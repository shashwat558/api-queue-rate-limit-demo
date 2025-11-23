
import { Context, Hono, Next } from 'hono'
import { cors } from 'hono/cors';


const app = new Hono();

app.use("*", cors());

const RATE_LIMIT = 10;
const REFILL_RATE = 10000;


/* eslint-disable @typescript-eslint/no-explicit-any */
const consumeToken = async (kv: any, key: string) => {
  const bucket = JSON.parse(await kv.get(key) || '{}');
  console.log(bucket);

  let tokens = bucket.tokens ?? RATE_LIMIT;
  let lastRefill = bucket.lastRefill ?? Date.now();

  const now = Date.now();
  const elapsed = now - lastRefill;

  const newTokens = Math.floor(elapsed / REFILL_RATE);
  if(newTokens > 0){
    tokens = Math.min(RATE_LIMIT, tokens + newTokens);
    lastRefill = now;
  }

  if(tokens <= 0){
    return {allowed: false};
  }

  tokens -= 1;

  await kv.put(key, JSON.stringify({tokens, lastRefill}));

  return {allowed:true}
    

}


const rateLimitMiddleware = async (c: Context, next: Next) => {
  const kv = c.env.RATE_LIMIT_KV;
  const ip = c.req.header("CF-Connecting-IP") || "unknown";

  const result = await consumeToken(kv, `bucket:${ip}`);

  if(!result.allowed){
    return c.json({
      status: "error",
      message: "Rate limit exceeded"
    }, 429);
  }

  await next();

   

}

app.use('*', rateLimitMiddleware)

app.get('/', (c) => {
  return c.text('Hello Hono!')
});

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

app.post('/api/v1/echo', async (c) => {
  
  const body = await c.req.json();
  console.log(body);

  await delay(2000);

  return c.json({
    status: "ok",
    echo: body.message
  })

})


export default app
