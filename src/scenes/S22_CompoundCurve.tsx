import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {theme} from '../theme';

const CANVAS_W = 1920;
const CANVAS_H = 1080;

const clamp = {
	extrapolateLeft: 'clamp' as const,
	extrapolateRight: 'clamp' as const,
};

// Beat anchors.
const B1_END = 115;
const B2_START = 115;
const B2_END = 475;
const B3_START = 475;
const B3_END = 925;
const B4_START = 925;
const B4_END = 1040;
const B5_START = 1040;
const B5_END = 1310;
const B6_START = 1310;
const B6_END = 1700;
const B7_START = 1700;
const B7_END = 1800;

// Plot box.
const PLOT_X0 = 240;
const PLOT_X1 = 1680;
const PLOT_Y_BOTTOM = 880;
const PLOT_Y_TOP = 220;
const PLOT_W = PLOT_X1 - PLOT_X0;
const PLOT_H = PLOT_Y_BOTTOM - PLOT_Y_TOP;

// Exponential constant.
const K = 4.5;
const EXP_DENOM = Math.exp(K) - 1;

// Compute y(t) ∈ [0,1] normalized (0 at bottom, 1 at top of plot).
const yNorm = (t: number) => (Math.exp(K * t) - 1) / EXP_DENOM;

// Map (t∈[0,1]) → screen point.
const point = (t: number) => {
	const x = PLOT_X0 + t * PLOT_W;
	const y = PLOT_Y_BOTTOM - yNorm(t) * PLOT_H;
	return {x, y};
};

// Build SVG path string from t=tStart to t=tEnd, sampling N steps.
const buildPath = (tStart: number, tEnd: number, samples = 200) => {
	const parts: string[] = [];
	for (let i = 0; i <= samples; i++) {
		const t = tStart + (tEnd - tStart) * (i / samples);
		const p = point(t);
		parts.push((i === 0 ? 'M' : 'L') + p.x.toFixed(2) + ',' + p.y.toFixed(2));
	}
	return parts.join(' ');
};

