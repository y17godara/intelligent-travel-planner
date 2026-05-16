import type { Metadata } from "next";
import { Providers } from "@/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Itinerary Builder",
  description: "Create your perfect travel itinerary with AI",
  icons: {
    icon: "✈️",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
