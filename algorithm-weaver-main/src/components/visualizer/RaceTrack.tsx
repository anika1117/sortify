import { useMemo } from "react";
import { Trophy } from "lucide-react";
import { ALGORITHMS, generateSteps, type AlgorithmKey, type SortStep } from "@/lib/sorting";
import { BarsCanvas } from "./BarsCanvas";


interface Props {
  algo: AlgorithmKey;
  array: number[];
  stepIndex: number;
  is3D: boolean;
  isWinner: boolean;
}

export function RaceTrack({
  algo,
  array,
  stepIndex,
  is3D,
  isWinner,
}: Props) {
  const steps = useMemo<SortStep[]>(() => generateSteps(algo, array), [algo, array]);
  const clamped = Math.min(stepIndex, steps.length - 1);
  const step = steps[clamped];
  const maxValue = useMemo(() => Math.max(...array, 1), [array]);
  const finished = stepIndex >= steps.length - 1;
  const progress = ((clamped + 1) / steps.length) * 100;
  const info = ALGORITHMS[algo];



  return (
    <div
      className={`glass-strong relative overflow-hidden rounded-2xl p-4 transition-all ${isWinner ? "ring-2 ring-primary/60" : ""
        }`}
      style={
        isWinner
          ? { boxShadow: "var(--shadow-glow)" }
          : undefined
      }
    >
      {isWinner && finished && (
        <div
          className="absolute right-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-foreground"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Trophy className="h-3 w-3" /> Winner
        </div>
      )}

      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gradient">{info.name}</h3>
        <span className="font-mono text-xs text-muted-foreground">
          {clamped + 1}/{steps.length}
        </span>
      </div>

      <div className="relative h-[200px] w-full md:h-[240px]">
        <BarsCanvas step={step} maxValue={maxValue} is3D={is3D} />
      </div>

      <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/5">
        <div
          className="h-full rounded-full transition-all duration-200"
          style={{
            width: `${progress}%`,
            background: "var(--gradient-primary)",
          }}
        />
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Stat label="Compares" value={step.comparisons} />
        <Stat label="Swaps" value={step.swaps} />
        <Stat label="Accesses" value={step.arrayAccesses} />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5">
      <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="font-mono text-sm font-semibold">{value}</p>
    </div>
  );
}