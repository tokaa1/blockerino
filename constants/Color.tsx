export const cssColors = {
    brightNiceRed: "#FF3333",
    pink: "#FF00FF",
    green: "#00FF00",
    pitchBlack: "#000000",
    spaceGray: "rgb(90, 90, 90)"
}

export interface Color {
    r: number,
    g: number,
    b: number
}

export interface HSLColor {
    h: number,
    s: number,
    l: number
}

export function hslToRgb({ h, s, l }: HSLColor): Color {
    'worklet';
    const f = (n: number) => {
        const k = (n + h / 30) % 12;
        const a = s * Math.min(l, 1 - l);
        return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
    };
    return { r: f(0), g: f(8), b: f(4) };
}

export function rgbToHsl({ r, g, b }: Color): HSLColor {
    'worklet';
    r /= 255, g /= 255, b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h *= 60;
    } else {
        s = 0;
    }

    return { h, s, l };
}

export function colorToHex(color: Color | null): string {
    'worklet';
    if (color == null) {
        return '#000000';
    }

    const toHex = (value: number) => {
        const clamped = Math.max(0, Math.min(255, value));
        return clamped.toString(16).padStart(2, '0');
    };

    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

export function colorLerp(a: Color, b: Color, t: number): Color {
    const lerp = (a: number, b: number, t: number) => {
      return a + (b - a) * t;
    };
    return {
      r: lerp(a.r, b.r, t),
      g: lerp(a.g, b.g, t),
      b: lerp(a.b, b.b, t),
    };
  }
  
  