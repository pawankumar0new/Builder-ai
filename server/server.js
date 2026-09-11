import express from "express";
import "dotenv/config";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectToDatabase } from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import projectRouter from "./routes/projectRoutes.js";

const app = express()

app.use(cors({origin: process.env.ORIGINS.split(","), credentials:true}))
app.use(cookieParser())
app.use(express.json())

app.get("/", (req, res)=>res.send("Server is Live!"))
app.use("/api/auth", authRouter)
app.use("/api/projects", projectRouter)

app.use((err,_req, res, _next)=>{
    console.error(`[Error] ${err.message}`)
    res.status(500).json({error: err.message})
})

const port = process.env.PORT || 6000

async function startServer() {
    try {
        await connectToDatabase()
        app.listen(port, ()=>{
            console.log(`Server is running at http://localhost:${port}`)
        })
    } catch (error) {
        console.error(`[Error] Database connection failed: ${error.message}`)
        process.exit(1)
    }
}

startServer()