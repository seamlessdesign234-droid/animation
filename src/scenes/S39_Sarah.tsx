import React from 'react';
import {
	AbsoluteFill,
	interpolate,
	interpolateColors,
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

// Beats.
const B1_END = 330;
const B2_START = 330;
const B2_END = 740;
const B3_START = 740;
const B3_END = 1220;
const B4_START = 1220;
const B4_END = 1850;
const B5_START = 1850;
const B5_END = 2600;
const B6_START = 2600;
const B6_END = 2870;
const B7_START = 2870;
const B7_END = 3260;
const B8_START = 3260;
const B8_END = 3510;

// Chart geometry.
const PLOT_X0 = 240;
const PLOT_X1 = 1680;
const PLOT_Y_BOTTOM = 880;
const PLOT_Y_TOP = 220;
const PLOT_W = PLOT_X1 - PLOT_X0;
const PLOT_H = PLOT_Y_BOTTOM - PLOT_Y_TOP;

// Time anchors (t ∈ [0,1] corresponds to age 30 → 60).
const T_CRASH_START = 0.4; // age 42 ≈ year 12
const T_CRASH_END = 0.46;
const T_REENTRY = 0.6;

// Value targets.
const V_YEAR_12 = 130_000;
const V_CRASH_LOW = 78_000; // ≈ -40%
const MARCUS_FINAL = 1_130_000;
const SARAH_FINAL = 600_000;

// Y mapping.
const yFor = (val: number) =>
	PLOT_Y_BOTTOM - (val / MARCUS_FINAL) * PLOT_H;
const xFor = (t: number) => PLOT_X0 + t * PLOT_W;

// Value functions.
const marcusValue = (t: number) => {
	if (t <= T_CRASH_START) {
		const u = t / T_CRASH_START;
		const k = 2.5;
		return V_YEAR_12 * (Math.exp(k * u) - 1) / (Math.exp(k) - 1);
	}
	if (t <= T_CRASH_END) {
		const u = (t - T_CRASH_START) / (T_CRASH_END - T_CRASH_START);
		return V_YEAR_12 + (V_CRASH_LOW - V_YEAR_12) * u;
	}
	const u = (t - T_CRASH_END) / (1 - T_CRASH_END);
	const k = 4;
	return V_CRASH_LOW + (MARCUS_FINAL - V_CRASH_LOW) *
		(Math.exp(k * u) - 1) / (Math.exp(k) - 1);
};

const sarahValue = (t: number) => {
	if (t <= T_CRASH_END) return marcusValue(t);
	if (t <= T_REENTRY) return V_CRASH_LOW; // cash, flat
	const u = (t - T_REENTRY) / (1 - T_REENTRY);
	const k = 3;
	return V_CRASH_LOW + (SARAH_FINAL - V_CRASH_LOW) *
		(Math.exp(k * u) - 1) / (Math.exp(k) - 1);
};

// Build SVG path from sample array.
const buildPathFromSamples = (
	tStart: number,
	tEnd: number,
	samples: number,
	valueFn: (t: number) => number,
) => {
	const parts: string[] = [];
	for (let i = 0; i <= samples; i++) {
		const t = tStart + (tEnd - tStart) * (i / samples);
		const x = xFor(t);
		const y = yFor(valueFn(t));
		parts.push((i === 0 ? 'M' : 'L') + x.toFixed(2) + ',' + y.toFixed(2));
	}
	return parts.join(' ');
};

const MARCUS_PATH = buildPathFromSamples(0, 1, 360, marcusValue);
const SARAH_PRE = buildPathFromSamples(0, T_CRASH_END, 180, sarahValue);
const SARAH_CASH = buildPathFromSamples(T_CRASH_END, T_REENTRY, 60, sarahValue);
const SARAH_POST = buildPathFromSamples(T_REENTRY, 1, 200, sarahValue);

const Vignette: React.FC<{intensity?: number}> = ({intensity = 0.1}) => (
	<AbsoluteFill
		style={{
			background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,0,0,${intensity}) 100%)`,
			pointerEvents: 'none',
		}}
	/>
);

const Figure: React.FC<{
	cx: number;
	cy: number;
	width: number;
	color: string;
	opacity?: number;
	blurPx?: number;
}> = ({cx, cy, width, color, opacity = 1, blurPx = 0}) => {
	const height = width * 1.2;
	return (
		<svg
			width={width}
			height={height}
			viewBox="0 0 200 240"
			style={{
				position: 'absolute',
				left: cx - width / 2,
				top: cy - height / 2,
				opacity,
				filter: blurPx ? `blur(${blurPx}px)` : undefined,
			}}
		>
			<circle cx={100} cy={62} r={42} fill={color} />
			<path d="M 22 240 Q 22 130 100 130 Q 178 130 178 240 Z" fill={color} />
		</svg>
	);
};

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

const formatDollars = (v: number) =>
	'$' + Math.max(0, Math.round(v)).toLocaleString('en-US');

const Stamp: React.FC<{
	label: string;
	color: string;
	scale: number;
	rotation: number;
	opacity: number;
	width: number;
	height: number;
	fontSize: number;
}> = ({label, color, scale, rotation, opacity, width, height, fontSize}) => (
	<div
		style={{
			width,
			height,
			border: `6px solid ${color}`,
			borderRadius: 14,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			fontSize,
			fontWeight: theme.weightMedium,
			color,
			letterSpacing: 4,
			background: 'rgba(247,245,239,0.88)',
			transform: `scale(${scale}) rotate(${rotation}deg)`,
			opacity,
		}}
	>
		{label}
	</div>
);

const GRAY = '#9A958A';

export const S39_Sarah: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	// ============================================================
	// B1: Sarah silhouette → figure reveal
	// ============================================================
	const sarahRevealOpacity = interpolate(frame, [30, 180], [0.25, 1], clamp);
	const sarahRevealBlur = interpolate(frame, [30, 180], [4, 0], clamp);
	const sarahRevealScale = interpolate(
		spring({frame: frame - 20, fps, config: {damping: 14, stiffness: 110}}),
		[0, 1],
		[0.85, 1],
		clamp,
	);
	const sarahNameOpacity = interpolate(frame, [120, 200], [0, 1], clamp);
	const sarahCaptionOpacity = interpolate(
		frame,
		[180, 240, B1_END - 20, B1_END + 20],
		[0, 1, 1, 0],
		clamp,
	);
	const silhouetteFadeOut = interpolate(
		frame,
		[B1_END - 40, B1_END + 40],
		[1, 0],
		clamp,
	);

	// ============================================================
	// Chart axes (visible from B2 onward)
	// ============================================================
	const chartOpacity = interpolate(
		frame,
		[B2_START - 30, B2_START + 30],
		[0, 1],
		clamp,
	);

	// ============================================================
	// Line draw progress
	// Marcus draws: 0 → T_CRASH_END across B2..B3, then T_CRASH_END → 1 across B5.
	// Sarah draws:  0 → T_CRASH_END across B2..B3, cash (T_CRASH_END → T_REENTRY)
	//   across B4, re-entry (T_REENTRY → 1) across late B5.
	// ============================================================

	// Reveal fraction = t (since x is linear in t and pathLength=1).
	const marcusRevealT = interpolate(
		frame,
		[B2_START, B3_START, B3_END, B5_START, B5_END - 100],
		[0, T_CRASH_START, T_CRASH_END, T_CRASH_END, 1.0],
		clamp,
	);

	const sarahPreRevealT = interpolate(
		frame,
		[B2_START, B3_START, B3_END],
		[0, T_CRASH_START, T_CRASH_END],
		clamp,
	);
	// As fraction of pre-crash path length (which spans 0..T_CRASH_END normalized in path).
	const sarahPreFrac = sarahPreRevealT / T_CRASH_END;

	const sarahCashFrac = interpolate(
		frame,
		[B4_START + 40, B4_END - 40],
		[0, 1],
		clamp,
	);

	const sarahPostFrac = interpolate(
		frame,
		[B5_START + 350, B5_END - 60],
		[0, 1],
		clamp,
	);

	// Re-entry jump: a vertical-ish connector from (T_REENTRY, V_CRASH_LOW) at the cash end
	// up to (T_REENTRY, sarahValue(T_REENTRY)) — but sarahValue starts at V_CRASH_LOW, so no jump
	// in HER money. The "BOUGHT BACK higher" effect comes from comparing markers on Marcus's line.

	// ============================================================
	// B3 crash effects
	// ============================================================
	const crashLocal = frame - (B3_START + 20);
	const crashFlash = interpolate(
		crashLocal,
		[0, 6, 60],
		[0, 0.55, 0],
		clamp,
	);
	const shake =
		crashLocal >= 0 && crashLocal < 30
			? Math.sin(crashLocal * 1.6) * Math.max(0, 8 - crashLocal * 0.25)
			: 0;
	const minus40Local = frame - (B3_START + 80);
	const minus40Spring = spring({
		frame: minus40Local,
		fps,
		config: {damping: 11, stiffness: 170},
	});
	const minus40Scale = interpolate(minus40Spring, [0, 1], [1.5, 1], clamp);
	const minus40Rot = interpolate(minus40Spring, [0, 1], [-14, -8], clamp);
	const minus40Opacity = interpolate(
		frame,
		[B3_START + 80, B3_START + 110, B4_END - 30, B4_END + 30],
		[0, 1, 1, 0],
		clamp,
	);

	// ============================================================
	// B4 SOLD → CASH marker
	// ============================================================
	const soldMarkerOpacity = interpolate(
		frame,
		[B4_START + 60, B4_START + 120],
		[0, 1],
		clamp,
	);

	// Sarah cash color: coral → gray during B4.
	const sarahCashStrokeColor = interpolateColors(
		interpolate(frame, [B4_START + 20, B4_START + 200], [0, 1], clamp),
		[0, 1],
		[theme.coral, GRAY],
	);

	// ============================================================
	// B5 BOUGHT BACK + loss connector
	// ============================================================
	const boughtBackOpacity = interpolate(
		frame,
		[B5_START + 280, B5_START + 340],
		[0, 1],
		clamp,
	);
	const lossConnectorOpacity = interpolate(
		frame,
		[B5_START + 200, B5_START + 260],
		[0, 0.8],
		clamp,
	);

	// Sarah post color: gray → coral around re-entry.
	const sarahPostStrokeColor = interpolateColors(
		interpolate(frame, [B5_START + 320, B5_START + 380], [0, 1], clamp),
		[0, 1],
		[GRAY, theme.coral],
	);

	// Gap highlight band between Marcus & Sarah on the chart.
	const gapHighlightOpacity = interpolate(
		frame,
		[B5_START + 120, B5_START + 200, B5_END, B5_END + 40],
		[0, 0.18, 0.18, 0.1],
		clamp,
	);

	// ============================================================
	// B6 recap badges (around Sarah)
	// ============================================================
	const recapBadges = ['✓ STARTED AT 30', '✓ $500 / MO', '✓ HEAD START'];
	const recapStarts = [B6_START + 30, B6_START + 100, B6_START + 170];

	// ============================================================
	// B7 reveals: Sarah $600k, Marcus $1.13M + bars
	// ============================================================
	const sarahCountVal = interpolate(
		frame,
		[B7_START + 30, B7_START + 180],
		[0, SARAH_FINAL],
		clamp,
	);
	const marcusCountVal = interpolate(
		frame,
		[B7_START + 90, B7_START + 240],
		[0, MARCUS_FINAL],
		clamp,
	);
	const sarahNumberOpacity = interpolate(
		frame,
		[B7_START + 20, B7_START + 70, B8_END],
		[0, 1, 1],
		clamp,
	);
	const marcusNumberOpacity = interpolate(
		frame,
		[B7_START + 80, B7_START + 130, B8_END],
		[0, 1, 1],
		clamp,
	);

	const barReveal = interpolate(
		frame,
		[B7_START + 200, B7_END - 30],
		[0, 1],
		clamp,
	);
	const BAR_MAX = 280;
	const RATIO = SARAH_FINAL / MARCUS_FINAL;

	// ============================================================
	// B8: 1 PANIC stamp
	// ============================================================
	const panicLocal = frame - (B8_START + 30);
	const panicSpring = spring({
		frame: panicLocal,
		fps,
		config: {damping: 10, stiffness: 180},
	});
	const panicScale = interpolate(panicSpring, [0, 1], [1.4, 1], clamp);
	const panicRot = interpolate(panicSpring, [0, 1], [-10, -6], clamp);
	const panicOpacity = interpolate(panicLocal, [0, 8], [0, 1], clamp);
	const scaryMonthOpacity = interpolate(
		frame,
		[B8_START + 120, B8_START + 170],
		[0, 0.9],
		clamp,
	);

	// Subtle screen-shake on panic stamp impact.
	const panicShake =
		panicLocal >= 0 && panicLocal < 14
			? Math.sin(panicLocal * 1.6) * Math.max(0, 5 - panicLocal * 0.4)
			: 0;

	// ============================================================
	// Sarah figure position (lives in the chart area)
	// ============================================================
	// During B1 she's center-stage. From B2 onwards she shrinks down beside the chart.
	const sarahFigureLocal = frame - B2_START;
	const sarahFigureT = interpolate(sarahFigureLocal, [0, 100], [0, 1], clamp);
	const sarahFigCx = interpolate(sarahFigureT, [0, 1], [CANVAS_W / 2, 130], clamp);
	const sarahFigCy = interpolate(sarahFigureT, [0, 1], [540, 980], clamp);
	const sarahFigW = interpolate(sarahFigureT, [0, 1], [260, 100], clamp);

	// Sarah's alarmed pose during B3..B4: bob slightly.
	const sarahAlarm =
		frame >= B3_START && frame <= B4_END
			? Math.sin((frame - B3_START) / 6) * 3
			: 0;

	// ============================================================
	// Render helpers
	// ============================================================
	const soldX = xFor(T_CRASH_END);
	const soldY = yFor(V_CRASH_LOW);
	const boughtX = xFor(T_REENTRY);
	const boughtY = yFor(marcusValue(T_REENTRY));

	// Crash markers on chart.
	const flashStyle: React.CSSProperties = {
		position: 'absolute',
		inset: 0,
		background: `radial-gradient(ellipse at center, ${theme.red}55 0%, rgba(0,0,0,0) 65%)`,
		opacity: crashFlash,
		pointerEvents: 'none',
	};

	return (
		<AbsoluteFill
			style={{
				background: theme.bg,
				fontFamily: theme.font,
				color: theme.ink,
				overflow: 'hidden',
				transform: `translate(${shake + panicShake}px, ${-shake / 2}px)`,
			}}
		>
			{/* ============================================================
			    B1: Coral silhouette → figure reveal
			    ============================================================ */}
			{frame <= B2_START + 120 ? (
				<>
					{/* faint silhouette (S07 callback) underneath */}
					<Figure
						cx={CANVAS_W / 2}
						cy={540}
						width={320}
						color={theme.coral}
						opacity={silhouetteFadeOut * 0.45}
						blurPx={Math.max(0, sarahRevealBlur)}
					/>
					<GlowDisc
						cx={CANVAS_W / 2}
						cy={540}
						size={620}
						color={theme.coral}
						opacity={
							silhouetteFadeOut *
							interpolate(frame, [40, 220], [0.2, 0.45], clamp)
						}
					/>
				</>
			) : null}

			{/* Sarah figure — full reveal in B1, then docks down by chart from B2 */}
			<div
				style={{
					transform: `scale(${sarahRevealScale})`,
					transformOrigin: 'center bottom',
				}}
			>
				<Figure
					cx={sarahFigCx}
					cy={sarahFigCy + sarahAlarm}
					width={sarahFigW}
					color={theme.coral}
					opacity={sarahRevealOpacity}
				/>
			</div>

			{/* Sarah name */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: 740,
					textAlign: 'center',
					fontSize: 36,
					letterSpacing: 6,
					color: theme.coral,
					fontWeight: theme.weightMedium,
					opacity: sarahNameOpacity *
						interpolate(frame, [B2_START, B2_START + 60], [1, 0], clamp),
				}}
			>
				SARAH
			</div>
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: 800,
					textAlign: 'center',
					fontSize: 22,
					color: theme.ink,
					opacity: sarahCaptionOpacity,
					fontStyle: 'italic',
				}}
			>
				did everything right — still went wrong.
			</div>

			{/* ============================================================
			    Chart (from B2 onward)
			    ============================================================ */}
			<svg
				width={CANVAS_W}
				height={CANVAS_H}
				style={{position: 'absolute', left: 0, top: 0, opacity: chartOpacity}}
			>
				{/* Axes */}
				<line
					x1={PLOT_X0}
					y1={PLOT_Y_BOTTOM}
					x2={PLOT_X1}
					y2={PLOT_Y_BOTTOM}
					stroke={theme.ink}
					strokeWidth={3}
					opacity={0.6}
				/>
				<line
					x1={PLOT_X0}
					y1={PLOT_Y_BOTTOM}
					x2={PLOT_X0}
					y2={PLOT_Y_TOP}
					stroke={theme.ink}
					strokeWidth={3}
					opacity={0.6}
				/>
				{/* Tick labels */}
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
				{/* Year-12 tick */}
				<line
					x1={xFor(T_CRASH_START)}
					y1={PLOT_Y_BOTTOM}
					x2={xFor(T_CRASH_START)}
					y2={PLOT_Y_BOTTOM + 14}
					stroke={theme.ink}
					strokeWidth={2}
					opacity={0.5}
				/>
				<text
					x={xFor(T_CRASH_START)}
					y={PLOT_Y_BOTTOM + 38}
					fill={theme.ink}
					fontSize={16}
					fontWeight={theme.weightMedium}
					textAnchor="middle"
					opacity={
						interpolate(frame, [B3_START, B3_START + 40], [0, 0.7], clamp)
					}
				>
					YEAR 12
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

				{/* Gap highlight band between Marcus and Sarah curves in B5 */}
				{frame >= B5_START + 100 ? (
					<rect
						x={xFor(T_CRASH_END)}
						y={PLOT_Y_TOP - 10}
						width={xFor(1) - xFor(T_CRASH_END)}
						height={PLOT_H + 10}
						fill={theme.coral}
						opacity={gapHighlightOpacity}
					/>
				) : null}

				{/* Loss connector — dashed line from SOLD to BOUGHT BACK on Marcus's path */}
				{frame >= B5_START + 200 ? (
					<line
						x1={soldX}
						y1={soldY}
						x2={boughtX}
						y2={boughtY}
						stroke={theme.red}
						strokeWidth={3}
						strokeDasharray="8 6"
						opacity={lossConnectorOpacity}
					/>
				) : null}

				{/* Marcus path (teal) */}
				<path
					d={MARCUS_PATH}
					fill="none"
					stroke={theme.teal}
					strokeWidth={6}
					strokeLinecap="round"
					strokeLinejoin="round"
					pathLength={1}
					strokeDasharray="1 1"
					strokeDashoffset={1 - marcusRevealT}
				/>

				{/* Sarah pre-crash (coral) */}
				<path
					d={SARAH_PRE}
					fill="none"
					stroke={theme.coral}
					strokeWidth={6}
					strokeLinecap="round"
					strokeLinejoin="round"
					pathLength={1}
					strokeDasharray="1 1"
					strokeDashoffset={1 - sarahPreFrac}
					// Slight offset visually: shift up by 1px so both lines read while overlapped.
					transform="translate(0,-1.5)"
				/>

				{/* Sarah cash (gray flat) */}
				{frame >= B4_START + 20 ? (
					<path
						d={SARAH_CASH}
						fill="none"
						stroke={sarahCashStrokeColor}
						strokeWidth={6}
						strokeLinecap="round"
						strokeLinejoin="round"
						pathLength={1}
						strokeDasharray="1 1"
						strokeDashoffset={1 - sarahCashFrac}
					/>
				) : null}

				{/* Sarah post re-entry (gray → coral) */}
				{frame >= B5_START + 320 ? (
					<path
						d={SARAH_POST}
						fill="none"
						stroke={sarahPostStrokeColor}
						strokeWidth={6}
						strokeLinecap="round"
						strokeLinejoin="round"
						pathLength={1}
						strokeDasharray="1 1"
						strokeDashoffset={1 - sarahPostFrac}
					/>
				) : null}

				{/* SOLD marker (low point) */}
				{frame >= B4_START + 60 ? (
					<g opacity={soldMarkerOpacity}>
						<circle cx={soldX} cy={soldY} r={9} fill={theme.red} />
						<line
							x1={soldX}
							y1={soldY}
							x2={soldX}
							y2={soldY + 60}
							stroke={theme.red}
							strokeWidth={2}
							strokeDasharray="4 4"
						/>
					</g>
				) : null}

				{/* BOUGHT BACK marker (higher) */}
				{frame >= B5_START + 280 ? (
					<g opacity={boughtBackOpacity}>
						<circle cx={boughtX} cy={boughtY} r={9} fill={theme.red} />
						<line
							x1={boughtX}
							y1={boughtY}
							x2={boughtX}
							y2={boughtY - 60}
							stroke={theme.red}
							strokeWidth={2}
							strokeDasharray="4 4"
						/>
					</g>
				) : null}
			</svg>

			{/* SOLD label */}
			{frame >= B4_START + 80 ? (
				<div
					style={{
						position: 'absolute',
						left: soldX - 80,
						top: soldY + 70,
						width: 160,
						textAlign: 'center',
						fontSize: 16,
						letterSpacing: 3,
						color: theme.red,
						opacity: soldMarkerOpacity,
						fontWeight: theme.weightMedium,
					}}
				>
					SOLD → CASH
				</div>
			) : null}

			{/* BOUGHT BACK label */}
			{frame >= B5_START + 300 ? (
				<div
					style={{
						position: 'absolute',
						left: boughtX - 100,
						top: boughtY - 100,
						width: 200,
						textAlign: 'center',
						fontSize: 16,
						letterSpacing: 3,
						color: theme.red,
						opacity: boughtBackOpacity,
						fontWeight: theme.weightMedium,
					}}
				>
					BOUGHT BACK ↑
				</div>
			) : null}

			{/* B2 tags */}
			{frame >= B2_START + 100 && frame <= B3_START + 30 ? (
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						top: 130,
						textAlign: 'center',
						opacity: interpolate(
							frame,
							[B2_START + 100, B2_START + 160, B3_START - 30, B3_START + 30],
							[0, 1, 1, 0],
							clamp,
						),
					}}
				>
					{['$500 / MO', 'SAME FUND', 'HEAD START'].map((label) => (
						<span
							key={label}
							style={{
								display: 'inline-block',
								padding: '8px 18px',
								margin: '0 6px',
								border: `2px solid ${theme.ink}`,
								borderRadius: 999,
								fontSize: 16,
								letterSpacing: 3,
								color: theme.ink,
								fontWeight: theme.weightMedium,
								background: theme.bg,
							}}
						>
							{label}
						</span>
					))}
				</div>
			) : null}

			{/* Marcus name label up at chart top, persistent from B2 */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: 90,
					textAlign: 'center',
					fontSize: 22,
					letterSpacing: 6,
					color: theme.ink,
					opacity: interpolate(frame, [B2_START, B2_START + 40], [0, 0.65], clamp),
					fontWeight: theme.weightMedium,
				}}
			>
				MARCUS
				<span style={{margin: '0 14px', opacity: 0.5}}>·</span>
				SARAH
			</div>

			{/* B3 -40% stamp */}
			{frame >= B3_START + 70 ? (
				<div
					style={{
						position: 'absolute',
						left: xFor(T_CRASH_END) - 130,
						top: yFor(V_CRASH_LOW) - 200,
						width: 260,
					}}
				>
					<Stamp
						label="−40%"
						color={theme.red}
						scale={minus40Scale}
						rotation={minus40Rot}
						opacity={minus40Opacity}
						width={260}
						height={100}
						fontSize={56}
					/>
				</div>
			) : null}

			{/* B6 recap badges (around Sarah, lower-left of chart) */}
			{frame >= B6_START - 10 && frame <= B7_START + 30 ? (
				<div
					style={{
						position: 'absolute',
						left: 40,
						top: 200,
						width: 320,
					}}
				>
					{recapBadges.map((label, i) => {
						const s = recapStarts[i];
						const local = frame - s;
						const sp = spring({
							frame: local,
							fps,
							config: {damping: 13, stiffness: 160},
						});
						const sc = interpolate(sp, [0, 1], [0.6, 1], clamp);
						const op = interpolate(
							frame,
							[s, s + 25, B7_START - 20, B7_START + 30],
							[0, 1, 1, 0],
							clamp,
						);
						return (
							<div
								key={label}
								style={{
									marginBottom: 14,
									opacity: op,
									transform: `scale(${sc})`,
									transformOrigin: 'left center',
								}}
							>
								<span
									style={{
										display: 'inline-block',
										padding: '10px 18px',
										border: `2px solid ${theme.coral}`,
										borderRadius: 999,
										fontSize: 18,
										letterSpacing: 3,
										color: theme.coral,
										fontWeight: theme.weightMedium,
										background: theme.bg,
									}}
								>
									{label}
								</span>
							</div>
						);
					})}
				</div>
			) : null}

			{/* B7 number reveals + bars */}
			{frame >= B7_START - 10 ? (
				<>
					{/* Sarah number card */}
					<div
						style={{
							position: 'absolute',
							left: 80,
							top: 120,
							width: 460,
							opacity: sarahNumberOpacity,
						}}
					>
						<div
							style={{
								fontSize: 14,
								letterSpacing: 5,
								color: theme.coral,
								fontWeight: theme.weightMedium,
								marginBottom: 6,
							}}
						>
							SARAH · AGE 60
						</div>
						<div
							style={{
								fontSize: 72,
								lineHeight: 1,
								fontWeight: theme.weightMedium,
								color: theme.coral,
								fontVariantNumeric: 'tabular-nums',
							}}
						>
							{formatDollars(sarahCountVal)}
						</div>
					</div>

					{/* Marcus number card */}
					<div
						style={{
							position: 'absolute',
							right: 80,
							top: 120,
							width: 540,
							textAlign: 'right',
							opacity: marcusNumberOpacity,
						}}
					>
						<div
							style={{
								fontSize: 14,
								letterSpacing: 5,
								color: theme.teal,
								fontWeight: theme.weightMedium,
								marginBottom: 6,
							}}
						>
							MARCUS · AGE 60
						</div>
						<div
							style={{
								fontSize: 72,
								lineHeight: 1,
								fontWeight: theme.weightMedium,
								color: theme.gold,
								fontVariantNumeric: 'tabular-nums',
							}}
						>
							{formatDollars(marcusCountVal)}
						</div>
					</div>

					{/* Side-by-side bars (compact, lower-right under chart) */}
					<div
						style={{
							position: 'absolute',
							right: 80,
							top: 320,
							width: 360,
							height: BAR_MAX + 60,
						}}
					>
						{/* Baseline */}
						<div
							style={{
								position: 'absolute',
								left: 0,
								right: 0,
								bottom: 50,
								height: 2,
								background: theme.ink,
								opacity: 0.4,
							}}
						/>
						{/* Marcus bar */}
						<div
							style={{
								position: 'absolute',
								left: 40,
								bottom: 50,
								width: 110,
								height: BAR_MAX * barReveal,
								background: theme.teal,
								borderRadius: 6,
							}}
						/>
						{/* Sarah bar */}
						<div
							style={{
								position: 'absolute',
								left: 210,
								bottom: 50,
								width: 110,
								height: BAR_MAX * RATIO * barReveal,
								background: theme.coral,
								borderRadius: 6,
							}}
						/>
						{/* Labels */}
						<div
							style={{
								position: 'absolute',
								left: 40,
								bottom: 16,
								width: 110,
								textAlign: 'center',
								fontSize: 14,
								letterSpacing: 3,
								color: theme.teal,
								fontWeight: theme.weightMedium,
								opacity: barReveal,
							}}
						>
							MARCUS
						</div>
						<div
							style={{
								position: 'absolute',
								left: 210,
								bottom: 16,
								width: 110,
								textAlign: 'center',
								fontSize: 14,
								letterSpacing: 3,
								color: theme.coral,
								fontWeight: theme.weightMedium,
								opacity: barReveal,
							}}
						>
							SARAH
						</div>
						{/* ~half label */}
						<div
							style={{
								position: 'absolute',
								left: 0,
								right: 0,
								top: 0,
								textAlign: 'center',
								fontSize: 14,
								letterSpacing: 3,
								color: theme.ink,
								opacity: barReveal * 0.7,
								fontWeight: theme.weightMedium,
							}}
						>
							ROUGHLY HALF
						</div>
					</div>
				</>
			) : null}

			{/* B8 panic stamp + scary-month caption */}
			{frame >= B8_START - 5 ? (
				<>
					<div
						style={{
							position: 'absolute',
							left: CENTER_W() - 360,
							top: 540,
							width: 720,
						}}
					>
						<Stamp
							label="1 PANIC = −$500,000"
							color={theme.red}
							scale={panicScale}
							rotation={panicRot}
							opacity={panicOpacity}
							width={720}
							height={150}
							fontSize={42}
						/>
					</div>
					<div
						style={{
							position: 'absolute',
							left: 0,
							right: 0,
							top: 720,
							textAlign: 'center',
							fontSize: 28,
							fontStyle: 'italic',
							color: theme.ink,
							opacity: scaryMonthOpacity,
							fontWeight: theme.weightMedium,
						}}
					>
						one scary month.
					</div>
				</>
			) : null}

			{/* Red crash flash */}
			<div style={flashStyle} />

			<Vignette intensity={0.08 + 0.06 * interpolate(frame, [B7_START, B8_END], [0, 1], clamp)} />
		</AbsoluteFill>
	);
};

// Helper to keep CENTER_W usage clean.
function CENTER_W() {
	return CANVAS_W / 2;
}

export default S39_Sarah;
