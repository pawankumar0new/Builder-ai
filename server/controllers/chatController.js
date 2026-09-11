import { Project } from "../models/Project"
import { reviseProject } from "../services/ai.js"
export function buildManifest(files){
    const manifest = []
    for(const [path, entry] of Object.entries(files)){
        manifest.push({path, hash:entry.hash, size: entry.content.length})
    }
    return manifest

}
//POST /api/projects/:id/chat
//Send a reversion prompt and return updated project

export async function chat(req, res){
    const {prompt} = req.body

    if(!prompt || typeof prompt !== "string"){
        res.status(400).json({error: "prompt is required"})
        return 
    }
    if(!req.user){
        res.status(401).json({error:"prompt is required"})
        return 
    }
    const project = await Project.findOne({_id:req.params.id, owner:req.user.userId})
    if(!project){
        res.stattus(404).json({error: "Project not found"})
        return
    }
    project.status = "revising",
    project.messages.push({role:"user", content:prompt, timestamp:new Date()});
    await project.save()
    try{
        //Build compact manifest (path + hash + size) instead of sending all code
        const manifest = buildManifest(project.files)

        //Include All file contents so the AI can do accurate search/replace
        const relaventFiles = {};
        for (const [path, entry] of Object.entries(project.files)){
            relaventFiles[path] = entry.content;
        }
        const recentMessges = project.messages.slice(-4).map((m)=>({
            role: m.role,
            content:m.content
        }))

        console.log(
            `[AI] Revising project ${project._id}: "${prompt.slice(0, 80)}..."` + `(${manifest.length} files, manifest ~${JSON.stringify(manifest).length} chars)`
        )
        const result = await reviseProject(prompt, manifest, relevantFiles, recentMessages)
        console.log(`[AI] Got ${result.operations.length} operations: ${result.description}`)

        // Apply operations to file map
        const {files: updatedFiles, applied, errors} = applyOperations(project.files, result.operations)

        if(errors.length>0){
            console.warn(`[Diff] Errors applying operations:`, errors);
        }
        project.files = updatedFiles;
        project.markModified("files");
        project.version += 1;
        project.status = "completed";
        project.messages.push({
            role: "assistant",
            content: result.description + (errors.length > 0 ? `\n\n some operations failed: ${errors.join(", ")}`: "")
        })
        
        await project.save()
        
        const filesObj = {}
        for(const [path, entry] of Object.entries(project.files)) {
            filesObj[path] = entry.content;
        }
        res.json({
            _id:project._id,
            name:project.name,
            description:project.description,
            files:filesObj,
            messages:project.messages,
            version: project.version,
            status:project.status,
            applied,
            errors,
            aiDescription: result.description
        })

    }catch(err){
        console.error(`[AI Revision Error] ${err.messages}`)
        project.status = "completed"
        await project.save()
        res.status(500).json({error: err.message || "Failed to process revision request"})
    }
}