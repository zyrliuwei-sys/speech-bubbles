/**
 * Muted color tones used to code game groups across cards, chips and
 * sidebars. Low-chroma, print-like colors — deliberately no gradients.
 */
export type Tone = 'red' | 'green' | 'teal' | 'blue' | 'amber' | 'slate';

export const TONES: Record<
  Tone,
  {
    /** Small marker dot. */
    dot: string;
    /** Pill/chip background. */
    soft: string;
    /** Text on light surfaces. */
    text: string;
    /** Card cover: background + foreground. */
    cover: string;
  }
> = {
  // terracotta
  red: {
    dot: 'bg-[oklch(0.62_0.11_35)]',
    soft: 'bg-[oklch(0.94_0.025_35)] dark:bg-[oklch(0.3_0.04_35)]',
    text: 'text-[oklch(0.48_0.1_35)] dark:text-[oklch(0.82_0.06_35)]',
    cover:
      'bg-[oklch(0.9_0.035_40)] text-[oklch(0.42_0.08_35)] dark:bg-[oklch(0.32_0.04_35)] dark:text-[oklch(0.86_0.05_40)]',
  },
  // sage
  green: {
    dot: 'bg-[oklch(0.6_0.08_150)]',
    soft: 'bg-[oklch(0.94_0.025_145)] dark:bg-[oklch(0.3_0.035_150)]',
    text: 'text-[oklch(0.45_0.07_150)] dark:text-[oklch(0.82_0.05_145)]',
    cover:
      'bg-[oklch(0.91_0.03_140)] text-[oklch(0.4_0.06_150)] dark:bg-[oklch(0.32_0.035_150)] dark:text-[oklch(0.86_0.04_140)]',
  },
  // mist teal
  teal: {
    dot: 'bg-[oklch(0.62_0.07_215)]',
    soft: 'bg-[oklch(0.94_0.02_210)] dark:bg-[oklch(0.3_0.03_215)]',
    text: 'text-[oklch(0.45_0.06_220)] dark:text-[oklch(0.83_0.04_210)]',
    cover:
      'bg-[oklch(0.91_0.025_210)] text-[oklch(0.4_0.055_220)] dark:bg-[oklch(0.32_0.03_215)] dark:text-[oklch(0.86_0.035_210)]',
  },
  // dusty indigo
  blue: {
    dot: 'bg-[oklch(0.55_0.08_275)]',
    soft: 'bg-[oklch(0.94_0.02_275)] dark:bg-[oklch(0.3_0.035_275)]',
    text: 'text-[oklch(0.45_0.08_275)] dark:text-[oklch(0.83_0.045_275)]',
    cover:
      'bg-[oklch(0.9_0.025_270)] text-[oklch(0.38_0.07_275)] dark:bg-[oklch(0.31_0.035_275)] dark:text-[oklch(0.86_0.04_270)]',
  },
  // ochre
  amber: {
    dot: 'bg-[oklch(0.7_0.1_75)]',
    soft: 'bg-[oklch(0.95_0.03_85)] dark:bg-[oklch(0.32_0.04_75)]',
    text: 'text-[oklch(0.5_0.09_65)] dark:text-[oklch(0.85_0.07_85)]',
    cover:
      'bg-[oklch(0.92_0.04_85)] text-[oklch(0.45_0.08_65)] dark:bg-[oklch(0.33_0.04_75)] dark:text-[oklch(0.88_0.06_85)]',
  },
  // warm gray
  slate: {
    dot: 'bg-[oklch(0.62_0.01_80)]',
    soft: 'bg-[oklch(0.94_0.006_80)] dark:bg-[oklch(0.3_0.008_80)]',
    text: 'text-[oklch(0.45_0.01_80)] dark:text-[oklch(0.82_0.008_80)]',
    cover:
      'bg-[oklch(0.92_0.008_80)] text-[oklch(0.4_0.012_80)] dark:bg-[oklch(0.32_0.008_80)] dark:text-[oklch(0.86_0.008_80)]',
  },
};
