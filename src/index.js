import dotenv from "dotenv";
import connectDB from "./db/connection.js";
import { app } from "./app.js";
import http from "http";
import { videoWorker } from "./workers/videoWokers.js";
import { dlqWorker } from "./workers/videoDLQwoker.js";
import { Server } from "socket.io";
dotenv.config({path:'./env'});
const server=http.createServer(app);
const io=new Server(server);
connectDB()
.then(()=>{
    server.listen(process.env.PORT||8000,()=>{
        console.log(`Server connected successfully at port ${process.env.PORT} `);
    })
})
.catch((err)=>{
    console.log("MongoDB Failed to connect",err);
})