import { createFileRoute } from "@tanstack/react-router";
import { Visualizer } from "@/components/visualizer/Visualizer";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* ambient orbs */}
      <div
        className="bg-orb"
        style={{
          top: "-10%",
          left: "-5%",
          width: "500px",
          height: "500px",
          background: "oklch(0.7 0.22 295 / 0.35)",
        }}
      />
      <div
        className="bg-orb"
        style={{
          top: "30%",
          right: "-10%",
          width: "600px",
          height: "600px",
          background: "oklch(0.78 0.18 220 / 0.3)",
          animationDelay: "-7s",
        }}
      />
      <div
        className="bg-orb"
        style={{
          bottom: "-15%",
          left: "30%",
          width: "450px",
          height: "450px",
          background: "oklch(0.82 0.17 195 / 0.25)",
          animationDelay: "-3s",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-[1500px] flex-col px-4 py-6 md:px-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl"
              style={{
                background: "var(--gradient-primary)",
                boxShadow: "var(--shadow-glow)",
              }}
            >
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                <span className="text-gradient">Sortify</span>
              </h1>
              <p className="text-xs text-muted-foreground">
                Sorting algorithm visualizer
              </p>
            </div>
          </div>

        </header>

        <div className="flex-1">
          <Visualizer />
        </div>

        <footer className="mt-6 text-center text-xs text-muted-foreground">
          &copy; SAI ANIKA BOMPALLY -2026
        </footer>
      </div>
    </div>
  );
}
