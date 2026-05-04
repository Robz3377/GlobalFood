// Lightweight unit conversion: only mass (g, kg) and volume (ml, cl, L) are
// auto-converted to imperial. Discrete units (œuf, gousse, pincée…) stay as-is.

export type System = "metric" | "imperial";

const G_PER_OZ = 28.349523125;
const ML_PER_FLOZ = 29.5735295625;

function round(n: number, step: number): number {
  return Math.round(n / step) * step;
}

function format(n: number): string {
  if (n === 0) return "0";
  if (n < 0.1) return n.toFixed(2).replace(/\.?0+$/, "");
  if (n < 10) return n.toFixed(1).replace(/\.?0+$/, "");
  return Math.round(n).toString();
}

export function convert(qty: number, unit: string, system: System): {
  qty: number;
  unit: string;
  display: string;
} {
  if (system === "metric") return { qty, unit, display: `${format(qty)} ${unit}` };

  // Mass
  if (unit === "g" || unit === "G") {
    const oz = qty / G_PER_OZ;
    if (oz >= 16) {
      const lb = oz / 16;
      return { qty: round(lb, 0.05), unit: "lb", display: `${format(lb)} lb` };
    }
    return { qty: round(oz, 0.1), unit: "oz", display: `${format(oz)} oz` };
  }
  if (unit === "kg") {
    const lb = qty * 2.2046226218;
    return { qty: round(lb, 0.05), unit: "lb", display: `${format(lb)} lb` };
  }

  // Volume
  if (unit === "ml" || unit === "mL") {
    const floz = qty / ML_PER_FLOZ;
    if (floz >= 8) {
      const cup = floz / 8;
      return { qty: round(cup, 0.05), unit: "cup", display: `${format(cup)} cup` };
    }
    return { qty: round(floz, 0.1), unit: "fl oz", display: `${format(floz)} fl oz` };
  }
  if (unit === "cl") {
    const floz = (qty * 10) / ML_PER_FLOZ;
    return { qty: round(floz, 0.1), unit: "fl oz", display: `${format(floz)} fl oz` };
  }
  if (unit === "l" || unit === "L") {
    const cup = (qty * 1000) / (ML_PER_FLOZ * 8);
    return { qty: round(cup, 0.05), unit: "cup", display: `${format(cup)} cup` };
  }

  // Non-convertible: keep original
  return { qty, unit, display: `${format(qty)} ${unit}` };
}
