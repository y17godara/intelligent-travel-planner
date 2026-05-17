"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Calendar, DollarSign, Heart, Download, Share2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import GoogleMap from "@/components/GoogleMap";

interface Activity {
  place: string;
  description: string;
  time?: string;
  latitude?: number;
  longitude?: number;
}

interface Day {
  day: number;
  title: string;
  activities: Activity[];
}

interface ItineraryResultProps {
  destination: string;
  days: number;
  title: string;
  itinerary: Day[];
  budget: string | number;
  interests: string[] | string;
  description: string;
}

export default function ItineraryResult({
  destination,
  days,
  title,
  itinerary,
  budget,
  interests,
  description,
}: ItineraryResultProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(0);
  const interestsList = Array.isArray(interests) ? interests : interests?.split(",").map(i => i.trim()) || [];

  const handleDownloadPDF = async () => {
    try {
      const response = await fetch("/api/export/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination,
          days,
          title,
          itinerary,
          budget,
          interests: interestsList,
          description,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title}-itinerary.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error downloading PDF:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-100 p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 rounded-2xl bg-white p-8 shadow-lg"
        >
          <div className="mb-6 flex items-start justify-between">
            <div>
              <h1 className="mb-2 text-4xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600">{description}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleDownloadPDF} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                PDF
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          {/* Trip Stats */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-blue-50 p-4">
              <div className="flex items-center gap-2 text-blue-600">
                <MapPin className="h-5 w-5" />
                <span className="font-semibold">Destination</span>
              </div>
              <p className="mt-1 text-lg font-bold text-gray-900">{destination}</p>
            </div>

            <div className="rounded-lg bg-purple-50 p-4">
              <div className="flex items-center gap-2 text-purple-600">
                <Calendar className="h-5 w-5" />
                <span className="font-semibold">Duration</span>
              </div>
              <p className="mt-1 text-lg font-bold text-gray-900">{days} days</p>
            </div>

            <div className="rounded-lg bg-green-50 p-4">
              <div className="flex items-center gap-2 text-green-600">
                <DollarSign className="h-5 w-5" />
                <span className="font-semibold">Budget</span>
              </div>
              <p className="mt-1 text-lg font-bold text-gray-900">{budget}</p>
            </div>

            <div className="rounded-lg bg-pink-50 p-4">
              <div className="flex items-center gap-2 text-pink-600">
                <Heart className="h-5 w-5" />
                <span className="font-semibold">Interests</span>
              </div>
              <p className="mt-1 text-lg font-bold text-gray-900">{interestsList.length}</p>
            </div>
          </div>

          {/* Interests Tags */}
          {interestsList.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 font-semibold text-gray-900">Your Interests</h3>
              <div className="flex flex-wrap gap-2">
                {interestsList.map((interest, idx) => (
                  <span
                    key={idx}
                    className="rounded-full bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 text-sm font-medium text-gray-700"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Itinerary Days */}
        <div className="space-y-4">
          {itinerary && itinerary.length > 0 ? (
            itinerary.map((day, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <button
                  onClick={() => setExpandedDay(expandedDay === idx ? null : idx)}
                  className="w-full rounded-2xl bg-white p-6 shadow-lg transition-all hover:shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold">
                        Day {day.day}
                      </div>
                      <div className="text-left">
                        <h3 className="text-lg font-bold text-gray-900">{day.title}</h3>
                        <p className="text-sm text-gray-600">{day.activities?.length || 0} activities</p>
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 transition-transform text-gray-600 ${
                        expandedDay === idx ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {/* Expanded Day Content */}
                  {expandedDay === idx && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                      className="mt-6 space-y-4 border-t pt-6"
                    >
                      {day.activities && day.activities.length > 0 ? (
                        day.activities.map((activity, actIdx) => (
                          <div key={actIdx} className="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-4">
                            <div className="flex items-start gap-3">
                              <div className="mt-1 h-2 w-2 rounded-full bg-purple-500 flex-shrink-0" />
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{activity.place}</h4>
                                {activity.time && <p className="text-sm text-gray-600">⏰ {activity.time}</p>}
                                <p className="mt-1 text-sm text-gray-700">{activity.description}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-600">No activities planned for this day</p>
                      )}
                    </motion.div>
                  )}
                </button>
              </motion.div>
            ))
          ) : (
            <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
              <p className="text-gray-600">No itinerary data available</p>
            </div>
          )}
        </div>

        {/* Map Section */}
        {itinerary && itinerary.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 rounded-2xl bg-white p-6 shadow-lg"
          >
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Trip Map</h2>
            <div className="h-96 rounded-lg overflow-hidden">
              <GoogleMap
                markers={itinerary
                  .flatMap((day) =>
                    day.activities
                      ?.filter((a) => a.latitude && a.longitude)
                      .map((a) => ({
                        lat: a.latitude || 0,
                        lng: a.longitude || 0,
                        place: a.place,
                        time: a.time || "",
                        description: a.description,
                        day: day.day,
                      }))
                  )
                  .filter((m): m is { lat: number; lng: number; place: string; time: string; description: string; day: number } => m !== undefined)}
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}