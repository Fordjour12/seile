export function getBudgetColor(progress: number, colors?: { green: string; yellow: string; orange: string; red: string }): string {
  const c = colors || { green: "#22c55e", yellow: "#eab308", orange: "#f97316", red: "#ef4444" };
  
  if (progress > 1) {
    return c.red;
  }
  
  if (progress >= 0.75) {
    return c.orange;
  }
  
  if (progress >= 0.5) {
    return c.yellow;
  }
  
  return c.green;
}

export function interpolateColor(
  progress: number, 
  colors?: { green: string; yellow: string; orange: string; red: string }
): string {
  const c = colors || { green: "#22c55e", yellow: "#eab308", orange: "#f97316", red: "#ef4444" };
  
  if (progress > 1) {
    return c.red;
  }

  if (progress >= 0.75) {
    const t = (progress - 0.75) / 0.25;
    return interpolateBetween(c.orange, c.red, t);
  }
  
  if (progress >= 0.5) {
    const t = (progress - 0.5) / 0.25;
    return interpolateBetween(c.yellow, c.orange, t);
  }
  
  if (progress >= 0.25) {
    const t = (progress - 0.25) / 0.25;
    return interpolateBetween(c.green, c.yellow, t);
  }
  
  return c.green;
}

export function withAlpha(color: string, alpha: number): string {
  const rgb = parseColorToRgb(color);
  if (!rgb) {
    return color;
  }
  const normalizedAlpha = Math.max(0, Math.min(1, alpha));
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${normalizedAlpha})`;
}

function interpolateBetween(color1: string, color2: string, t: number): string {
  const c1 = parseColorToRgb(color1);
  const c2 = parseColorToRgb(color2);
  if (!c1 || !c2) {
    return color1;
  }

  const ratio = Math.max(0, Math.min(1, t));
  const r = Math.round(c1.r + (c2.r - c1.r) * ratio);
  const g = Math.round(c1.g + (c2.g - c1.g) * ratio);
  const b = Math.round(c1.b + (c2.b - c1.b) * ratio);

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function parseColorToRgb(color: string): { r: number; g: number; b: number } | null {
  const value = color.trim();

  if (value.startsWith("#")) {
    return parseHex(value);
  }

  if (value.startsWith("rgb")) {
    return parseRgb(value);
  }

  if (value.startsWith("hsl")) {
    return parseHsl(value);
  }

  return null;
}

function parseHex(value: string): { r: number; g: number; b: number } | null {
  const hex = value.slice(1);

  if (hex.length === 3 || hex.length === 4) {
    const [r, g, b] = hex;
    if (!r || !g || !b) {
      return null;
    }
    return {
      r: parseInt(`${r}${r}`, 16),
      g: parseInt(`${g}${g}`, 16),
      b: parseInt(`${b}${b}`, 16),
    };
  }

  if (hex.length === 6 || hex.length === 8) {
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16),
    };
  }

  return null;
}

function parseRgb(value: string): { r: number; g: number; b: number } | null {
  const match = value.match(/rgba?\(([^)]+)\)/i);
  if (!match?.[1]) {
    return null;
  }

  const parts = match[1].split(",").map((part) => Number.parseFloat(part.trim()));
  if (parts.length < 3 || parts.slice(0, 3).some((part) => Number.isNaN(part))) {
    return null;
  }

  return {
    r: clampChannel(parts[0]),
    g: clampChannel(parts[1]),
    b: clampChannel(parts[2]),
  };
}

function parseHsl(value: string): { r: number; g: number; b: number } | null {
  const match = value.match(/hsla?\(([^)]+)\)/i);
  if (!match?.[1]) {
    return null;
  }

  const parts = match[1].split(",").map((part) => part.trim());
  if (parts.length < 3) {
    return null;
  }

  const h = Number.parseFloat(parts[0]);
  const s = Number.parseFloat(parts[1].replace("%", ""));
  const l = Number.parseFloat(parts[2].replace("%", ""));
  if ([h, s, l].some((part) => Number.isNaN(part))) {
    return null;
  }

  const saturation = Math.max(0, Math.min(1, s / 100));
  const lightness = Math.max(0, Math.min(1, l / 100));
  const hue = ((h % 360) + 360) % 360;

  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lightness - chroma / 2;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (hue < 60) {
    rPrime = chroma;
    gPrime = x;
  } else if (hue < 120) {
    rPrime = x;
    gPrime = chroma;
  } else if (hue < 180) {
    gPrime = chroma;
    bPrime = x;
  } else if (hue < 240) {
    gPrime = x;
    bPrime = chroma;
  } else if (hue < 300) {
    rPrime = x;
    bPrime = chroma;
  } else {
    rPrime = chroma;
    bPrime = x;
  }

  return {
    r: clampChannel((rPrime + m) * 255),
    g: clampChannel((gPrime + m) * 255),
    b: clampChannel((bPrime + m) * 255),
  };
}

function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

export const BUDGET_COLORS = {
  healthy: "#22c55e",
  warning: "#eab308",
  danger: "#f97316",
  critical: "#ef4444",
};
