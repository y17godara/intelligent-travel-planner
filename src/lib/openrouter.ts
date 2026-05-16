import axios from "axios";

export interface OpenRouterMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export const openrouterApi = {
  async chat(messages: OpenRouterMessage[], model: string = "meta-llama/llama-2-70b-chat-free") {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY not set");
    }

    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model,
          messages,
          temperature: 0.7,
          max_tokens: 2000,
          top_p: 1,
          top_k: 0,
          frequency_penalty: 0,
          presence_penalty: 0,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": process.env.OPENROUTER_REFERRER || "http://localhost:3000",
            "X-Title": "AI Itinerary Builder",
          },
          timeout: 30000,
        }
      );

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("OpenRouter API Error:", error);
      throw error;
    }
  },

  async generateText(prompt: string) {
    return this.chat([{ role: "user", content: prompt }]);
  },
};
