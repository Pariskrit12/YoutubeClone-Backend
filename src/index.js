import dotenv from "dotenv";
import connectDB from "./db/connection.js";
import { app } from "./app.js";
import { videoWorker } from "./workers/videoWokers.js";
import { dlqWorker } from "./workers/videoDLQwoker.js";
dotenv.config({path:'./env'});

connectDB()
.then(()=>{
    app.listen(process.env.PORT||8000,()=>{
        console.log(`Server connected successfully at port ${process.env.PORT} `);
    })
})
.catch((err)=>{
    console.log("MongoDB Failed to connect",err);
})