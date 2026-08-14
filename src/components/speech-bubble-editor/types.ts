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
  | 'paw'
  | 'cat'
  | 'dog'
  | 'bear'
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
  /**
   * true = height auto-fits the text content (default). Flipped to false the
   * first time the user drags the resize handle, after which `h` is a manual
   * value and the bubble keeps a fixed height with the text centered inside.
   * Image stickers ignore this (they always use `h` directly).
   */
  autoH: boolean;
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
  /**
   * The decoded <img> element. Optional — the live editor preloads the photo
   * into an `HTMLImageElement` and attaches it so the exporter can paint at
   * native resolution without a second decode.
   */
  el?: HTMLImageElement;
}

/**
 * Fonts offered in the editor, grouped for the font <select>.
 *
 * `standard` — web-safe faces or bundled via @fontsource in the app shell.
 * `cartoon` — bundled @fontsource display faces suited to comics / speech
 *   bubbles. Each cartoon value carries a sensible fallback (e.g. Bangers →
 *   Impact) so a not-yet-loaded or missing face degrades gracefully.
 *
 * Group labels are translated in the editor: `editor.controls.font_<id>`.
 */
export type FontGroupId = 'standard' | 'cartoon';

export interface FontOption {
  label: string;
  value: string;
}

export interface FontGroup {
  id: FontGroupId;
  options: FontOption[];
}

export const FONT_OPTIONS: FontGroup[] = [
  {
    id: 'standard',
    options: [
      { label: 'Sans', value: 'Inter, ui-sans-serif, system-ui, sans-serif' },
      { label: 'Serif', value: "'Libre Baskerville', Georgia, serif" },
      { label: 'Mono', value: "'Courier New', ui-monospace, monospace" },
      { label: 'Round', value: "'Trebuchet MS', 'Segoe UI', sans-serif" },
    ],
  },
  {
    id: 'cartoon',
    options: [
      {
        label: 'Comic',
        value: "'Comic Sans MS', 'Comic Sans', Chalkboard, cursive",
      },
      {
        label: 'Impact',
        value: 'Impact, Haettenschweiler, Franklin Gothic Bold, sans-serif',
      },
      { label: 'Bangers', value: "'Bangers', 'Impact', cursive" },
      {
        label: 'Marker',
        value: "'Permanent Marker', 'Marker Felt', cursive",
      },
      { label: 'Fredoka', value: "'Fredoka', 'Trebuchet MS', sans-serif" },
      { label: 'Hand', value: "'Patrick Hand', 'Comic Sans MS', cursive" },
      { label: 'Lucky', value: "'Luckiest Guy', 'Impact', cursive" },
    ],
  },
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
    autoH: true,
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
      // Frame-only (transparent fill) like every shape bubble — recolor/toggle
      // fill in the right-hand panel.
      return { ...base, text: 'WOW!' };
    case 'caption':
      return {
        ...base,
        text: 'Your caption here',
        color: '#ffffff',
        stroke: '#111827',
        strokeWidth: 0.004,
      };
    case 'star':
      return { ...base, text: 'Look!', strokeWidth: 0.008 };
    case 'heart':
      return { ...base, text: 'Love', strokeWidth: 0.008 };
    case 'oval':
      return { ...base, text: 'Hello', strokeWidth: 0.007 };
    case 'square':
      return { ...base, text: 'Note', strokeWidth: 0.007 };
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
    case 'paw':
      // Animal/pet bubble — paw print outline. Cute, friendly default for
      // dog / cat / rabbit / "宠物" / "animal" prompts. The shape generator
      // lives in bubble-shapes.ts.
      return { ...base, text: '🐾', strokeWidth: 0.008 };
    case 'cat':
      // Cat head silhouette — pointy triangular ears + round head. Triggered
      // by "猫 / cat / kitty / 喵" keywords.
      return { ...base, text: '🐱', strokeWidth: 0.008 };
    case 'dog':
      // Dog head silhouette — floppy round ears + round head. Triggered by
      // "狗 / dog / puppy / 汪" keywords.
      return { ...base, text: '🐶', strokeWidth: 0.008 };
    case 'bear':
      // Bear / panda head — round head + two small round ears on top
      // (different from the dog's floppy side-ears and the cat's pointy
      // ears). Triggered by "狗熊 / 熊 / bear / panda / 熊猫".
      return { ...base, text: '🐻', strokeWidth: 0.008 };
    default:
      return base;
  }
}
