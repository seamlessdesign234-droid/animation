import {
	AbsoluteFill,
	Sequence,
	interpolate,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {
	MAP_W,
	MAP_H,
	LA,
	NY,
	PARIS,
	Pt,
	arcPoint,
	arcPath,
	clamp01,
	lerp,
	smooth,
} from '../lib/geo';
import {FONT, palette} from '../lib/theme';
import {EiffelTower3D} from './EiffelTower';

// 18s @ 30fps = 540 frames, 1920x1080.
const VP_W = 1920;
const VP_H = 1080;

// ---- Simplified continent outlines (lon,lat) → equirectangular paths ----
const NORTH_AMERICA: [number, number][] = [
	[-168, 65], [-148, 70], [-125, 71], [-100, 70], [-80, 68], [-62, 60], [-55, 50],
	[-66, 45], [-70, 41], [-75, 35], [-81, 25], [-90, 29], [-97, 26], [-106, 22],
	[-110, 24], [-117, 32], [-124, 40], [-124, 48], [-132, 55], [-148, 60], [-168, 65],
];
const GREENLAND: [number, number][] = [[-45, 60], [-22, 70], [-20, 82], [-50, 83], [-58, 76], [-48, 66]];
const SOUTH_AMERICA: [number, number][] = [
	[-80, 8], [-62, 11], [-50, 0], [-35, -5], [-38, -23], [-48, -25], [-58, -35],
	[-66, -45], [-73, -52], [-73, -40], [-70, -18], [-78, -5], [-80, 8],
];
const EUROPE: [number, number][] = [
	[-10, 36], [-9, 44], [-2, 48], [2, 51], [8, 54], [14, 55], [24, 56], [30, 52],
	[40, 48], [40, 40], [28, 41], [20, 42], [15, 40], [8, 44], [0, 43], [-6, 36],
];
const AFRICA: [number, number][] = [
	[-17, 15], [-12, 30], [10, 33], [30, 31], [43, 12], [51, 12], [42, -3], [35, -20],
	[20, -35], [16, -28], [12, -5], [8, 4], [-8, 5], [-17, 15],
];

const toPath = (pts: [number, number][]) =>
	pts
		.map(([lon, lat], i) => `${i === 0 ? 'M' : 'L'}${((lon + 180) / 360) * MAP_W} ${((90 - lat) / 180) * MAP_H}`)
		.join(' ') + ' Z';

const CONTINENTS = [NORTH_AMERICA, GREENLAND, SOUTH_AMERICA, EUROPE, AFRICA].map(toPath);

// ---- Camera director ----
type Cam = {cx: number; cy: number; s: number};
const getCamera = (frame: number): Cam => {
	if (frame < 100) {
		// Scene 1: zoom out, staying centered on LA.
		const t = smooth(frame / 100);
		return {cx: LA.x, cy: LA.y, s: lerp(7, 2.7, t)};
	}
	if (frame < 220) {
		// Scene 2: follow the flight LA → NY.
		const t = smooth(clamp01((frame - 100) / 110));
		const p = arcPoint(LA, NY, t);
		return {cx: p.x, cy: p.y, s: 2.9};
	}
	if (frame < 300) {
		// Scene 3a: follow NY → Paris, pull back over the Atlantic.
		const t = smooth(clamp01((frame - 220) / 80));
		const p = arcPoint(NY, PARIS, t);
		return {cx: p.x, cy: p.y, s: lerp(2.9, 1.8, t)};
	}
	if (frame < 360) {
		// Scene 3b: zoom into Paris.
		const t = smooth((frame - 300) / 60);
		return {cx: PARIS.x, cy: PARIS.y, s: lerp(1.8, 6, t)};
	}
	// Scene 4: hold on Paris while the tower rises.
	return {cx: PARIS.x, cy: PARIS.y, s: 6};
};

const CityMarker: React.FC<{p: Pt; label: string; appearAt: number; color: string}> = ({p, label, appearAt, color}) => {
	const frame = useCurrentFrame();
	const a = clamp01((frame - appearAt) / 12);
	const r = interpolate(a, [0, 1], [0, 9]);
	const pulse = 9 + (Math.sin(frame / 6) * 0.5 + 0.5) * 14 * a;
	return (
		<g opacity={a}>
			<circle cx={p.x} cy={p.y} r={pulse} fill={color} opacity={0.18} />
			<circle cx={p.x} cy={p.y} r={r} fill={color} stroke="#fff" strokeWidth={2} />
			<text x={p.x + 16} y={p.y + 6} fill="#fff" fontSize={26} fontWeight={800} fontFamily={FONT} style={{paintOrder: 'stroke'}} stroke="#0a0f24" strokeWidth={5}>
				{label}
			</text>
		</g>
	);
};

const Plane: React.FC<{a: Pt; b: Pt; p: number; color: string}> = ({a, b, p, color}) => {
	if (p <= 0 || p >= 1) return null;
	const here = arcPoint(a, b, p);
	const ahead = arcPoint(a, b, Math.min(1, p + 0.01));
	const ang = (Math.atan2(ahead.y - here.y, ahead.x - here.x) * 180) / Math.PI;
	return (
		<g transform={`translate(${here.x} ${here.y}) rotate(${ang})`}>
			<path d="M14 0 L-8 -7 L-3 0 L-8 7 Z" fill="#fff" stroke={color} strokeWidth={1.5} />
		</g>
	);
};

const MapLayer: React.FC = () => {
	const frame = useCurrentFrame();
	const {cx, cy, s} = getCamera(frame);
	const tx = VP_W / 2 - cx * s;
	const ty = VP_H / 2 - cy * s;

	const pLAtoNY = clamp01((frame - 102) / 105);
	const pNYtoP = clamp01((frame - 222) / 78);

	return (
		<div style={{position: 'absolute', width: MAP_W, height: MAP_H, transformOrigin: '0 0', transform: `translate(${tx}px, ${ty}px) scale(${s})`}}>
			<svg width={MAP_W} height={MAP_H} style={{position: 'absolute', top: 0, left: 0}}>
				{/* graticule */}
				{new Array(13).fill(0).map((_, i) => (
					<line key={`v${i}`} x1={(i / 12) * MAP_W} y1={0} x2={(i / 12) * MAP_W} y2={MAP_H} stroke="#1c2c55" strokeWidth={1} />
				))}
				{new Array(7).fill(0).map((_, i) => (
					<line key={`h${i}`} x1={0} y1={(i / 6) * MAP_H} x2={MAP_W} y2={(i / 6) * MAP_H} stroke="#1c2c55" strokeWidth={1} />
				))}
				{/* land */}
				{CONTINENTS.map((d, i) => (
					<path key={i} d={d} fill="#22407a" stroke="#3a63b0" strokeWidth={1.5} />
				))}
				{/* routes */}
				{pLAtoNY > 0 && (
					<path d={arcPath(LA, NY, pLAtoNY)} fill="none" stroke={palette.amber} strokeWidth={4} strokeLinecap="round" strokeDasharray="2 10" />
				)}
				{pNYtoP > 0 && (
					<path d={arcPath(NY, PARIS, pNYtoP)} fill="none" stroke={palette.coral} strokeWidth={4} strokeLinecap="round" strokeDasharray="2 10" />
				)}
				<Plane a={LA} b={NY} p={pLAtoNY} color={palette.amber} />
				<Plane a={NY} b={PARIS} p={pNYtoP} color={palette.coral} />
				{/* cities */}
				<CityMarker p={LA} label="Los Angeles" appearAt={20} color={palette.amber} />
				<CityMarker p={NY} label="New York" appearAt={150} color={palette.coral} />
				<CityMarker p={PARIS} label="Paris" appearAt={250} color={palette.mint} />
			</svg>
		</div>
	);
};

const Caption: React.FC<{text: string}> = ({text}) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const op = Math.min(
		interpolate(frame, [0, 12], [0, 1], {extrapolateRight: 'clamp'}),
		interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {extrapolateLeft: 'clamp'})
	);
	const y = interpolate(frame, [0, 14], [30, 0], {extrapolateRight: 'clamp'});
	return (
		<div style={{position: 'absolute', bottom: 80, left: 0, right: 0, textAlign: 'center', opacity: op, transform: `translateY(${y}px)`}}>
			<span style={{background: 'rgba(8,12,30,0.7)', color: '#fff', fontSize: 40, fontWeight: 700, fontFamily: FONT, padding: '14px 34px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.15)'}}>
				{text}
			</span>
		</div>
	);
};

