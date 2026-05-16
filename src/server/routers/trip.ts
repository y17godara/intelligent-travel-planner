import { createTRPCRouter, publicProcedure } from "../trpc";
import { SaveTripInputSchema } from "@/types";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const tripRouter = createTRPCRouter({
  save: publicProcedure
    .input(SaveTripInputSchema)
    .mutation(async ({ input }) => {
      try {
        // For now, we'll use a default userId. In production with auth:
        // const userId = ctx.session?.user?.id
        const userId = "default-user";

        // Find or create user
        let user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              id: userId,
              name: "Default User",
            },
          });
        }

        // Create trip with day plans and activities
        const trip = await prisma.trip.create({
          data: {
            userId: user.id,
            title: input.title,
            destination: input.destination,
            description: input.description,
            days: input.days,
            budget: input.budget,
            interests: input.interests,
            generatedData: input.generatedData,
            dayPlans: {
              create: input.dayPlans.map((day) => ({
                day: day.day,
                title: day.title,
                activities: {
                  create: day.activities.map((activity, idx) => ({
                    place: activity.place,
                    description: activity.description,
                    time: activity.time,
                    sequence: idx,
                    location: {
                      create: {
                        latitude: activity.latitude,
                        longitude: activity.longitude,
                      },
                    },
                  })),
                },
              })),
            },
          },
          include: {
            dayPlans: {
              include: {
                activities: {
                  include: {
                    location: true,
                  },
                },
              },
            },
          },
        });

        return trip;
      } catch (error) {
        console.error("Error saving trip:", error);
        throw error;
      }
    }),

  getAll: publicProcedure.query(async () => {
    try {
      const userId = "default-user";

      const trips = await prisma.trip.findMany({
        where: { userId },
        include: {
          dayPlans: {
            include: {
              activities: {
                include: {
                  location: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return trips;
    } catch (error) {
      console.error("Error fetching trips:", error);
      throw error;
    }
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      try {
        const trip = await prisma.trip.findUnique({
          where: { id: input.id },
          include: {
            dayPlans: {
              include: {
                activities: {
                  include: {
                    location: true,
                  },
                },
              },
            },
          },
        });

        if (!trip) {
          throw new Error("Trip not found");
        }

        return trip;
      } catch (error) {
        console.error("Error fetching trip:", error);
        throw error;
      }
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      try {
        const trip = await prisma.trip.delete({
          where: { id: input.id },
        });

        return trip;
      } catch (error) {
        console.error("Error deleting trip:", error);
        throw error;
      }
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const trip = await prisma.trip.update({
          where: { id: input.id },
          data: {
            ...(input.title && { title: input.title }),
            ...(input.description && { description: input.description }),
          },
          include: {
            dayPlans: {
              include: {
                activities: {
                  include: {
                    location: true,
                  },
                },
              },
            },
          },
        });

        return trip;
      } catch (error) {
        console.error("Error updating trip:", error);
        throw error;
      }
    }),
});
