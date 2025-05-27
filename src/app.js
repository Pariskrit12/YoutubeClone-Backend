import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"
const app=express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}));// Parse incoming JSON requests and limit the payload size to 16KB for security and performance
app.use(express.urlencoded({extended:true,limit:"16kb"}));// Parse URL-encoded data (from forms) with extended support for rich objects, limit payload to 16KB
app.use(express.static("public"));// Serve static files (HTML, CSS, JS, images, etc.) from the "public" directory
app.use(cookieParser());// Parse cookies from the HTTP request headers and make them accessible via req.cookies


//import routes
import userRouter from "./routes/user.routes.js"
app.use("/api/v1/users",userRouter);

export {app};