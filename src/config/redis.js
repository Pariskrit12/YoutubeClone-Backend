import Redis from "ioredis";

// Create a Redis client instance and connect to local Redis server at 127.0.0.1:6379
const redisClient = new Redis({
  host: "localhost",
  port: 6379,
});

//error handling
redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
});

redisClient.on("connect",()=>{
    console.error("Connected to redis");
})

const redisOptions = {
  host: "localhost",
  port: 6379,
};
export {redisClient,redisOptions};