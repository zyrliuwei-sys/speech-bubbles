/** Color tones used to code game groups across cards, chips and sidebars. */
export type Tone = 'red' | 'green' | 'teal' | 'blue' | 'amber' | 'slate';

export const TONES: Record<
  Tone,
  { dot: string; bar: string; soft: string; text: string }
> = {
  red: {
    dot: 'bg-rose-500',
    bar: 'before:bg-rose-500',
    soft: 'bg-rose-50 dark:bg-rose-500/10',
    text: 'text-rose-600 dark:text-rose-300',
  },
  green: {
    dot: 'bg-emerald-500',
    bar: 'before:bg-emerald-500',
    soft: 'bg-emerald-50 dark:bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  teal: {
    dot: 'bg-cyan-500',
    bar: 'before:bg-cyan-500',
    soft: 'bg-cyan-50 dark:bg-cyan-500/10',
    text: 'text-cyan-700 dark:text-cyan-300',
  },
  blue: {
    dot: 'bg-indigo-500',
    bar: 'before:bg-indigo-500',
    soft: 'bg-indigo-50 dark:bg-indigo-500/10',
    text: 'text-indigo-700 dark:text-indigo-300',
  },
  amber: {
    dot: 'bg-amber-500',
    bar: 'before:bg-amber-500',
    soft: 'bg-amber-50 dark:bg-amber-500/10',
    text: 'text-amber-700 dark:text-amber-300',
  },
  slate: {
    dot: 'bg-slate-400',
    bar: 'before:bg-slate-400',
    soft: 'bg-slate-100 dark:bg-slate-500/10',
    text: 'text-slate-600 dark:text-slate-300',
  },
};
