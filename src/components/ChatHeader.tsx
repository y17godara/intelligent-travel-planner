// import ThemeToggle from "./ThemeToggle";
import HeaderMenu from "./HeaderMenu";

export default function ChatHeader() {
  return (
    <header className="relative z-10 border-b border-border/50 glass-strong px-6 py-4">
      <div className="mx-auto flex max-w-4xl items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/25">
            <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
            </svg>
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-primary/70 dark:text-primary/60">
              AI Trip Studio
            </p>
            <h1 className="font-display text-xl font-semibold leading-tight text-foreground md:text-2xl">
              Itinerary Builder
            </h1>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-2 text-xs font-medium text-muted-foreground backdrop-blur-sm md:flex">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse-glow" />
            Live session
          </div>
          {/* <ThemeToggle /> */} // --- IGNORE ---
          <HeaderMenu />
        </div>
      </div>
    </header>
  );
}