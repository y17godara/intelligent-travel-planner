import { createTRPCRouter, publicProcedure } from "../trpc";
import { CreateTripInputSchema, ItinerarySchema } from "@/types";
import { z } from "zod";
import axios from "axios";

// const MODEL = "google/gemma-4-26b-a4b-it:free";
const MODEL = "openrouter/owl-alpha";

const parseHeuristicTripData = (message: string, previousData?: { destination?: string; days?: number; interests?: string[]; budget?: string }) => {
  const normalized = message.trim();
  const daysMatch = normalized.match(/\b(\d{1,2})\s*(?:days?|d)\b/i);
  const days = daysMatch ? Number(daysMatch[1]) : undefined;

  const stripped = normalized
    .replace(/\b\d{1,2}\s*(?:days?|d)\b/gi, " ")
    .replace(/\bfor\b/gi, " ")
    .replace(/\btrip\b/gi, " ")
    .replace(/\bto\b/gi, " ")
    .replace(/[,:.]/g, " ")
    .trim();

  const destination = stripped && stripped.length <= 60 ? stripped : undefined;

  return {
    destination: destination || previousData?.destination,
    days: days || previousData?.days,
    interests: previousData?.interests,
    budget: previousData?.budget,
  };
};

const parseUserInputPrompt = (input: string, previousData?: { destination?: string; days?: number; interests?: string[]; budget?: string }) => {
  const dataContext = previousData ? `
Previously collected data:
- Destination: ${previousData.destination || "not yet provided"}
- Days: ${previousData.days || "not yet provided"}
- Interests: ${previousData.interests?.join(", ") || "not yet provided"}
- Budget: ${previousData.budget || "not yet provided"}

` : '';

  return `You are a conversational travel assistant. Extract trip info from: "${input}"
${dataContext}
Respond with ONLY valid JSON, no other text. Be flexible and infer what you can:
{
  "destination": "extracted destination or null (or keep previous if no new destination mentioned)",
  "days": number 1-30 or null (or keep previous if no new days mentioned),
  "interests": ["array", "of", "interests"] or [],
  "budget": "budget level or null",
  "title": "trip title or null",
  "missing": ["list of clearly missing required fields"],
  "followUp": "A natural, friendly follow-up question for any missing required fields. Empty string if nothing missing."
}

Rules:
- destination and days are REQUIRED for itinerary
- IMPORTANT: If user already provided destination or days before, use that value even if only new partial info is provided now
- If BOTH missing, ask a single friendly question for both
- If only destination missing, ask for destination
- If only days missing, ask for duration
- If both present, don't ask follow-ups even if budget/interests missing
- Interests and budget are OPTIONAL
- Always be friendly and conversational
- ONLY return the JSON object`;
};

const generateItineraryPrompt = (input: {
  destination: string;
  days: number;
  budget?: string;
  interests: string[];
}) => {
  const interestsText =
    input.interests.length > 0 ? input.interests.join(", ") : "general tourism";

  return `[START JSON ONLY - NO TEXT BEFORE, DURING, OR AFTER]
[{"day":1,"title":"","activities":[{"place":"","description":"","time":"10:00-12:00","latitude":0,"longitude":0}]}]
[END TEMPLATE]

Generate ONLY the JSON array. Nothing else. Start with [ immediately.

${input.days} day trip to ${input.destination} (${interestsText})

Each of ${input.days} days must have 3-4 activities. Real coordinates for ${input.destination}.`;
};

