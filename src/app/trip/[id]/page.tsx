"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ItineraryResult from "@/components/ItineraryResult";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getTripQuery = trpc.trip.getById.useQuery({ id: tripId });

  useEffect(() => {
    if (getTripQuery.data) {
      const trip = getTripQuery.data as any;
      // Parse the generatedData if it exists
      const itinerary = trip.generatedData
        ? typeof trip.generatedData === "string"
          ? JSON.parse(trip.generatedData)
          : trip.generatedData
        : trip.dayPlans.map((dp: any) => ({
            day: dp.day,
            title: dp.title,
            activities: dp.activities.map((activity: any) => ({
              place: activity.place,
              description: activity.description,
              time: activity.time,
              latitude: activity.location?.latitude || 0,
              longitude: activity.location?.longitude || 0,
            })),
          }));

      setData({
        title: trip.title,
        destination: trip.destination,
        days: trip.days,
        budget: trip.budget,
        description: trip.description,
        interests: trip.interests,
        itinerary,
      });
      setIsLoading(false);
    }

    if (getTripQuery.isError) {
      console.error("Error loading trip");
      router.push("/dashboard");
    }
  }, [getTripQuery.data, getTripQuery.isError, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 p-6">
        <div className="mx-auto max-w-6xl">
          <Skeleton className="h-12 w-64 mb-4" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Trip not found</p>
      </div>
    );
  }

  return (
    <ItineraryResult
      destination={data.destination}
      days={data.days}
      title={data.title}
      itinerary={data.itinerary}
      budget={data.budget}
      interests={data.interests}
      description={data.description}
    />
  );
}
