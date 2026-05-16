import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => ({}),
    onError({ error }) {
      // Safe error logging without circular references
      if (error instanceof Error) {
        console.error("tRPC error:", error.message, error.stack);
      } else {
        console.error("tRPC handler error:", JSON.stringify(error, null, 2).substring(0, 500));
      }
    },
  });

export { handler as GET, handler as POST };
