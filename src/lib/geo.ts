// Equirectangular map helpers. Map is 2:1.
export const MAP_W = 3600;
export const MAP_H = 1800;

export const lonToX = (lon: number) => ((lon + 180) / 360) * MAP_W;
export const latToY = (lat: number) => ((90 - lat) / 180) * MAP_H;

export type Pt = {x: number; y: number};
export const city = (lon: number, lat: number): Pt => ({x: lonToX(lon), y: latToY(lat)});

export const LA = city(-118.24, 34.05);
export const NY = city(-74.0, 40.71);
export const PARIS = city(2.35, 48.85);

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const smooth = (x: number) => {
	const c = clamp01(x);
	return c * c * (3 - 2 * c);
};

// Quadratic-bezier flight arc that bows "north" (upward on the map).
export const arcPoint = (a: Pt, b: Pt, t: number, bow = 0.22): Pt => {
	const d = Math.hypot(b.x - a.x, b.y - a.y);
	const cx = (a.x + b.x) / 2;
	const cy = (a.y + b.y) / 2 - d * bow;
	const u = 1 - t;
	return {
		x: u * u * a.x + 2 * u * t * cx + t * t * b.x,
		y: u * u * a.y + 2 * u * t * cy + t * t * b.y,
	};
};

// Build an SVG polyline path string for the arc revealed from 0..p.
export const arcPath = (a: Pt, b: Pt, p: number, bow = 0.22, steps = 80) => {
	const n = Math.max(1, Math.round(steps * clamp01(p)));
	let d = '';
	for (let i = 0; i <= n; i++) {
		const t = (i / steps); // partial reveal: stop at p
		if (t > p) break;
		const pt = arcPoint(a, b, t, bow);
		d += `${i === 0 ? 'M' : 'L'}${pt.x.toFixed(1)} ${pt.y.toFixed(1)} `;
	}
	return d.trim();
};
