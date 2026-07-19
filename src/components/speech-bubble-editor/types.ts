/**
 * Speech Bubbles editor — shared types & defaults.
 *
 * All bubble geometry is stored as RATIOS relative to the image so the same
 * scene renders identically in the (small) on-screen preview and the
 * (full-resolution) exported PNG. Multiply a ratio by the pixel width/height of
 * whatever surface you are drawing on.
 */

export type BubbleType =
  | 'speech'
  | 'thought'
  | 'shout'
  | 'caption'
  | 'star'
  | 'heart'
  | 'oval'
  | 'square'
  | 'image';

export interface Bubble {
  id: string;
  type: BubbleType;
  /** Center position as a ratio of the image (0..1). */
  x: number;
  y: number;
  /**
   * For `image` bubbles: a (usually transparent PNG) data URL rendered as a
   * movable/resizable sticker. When set, the bubble ignores text/shape/style.
   */
  imageSrc?: string;
  /** Width as a ratio of the image width (0..1). Height is content-driven. */
  w: number;
  /** Measured height as a ratio of the image width (kept in sync by the editor). */
  h: number;
  text: string;
  fontFamily: string;
  /** Font size as a ratio of the image width (0..1). */
  fontSize: number;
  fontWeight: number;
  /** Text color. */
  color: string;
  /** Bubble fill color. */
  fill: string;
  /** Bubble outline color. */
  stroke: string;
  /** Outline thickness as a ratio of the image width (0..1). */
  strokeWidth: number;
  /** Tail tip position as a ratio of the image (0..1). Used by speech/thought. */
  tailX: number;
  tailY: number;
  /** Text alignment inside the bubble. */
  align: 'left' | 'center' | 'right';
}

export interface EditorImage {
  src: string;
  naturalWidth: number;
  naturalHeight: number;
}

/** Fonts offered in the editor. Web-safe or already loaded by the app shell. */
export const FONT_OPTIONS: { label: string; value: string }[] = [
  { label: 'Sans', value: 'Inter, ui-sans-serif, system-ui, sans-serif' },
  { label: 'Serif', value: "'Libre Baskerville', Georgia, serif" },
  {
    label: 'Comic',
    value: "'Comic Sans MS', 'Comic Sans', Chalkboard, cursive",
  },
  {
    label: 'Impact',
    value: 'Impact, Haettenschweiler, Franklin Gothic Bold, sans-serif',
  },
  { label: 'Mono', value: "'Courier New', ui-monospace, monospace" },
  { label: 'Round', value: "'Trebuchet MS', 'Segoe UI', sans-serif" },
];

let idSeq = 0;
export function newBubbleId(): string {
  idSeq += 1;
  return `bbl_${Date.now().toString(36)}_${idSeq}`;
}

export function defaultBubble(type: BubbleType, x = 0.5, y = 0.5): Bubble {
  const base: Bubble = {
    id: newBubbleId(),
    type,
    x,
    y,
    w: type === 'caption' ? 0.5 : 0.34,
    h: 0.12,
    text: '',
    fontFamily:
      type === 'shout'
        ? 'Impact, Haettenschweiler, Franklin Gothic Bold, sans-serif'
        : 'Inter, ui-sans-serif, system-ui, sans-serif',
    fontSize: type === 'caption' ? 0.05 : 0.045,
    fontWeight: type === 'shout' ? 700 : 600,
    color: '#111827',
    fill: '#ffffff',
    stroke: '#111827',
    strokeWidth: 0.006,
    tailX: 0.5,
    tailY: 0.66,
    align: 'center',
  };

  switch (type) {
    case 'speech':
      return { ...base, text: 'Say something!' };
    case 'thought':
      return { ...base, text: 'Hmm, let me think...' };
    case 'shout':
      return {
        ...base,
        text: 'WOW!',
        fill: '#FBBF24',
        stroke: '#111827',
        color: '#111827',
      };
    case 'caption':
      return {
        ...base,
        text: 'Your caption here',
        color: '#ffffff',
        stroke: '#111827',
        strokeWidth: 0.004,
      };
    case 'star':
      return {
        ...base,
        text: 'Look!',
        fill: 'transparent',
        strokeWidth: 0.008,
      };
    case 'heart':
      return {
        ...base,
        text: 'Love',
        fill: 'transparent',
        strokeWidth: 0.008,
      };
    case 'oval':
      return {
        ...base,
        text: 'Hello',
        fill: 'transparent',
        strokeWidth: 0.007,
      };
    case 'square':
      return {
        ...base,
        text: 'Note',
        fill: 'transparent',
        strokeWidth: 0.007,
      };
    case 'image':
      // Sticker bubble — imageSrc is assigned by the caller when created.
      return {
        ...base,
        text: '',
        w: 0.3,
        h: 0.3,
        fill: 'transparent',
        strokeWidth: 0,
      };
    default:
      return base;
  }
}
