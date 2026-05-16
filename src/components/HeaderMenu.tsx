"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  BookMarked,
  Info,
  GraduationCap,
  User,
  Code2,
  Globe,
  ChevronRight,
  Plane,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeaderMenu() {
  const [open, setOpen] = useState(false);
  const [showProject, setShowProject] = useState(false);
  const router = useRouter();

  return (
    <div className="relative">
      {/* Hamburger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => { setOpen((v) => !v); setShowProject(false); }}
        className="h-9 w-9 rounded-xl border border-border/60 bg-card/60 text-muted-foreground backdrop-blur-sm hover:bg-card hover:text-foreground"
        aria-label="Menu"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="h-4 w-4" />
            </motion.div>
          ) : (
            <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Menu className="h-4 w-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="absolute right-0 top-12 z-50 w-64 bg-card overflow-hidden rounded-2xl border border-border shadow-2xl shadow-foreground"
            >
              {!showProject ? (
                /* Main Menu */
                <div className="p-2">
                  <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
                    Navigation
                  </p>

                  <button
                    onClick={() => { router.push("/dashboard"); setOpen(false); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-primary/8 hover:text-primary"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <BookMarked className="h-4 w-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">Saved Itineraries</p>
                      <p className="text-[11px] text-muted-foreground">View your saved trips</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>

                  <button
                    onClick={() => setShowProject(true)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/8 hover:text-accent"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                      <GraduationCap className="h-4 w-4" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium">Project Info</p>
                      <p className="text-[11px] text-muted-foreground">About this BCA project</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>

                  <div className="my-2 h-px bg-border/50" />

                  <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Globe className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-foreground">Powered by</p>
                      <p className="text-[11px] text-muted-foreground">OpenRouter + Gemma 3</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Project Info Panel */
                <div className="p-2">
                  <button
                    onClick={() => setShowProject(false)}
                    className="mb-1 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <ChevronRight className="h-3 w-3 rotate-180" />
                    Back
                  </button>

                  {/* Project Card */}
                  <div className="mx-1 mb-2 overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-sm">
                        <Plane className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">AI Itinerary Builder</p>
                        <p className="text-[11px] text-muted-foreground">BCA Final Year Project</p>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div className="flex items-start gap-2">
                        <GraduationCap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        <div>
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Degree</p>
                          <p className="text-xs text-foreground">Bachelor of Computer Applications (BCA)</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <User className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                        <div>
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Developer</p>
                          <p className="text-xs text-foreground">Your Name</p>
                          <p className="text-[11px] text-muted-foreground">Roll No: XXXXXXXX</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                        <div>
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Guide</p>
                          <p className="text-xs text-foreground">Prof. Guide Name</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Code2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-500" />
                        <div>
                          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Tech Stack</p>
                          <p className="text-xs text-foreground">Next.js · tRPC · Prisma</p>
                          <p className="text-xs text-foreground">OpenRouter AI · Leaflet</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="px-3 pb-2 text-center text-[10px] text-muted-foreground/50">
                    © 2025 · All rights reserved
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}