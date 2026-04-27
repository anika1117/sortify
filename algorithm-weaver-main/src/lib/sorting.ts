export type StepType = "compare" | "swap" | "overwrite" | "mark-sorted" | "done";

export interface SortStep {
  type: StepType;
  /** indices being compared / acted on */
  indices: number[];
  /** snapshot of the array AFTER this step */
  array: number[];
  /** indices that are now confirmed sorted */
  sorted: number[];
  /** human description */
  description: string;
  /** cumulative metrics up to and including this step */
  comparisons: number;
  swaps: number;
  arrayAccesses: number;
}

export type AlgorithmKey = "bubble" | "selection" | "insertion" | "merge" | "quick";

export interface AlgorithmInfo {
  key: AlgorithmKey;
  name: string;
  description: string;
  howItWorks: string[];
  keyInsight: string;
  useCase: string;
  best: string;
  average: string;
  worst: string;
  space: string;
  stable: boolean;
  pseudocode: string[];
}

export const ALGORITHMS: Record<AlgorithmKey, AlgorithmInfo> = {
  bubble: {
    key: "bubble",
    name: "Bubble Sort",
    description:
      "Repeatedly steps through the list, compares adjacent pairs and swaps them if they are in the wrong order. Largest values bubble up to the end on each pass.",
    howItWorks: [
      "Start at index 0 and compare it with index 1.",
      "If the left value is greater, swap them.",
      "Move one step right and repeat the comparison.",
      "After each full pass, the largest unsorted value 'bubbles' to the end.",
      "Repeat passes until no swaps happen — the array is sorted.",
    ],
    keyInsight:
      "Only adjacent elements are ever swapped, so each pass moves the next-largest value exactly one position into place.",
    useCase:
      "Best as a teaching tool. Useful in practice only on tiny or nearly-sorted arrays where its early-exit makes it surprisingly fast.",
    best: "O(n)",
    average: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    stable: true,
    pseudocode: [
      "for i from 0 to n-1:",
      "  swapped = false",
      "  for j from 0 to n-i-2:",
      "    if a[j] > a[j+1]:",
      "      swap(a[j], a[j+1])",
      "      swapped = true",
      "  if not swapped: break",
    ],
  },
  selection: {
    key: "selection",
    name: "Selection Sort",
    description:
      "Divides the array into a sorted and unsorted region. Repeatedly selects the minimum from the unsorted region and moves it to the end of the sorted region.",
    howItWorks: [
      "Treat index 0 as the start of the unsorted region.",
      "Scan the unsorted region to find the smallest value.",
      "Swap that smallest value with the first unsorted slot.",
      "Grow the sorted region by one and repeat for the next slot.",
      "After n−1 passes, every element is in place.",
    ],
    keyInsight:
      "It always performs the same number of comparisons regardless of input — but it minimizes the number of swaps (at most n−1).",
    useCase:
      "Useful when writes are expensive (e.g. flash memory) since it performs very few swaps compared to bubble or insertion sort.",
    best: "O(n²)",
    average: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    stable: false,
    pseudocode: [
      "for i from 0 to n-1:",
      "  min = i",
      "  for j from i+1 to n-1:",
      "    if a[j] < a[min]: min = j",
      "  swap(a[i], a[min])",
    ],
  },
  insertion: {
    key: "insertion",
    name: "Insertion Sort",
    description:
      "Builds the sorted array one element at a time by taking each new element and inserting it into its correct position among the already sorted elements.",
    howItWorks: [
      "Treat the first element as a sorted sub-array of size 1.",
      "Pick the next element (the 'key') from the unsorted region.",
      "Compare the key leftward against sorted elements.",
      "Shift larger elements one slot to the right.",
      "Drop the key into the gap. Repeat until the array is consumed.",
    ],
    keyInsight:
      "Like sorting playing cards in your hand — each new card slides left until it finds its place.",
    useCase:
      "Excellent for small arrays (n < 50) and nearly-sorted data. Many hybrid sorts (Timsort, Introsort) fall back to insertion sort for small partitions.",
    best: "O(n)",
    average: "O(n²)",
    worst: "O(n²)",
    space: "O(1)",
    stable: true,
    pseudocode: [
      "for i from 1 to n-1:",
      "  key = a[i]; j = i - 1",
      "  while j >= 0 and a[j] > key:",
      "    a[j+1] = a[j]; j -= 1",
      "  a[j+1] = key",
    ],
  },
  merge: {
    key: "merge",
    name: "Merge Sort",
    description:
      "A divide-and-conquer algorithm that splits the array in half recursively, sorts each half, then merges them back together in sorted order.",
    howItWorks: [
      "Split the array down the middle into two halves.",
      "Recursively apply merge sort to each half.",
      "Merge the two sorted halves by comparing front elements.",
      "The smaller element is written into the result position.",
      "Repeat until both halves are fully merged into one sorted array.",
    ],
    keyInsight:
      "By always merging two already-sorted halves, each merge step is linear — giving the algorithm its guaranteed O(n log n) time even in the worst case.",
    useCase:
      "The go-to sort when stable O(n log n) is required. Preferred for linked lists and external sorting (large files). Used in Timsort (Python, Java).",
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(n)",
    stable: true,
    pseudocode: [
      "function mergeSort(a, lo, hi):",
      "  if lo >= hi: return",
      "  mid = (lo + hi) / 2",
      "  mergeSort(a, lo, mid)",
      "  mergeSort(a, mid+1, hi)",
      "  merge(a, lo, mid, hi)",
      "",
      "function merge(a, lo, mid, hi):",
      "  copy left = a[lo..mid]",
      "  copy right = a[mid+1..hi]",
      "  i=0, j=0, k=lo",
      "  while i<left.len and j<right.len:",
      "    if left[i] <= right[j]: a[k++]=left[i++]",
      "    else: a[k++]=right[j++]",
      "  copy remaining left/right into a",
    ],
  },
  quick: {
    key: "quick",
    name: "Quick Sort",
    description:
      "Picks a pivot element, partitions the array so everything smaller is to the left and larger to the right, then recursively sorts both partitions.",
    howItWorks: [
      "Choose the last element as the pivot.",
      "Scan left-to-right; move elements smaller than pivot to the left partition.",
      "Place the pivot in its correct final position.",
      "Recursively apply quick sort to the left and right partitions.",
      "Base case: partitions of size 0 or 1 are already sorted.",
    ],
    keyInsight:
      "The partition step puts the pivot in its exact final position in one pass — so each recursive call works on a strictly smaller problem.",
    useCase:
      "Often the fastest sort in practice due to cache efficiency. Used as the default sort in many standard libraries (C qsort, V8 Array.sort for large arrays).",
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n²)",
    space: "O(log n)",
    stable: false,
    pseudocode: [
      "function quickSort(a, lo, hi):",
      "  if lo >= hi: return",
      "  p = partition(a, lo, hi)",
      "  quickSort(a, lo, p-1)",
      "  quickSort(a, p+1, hi)",
      "",
      "function partition(a, lo, hi):",
      "  pivot = a[hi]",
      "  i = lo - 1",
      "  for j from lo to hi-1:",
      "    if a[j] <= pivot:",
      "      i++; swap(a[i], a[j])",
      "  swap(a[i+1], a[hi])",
      "  return i+1",
    ],
  },
};

