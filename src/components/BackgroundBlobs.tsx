export default function BackgroundBlobs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Primary ocean blob */}
      <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[hsl(214_85%_45%/0.12)] blur-[120px] dark:bg-[hsl(210_90%_60%/0.08)]" />
      {/* Coral accent blob */}
      <div className="absolute -right-20 top-20 h-[400px] w-[400px] rounded-full bg-[hsl(16_90%_58%/0.10)] blur-[100px] dark:bg-[hsl(16_85%_62%/0.07)]" />
      {/* Warm sand bottom blob */}
      <div className="absolute bottom-0 left-1/3 h-[350px] w-[350px] rounded-full bg-[hsl(38_40%_70%/0.15)] blur-[140px] dark:bg-[hsl(220_25%_40%/0.08)]" />
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                            linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />
    </div>
  );
}