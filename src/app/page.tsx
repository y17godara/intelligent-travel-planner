import ChatBot from "@/components/ChatBot";
import ChatHeader from "@/components/ChatHeader";
import BackgroundBlobs from "@/components/BackgroundBlobs";

export default function Home() {
  return (
    <main className="relative flex h-screen flex-col overflow-hidden bg-background text-foreground">
      <BackgroundBlobs />
      <ChatHeader />
      <ChatBot />
    </main>
  );
}