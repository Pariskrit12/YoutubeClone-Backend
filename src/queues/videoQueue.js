import { Queue } from "bullmq";
import {  redisOptions } from "../config/redis.js";
import { QueueEvents } from "bullmq";
import { connect } from "mongoose";
import { connections } from "mongoose";

const videoQueue=new Queue("videoProcessing",{
    connection:redisOptions,
})
export const videoQueueEvents = new QueueEvents("videoProcessing", {
  connection:redisOptions,
});
await videoQueueEvents.waitUntilReady();

export {videoQueue}