export const aiRouter = createTRPCRouter({
  parseUserInput: publicProcedure
    .input(
      z.object({
        message: z.string(),
        previousData: z.object({
          destination: z.string().optional(),
          days: z.number().optional(),
          interests: z.array(z.string()).optional(),
          budget: z.string().optional(),
        }).optional(),
      })
    )
    .output(
      z.object({
        destination: z.string().optional(),
        days: z.number().optional(),
        interests: z.array(z.string()).optional(),
        budget: z.string().optional(),
        title: z.string().optional(),
        missing: z.array(z.string()),
        response: z.string(),
        isComplete: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
          return {
            destination: input.previousData?.destination,
            days: input.previousData?.days,
            interests: input.previousData?.interests,
            budget: input.previousData?.budget,
            title: undefined,
            missing: ["destination", "days"],
            response: "⚠️ The AI service isn't configured yet. Please try again later or contact support.",
            isComplete: false,
          };
        }

        const prompt = parseUserInputPrompt(input.message, input.previousData);

        const response = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: MODEL,
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 500,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "HTTP-Referer": process.env.OPENROUTER_REFERRER || "http://localhost:3000",
              "X-Title": "AI Itinerary Builder",
            },
          }
        );

        const content = response.data?.choices?.[0]?.message?.content;
        
        if (!content) {
          console.error("Empty response from API");
          return {
            destination: input.previousData?.destination,
            days: input.previousData?.days,
            interests: input.previousData?.interests,
            budget: input.previousData?.budget,
            title: undefined,
            missing: ["destination", "days"],
            response: "🌍 I didn't quite understand. Tell me where you want to go and for how many days (e.g., 'Paris 5 days')",
            isComplete: false,
          };
        }

        console.log("parseUserInput API response:", content.substring(0, 300));

        // Parse JSON from response - try multiple strategies
        let parsed = null;
        let jsonMatch = null;
        
        // Strategy 1: Direct JSON object in curly braces
        jsonMatch = content.match(/\{[\s\S]*\}(?=\s*$|[\n])/);
        if (jsonMatch) {
          try {
            const cleanedJson = jsonMatch[0]
              .replace(/[\x00-\x1F]/g, '')
              .replace(/,\s*}/g, '}')
              .replace(/,\s*]/g, ']');
            parsed = JSON.parse(cleanedJson);
            console.log("✓ Parsed JSON successfully");
          } catch (e) {
            console.log("Strategy 1 failed:", (e as Error).message);
            parsed = null;
          }
        }

        // Strategy 2: Extract JSON with code block markers
        if (!parsed) {
          const cleanContent = content
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();
          jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const cleanedJson = jsonMatch[0]
                .replace(/[\x00-\x1F]/g, '')
                .replace(/,\s*}/g, '}')
                .replace(/,\s*]/g, ']');
              parsed = JSON.parse(cleanedJson);
              console.log("✓ Parsed JSON successfully (after removing markdown)");
            } catch (e) {
              console.log("Strategy 2 failed:", (e as Error).message);
            }
          }
        }

        if (!parsed) {
          console.error("JSON parsing failed. Raw response:", content.substring(0, 500));
          const heuristic = parseHeuristicTripData(input.message, input.previousData);
          const heuristicComplete = !!heuristic.destination && !!heuristic.days;
          if (heuristic.destination || heuristic.days) {
            return {
              destination: heuristic.destination,
              days: heuristic.days,
              interests: heuristic.interests,
              budget: heuristic.budget,
              title: undefined,
              missing: [],
              response: heuristicComplete
                ? `Perfect! Got it - ${heuristic.destination} for ${heuristic.days} days. Let me create your itinerary! 🎉`
                : heuristic.destination
                  ? `📅 ${heuristic.destination} sounds great! How many days will you be there? (1-30 days)`
                  : "🌍 Where would you like to go and for how many days? (e.g., 'Paris 5 days')",
              isComplete: heuristicComplete,
            };
          }
          return {
            destination: input.previousData?.destination,
            days: input.previousData?.days,
            interests: input.previousData?.interests,
            budget: input.previousData?.budget,
            title: undefined,
            missing: ["destination", "days"],
            response: "🌍 I didn't catch that. Where would you like to go and for how many days? (e.g., 'Paris 5 days')",
            isComplete: false,
          };
        }

        // Validate and normalize parsed data - merge with previous data
        const destination = typeof parsed.destination === 'string' && parsed.destination !== "null" && parsed.destination.trim() ? parsed.destination.trim() : (input.previousData?.destination || null);
        const days = typeof parsed.days === 'number' && parsed.days > 0 && parsed.days <= 30 ? parsed.days : (input.previousData?.days || null);
        const interests = Array.isArray(parsed.interests) ? parsed.interests.filter((i: any) => typeof i === 'string' && i.trim()) : (input.previousData?.interests || []);
        const budget = typeof parsed.budget === 'string' && parsed.budget !== "null" && parsed.budget.trim() ? parsed.budget.trim() : (input.previousData?.budget || null);
        const title = typeof parsed.title === 'string' && parsed.title !== "null" && parsed.title.trim() ? parsed.title.trim() : null;
        
        const isComplete = !!destination && !!days;

        let response_text = "🌍 Tell me where you want to go and how many days";
        
        if (parsed.followUp && typeof parsed.followUp === 'string' && parsed.followUp.trim()) {
          response_text = parsed.followUp.trim();
        } else if (isComplete) {
          response_text = `Perfect! Got it - ${destination} for ${days} days${interests.length > 0 ? ` focusing on ${interests.join(', ')}` : ''}. Let me create your itinerary! 🎉`;
        } else if (destination && !days) {
          response_text = `📅 ${destination} sounds great! How many days will you be there? (1-30 days)`;
        } else if (days && !destination) {
          response_text = `📍 ${days} days is perfect! Where would you like to go?`;
        }

        const result = {
          destination: destination || undefined,
          days: days || undefined,
          interests: interests.length > 0 ? interests : undefined,
          budget: budget || undefined,
          title: title || undefined,
          missing: [],
          response: response_text,
          isComplete: isComplete,
        };

        return result;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error("Error parsing user input:", errorMsg);

        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          console.error(`API Error (${status}):`, error.response?.data);

          if (status === 429) {
            return {
              destination: input.previousData?.destination,
              days: input.previousData?.days,
              interests: input.previousData?.interests,
              budget: input.previousData?.budget,
              title: undefined,
              missing: ["destination", "days"],
              response: "⏳ The AI service is busy. Please wait a moment and try again.",
              isComplete: false,
            };
          }

          if (status === 401 || status === 403) {
            return {
              destination: input.previousData?.destination,
              days: input.previousData?.days,
              interests: input.previousData?.interests,
              budget: input.previousData?.budget,
              title: undefined,
              missing: ["destination", "days"],
              response: "⚠️ The AI service isn't authorized. Please check your OPENROUTER_API_KEY.",
              isComplete: false,
            };
          }

          if (status && status >= 500) {
            return {
              destination: input.previousData?.destination,
              days: input.previousData?.days,
              interests: input.previousData?.interests,
              budget: input.previousData?.budget,
              title: undefined,
              missing: ["destination", "days"],
              response: "⚠️ The AI service is temporarily unavailable. Please try again soon.",
              isComplete: false,
            };
          }
        }

        console.error("Unhandled error in parseUserInput:", error);
        const heuristic = parseHeuristicTripData(input.message, input.previousData);
        const heuristicComplete = !!heuristic.destination && !!heuristic.days;
        if (heuristic.destination || heuristic.days) {
          return {
            destination: heuristic.destination,
            days: heuristic.days,
            interests: heuristic.interests,
            budget: heuristic.budget,
            title: undefined,
            missing: [],
            response: heuristicComplete
              ? `Perfect! Got it - ${heuristic.destination} for ${heuristic.days} days. Let me create your itinerary! 🎉`
              : heuristic.destination
                ? `📅 ${heuristic.destination} sounds great! How many days will you be there? (1-30 days)`
                : "🌍 Where would you like to go and for how many days?",
            isComplete: heuristicComplete,
          };
        }
        return {
          destination: input.previousData?.destination,
          days: input.previousData?.days,
          interests: input.previousData?.interests,
          budget: input.previousData?.budget,
          title: undefined,
          missing: ["destination", "days"],
          response: "🌍 I had trouble understanding that. Where would you like to go and for how many days?",
          isComplete: false,
        };
      }
    }),

  generateBotResponse: publicProcedure
    .input(
      z.object({
        step: z.enum(["destination", "days", "interests", "budget", "title", "ready"]),
        collectedData: z.object({
          destination: z.string().optional(),
          days: z.number().optional(),
          budget: z.string().optional(),
          interests: z.array(z.string()).optional(),
          title: z.string().optional(),
        }),
        userInput: z.string(),
      })
    )
    .output(z.string())
    .mutation(async ({ input }) => {
      try {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
          throw new Error("OPENROUTER_API_KEY not set");
        }

        const prompts: Record<string, string> = {
          destination: `The user wants to travel and has responded to "Where would you like to travel?" with: "${input.userInput}"
          
Generate a friendly, encouraging next question to ask about their trip duration (1-30 days). Keep it conversational and engaging. Response should be 1-2 sentences max.`,
          
          days: `The user has chosen to travel for ${input.userInput} days to ${input.collectedData.destination}.
          
Ask them about their interests or activities they prefer (cultural, adventure, food, etc.). Keep it conversational. Response should be 1-2 sentences max.`,
          
          interests: `The user has selected their interests for a ${input.collectedData.days}-day trip to ${input.collectedData.destination}.
          
Now ask them about their budget preference (budget, moderate, luxury, or specific amount). Keep it conversational. Response should be 1-2 sentences max.`,
          
          budget: `The user specified budget: ${input.userInput} for their trip to ${input.collectedData.destination}.
          
Ask them to give their trip a memorable title or name. Keep it conversational and encouraging. Response should be 1-2 sentences max.`,
          
          title: `The user named their trip: "${input.userInput}"
          
Acknowledge the title and express excitement about generating their personalized itinerary. Keep it brief and enthusiastic. Response should be 1-2 sentences max.`,
          
          ready: `Generate an encouraging message about starting to create a personalized itinerary for a ${input.collectedData.days}-day trip to ${input.collectedData.destination}. Keep it brief (1 sentence).`,
        };

        const systemPrompt = `You are a friendly, enthusiastic travel assistant. Be conversational, encouraging, and concise in your responses. Use relevant emojis to make responses engaging.`;

        const response = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: MODEL,
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              {
                role: "user",
                content: prompts[input.step] || prompts.destination,
              },
            ],
            temperature: 0.8,
            max_tokens: 150,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "HTTP-Referer": process.env.OPENROUTER_REFERRER || "http://localhost:3000",
              "X-Title": "AI Itinerary Builder",
            },
          }
        );

        return response.data.choices[0].message.content.trim();
      } catch (error) {
        console.error("Error generating bot response:", error);
        const fallbacks: Record<string, string> = {
          destination: "🎯 Great choice! How many days will you be traveling? (1-30 days)",
          days: "📋 What are your interests or activities? (e.g., cultural, adventure, food)",
          interests: "💰 What's your budget range? (Budget, Moderate, Luxury, or specific amount)",
          budget: "📌 What's a memorable title for your trip?",
          title: "✨ Perfect! Let me generate your personalized itinerary...",
          ready: "🔄 Generating your itinerary...",
        };
        return fallbacks[input.step] || "Ready to continue!";
      }
    }),

  generateItinerary: publicProcedure
    .input(CreateTripInputSchema)
    .output(ItinerarySchema)
    .mutation(async ({ input }) => {
      try {
        const apiKey = process.env.OPENROUTER_API_KEY;
        if (!apiKey) {
          throw new Error("OPENROUTER_API_KEY not set");
        }

        const prompt = generateItineraryPrompt({
          destination: input.destination,
          days: input.days,
          budget: input.budget,
          interests: input.interests,
        });

        const response = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: MODEL,
            messages: [
              {
                role: "system",
                content: "You are a JSON generator. Output ONLY valid JSON. Start with [ and end with ]. No text before or after. No explanations.",
              },
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.3,
            max_tokens: 2000,
          },
          {
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "HTTP-Referer": process.env.OPENROUTER_REFERRER || "http://localhost:3000",
              "X-Title": "AI Itinerary Builder",
            },
          }
        );

        const content = response.data.choices[0].message.content.trim();
        console.log("[generateItinerary] API response (first 300 chars):", content.substring(0, 300));

        // Step 1: Remove markdown and extra whitespace
        let cleanedContent = content
          .replace(/```json\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();

        // Step 2: Find actual JSON array - look for [{ pattern
        let jsonStr = null;
        
        const jsonStartPattern = cleanedContent.indexOf('[{');
        if (jsonStartPattern !== -1) {
          let bracketCount = 0;
          let inString = false;
          let i = jsonStartPattern;
          
          while (i < cleanedContent.length) {
            const char = cleanedContent[i];
            
            if (char === '"' && (i === 0 || cleanedContent[i-1] !== '\\')) {
              inString = !inString;
            }
            
            if (!inString) {
              if (char === '[' || char === '{') {
                bracketCount++;
              } else if (char === ']' || char === '}') {
                bracketCount--;
                if (bracketCount === 0) {
                  jsonStr = cleanedContent.substring(jsonStartPattern, i + 1);
                  console.log("[generateItinerary] Found JSON via bracket matching");
                  break;
                }
              }
            }
            i++;
          }
        }
        
        // Fallback: simple bracket extraction
        if (!jsonStr) {
          const firstBracket = cleanedContent.indexOf('[');
          const lastBracket = cleanedContent.lastIndexOf(']');
          
          if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
            jsonStr = cleanedContent.substring(firstBracket, lastBracket + 1);
            console.log("[generateItinerary] Found JSON via bracket fallback");
          }
        }
        
        if (!jsonStr) {
          console.error("[generateItinerary] No JSON array brackets found in:", cleanedContent.substring(0, 500));
          throw new Error("Failed to extract itinerary JSON - no array brackets found. Please try again.");
        }

        console.log("[generateItinerary] Extracted JSON (first 200 chars):", jsonStr.substring(0, 200));
        
        // Step 3: Aggressive JSON content cleaning
        let cleanedJson = '';
        let inString = false;
        let escapeNext = false;
        
        for (let i = 0; i < jsonStr.length; i++) {
          const char = jsonStr[i];
          
          if (char === '"' && !escapeNext) {
            inString = !inString;
            cleanedJson += char;
          } else if (inString) {
            cleanedJson += char;
            escapeNext = char === '\\' && !escapeNext;
          } else if (char === '{') {
            cleanedJson += char;
          } else if (char === '}') {
            cleanedJson += char;
          } else if (char === '[') {
            cleanedJson += char;
          } else if (char === ']') {
            cleanedJson += char;
          } else if (/[\[\]{}:,.\d\-\s]/.test(char)) {
            cleanedJson += char;
          }
        }
        
        jsonStr = cleanedJson.trim();
        console.log("[generateItinerary] After content cleaning (first 200):", jsonStr.substring(0, 200));

        // Step 4: Balance brackets if truncated
        const openBraces = (jsonStr.match(/\{/g) || []).length;
        const closeBraces = (jsonStr.match(/\}/g) || []).length;
        const openBrackets = (jsonStr.match(/\[/g) || []).length;
        const closeBrackets = (jsonStr.match(/\]/g) || []).length;

        if (openBraces > closeBraces) {
          jsonStr += '}'.repeat(openBraces - closeBraces);
          console.log(`[generateItinerary] ✓ Added ${openBraces - closeBraces} missing closing braces`);
        }

        if (openBrackets > closeBrackets) {
          jsonStr += ']'.repeat(openBrackets - closeBrackets);
          console.log(`[generateItinerary] ✓ Added ${openBrackets - closeBrackets} missing closing brackets`);
        }

        // Step 5: Remove any text after final ]
        const finalBracket = jsonStr.lastIndexOf(']');
        if (finalBracket > -1) {
          jsonStr = jsonStr.substring(0, finalBracket + 1);
        }

        console.log("[generateItinerary] Final JSON (first 200 chars):", jsonStr.substring(0, 200));
        console.log("[generateItinerary] Final JSON (last 100 chars):", jsonStr.substring(Math.max(0, jsonStr.length - 100)));

        // Step 6: Parse JSON
        let parsed;
        try {
          parsed = JSON.parse(jsonStr);
          console.log("[generateItinerary] ✓ JSON parsed successfully");
        } catch (parseError) {
          const errorMsg = (parseError as Error).message;
          console.error("[generateItinerary] ✗ JSON parse failed:", errorMsg);
          
          const veryAggressiveClean = jsonStr
            .replace(/([^[\]{}:,"'\d.\-\s\\])/g, '')
            .replace(/\s+/g, ' ')
            .trim();
          
          try {
            parsed = JSON.parse(veryAggressiveClean);
            console.log("[generateItinerary] ✓ Parsed after very aggressive cleaning");
          } catch (retryError) {
            throw new Error(`Failed to parse itinerary JSON. Please try again with a different destination.`);
          }
        }

        // Validate against schema
        try {
          const validated = ItinerarySchema.parse(parsed);
          console.log("✓ Itinerary validated successfully");
          return validated;
        } catch (valError) {
          console.error("Schema validation failed:", valError);
          throw new Error("Itinerary structure was invalid. Please try again.");
        }
      } catch (error) {
        console.error("Error generating itinerary:", error);
        
        if (error instanceof z.ZodError) {
          console.error("Schema validation error:", error.errors);
          throw new Error(`Invalid itinerary format: Missing or incorrect field`);
        }
        
        if (axios.isAxiosError(error)) {
          const status = error.response?.status;
          console.error(`API Error (${status}):`, error.response?.data);
          
          if (status === 429) {
            throw new Error("API rate limited. Please wait a moment and try again.");
          } else if (status && status >= 500) {
            throw new Error("OpenRouter API is temporarily unavailable. Please try again.");
          }
        }
        
        if (error instanceof Error && error.message.includes("Invalid itinerary")) {
          throw error;
        }
        
        throw new Error(
          error instanceof Error 
            ? error.message 
            : "Failed to generate itinerary. Please try again with different preferences."
        );
      }
    }),
});