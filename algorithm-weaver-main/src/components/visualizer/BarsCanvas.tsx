import { lazy, Suspense, useMemo } from "react";
import type { SortStep } from "@/lib/sorting";

const Bars3D = lazy(() => import("./Bars3D"));

interface Props {
  step: SortStep;
  maxValue: number;
  is3D: boolean;
}

export function BarsCanvas({ step, maxValue, is3D }: Props) {
  const { array, indices, sorted, type } = step;

  const sortedSet = useMemo(() => new Set(sorted), [sorted]);
  const activeSet = useMemo(() => new Set(indices), [indices]);

  const getState = (i: number): string => {
    if (sortedSet.has(i)) return "sorted";
    if (activeSet.has(i)) {
      if (type === "swap" || type === "overwrite") return "active";
      return "comparing";
    }
    return "default";
  };

  const count = array.length;
  const gap = count > 40 ? 2 : count > 25 ? 4 : 6;

  // True WebGL 3D mode
  if (is3D) {
    return (
      <div className="relative h-full w-full">
        <Suspense
          fallback={
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              Loading 3D scene…
            </div>
          }
        >
          <Bars3D step={step} maxValue={maxValue} />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div
        className="relative flex h-full w-full items-end justify-center px-4 pb-4"
        style={{ gap: `${gap}px` }}
      >
        {array.map((value, i) => {
          const heightPct = (value / maxValue) * 100;
          const state = getState(i);
          return (
            <div
              key={i}
              data-state={state}
              className="viz-bar flex-1"
              style={{
                height: `${heightPct}%`,
                minWidth: count > 50 ? "4px" : "8px",
                maxWidth: "60px",
              }}
            >
              {count <= 80 && (
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[11px] font-semibold text-foreground/80">
                  {value}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}