"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, BookMarked, Info, GraduationCap,
  User, Code2, Globe, ChevronRight, Plane,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function HeaderMenu() {
  const [open, setOpen] = useState(false);
  const [showProject, setShowProject] = useState(false);
  const router = useRouter();

  const close = () => { setOpen(false); setShowProject(false); };

  return (
    <div className="relative">
      {/* Hamburger Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => { setOpen((v) => !v); setShowProject(false); }}
        className="h-9 w-9 rounded-xl border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Menu"
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.div key="x"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-4 w-4" />
            </motion.div>
          ) : (
            <motion.div key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Menu className="h-4 w-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={close} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -8 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              // ✅ solid bg — no opacity modifier so it's always visible
              className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
              style={{ isolation: "isolate" }}
            >
              <AnimatePresence mode="wait">
                {!showProject ? (
                  <motion.div
                    key="main"
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.15 }}
                    className="p-2"
                  >
                    <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Navigation
                    </p>

                    {/* Saved Itineraries */}
                    <button
                      onClick={() => { router.push("/dashboard"); close(); }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
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

                    {/* Project Info */}
                    <button
                      onClick={() => setShowProject(true)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
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

                    <div className="my-2 h-px bg-border" />

                    {/* Powered by — static info */}
                    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Globe className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">Powered by</p>
                        <p className="text-[11px] text-muted-foreground">OpenRouter + Gemma 3</p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="project"
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    transition={{ duration: 0.15 }}
                    className="p-2"
                  >
                    {/* Back button */}
                    <button
                      onClick={() => setShowProject(false)}
                      className="mb-1 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <ChevronRight className="h-3 w-3 rotate-180" />
                      Back
                    </button>

                    {/* Project Card */}
                    <div className="mx-1 mb-2 rounded-xl border border-border bg-muted/50 p-4">
                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-sm">
                          <Plane className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">AI Itinerary Builder</p>
                          <p className="text-[11px] text-muted-foreground">BCA Final Year Project</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Row icon={<GraduationCap className="h-3.5 w-3.5 text-primary" />} label="Degree">
                          Bachelor of Computer Applications (BCA)
                        </Row>
                        <Row icon={<User className="h-3.5 w-3.5 text-accent" />} label="Developer">
                          Your Name
                          <span className="block text-[11px] text-muted-foreground">Roll No: XXXXXXXX</span>
                        </Row>
                        <Row icon={<Info className="h-3.5 w-3.5 text-emerald-500" />} label="Guide">
                          Prof. Guide Name
                        </Row>
                        <Row icon={<Code2 className="h-3.5 w-3.5 text-violet-500" />} label="Tech Stack">
                          Next.js · tRPC · Prisma
                          <span className="block">OpenRouter AI · Leaflet</span>
                        </Row>
                      </div>
                    </div>

                    <p className="px-3 pb-1 text-center text-[10px] text-muted-foreground/50">
                      © 2025 · All rights reserved
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Small helper to reduce repetition
function Row({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-xs text-foreground">{children}</p>
      </div>
    </div>
  );
}