import { trpcServer } from "@hono/trpc-server"; // Deno 'npm:@hono/trpc-server'
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { appRouter } from "./trpc/app";
import { handlePage } from "./internal/serverPageHandler";

const server = new Hono()
  // Log every request
  .use("*", async (c, next) => {
    console.log(`[${c.req.method}] ${c.req.url}`);
    if (process.env["VERCEL"]) {
      // Add the base url to the request
      const host = c.req.header("VERCEL_URL");
      // @ts-ignore
      c.req.url = `https://${host}${c.req.url}`;
      console.log(`UPDATE: [${c.req.method}] ${c.req.url}`);
    }
    return next();
  })
  .use("/assets/*", serveStatic({ root: "./dist/public" }))
  .use("/favicon.ico", serveStatic({ path: "./dist/public/favicon.ico" }))

  .get("test", async (c) => {
    return c.json({ test: "working" });
  })

  .use(
    "/trpc/*",
    trpcServer({
      router: appRouter,
    }),
  )

  // Free to use this hono server for whatever you want (redirect urls, etc)

  .get("*", handlePage);

let result = null;

if (import.meta.env.DEV) {
  result = server;
} else {
  result = server.fetch;
}

export default result;
