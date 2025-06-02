import { Queue } from "bullmq";
import {  redisOptions } from "../config/redis.js";

const videoQueue=new Queue("videoProcessing",{
    connection:redisOptions,
})

export {videoQueue}