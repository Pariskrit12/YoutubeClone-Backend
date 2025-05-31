import { Queue } from "bullmq";
import {  redisOptions } from "../config/redis";

const videoQueue=new Queue("videoProcessing",{
    connection:redisOptions,
})

export {videoQueue}