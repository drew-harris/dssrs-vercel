import { trpcServer } from "@hono/trpc-server"; // Deno 'npm:@hono/trpc-server'
import { Hono } from "hono";
import { appRouter } from "./trpc/app";
import { handlePage } from "./internal/serverPageHandler";

const server = new Hono()
  // Log every request
  .use("*", async (c, next) => {
    console.log(`[${c.req.method}] ${c.req.url}`);
  })

  .get("test", async (c) => {
    return c.json({ test: "working" });
  })

  .use(
    "/trpc/*",
    trpcServer({
      router: appRouter,
    }),
  );

server.notFound(async (c) => {
  return c.json({ error: "Not found" });
});

// Free to use this hono server for whatever you want (redirect urls, etc)

// .get("*", handlePage);

let result = null;

export default server.fetch;
