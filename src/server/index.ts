import { createTRPCRouter } from "./trpc";
import { aiRouter } from "./routers/ai";
import { tripRouter } from "./routers/trip";

export const appRouter = createTRPCRouter({
  ai: aiRouter,
  trip: tripRouter,
});

export type AppRouter = typeof appRouter;