function snapshot(arr: number[]): number[] {
  return arr.slice();
}

export function bubbleSortSteps(input: number[]): SortStep[] {
  const a = input.slice();
  const steps: SortStep[] = [];
  const sorted: number[] = [];
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;
  let arrayAccesses = 0;
  for (let i = 0; i < n - 1; i++) {
    let swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      arrayAccesses += 2;
      steps.push({
        type: "compare",
        indices: [j, j + 1],
        array: snapshot(a),
        sorted: sorted.slice(),
        description: `Compare index ${j} (${a[j]}) with index ${j + 1} (${a[j + 1]})`,
        comparisons,
        swaps,
        arrayAccesses,
      });
      if (a[j] > a[j + 1]) {
        const x = a[j];
        const y = a[j + 1];
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        swaps++;
        arrayAccesses += 4;
        swapped = true;
        steps.push({
          type: "swap",
          indices: [j, j + 1],
          array: snapshot(a),
          sorted: sorted.slice(),
          description: `Swap ${x} and ${y}`,
          comparisons,
          swaps,
          arrayAccesses,
        });
      }
    }
    sorted.unshift(n - i - 1);
    steps.push({
      type: "mark-sorted",
      indices: [n - i - 1],
      array: snapshot(a),
      sorted: sorted.slice(),
      description: `Index ${n - i - 1} is now in its final position`,
      comparisons,
      swaps,
      arrayAccesses,
    });
    if (!swapped) break;
  }
  // mark all sorted
  const all = Array.from({ length: n }, (_, i) => i);
  steps.push({
    type: "done",
    indices: [],
    array: snapshot(a),
    sorted: all,
    description: "Array is fully sorted ✓",
    comparisons,
    swaps,
    arrayAccesses,
  });
  return steps;
}

