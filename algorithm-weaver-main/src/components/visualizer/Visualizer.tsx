import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Shuffle,
  Boxes,
  Code2,
  Activity,
  Gauge,
  ListOrdered,
  Pencil,
  Lightbulb,
  Target,
  BookOpen,

  Layers,
  Trophy,
} from "lucide-react";
import {
  ALGORITHMS,
  generateSteps,
  randomArray,
  type AlgorithmKey,
  type SortStep,
} from "@/lib/sorting";
import { BarsCanvas } from "./BarsCanvas";
import { RaceTrack } from "./RaceTrack";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";


const ALGO_KEYS: AlgorithmKey[] = ["bubble", "selection", "insertion", "merge", "quick"];

type ViewMode = "single" | "race";



export function Visualizer() {
  const [algo, setAlgo] = useState<AlgorithmKey>("bubble");
  const [size, setSize] = useState(20);
  const [speed, setSpeed] = useState(70); // 0-100
  const [is3D, setIs3D] = useState(false);
  const [showPseudo, setShowPseudo] = useState(false);
  const [array, setArray] = useState<number[]>(() => randomArray(20));
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [mode, setMode] = useState<ViewMode>("single");




  const steps = useMemo<SortStep[]>(
    () => generateSteps(algo, array),
    [algo, array],
  );

  const maxValue = useMemo(
    () => Math.max(...array, 1),
    [array],
  );

  const currentStep: SortStep = steps[stepIndex] ?? {
    type: "compare",
    indices: [],
    array,
    sorted: [],
    description: "Ready",
    comparisons: 0,
    swaps: 0,
    arrayAccesses: 0,
  };

  // Race-mode totals across all algorithms (for winner detection)
  const raceLengths = useMemo(() => {
    if (mode !== "race") return null;
    return ALGO_KEYS.map((k) => ({
      algo: k,
      length: generateSteps(k, array).length,
    }));
  }, [mode, array]);
  const winnerAlgo = useMemo<AlgorithmKey | null>(() => {
    if (!raceLengths) return null;
    return raceLengths.reduce((min, r) =>
      r.length < min.length ? r : min,
    ).algo;
  }, [raceLengths]);
  const maxRaceLength = useMemo(
    () => (raceLengths ? Math.max(...raceLengths.map((r) => r.length)) : 0),
    [raceLengths],
  );

  // Reset step when algorithm, array, or mode changes
  useEffect(() => {
    setStepIndex(0);
    setPlaying(false);
  }, [algo, array, mode]);

  // Playback loop
  const playingRef = useRef(playing);
  playingRef.current = playing;
  const speedRef = useRef(speed);
  speedRef.current = speed;

  useEffect(() => {
    if (!playing) return;
    let cancelled = false;
    const totalLen = mode === "race" ? maxRaceLength : steps.length;
    const tick = () => {
      if (cancelled) return;
      setStepIndex((idx) => {
        if (idx >= totalLen - 1) {
          setPlaying(false);
          return idx;
        }
        return idx + 1;
      });
      // delay maps speed [0..100] -> [600..20]ms
      const delay = Math.max(15, 620 - speedRef.current * 6);
      timer = window.setTimeout(tick, delay);
    };
    let timer = window.setTimeout(tick, Math.max(15, 620 - speed * 6));
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [playing, steps.length, speed, mode, maxRaceLength]);



  const totalForControls = mode === "race" ? maxRaceLength : steps.length;
  const handleNext = useCallback(() => {
    setStepIndex((i) => Math.min(totalForControls - 1, i + 1));
  }, [totalForControls]);
  const handlePrev = useCallback(
    () => setStepIndex((i) => Math.max(0, i - 1)),
    [],
  );
  const handleReset = useCallback(() => {
    setStepIndex(0);
    setPlaying(false);
  }, []);
  const handleShuffle = useCallback(() => {
    setArray(randomArray(size));
  }, [size]);

  const handleApplyCustom = useCallback(() => {
    const parsed = customInput
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => Number(s));
    if (parsed.length < 2 || parsed.some((n) => !Number.isFinite(n))) {
      toast.error("Please enter at least 2 valid numbers, separated by commas.");
      return;
    }
    if (parsed.length > 80) {
      toast.error("Please enter 80 numbers or fewer.");
      return;
    }
    const clamped = parsed.map((n) => Math.max(1, Math.min(120, Math.round(n))));
    setArray(clamped);
    setSize(clamped.length);
    setCustomOpen(false);
    toast.success(`Loaded ${clamped.length} custom values`);
  }, [customInput]);

  const info = ALGORITHMS[algo];
  const progress = ((stepIndex + 1) / Math.max(1, totalForControls)) * 100;

  return (
    <div
      className={`grid h-full grid-cols-1 gap-6 ${mode === "single"
          ? "lg:grid-cols-[300px_1fr_320px]"
          : "lg:grid-cols-[300px_1fr]"
        }`}
    >
      {/* LEFT - Controls */}
      <aside className="glass rounded-2xl p-5 space-y-6 animate-fade-in">
        {/* Mode toggle */}
        <section>
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Layers className="h-3.5 w-3.5" /> View mode
          </h3>
          <div className="grid grid-cols-2 gap-2 rounded-xl border border-white/10 bg-white/5 p-1">
            {(["single", "race"] as ViewMode[]).map((m) => {
              const active = mode === m;
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-all ${active
                      ? "text-primary-foreground"
                      : "text-foreground/70 hover:text-foreground"
                    }`}
                  style={
                    active
                      ? {
                        background: "var(--gradient-primary)",
                        boxShadow: "var(--shadow-glow)",
                      }
                      : undefined
                  }
                >
                  {m === "race" ? (
                    <span className="flex items-center justify-center gap-1.5">
                      <Trophy className="h-3 w-3" /> Race
                    </span>
                  ) : (
                    "Single"
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {mode === "single" && (
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <ListOrdered className="h-3.5 w-3.5" /> Algorithm
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {ALGO_KEYS.map((k) => {
                const active = algo === k;
                return (
                  <button
                    key={k}
                    onClick={() => setAlgo(k)}
                    className={`group relative overflow-hidden rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${active
                        ? "border-transparent text-primary-foreground"
                        : "border-white/10 bg-white/5 text-foreground/80 hover:bg-white/10"
                      }`}
                    style={
                      active
                        ? {
                          background: "var(--gradient-primary)",
                          boxShadow: "var(--shadow-glow)",
                        }
                        : undefined
                    }
                  >
                    {ALGORITHMS[k].name}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-2">
              <Gauge className="h-3.5 w-3.5" /> Speed
            </span>
            <span className="text-foreground/70 normal-case">{speed}%</span>
          </div>
          <input
            type="range"
            min={5}
            max={100}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="premium-slider w-full"
          />
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <span className="flex items-center gap-2">
              <Activity className="h-3.5 w-3.5" /> Array size
            </span>
            <span className="text-foreground/70 normal-case">{size}</span>
          </div>
          <input
            type="range"
            min={5}
            max={60}
            value={size}
            onChange={(e) => {
              const s = Number(e.target.value);
              setSize(s);
              setArray(randomArray(s));
            }}
            className="premium-slider w-full"
          />
        </section>

        <section className="space-y-2">
          <Button
            onClick={handleShuffle}
            className="w-full justify-start gap-2 border border-white/10 bg-white/5 text-foreground hover:bg-white/10"
            variant="ghost"
          >
            <Shuffle className="h-4 w-4" /> Generate new array
          </Button>
          <Dialog open={customOpen} onOpenChange={setCustomOpen}>
            <DialogTrigger asChild>
              <Button
                className="w-full justify-start gap-2 border border-white/10 bg-white/5 text-foreground hover:bg-white/10"
                variant="ghost"
                onClick={() =>
                  setCustomInput(array.join(", "))
                }
              >
                <Pencil className="h-4 w-4" /> Custom input
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-strong border-white/10">
              <DialogHeader>
                <DialogTitle className="text-gradient">Custom array</DialogTitle>
                <DialogDescription>
                  Enter 2–80 numbers (1–120) separated by commas or spaces.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="e.g. 34, 7, 23, 32, 5, 62, 18"
                  className="border-white/10 bg-white/5 font-mono"
                />
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {["5,2,8,1,9,3", "10,9,8,7,6,5,4,3,2,1", "1,2,3,4,5,6,7,8"].map(
                    (preset) => (
                      <button
                        key={preset}
                        onClick={() => setCustomInput(preset)}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 hover:bg-white/10"
                      >
                        {preset}
                      </button>
                    ),
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setCustomOpen(false)}
                  className="border border-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApplyCustom}
                  className="text-primary-foreground"
                  style={{
                    background: "var(--gradient-primary)",
                    boxShadow: "var(--shadow-glow)",
                  }}
                >
                  Apply
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            onClick={() => setIs3D((v) => !v)}
            className="w-full justify-start gap-2 border border-white/10 bg-white/5 text-foreground hover:bg-white/10"
            variant="ghost"
          >
            <Boxes className="h-4 w-4" />
            {is3D ? "Disable 3D mode" : "Enable 3D mode"}
          </Button>
          <Button
            onClick={() => setShowPseudo((v) => !v)}
            className="w-full justify-start gap-2 border border-white/10 bg-white/5 text-foreground hover:bg-white/10"
            variant="ghost"
          >
            <Code2 className="h-4 w-4" />
            {showPseudo ? "Hide pseudocode" : "Show pseudocode"}
          </Button>
        </section>


      </aside>

      {/* CENTER - Visualization */}
      <main className="flex flex-col gap-4">
        {mode === "single" ? (
          <div className="glass-strong relative flex-1 overflow-hidden rounded-2xl p-6">
            {/* Top label */}
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Now visualizing
                </p>
                <h2 className="text-xl font-semibold text-gradient">
                  {info.name}
                </h2>
                {is3D && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Drag to orbit · scroll to zoom
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Step
                </p>
                <p className="font-mono text-lg font-semibold">
                  {stepIndex + 1}{" "}
                  <span className="text-muted-foreground">/ {steps.length}</span>
                </p>
              </div>
            </div>

            {/* Live metrics */}
            <div className="mb-4 grid grid-cols-3 gap-2">
              <MetricCell label="Comparisons" value={currentStep.comparisons} />
              <MetricCell label="Swaps / writes" value={currentStep.swaps} />
              <MetricCell label="Array accesses" value={currentStep.arrayAccesses} />
            </div>

            {/* Bars */}
            <div className="relative h-[380px] w-full md:h-[440px]">
              <BarsCanvas
                step={currentStep}
                maxValue={maxValue}
                is3D={is3D}
              />
            </div>

            {/* Progress bar */}
            <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{
                  width: `${progress}%`,
                  background: "var(--gradient-primary)",
                  boxShadow: "var(--shadow-glow)",
                }}
              />
            </div>

            {/* Status line */}
            <div className="mt-3 flex items-center gap-2 text-sm text-foreground/85">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: "var(--primary)" }}
              />
              <span className="font-medium">{currentStep.description}</span>
            </div>
          </div>
        ) : (
          /* RACE GRID */
          <div className="glass-strong flex-1 rounded-2xl p-4 md:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Race mode
                </p>
                <h2 className="text-xl font-semibold text-gradient">
                  Same array · same step · different algorithms
                </h2>
                {is3D && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Drag any scene to orbit · scroll to zoom
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Step
                </p>
                <p className="font-mono text-lg font-semibold">
                  {stepIndex + 1}{" "}
                  <span className="text-muted-foreground">
                    / {maxRaceLength}
                  </span>
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {ALGO_KEYS.map((k) => (
                <RaceTrack
                  key={k}
                  algo={k}
                  array={array}
                  stepIndex={stepIndex}
                  is3D={is3D}
                  isWinner={winnerAlgo === k}
                />
              ))}
            </div>
          </div>
        )}

        {/* Controls bar */}
        <div className="glass flex items-center justify-between rounded-2xl p-3">
          <div className="flex items-center gap-2">
            <ControlBtn onClick={handleReset} label="Reset">
              <RotateCcw className="h-4 w-4" />
            </ControlBtn>
            <ControlBtn onClick={handlePrev} label="Previous">
              <SkipBack className="h-4 w-4" />
            </ControlBtn>
            <button
              onClick={() => {
                if (stepIndex >= steps.length - 1) setStepIndex(0);
                setPlaying((p) => !p);
              }}
              className="flex h-12 w-12 items-center justify-center rounded-full text-primary-foreground transition-transform hover:scale-105"
              style={{
                background: "var(--gradient-primary)",
                boxShadow: "var(--shadow-glow)",
              }}
              aria-label={playing ? "Pause" : "Play"}
            >
              {playing ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="ml-0.5 h-5 w-5" />
              )}
            </button>
            <ControlBtn onClick={handleNext} label="Next">
              <SkipForward className="h-4 w-4" />
            </ControlBtn>
          </div>

          {/* Legend */}
          <div className="hidden items-center gap-4 text-xs md:flex">
            <Legend color="var(--bar-default)" label="Idle" />
            <Legend color="var(--bar-comparing)" label="Comparing" />
            <Legend color="var(--bar-active)" label="Active" />
            <Legend color="var(--bar-sorted)" label="Sorted" />
          </div>
        </div>
      </main>

      {/* RIGHT - Info */}
      {mode === "single" && (
        <aside className="glass space-y-5 rounded-2xl p-5 animate-fade-in">
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              About
            </h3>
            <h2 className="mt-1 text-xl font-semibold text-gradient">
              {info.name}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">
              {info.description}
            </p>
          </section>

          <section>
            <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" /> How it works
            </h3>
            <ol className="space-y-1.5 text-sm text-foreground/85">
              {info.howItWorks.map((step, i) => (
                <li key={i} className="flex gap-2.5">
                  <span
                    className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-primary-foreground"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    {i + 1}
                  </span>
                  <span className="leading-snug">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Lightbulb className="h-3.5 w-3.5" /> Key insight
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">
              {info.keyInsight}
            </p>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Target className="h-3.5 w-3.5" /> When to use
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-foreground/85">
              {info.useCase}
            </p>
          </section>

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Complexity
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <ComplexityCell label="Best" value={info.best} accent />
              <ComplexityCell label="Average" value={info.average} />
              <ComplexityCell label="Worst" value={info.worst} />
              <ComplexityCell label="Space" value={info.space} />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Stable: <span className="text-foreground/80">{info.stable ? "Yes" : "No"}</span>
            </p>
          </section>

          {showPseudo && (
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pseudocode
              </h3>
              <pre className="overflow-x-auto rounded-lg border border-white/10 bg-black/30 p-3 font-mono text-xs leading-relaxed text-foreground/90">
                {info.pseudocode.join("\n")}
              </pre>
            </section>
          )}

          <section>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Live operation
            </h3>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm">
              <p className="text-foreground/90">{currentStep.description}</p>
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                type: {currentStep.type}
                {currentStep.indices.length > 0 &&
                  ` · indices: [${currentStep.indices.join(", ")}]`}
              </p>
            </div>
          </section>
        </aside>
      )}
    </div>
  );
}

function ControlBtn({
  children,
  onClick,
  label,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-foreground/90 transition-all hover:bg-white/10 hover:scale-105"
    >
      {children}
    </button>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className="h-2.5 w-2.5 rounded-sm"
        style={{ background: color }}
      />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}

function ComplexityCell({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-lg border border-white/10 bg-white/5 p-3"
      style={
        accent
          ? {
            borderColor: "transparent",
            background:
              "linear-gradient(135deg, oklch(0.7 0.22 295 / 0.18), oklch(0.78 0.18 220 / 0.12))",
          }
          : undefined
      }
    >
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 font-mono text-sm font-semibold">{value}</p>
    </div>
  );
}

function MetricCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-0.5 font-mono text-base font-semibold">
        {value.toLocaleString()}
      </p>
    </div>
  );
}