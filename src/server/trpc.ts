import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";

export const createTRPCContext = async () => {
  return {};
};

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

const isAuthed = t.middleware(({ next, ctx }) => {
  // Check authentication here
  // For now, we'll allow all
  return next({
    ctx: {
      ...ctx,
    },
  });
});

export const protectedProcedure = t.procedure.use(isAuthed);
