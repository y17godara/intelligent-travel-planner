"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import {
  Trash2,
  MapPin,
  Calendar,
  ArrowRight,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SavedTrip {
  id: string;
  title: string;
  destination: string;
  days: number;
  budget?: string | null;
  createdAt: Date;
}

export default function Dashboard() {
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const getAllTrips = trpc.trip.getAll.useQuery();
  const deleteTrip = trpc.trip.delete.useMutation();

  useEffect(() => {
    if (getAllTrips.data) {
      setTrips(getAllTrips.data as any);
      setIsLoading(false);
    }
  }, [getAllTrips.data]);

  const handleDeleteTrip = async (id: string) => {
    if (confirm("Are you sure you want to delete this trip?")) {
      setDeletingId(id);
      try {
        await deleteTrip.mutateAsync({ id });
        setTrips((prev) => prev.filter((trip) => trip.id !== id));
      } catch (error) {
        console.error("Error deleting trip:", error);
        alert("Failed to delete trip");
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleViewTrip = (tripId: string) => {
    router.push(`/trip/${tripId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-800">
              📋 My Trips
            </h1>
            <p className="text-gray-600">Manage your saved itineraries</p>
          </div>
          <Link href="/">
            <Button className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
              <Plus className="h-4 w-4" />
              Create New Trip
            </Button>
          </Link>
        </motion.div>

        {/* Trips Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-5xl mb-4">🗺️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No trips yet
            </h2>
            <p className="text-gray-600 mb-6">
              Create your first itinerary to get started!
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                Create Trip Now
              </Button>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {trips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group overflow-hidden">
                  {/* Gradient Background */}
                  <div className="h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 group-hover:scale-105 transition-transform" />

                  <CardHeader className="relative pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl text-gray-800 group-hover:text-blue-600 transition-colors">
                          {trip.title}
                        </CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {trip.destination}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{trip.days} days</span>
                      </div>
                      {trip.budget && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          {trip.budget}
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 group/btn"
                        onClick={() => handleViewTrip(trip.id)}
                      >
                        View
                        <ArrowRight className="h-3 w-3 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deletingId === trip.id}
                        onClick={() => handleDeleteTrip(trip.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
