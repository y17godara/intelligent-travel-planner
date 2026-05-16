"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader, PlaneIcon } from "lucide-react";
import ItineraryResult from "./ItineraryResult";
import { Itinerary } from "@/types";

interface ChatMessage {
  id: string;
  type: "bot" | "user";
  content: string;
  showItineraryButton?: boolean;
}

interface CollectedData {
  destination?: string;
  days?: number;
  budget?: string;
  interests?: string[];
  title?: string;
}

export default function ChatBot() {
  const quickSuggestions = [
    "Thailand FullMoon 6days 50k",
    "leh ladakh from delhi bike trip",
    "Europe 10days",
    "Delhi to Kasmir 5days 20k",
  ];
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "bot",
      content:
        "👋 Welcome to AI Itinerary Builder! Tell me about your trip in one message. For example: 'Kashmir 7 days, cultural and adventure, budget, winter trip' or just 'Tokyo 5 days'. I'll understand and create your perfect itinerary!",
    },
  ]);
  const [input, setInput] = useState("");
  const [collectedData, setCollectedData] = useState<CollectedData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<
    "parsing" | "generating" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [showItineraryDialog, setShowItineraryDialog] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] =
    useState<Itinerary | null>(null);
  const [generatedData, setGeneratedData] = useState<CollectedData>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);

  const generateMutation = trpc.ai.generateItinerary.useMutation();
  const parseInputMutation = trpc.ai.parseUserInput.useMutation();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (value?: string) => {
    const messageText = value || input;
    if (!messageText.trim()) return;

    setError(null);
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), type: "user", content: messageText },
    ]);
    setInput("");
    setIsLoading(true);
    setLoadingStep("parsing");

    try {
      const parseResult = await parseInputMutation.mutateAsync({
        message: messageText,
        previousData: collectedData,
      });

      const updatedData: CollectedData = {
        ...collectedData,
        ...(parseResult.destination && {
          destination: parseResult.destination,
        }),
        ...(parseResult.days && { days: parseResult.days }),
        ...(parseResult.interests?.length && {
          interests: parseResult.interests,
        }),
        ...(parseResult.budget && { budget: parseResult.budget }),
        ...(parseResult.title && { title: parseResult.title }),
      };

      setCollectedData(updatedData);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content: parseResult.response,
        },
      ]);

      if (
        parseResult.isComplete &&
        updatedData.destination &&
        updatedData.days
      ) {
        const finalTitle =
          updatedData.title ||
          `${updatedData.days}-Day ${updatedData.destination} Trip`;
        setTimeout(
          () => generateItinerary({ ...updatedData, title: finalTitle }),
          1500,
        );
      } else {
        setIsLoading(false);
        setLoadingStep(null);
      }
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : "Failed to understand your request";
      setError(errorMsg);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content: `⚠️ ${errorMsg}\n\nPlease try again with:\n📍 Destination (required)\n📅 Days 1-30 (required)\n\nExample: "Paris 5 days"`,
        },
      ]);
      setIsLoading(false);
      setLoadingStep(null);
    }
  };

  const generateItinerary = async (data: CollectedData) => {
    if (!data.destination || !data.days || !data.title) return;

    setIsLoading(true);
    setLoadingStep("generating");
    setError(null);

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "bot",
        content: `🔄 Generating your personalized itinerary for ${data.destination}... This might take 10-15 seconds!`,
      },
    ]);

    timeoutIdRef.current = setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 999).toString(),
          type: "bot",
          content:
            "⏳ Still generating... AI is crafting your perfect itinerary. Please wait a bit more!",
        },
      ]);
    }, 10000);

    try {
      const result = await generateMutation.mutateAsync({
        destination: data.destination,
        days: data.days,
        budget: data.budget,
        interests: data.interests || [],
        title: data.title,
        description: `A ${data.days}-day trip to ${data.destination}`,
      });

      clearTimeout(timeoutIdRef.current!);
      setGeneratedItinerary(result);
      setGeneratedData(data);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "bot",
          content: `✨ Perfect! Your ${data.days}-day itinerary for ${data.destination} is ready!`,
          showItineraryButton: true,
        },
      ]);
    } catch (error) {
      clearTimeout(timeoutIdRef.current!);
      const errorMsg =
        error instanceof Error ? error.message : "Failed to generate itinerary";
      setError(errorMsg);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "bot",
          content: `❌ Error: ${errorMsg}\n\nPlease try again with:\n- A valid destination name\n- Days between 1-30`,
        },
      ]);
    } finally {
      setIsLoading(false);
      setLoadingStep(null);
    }
  };

  return (
    <>
      {/* Messages */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-8 md:px-6">
        <div className="mx-auto max-w-3xl space-y-5">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className="w-full max-w-[85%] md:max-w-md">
                  {message.type === "bot" && (
                    <div className="mb-1.5 flex items-center gap-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-sm">
                        <PlaneIcon className="h-3 w-3 text-black dark:text-white" />
                      </div>
                      <span className="text-[11px] font-medium text-muted-foreground">
                        AI Assistant
                      </span>
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-3 shadow-sm ${
                      message.type === "user"
                        ? "rounded-tr-sm bg-gradient-to-br from-primary via-primary to-accent/80 text-white shadow-primary/20"
                        : "rounded-tl-sm glass border-border/50 text-foreground"
                    }`}
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                  {message.showItineraryButton && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Button
                        onClick={() => setShowItineraryDialog(true)}
                        className="mt-3 w-full rounded-xl bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:opacity-95 transition-all font-medium"
                      >
                        📋 View Your Itinerary
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="glass rounded-2xl rounded-tl-sm border-border/50 px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 rounded-full bg-primary animate-bounce" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="relative z-10 border-t border-border/40 glass-strong px-4 py-4 md:px-6">
        <div className="mx-auto max-w-3xl">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-3 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/8 px-4 py-3"
            >
              <span className="text-sm text-destructive">⚠️ {error}</span>
            </motion.div>
          )}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-3 flex items-center gap-2 rounded-xl border border-border/50 bg-muted/50 px-4 py-2.5"
            >
              <Loader className="h-3.5 w-3.5 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">
                {loadingStep === "parsing" && "Understanding your request..."}
                {loadingStep === "generating" &&
                  "Crafting your perfect itinerary — this takes 10-15 seconds..."}
              </span>
            </motion.div>
          )}
          <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-lg shadow-foreground/5 transition-all focus-within:border-primary/50 focus-within:shadow-primary/10">
            <Input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !isLoading)
                  handleSendMessage();
              }}
              placeholder="e.g. 'Kashmir 7 days, cultural, budget' or 'Tokyo 5 days'"
              disabled={isLoading}
              className="flex-1 border-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
            />
            <Button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !input.trim()}
              className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-md shadow-primary/30 hover:shadow-primary/50 hover:opacity-90 transition-all disabled:opacity-40"
            >
              {isLoading ? (
                <Loader className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion) => (
              <Button
                key={suggestion}
                type="button"
                variant="secondary"
                onClick={() => handleSendMessage(suggestion)}
                disabled={isLoading}
                className="h-8 rounded-full px-3 text-xs font-medium"
              >
                {suggestion}
              </Button>
            ))}
          </div>
          <p className="mt-2 text-center text-[11px] text-muted-foreground/50">
            Tip: Include destination, days, interests & budget in one message
          </p>
        </div>
      </div>

      {/* Itinerary Dialog */}
      <Dialog open={showItineraryDialog} onOpenChange={setShowItineraryDialog}>
        <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto border border-border/60 bg-background text-foreground shadow-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Your Itinerary
            </DialogTitle>
          </DialogHeader>
          {generatedItinerary && (
            <ItineraryResult
              destination={generatedData.destination || ""}
              days={generatedData.days || 0}
              title={generatedData.title || ""}
              itinerary={generatedItinerary}
              budget={generatedData.budget}
              interests={generatedData.interests}
              description={`A ${generatedData.days}-day trip to ${generatedData.destination}`}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
