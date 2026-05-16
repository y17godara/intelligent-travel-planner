import { generateItineraryPDF } from "@/lib/pdf-generator";
import { Itinerary } from "@/types";

export async function POST(request: Request) {
  try {
    const { title, destination, itinerary } = await request.json();

    if (!title || !destination || !itinerary) {
      return new Response("Missing required fields", { status: 400 });
    }

    const pdfBuffer = await generateItineraryPDF(
      itinerary as Itinerary,
      title,
      destination
    );

    return new Response(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${title.replace(/\s+/g, "_")}_itinerary.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return new Response("Failed to generate PDF", { status: 500 });
  }
}
