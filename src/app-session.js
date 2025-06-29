import session from 'express-session'; // session
import { createClient } from 'redis'; // session
import * as connectRedis from 'connect-redis';  // session


const SECOND = 1000
const MINUTE = 60 * SECOND

const RedisStore = connectRedis.RedisStore;

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});
await redisClient.connect(); 

const redisStore = new RedisStore({
  client: redisClient,
  prefix: 'sess:',
});


// console.log('Store constructor:', RedisStore.toString());
export default session({
	name: 'sid',
	store: redisStore,
	secret: process.env.SESSION_SECRET || 'rahasia',
	resave: false,
	saveUninitialized: false,
	rolling: true,
	cookie: {
		secure: false,
		httpOnly: true,
		maxAge: 15 * MINUTE
	}
});