export function selectionSortSteps(input: number[]): SortStep[] {
  const a = input.slice();
  const steps: SortStep[] = [];
  const sorted: number[] = [];
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;
  let arrayAccesses = 0;
  for (let i = 0; i < n; i++) {
    let min = i;
    arrayAccesses += 1;
    steps.push({
      type: "compare",
      indices: [i],
      array: snapshot(a),
      sorted: sorted.slice(),
      description: `Assume index ${i} (${a[i]}) is the minimum`,
      comparisons,
      swaps,
      arrayAccesses,
    });
    for (let j = i + 1; j < n; j++) {
      comparisons++;
      arrayAccesses += 2;
      steps.push({
        type: "compare",
        indices: [min, j],
        array: snapshot(a),
        sorted: sorted.slice(),
        description: `Compare current min ${a[min]} with index ${j} (${a[j]})`,
        comparisons,
        swaps,
        arrayAccesses,
      });
      if (a[j] < a[min]) {
        min = j;
        steps.push({
          type: "compare",
          indices: [min],
          array: snapshot(a),
          sorted: sorted.slice(),
          description: `New minimum found at index ${min} (${a[min]})`,
          comparisons,
          swaps,
          arrayAccesses,
        });
      }
    }
    if (min !== i) {
      const x = a[i];
      const y = a[min];
      [a[i], a[min]] = [a[min], a[i]];
      swaps++;
      arrayAccesses += 4;
      steps.push({
        type: "swap",
        indices: [i, min],
        array: snapshot(a),
        sorted: sorted.slice(),
        description: `Swap ${x} and ${y}`,
        comparisons,
        swaps,
        arrayAccesses,
      });
    }
    sorted.push(i);
    steps.push({
      type: "mark-sorted",
      indices: [i],
      array: snapshot(a),
      sorted: sorted.slice(),
      description: `Index ${i} is now in its final position`,
      comparisons,
      swaps,
      arrayAccesses,
    });
  }
  steps.push({
    type: "done",
    indices: [],
    array: snapshot(a),
    sorted: Array.from({ length: n }, (_, i) => i),
    description: "Array is fully sorted ✓",
    comparisons,
    swaps,
    arrayAccesses,
  });
  return steps;
}

