import { z } from "zod";

export const ActivitySchema = z.object({
  place: z.string(),
  description: z.string(),
  time: z.string(),
  latitude: z.number(),
  longitude: z.number(),
});

export const DayPlanSchema = z.object({
  day: z.number(),
  title: z.string(),
  activities: z.array(ActivitySchema),
});

export const ItinerarySchema = z.array(DayPlanSchema);

export const CreateTripInputSchema = z.object({
  destination: z.string().min(1, "Destination is required"),
  days: z.number().min(1).max(30),
  budget: z.string().optional(),
  interests: z.array(z.string()).default([]),
  title: z.string().min(1, "Trip title is required"),
  description: z.string().optional(),
});

export const SaveTripInputSchema = z.object({
  title: z.string(),
  destination: z.string(),
  days: z.number(),
  budget: z.string().optional(),
  interests: z.array(z.string()),
  description: z.string().optional(),
  generatedData: z.any().optional(),
  dayPlans: z.array(
    z.object({
      day: z.number(),
      title: z.string(),
      activities: z.array(
        z.object({
          place: z.string(),
          description: z.string(),
          time: z.string(),
          latitude: z.number(),
          longitude: z.number(),
        })
      ),
    })
  ),
});

export type Activity = z.infer<typeof ActivitySchema>;
export type DayPlan = z.infer<typeof DayPlanSchema>;
export type Itinerary = z.infer<typeof ItinerarySchema>;
export type CreateTripInput = z.infer<typeof CreateTripInputSchema>;
export type SaveTripInput = z.infer<typeof SaveTripInputSchema>;
