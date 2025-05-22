import { config } from 'dotenv';

config();

console.log('Test ENV URL:', process.env.UPSTASH_REDIS_REST_URL);
console.log('Test ENV TOKEN:', process.env.UPSTASH_REDIS_REST_TOKEN);