export function insertionSortSteps(input: number[]): SortStep[] {
  const a = input.slice();
  const steps: SortStep[] = [];
  const sorted: number[] = [0];
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;
  let arrayAccesses = 0;
  steps.push({
    type: "mark-sorted",
    indices: [0],
    array: snapshot(a),
    sorted: sorted.slice(),
    description: `Start: index 0 is trivially sorted`,
    comparisons,
    swaps,
    arrayAccesses,
  });
  for (let i = 1; i < n; i++) {
    const key = a[i];
    arrayAccesses += 1;
    steps.push({
      type: "compare",
      indices: [i],
      array: snapshot(a),
      sorted: sorted.slice(),
      description: `Pick key ${key} at index ${i}`,
      comparisons,
      swaps,
      arrayAccesses,
    });
    let j = i - 1;
    while (j >= 0 && a[j] > key) {
      comparisons++;
      arrayAccesses += 1;
      steps.push({
        type: "compare",
        indices: [j, j + 1],
        array: snapshot(a),
        sorted: sorted.slice(),
        description: `Compare ${a[j]} > ${key} → shift right`,
        comparisons,
        swaps,
        arrayAccesses,
      });
      a[j + 1] = a[j];
      swaps++;
      arrayAccesses += 2;
      steps.push({
        type: "overwrite",
        indices: [j, j + 1],
        array: snapshot(a),
        sorted: sorted.slice(),
        description: `Shift ${a[j]} to index ${j + 1}`,
        comparisons,
        swaps,
        arrayAccesses,
      });
      j--;
    }
    if (j >= 0) {
      // final failed comparison that exited the while
      comparisons++;
      arrayAccesses += 1;
    }
    a[j + 1] = key;
    arrayAccesses += 1;
    sorted.push(i);
    steps.push({
      type: "overwrite",
      indices: [j + 1],
      array: snapshot(a),
      sorted: sorted.slice(),
      description: `Insert key ${key} at index ${j + 1}`,
      comparisons,
      swaps,
      arrayAccesses,
    });
  }
  steps.push({
    type: "done",
    indices: [],
    array: snapshot(a),
    sorted: Array.from({ length: n }, (_, i) => i),
    description: "Array is fully sorted ✓",
    comparisons,
    swaps,
    arrayAccesses,
  });
  return steps;
}

export function mergeSortSteps(input: number[]): SortStep[] {
  const a = input.slice();
  const steps: SortStep[] = [];
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;
  let arrayAccesses = 0;
  const sortedSet = new Set<number>();

  function merge(lo: number, mid: number, hi: number) {
    const left = a.slice(lo, mid + 1);
    const right = a.slice(mid + 1, hi + 1);
    arrayAccesses += hi - lo + 1;
    let i = 0, j = 0, k = lo;
    while (i < left.length && j < right.length) {
      comparisons++;
      arrayAccesses += 2;
      steps.push({
        type: "compare",
        indices: [lo + i, mid + 1 + j],
        array: a.slice(),
        sorted: Array.from(sortedSet),
        description: `Merge: compare ${left[i]} and ${right[j]}`,
        comparisons, swaps, arrayAccesses,
      });
      if (left[i] <= right[j]) {
        a[k] = left[i++];
      } else {
        a[k] = right[j++];
      }
      swaps++;
      arrayAccesses += 1;
      steps.push({
        type: "overwrite",
        indices: [k],
        array: a.slice(),
        sorted: Array.from(sortedSet),
        description: `Write ${a[k]} into index ${k}`,
        comparisons, swaps, arrayAccesses,
      });
      k++;
    }
    while (i < left.length) {
      a[k] = left[i++];
      swaps++; arrayAccesses += 1;
      steps.push({
        type: "overwrite",
        indices: [k],
        array: a.slice(),
        sorted: Array.from(sortedSet),
        description: `Copy remaining left: ${a[k]} → index ${k}`,
        comparisons, swaps, arrayAccesses,
      });
      k++;
    }
    while (j < right.length) {
      a[k] = right[j++];
      swaps++; arrayAccesses += 1;
      steps.push({
        type: "overwrite",
        indices: [k],
        array: a.slice(),
        sorted: Array.from(sortedSet),
        description: `Copy remaining right: ${a[k]} → index ${k}`,
        comparisons, swaps, arrayAccesses,
      });
      k++;
    }
    // mark merged range as sorted if it covers the whole array
    if (lo === 0 && hi === n - 1) {
      for (let x = 0; x < n; x++) sortedSet.add(x);
    }
  }

  function mergeSort(lo: number, hi: number) {
    if (lo >= hi) {
      sortedSet.add(lo);
      return;
    }
    const mid = Math.floor((lo + hi) / 2);
    steps.push({
      type: "compare",
      indices: [lo, hi],
      array: a.slice(),
      sorted: Array.from(sortedSet),
      description: `Split: indices ${lo}–${hi}, mid at ${mid}`,
      comparisons, swaps, arrayAccesses,
    });
    mergeSort(lo, mid);
    mergeSort(mid + 1, hi);
    merge(lo, mid, hi);
    // mark this merged subarray as locally sorted
    for (let x = lo; x <= hi; x++) sortedSet.add(x);
    steps.push({
      type: "mark-sorted",
      indices: Array.from({ length: hi - lo + 1 }, (_, i) => lo + i),
      array: a.slice(),
      sorted: Array.from(sortedSet),
      description: `Merged indices ${lo}–${hi} into sorted order`,
      comparisons, swaps, arrayAccesses,
    });
  }

  mergeSort(0, n - 1);
  steps.push({
    type: "done",
    indices: [],
    array: a.slice(),
    sorted: Array.from({ length: n }, (_, i) => i),
    description: "Array is fully sorted ✓",
    comparisons, swaps, arrayAccesses,
  });
  return steps;
}

