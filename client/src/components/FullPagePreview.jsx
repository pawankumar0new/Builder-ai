import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useAppContext } from '../context/AppContext';
import { SandpackLayout, SandpackPreview, SandpackProvider, useSandpack } from '@codesandbox/sandpack-react';
import { detectDependencies } from '../utils/sandpackUtils';
import SandpackErrorMonitor from './SandpackErrorMonitor';


function SandpackFileWatcher({onLiveFilesChange}){ 
    const {sandpack} = useSandpack();
    const {files} = sandpack;
    const {activeProject, updateProjectFiles} = useAppContext()

    const activeProjectRef = useRef(activeProject)

    useEffect(()=>{
        activeProjectRef.current = activeProject;
    },[activeProject])

    useEffect(()=>{
        const project = activeProjectRef.current
        if(!project) return;
        const updatedFiles = {};
        let hasChanges = false 

        for(const[path, fileObj] of Object.entries(files)){
            const fileCode = fileObj.code
            updatedFiles[path] = fileCode
            const originalContent = typeof project.files[path] === "string" ? project.files
            [path] : project.files[path]?.content;
            if(originalContent !== undefined && originalContent !== fileCode){
                hasChanges = true;
            }
        }

        onLiveFilesChange(updatedFiles)
        if(hasChanges){
            updateProjectFiles(updatedFiles)
        }
    },[files])
}

const FullPagePreview = ({files}) => {
    const [showErrorOverlay, setShowErrorOverlay] = useState(true);

    const sandpackFiles = useMemo(()=>{
            if(!files) return {}
            const spFiles = {};
            for(const[path, content] of Object.entries(files)){
               
                spFiles[path] = {code:content}
            }
    
            if(!spFiles["/index.js"]){
                spFiles["/index.js"] = {
                    code: `import React from "react";
    import { createRoot } from "react-dom/client";
    import App from "./App";
    
    createRoot(document.getElementById("root")).render(<App />);`,
                    hidden: true,
                }
            }
            return spFiles;
        },[files])
    
        const dependencies = useMemo (()=>{
            if(!files) return {};
            return detectDependencies(files)
        }, [files])
  return (
    <div className='h-screen w-screen bg-white overflow-hidden'>
        <SandpackProvider
         template='react' files={sandpackFiles} customSetup={{dependencies}} options={{
            externalResources: [
                "https://cdn.tailwindcss.com",
                "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
            ],
            
            logLevel:0,
        }} className="h-full w-full">
            
            <SandpackErrorMonitor onErrorChange={setShowErrorOverlay}/>
            <SandpackLayout className="h-full w-full border-none! bg-transparent!">
                    <SandpackPreview showNavigator={false} showRefreshButton={false} showOpenInCodeSandbox={false} showSandpackErrorOverlay={showErrorOverlay} className="h-full w-full"/>
            </SandpackLayout>

        </SandpackProvider>
    </div>
  )
}

export default FullPagePreview