const EiffelScene: React.FC = () => {
	const frame = useCurrentFrame();
	const dim = interpolate(frame, [0, 25], [0, 0.78], {extrapolateRight: 'clamp'});
	const titleOp = interpolate(frame, [30, 50], [0, 1], {extrapolateRight: 'clamp'});
	const titleY = interpolate(frame, [30, 55], [40, 0], {extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{background: `radial-gradient(circle at 50% 60%, rgba(20,16,40,${dim}) 0%, rgba(6,8,20,${dim}) 100%)`}} />
			<EiffelTower3D />
			<div style={{position: 'absolute', top: 90, left: 0, right: 0, textAlign: 'center', opacity: titleOp, transform: `translateY(${titleY}px)`}}>
				<div style={{color: palette.mint, fontSize: 34, fontWeight: 800, letterSpacing: 8, fontFamily: FONT}}>DESTINATION</div>
				<div style={{color: '#fff', fontSize: 120, fontWeight: 900, fontFamily: FONT, lineHeight: 1, textShadow: '0 8px 40px rgba(0,0,0,0.6)'}}>PARIS</div>
				<div style={{color: '#d8e0ff', fontSize: 34, fontWeight: 500, fontFamily: FONT, marginTop: 6}}>Bonjour from the Eiffel Tower</div>
			</div>
		</AbsoluteFill>
	);
};

export const MapTrip: React.FC = () => {
	return (
		<AbsoluteFill style={{background: '#070d22', fontFamily: FONT}}>
			<MapLayer />
			<Sequence durationInFrames={100}>
				<Caption text="Starting in Los Angeles" />
			</Sequence>
			<Sequence from={110} durationInFrames={100}>
				<Caption text="✈ Coast to coast → New York" />
			</Sequence>
			<Sequence from={225} durationInFrames={80}>
				<Caption text="✈ Crossing the Atlantic → Paris" />
			</Sequence>
			<Sequence from={360} durationInFrames={180}>
				<EiffelScene />
			</Sequence>
		</AbsoluteFill>
	);
};