export function quickSortSteps(input: number[]): SortStep[] {
  const a = input.slice();
  const steps: SortStep[] = [];
  const n = a.length;
  let comparisons = 0;
  let swaps = 0;
  let arrayAccesses = 0;
  const sortedSet = new Set<number>();

  function partition(lo: number, hi: number): number {
    const pivot = a[hi];
    arrayAccesses += 1;
    steps.push({
      type: "compare",
      indices: [hi],
      array: a.slice(),
      sorted: Array.from(sortedSet),
      description: `Pivot chosen: ${pivot} at index ${hi}`,
      comparisons, swaps, arrayAccesses,
    });
    let i = lo - 1;
    for (let j = lo; j < hi; j++) {
      comparisons++;
      arrayAccesses += 2;
      steps.push({
        type: "compare",
        indices: [j, hi],
        array: a.slice(),
        sorted: Array.from(sortedSet),
        description: `Compare ${a[j]} with pivot ${pivot}`,
        comparisons, swaps, arrayAccesses,
      });
      if (a[j] <= pivot) {
        i++;
        if (i !== j) {
          const x = a[i], y = a[j];
          [a[i], a[j]] = [a[j], a[i]];
          swaps++;
          arrayAccesses += 4;
          steps.push({
            type: "swap",
            indices: [i, j],
            array: a.slice(),
            sorted: Array.from(sortedSet),
            description: `Swap ${x} and ${y}`,
            comparisons, swaps, arrayAccesses,
          });
        }
      }
    }
    const pivotPos = i + 1;
    if (pivotPos !== hi) {
      const x = a[pivotPos], y = a[hi];
      [a[pivotPos], a[hi]] = [a[hi], a[pivotPos]];
      swaps++;
      arrayAccesses += 4;
      steps.push({
        type: "swap",
        indices: [pivotPos, hi],
        array: a.slice(),
        sorted: Array.from(sortedSet),
        description: `Place pivot ${y} at index ${pivotPos}`,
        comparisons, swaps, arrayAccesses,
      });
    }
    sortedSet.add(pivotPos);
    steps.push({
      type: "mark-sorted",
      indices: [pivotPos],
      array: a.slice(),
      sorted: Array.from(sortedSet),
      description: `Pivot ${a[pivotPos]} is now in its final position at index ${pivotPos}`,
      comparisons, swaps, arrayAccesses,
    });
    return pivotPos;
  }

  function quickSort(lo: number, hi: number) {
    if (lo >= hi) {
      if (lo === hi) sortedSet.add(lo);
      return;
    }
    const p = partition(lo, hi);
    quickSort(lo, p - 1);
    quickSort(p + 1, hi);
  }

  quickSort(0, n - 1);
  steps.push({
    type: "done",
    indices: [],
    array: a.slice(),
    sorted: Array.from({ length: n }, (_, i) => i),
    description: "Array is fully sorted ✓",
    comparisons, swaps, arrayAccesses,
  });
  return steps;
}

export function generateSteps(algo: AlgorithmKey, input: number[]): SortStep[] {
  switch (algo) {
    case "bubble":
      return bubbleSortSteps(input);
    case "selection":
      return selectionSortSteps(input);
    case "insertion":
      return insertionSortSteps(input);
    case "merge":
      return mergeSortSteps(input);
    case "quick":
      return quickSortSteps(input);
  }
}

export function randomArray(size: number, min = 8, max = 100): number[] {
  return Array.from(
    { length: size },
    () => Math.floor(Math.random() * (max - min + 1)) + min,
  );
}