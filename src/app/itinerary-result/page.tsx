"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ItineraryResult from "@/components/ItineraryResult";
import { Skeleton } from "@/components/ui/skeleton";
import { Itinerary } from "@/types";

export default function ItineraryResultPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Get data from sessionStorage
    const stored = sessionStorage.getItem("generatedItinerary");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setData(parsed);
        setIsLoading(false);
      } catch (error) {
        console.error("Error parsing itinerary data:", error);
        router.push("/");
      }
    } else {
      // Redirect to home if no data
      router.push("/");
    }
  }, [router]);

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
        <p>No itinerary data found. Redirecting...</p>
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
