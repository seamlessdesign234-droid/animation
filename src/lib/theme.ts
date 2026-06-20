// Shared, deterministic theme constants used across compositions.
// Using a system font stack keeps rendering deterministic without network font fetches.
export const FONT =
	'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export const SERIF =
	'"Didot", "Bodoni 72", "Playfair Display", Georgia, "Times New Roman", serif';

export const palette = {
	ink: '#0b1020',
	paper: '#0e1226',
	white: '#ffffff',
	accent: '#5b8cff',
	accent2: '#7c5cff',
	mint: '#3ddc97',
	amber: '#ffb648',
	coral: '#ff6b6b',
	slate: '#9aa6c7',
};

// Easing-friendly spring config presets.
export const springs = {
	smooth: {damping: 200},
	snappy: {damping: 18, mass: 0.7, stiffness: 140},
	gentle: {damping: 26, mass: 1, stiffness: 90},
};
