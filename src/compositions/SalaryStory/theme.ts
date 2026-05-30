// Shared design system for "Two People, Same Salary, 30 Years".
// The color coding is the spine of the whole video — never break it.

export const FONT =
	'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export const C = {
	// Characters
	marcus: '#1D9E75', // started early, stayed in (teal)
	david: '#BA7517', // started late (amber)
	sarah: '#D85A30', // panicked (coral)

	// Meaning
	money: '#1D9E75', // positive / growth
	loss: '#E24B4A', // danger / crash

	// Backgrounds
	paper: '#F7F5EF', // off-white (light)
	navy: '#0F1B2D', // dark mode look
	panel: '#FFFFFF',

	// Jacob brand
	jacobNavy: '#1B2A4A',
	gold: '#E0A82E',

	// Text & neutrals
	ink: '#1B2A4A',
	sub: '#6A7280',
	faint: '#C9C5BA',
	line: '#DAD6CB',
	white: '#FFFFFF',
	gray: '#9AA0A6',
};

// Spring presets.
export const springs = {
	smooth: {damping: 200},
	snappy: {damping: 14, mass: 0.8, stiffness: 140},
	gentle: {damping: 26, mass: 1, stiffness: 90},
	pop: {damping: 11, mass: 0.6, stiffness: 170},
};

// Format a number as USD with no decimals.
export const usd = (n: number) =>
	'$' + Math.round(n).toLocaleString('en-US');

// Format as compact-ish currency used in counters.
export const fmt = (n: number, mode: 'currency' | 'plain' = 'currency') =>
	mode === 'currency' ? usd(n) : Math.round(n).toLocaleString('en-US');