const Vignette: React.FC<{intensity?: number}> = ({intensity = 0.08}) => (
	<AbsoluteFill
		style={{
			background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,${intensity}) 100%)`,
			pointerEvents: 'none',
		}}
	/>
);

const GlowDisc: React.FC<{
	cx: number;
	cy: number;
	size: number;
	color: string;
	opacity: number;
}> = ({cx, cy, size, color, opacity}) => (
	<div
		style={{
			position: 'absolute',
			left: cx - size / 2,
			top: cy - size / 2,
			width: size,
			height: size,
			borderRadius: '50%',
			background: `radial-gradient(circle, ${color} 0%, rgba(0,0,0,0) 65%)`,
			opacity,
			pointerEvents: 'none',
		}}
	/>
);

// ---- Coin splitting (deterministic generations) ----
// Generation g appears at frame B3_START + g * GEN_STEP.
// Each child springs out from its parent; spread derived from index, not random.
const GEN_STEP = 70;
const GENERATIONS = 5; // 1, 2, 4, 8, 16 = 31 coins total.

type CoinSpec = {gen: number; idx: number; cx: number; cy: number; parent?: CoinSpec};

// Center of the splitting field.
const COIN_FIELD_CX = CANVAS_W / 2;
const COIN_FIELD_CY = 540;

// Precompute coin tree positions (deterministic).
const buildCoinTree = (): CoinSpec[] => {
	const coins: CoinSpec[] = [];
	// Root.
	const root: CoinSpec = {gen: 0, idx: 0, cx: COIN_FIELD_CX, cy: COIN_FIELD_CY};
	coins.push(root);
	let prevGen: CoinSpec[] = [root];
	for (let g = 1; g <= GENERATIONS - 1; g++) {
		const nextGen: CoinSpec[] = [];
		// Spread radius shrinks per generation so it stays readable.
		const radius = 220 / g;
		for (let i = 0; i < prevGen.length; i++) {
			const parent = prevGen[i];
			// Two children; angles fan out per generation based on indices.
			for (let c = 0; c < 2; c++) {
				const totalIdx = i * 2 + c;
				const fan = Math.PI * 0.9; // total fan per parent
				const angle = -Math.PI / 2 + (c - 0.5) * fan * (1 / Math.max(1, g));
				// Add a deterministic per-index offset so coins don't all stack on the same vertical.
				const wiggle = ((totalIdx % 3) - 1) * 10;
				const cx = parent.cx + Math.sin(angle + totalIdx * 0.15) * radius + wiggle;
				const cy = parent.cy + Math.cos(angle + totalIdx * 0.15) * radius * 0.4 - g * 6;
				const node: CoinSpec = {gen: g, idx: totalIdx, cx, cy, parent};
				coins.push(node);
				nextGen.push(node);
			}
		}
		prevGen = nextGen;
	}
	return coins;
};

const COIN_TREE = buildCoinTree();

const Coin: React.FC<{
	spec: CoinSpec;
	frame: number;
	fps: number;
	opacity: number;
}> = ({spec, frame, fps, opacity}) => {
	const startFrame = B3_START + spec.gen * GEN_STEP + (spec.idx % 4) * 2;
	const local = frame - startFrame;
	if (local < 0) return null;
	const sp = spring({
		frame: local,
		fps,
		config: {damping: 14, stiffness: 150, mass: 0.9},
	});
	const fromX = spec.parent ? spec.parent.cx : spec.cx;
	const fromY = spec.parent ? spec.parent.cy : spec.cy;
	const x = interpolate(sp, [0, 1], [fromX, spec.cx], clamp);
	const y = interpolate(sp, [0, 1], [fromY, spec.cy], clamp);
	const scale = interpolate(sp, [0, 1], [0.3, 1], clamp);
	const op = interpolate(local, [0, 8], [0, 1], clamp);
	const size = 36 - spec.gen * 4; // smaller as generations deepen
	return (
		<div
			style={{
				position: 'absolute',
				left: x - size / 2,
				top: y - size / 2 / 2.5,
				width: size,
				height: size / 2.5,
				borderRadius: '50%',
				background: theme.gold,
				boxShadow: `0 0 0 1.5px ${theme.amber} inset`,
				opacity: op * opacity,
				transform: `scale(${scale})`,
			}}
		/>
	);
};

export const S22_CompoundCurve: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	// -------- Axes draw-in (B1) --------
	const axesOpacity = interpolate(frame, [10, 90], [0, 1], clamp);
	const axesDrawProgress = interpolate(frame, [10, 110], [0, 1], clamp);

	// -------- Curve draw progress --------
	// B2: draws t=0 → 0.5 (the flat early portion).
	// B3: slowly extends t=0.5 → 0.6.
	// B4: rockets to t=1.0 (the vertical tail).
	const curveT = interpolate(
		frame,
		[B2_START, B2_END, B3_END, B4_END],
		[0, 0.5, 0.6, 1.0],
		clamp,
	);

	// Path for the partial single curve (drawn progressively).
	// We always render the full path; control reveal with strokeDashoffset.
	const fullPath = buildPath(0, 1, 240);
	// Reveal fraction = curveT.
	const dashOffset = 1 - curveT;

	// "Is this working?" mood label (B2).
	const moodOpacity = interpolate(
		frame,
		[B2_START + 120, B2_START + 180, B2_END - 30, B2_END],
		[0, 0.7, 0.7, 0],
		clamp,
	);

	// Coin field opacity — appears during B3, fades as we enter B4's curve burst.
	const coinFieldOpacity = interpolate(
		frame,
		[B3_START - 10, B3_START + 20, B4_END - 30, B4_END + 30],
		[0, 1, 1, 0],
		clamp,
	);

	// -------- B5 highlight band on steep tail --------
	const highlightOpacity = interpolate(
		frame,
		[B5_START, B5_START + 40, B5_END - 30, B5_END],
		[0, 1, 1, 0.6],
		clamp,
	);
	const highlightPulse = 0.85 + 0.15 * (1 + Math.sin((frame - B5_START) / 8)) / 2;

	// -------- B6 amber (late) curve --------
	// Late starts at t = LATE_START (e.g. 0.5 = "year 10 / age 40 marker" along X).
	// David only has time = (1 - LATE_START) to grow, so we draw amber as if it's a fresh
	// curve over a SHORTER time window. Map its local progress to a reduced exponential
	// height — it traces the low/flat region and never reaches the explosion.
	const LATE_START = 0.5;
	// Late curve length on X (visible piece) — runs until ~t=0.95 at most.
	const LATE_END = 0.95;
	// We render the amber path with its own coordinate transform: x along [LATE_START, LATE_END],
	// y rescaled by a smaller K so it stays low. We just rebuild the path with a smaller exp.
	const buildLatePath = (tStart: number, tEnd: number, samples = 160) => {
		const parts: string[] = [];
		// Late grows with a smaller effective K so its top is well below teal's tail.
		const lateK = 3.0;
		const lateDenom = Math.exp(lateK) - 1;
		for (let i = 0; i <= samples; i++) {
			const u = i / samples; // 0..1 across the late span
			const t = tStart + (tEnd - tStart) * u;
			const x = PLOT_X0 + t * PLOT_W;
			// Late's normalized y is scaled down — peak well below the steep tail of teal.
			const lateNorm = (Math.exp(lateK * u) - 1) / lateDenom;
			// Cap late max at 0.35 of plot height so it visibly stays in the flat region.
			const y = PLOT_Y_BOTTOM - lateNorm * PLOT_H * 0.35;
			parts.push((i === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2));
		}
		return parts.join(' ');
	};
	const latePath = buildLatePath(LATE_START, LATE_END);
	const lateProgress = interpolate(
		frame,
		[B6_START + 60, B6_END - 20],
		[0, 1],
		clamp,
	);
	const lateDashOffset = 1 - lateProgress;

	// Teal label "EARLY" / amber label "LATE" fade in during B6.
	const labelsOpacity = interpolate(
		frame,
		[B6_START, B6_START + 60],
		[0, 1],
		clamp,
	);

	// -------- B7 spotlight on amber, dim teal --------
	const tealDim = interpolate(
		frame,
		[B7_START, B7_START + 30],
		[1, 0.35],
		clamp,
	);
	const amberSpot = interpolate(
		frame,
		[B7_START, B7_START + 30],
		[1, 1],
		clamp,
	);
	const amberSpotGlow = interpolate(
		frame,
		[B7_START, B7_START + 60, B7_END - 20, B7_END],
		[0, 0.45, 0.45, 0.45],
		clamp,
	);
	const hardWayLabelOpacity = interpolate(
		frame,
		[B7_START + 30, B7_START + 70],
		[0, 0.9],
		clamp,
	);

	// Year marker (for the LATE_START "age 40 / year 10" reference).
	const yearMarkerOpacity = interpolate(
		frame,
		[B6_START + 20, B6_START + 60],
		[0, 0.55],
		clamp,
	);

	// Title.
	const titleOpacity = interpolate(
		frame,
		[20, 80, B3_END - 60, B3_END],
		[0, 1, 1, 0.4],
		clamp,
	);

	// Highlight band geometry (final ~25% of plot).
	const HIGHLIGHT_T0 = 0.75;
	const HIGHLIGHT_X0 = PLOT_X0 + HIGHLIGHT_T0 * PLOT_W;
	const HIGHLIGHT_X1 = PLOT_X1;

	// Late curve start marker x.
	const LATE_MARKER_X = PLOT_X0 + LATE_START * PLOT_W;

	return (
		<AbsoluteFill
			style={{
				background: theme.bg,
				fontFamily: theme.font,
				color: theme.ink,
				overflow: 'hidden',
			}}
		>
			{/* Title */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: 90,
					textAlign: 'center',
					fontSize: 32,
					letterSpacing: 8,
					color: theme.ink,
					opacity: titleOpacity,
					fontWeight: theme.weightMedium,
				}}
			>
				COMPOUNDING
			</div>

			{/* Chart SVG */}
			<svg
				width={CANVAS_W}
				height={CANVAS_H}
				style={{position: 'absolute', left: 0, top: 0}}
			>
				{/* Axes */}
				<g opacity={axesOpacity}>
					{/* X axis */}
					<line
						x1={PLOT_X0}
						y1={PLOT_Y_BOTTOM}
						x2={PLOT_X0 + PLOT_W * axesDrawProgress}
						y2={PLOT_Y_BOTTOM}
						stroke={theme.ink}
						strokeWidth={3}
						opacity={0.7}
					/>
					{/* Y axis */}
					<line
						x1={PLOT_X0}
						y1={PLOT_Y_BOTTOM}
						x2={PLOT_X0}
						y2={PLOT_Y_BOTTOM - PLOT_H * axesDrawProgress}
						stroke={theme.ink}
						strokeWidth={3}
						opacity={0.7}
					/>
					{/* X axis tick labels */}
					<text
						x={PLOT_X0}
						y={PLOT_Y_BOTTOM + 38}
						fill={theme.ink}
						fontSize={20}
						fontWeight={theme.weightMedium}
						textAnchor="middle"
						opacity={0.55}
					>
						AGE 30
					</text>
					<text
						x={PLOT_X1}
						y={PLOT_Y_BOTTOM + 38}
						fill={theme.ink}
						fontSize={20}
						fontWeight={theme.weightMedium}
						textAnchor="middle"
						opacity={0.55}
					>
						AGE 60
					</text>
					<text
						x={PLOT_X0 - 20}
						y={PLOT_Y_TOP + 20}
						fill={theme.ink}
						fontSize={16}
						letterSpacing={3}
						fontWeight={theme.weightMedium}
						textAnchor="end"
						opacity={0.55}
					>
						VALUE
					</text>
					<text
						x={(PLOT_X0 + PLOT_X1) / 2}
						y={PLOT_Y_BOTTOM + 70}
						fill={theme.ink}
						fontSize={14}
						letterSpacing={4}
						fontWeight={theme.weightMedium}
						textAnchor="middle"
						opacity={0.4}
					>
						TIME
					</text>
				</g>

				{/* B5 highlight band (steep tail) — render before curve so curve sits on top */}
				<rect
					x={HIGHLIGHT_X0}
					y={PLOT_Y_TOP - 20}
					width={HIGHLIGHT_X1 - HIGHLIGHT_X0}
					height={PLOT_H + 40}
					fill={theme.gold}
					opacity={highlightOpacity * 0.18 * highlightPulse}
				/>
				<line
					x1={HIGHLIGHT_X0}
					y1={PLOT_Y_TOP - 20}
					x2={HIGHLIGHT_X0}
					y2={PLOT_Y_BOTTOM}
					stroke={theme.gold}
					strokeWidth={2}
					strokeDasharray="8 6"
					opacity={highlightOpacity * 0.7}
				/>

				{/* B6 late-start vertical marker */}
				<line
					x1={LATE_MARKER_X}
					y1={PLOT_Y_TOP - 20}
					x2={LATE_MARKER_X}
					y2={PLOT_Y_BOTTOM}
					stroke={theme.amber}
					strokeWidth={2}
					strokeDasharray="6 6"
					opacity={yearMarkerOpacity}
				/>
				<text
					x={LATE_MARKER_X}
					y={PLOT_Y_TOP - 28}
					fill={theme.amber}
					fontSize={14}
					letterSpacing={3}
					fontWeight={theme.weightMedium}
					textAnchor="middle"
					opacity={yearMarkerOpacity}
				>
					DAVID STARTS HERE
				</text>

				{/* Main exponential curve (teal/early). pathLength=1 normalizes dash math. */}
				<path
					d={fullPath}
					fill="none"
					stroke={theme.teal}
					strokeWidth={6}
					strokeLinecap="round"
					strokeLinejoin="round"
					pathLength={1}
					strokeDasharray="1 1"
					strokeDashoffset={dashOffset}
					opacity={tealDim}
				/>

				{/* Late (amber) curve. Drawn only during/after B6. */}
				{frame >= B6_START - 5 ? (
					<path
						d={latePath}
						fill="none"
						stroke={theme.amber}
						strokeWidth={6}
						strokeLinecap="round"
						strokeLinejoin="round"
						pathLength={1}
						strokeDasharray="1 1"
						strokeDashoffset={lateDashOffset}
						opacity={amberSpot}
					/>
				) : null}
			</svg>

			{/* B5 highlight label "almost ALL the growth is here" */}
			<div
				style={{
					position: 'absolute',
					left: HIGHLIGHT_X0 - 240,
					top: PLOT_Y_TOP - 60,
					width: 240,
					textAlign: 'right',
					fontSize: 20,
					color: theme.gold,
					fontStyle: 'italic',
					fontWeight: theme.weightMedium,
					opacity: highlightOpacity,
					letterSpacing: 1,
				}}
			>
				← almost ALL the growth is here
			</div>

			{/* B2 "is this working?" mood label */}
			<div
				style={{
					position: 'absolute',
					left: PLOT_X0,
					top: PLOT_Y_BOTTOM - 130,
					width: 380,
					fontSize: 22,
					color: theme.ink,
					fontStyle: 'italic',
					opacity: moodOpacity,
				}}
			>
				…is this even working?
			</div>

			{/* B3 coin-splitting field */}
			{frame >= B3_START - 5 && frame <= B4_END + 30 ? (
				<div
					style={{
						position: 'absolute',
						inset: 0,
						opacity: coinFieldOpacity,
					}}
				>
					{/* Caption */}
					<div
						style={{
							position: 'absolute',
							left: 0,
							right: 0,
							top: 200,
							textAlign: 'center',
							fontSize: 22,
							letterSpacing: 4,
							color: theme.ink,
							opacity: interpolate(
								frame,
								[B3_START + 20, B3_START + 70, B3_END - 60, B3_END],
								[0, 0.85, 0.85, 0],
								clamp,
							),
							fontStyle: 'italic',
							fontWeight: theme.weightMedium,
						}}
					>
						earnings earn earnings…
					</div>
					{COIN_TREE.map((spec) => (
						<Coin
							key={`${spec.gen}-${spec.idx}`}
							spec={spec}
							frame={frame}
							fps={fps}
							opacity={1}
						/>
					))}
				</div>
			) : null}

			{/* B6 EARLY / LATE labels */}
			{frame >= B6_START - 5 ? (
				<>
					<div
						style={{
							position: 'absolute',
							left: PLOT_X1 - 240,
							top: PLOT_Y_TOP + 20,
							width: 240,
							textAlign: 'right',
							fontSize: 22,
							letterSpacing: 4,
							color: theme.teal,
							opacity: labelsOpacity * tealDim,
							fontWeight: theme.weightMedium,
						}}
					>
						EARLY ↗
					</div>
					<div
						style={{
							position: 'absolute',
							left: LATE_MARKER_X + 20,
							top: PLOT_Y_BOTTOM - 90,
							width: 220,
							fontSize: 22,
							letterSpacing: 4,
							color: theme.amber,
							opacity: labelsOpacity,
							fontWeight: theme.weightMedium,
						}}
					>
						LATE →
					</div>
				</>
			) : null}

			{/* B7 spotlight glow on amber's stuck-low region */}
			{frame >= B7_START - 5 ? (
				<>
					<GlowDisc
						cx={(LATE_MARKER_X + PLOT_X1) / 2}
						cy={PLOT_Y_BOTTOM - 60}
						size={620}
						color={theme.amber}
						opacity={amberSpotGlow}
					/>
					<div
						style={{
							position: 'absolute',
							left: 0,
							right: 0,
							top: PLOT_Y_BOTTOM + 90,
							textAlign: 'center',
							fontSize: 26,
							letterSpacing: 4,
							color: theme.ink,
							opacity: hardWayLabelOpacity,
							fontStyle: 'italic',
							fontWeight: theme.weightMedium,
						}}
					>
						David is about to learn this the hard way.
					</div>
				</>
			) : null}

			<Vignette intensity={0.08 + 0.06 * interpolate(frame, [B7_START, B7_END], [0, 1], clamp)} />
		</AbsoluteFill>
	);
};

export default S22_CompoundCurve;
