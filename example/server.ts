import { serve } from "bun";
import index from "./index.html";

const server = serve({
  port: 3001,
  routes: {
    "/*": index,
  },
  development: {
    hmr: true,
    console: true,
  },
});

console.log(`Example running at ${server.url}`);
