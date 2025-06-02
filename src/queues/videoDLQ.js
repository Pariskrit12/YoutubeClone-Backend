import { Queue } from "bullmq";
import { redisOptions } from "../config/redis.js";

const videoDLQ=new Queue("videoDLQ",{
    connection:redisOptions
})

export{videoDLQ};