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

// Horizontal anchor points (centers of each third).
const LEFT_CX = 480;
const RIGHT_CX = 1440;
const CENTER_CX = 960;

// Baselines.
const PEDESTAL_Y = 830;
const PEDESTAL_W = 240;
const PEDESTAL_H = 60;

// Coin discs.
const COIN_W = 180;
const COIN_H = 42;
const COIN_STEP = 24; // vertical pixels each new coin rises by

const LEFT_COIN_COUNT = 20;
const RIGHT_COIN_COUNT = 3;

const COIN_FIRST_FRAME = 60; // first coin lands shortly after pedestals settle
const COIN_STAGGER = 6;

// Beat anchors.
const B1_END = 45;
const B3_START = 280;
const B3_END = 410;
const B4_START = 410;
const B4_END = 560;
const B5_START = 560;

const clamp = {extrapolateLeft: 'clamp' as const, extrapolateRight: 'clamp' as const};

const Vignette: React.FC = () => (
	<AbsoluteFill
		style={{
			background:
				'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.08) 100%)',
			pointerEvents: 'none',
		}}
	/>
);

const Pedestal: React.FC<{cx: number; offset: number; accent: string}> = ({
	cx,
	offset,
	accent,
}) => {
	return (
		<div
			style={{
				position: 'absolute',
				left: cx - PEDESTAL_W / 2 + offset,
				top: PEDESTAL_Y,
				width: PEDESTAL_W,
				height: PEDESTAL_H,
			}}
		>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					borderRadius: '50%',
					background: theme.ink,
					opacity: 0.18,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: 12,
					right: 12,
					top: 10,
					bottom: 10,
					borderRadius: '50%',
					background: 'transparent',
					border: `2px solid ${accent}`,
					opacity: 0.55,
				}}
			/>
		</div>
	);
};

const Coin: React.FC<{
	cx: number;
	baseY: number;
	index: number;
	fill: string;
	rim: string;
	frame: number;
	fps: number;
	startFrame: number;
}> = ({cx, baseY, index, fill, rim, frame, fps, startFrame}) => {
	const localFrame = frame - startFrame;
	if (localFrame < 0) return null;

	// Spring drop-in: 0 -> 1 over ~18 frames.
	const settle = spring({
		frame: localFrame,
		fps,
		config: {damping: 14, mass: 0.9, stiffness: 150},
	});

	const finalY = baseY - index * COIN_STEP;
	// Coin starts ~140px above its resting place and falls down.
	const dropFromY = finalY - 160;
	const y = interpolate(settle, [0, 1], [dropFromY, finalY], clamp);
	const opacity = interpolate(localFrame, [0, 6], [0, 1], clamp);

	return (
		<div
			style={{
				position: 'absolute',
				left: cx - COIN_W / 2,
				top: y,
				width: COIN_W,
				height: COIN_H,
				opacity,
			}}
		>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					borderRadius: '50%',
					background: fill,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: 4,
					height: 4,
					borderRadius: '50%',
					background: rim,
					opacity: 0.55,
				}}
			/>
		</div>
	);
};

const Silhouette: React.FC<{
	cx: number;
	cy: number;
	width: number;
	color: string;
	opacity: number;
	blurPx?: number;
}> = ({cx, cy, width, color, opacity, blurPx = 0}) => {
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
			<path
				d="M 22 240 Q 22 130 100 130 Q 178 130 178 240 Z"
				fill={color}
			/>
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

export const S07_OutcomeTeaser: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	// --- B1: pedestals slide in from the edges (frames 0–45). ---
	const pedestalProgress = spring({
		frame,
		fps,
		config: {damping: 14, mass: 1, stiffness: 110},
		durationInFrames: B1_END,
	});
	const leftPedestalX = interpolate(pedestalProgress, [0, 1], [-800, 0]);
	const rightPedestalX = interpolate(pedestalProgress, [0, 1], [800, 0]);

	// --- Stack base Y (top of pedestal). ---
	const stackBaseY = PEDESTAL_Y - COIN_H + 4;

	// --- Left stack glow (fades in as stack grows). ---
	const leftGlowOpacity = interpolate(
		frame,
		[120, 240],
		[0, 0.6],
		clamp,
	);

	// --- Background silhouettes (fade in frames 60-120). ---
	const figFade = interpolate(frame, [60, 120], [0, 1], clamp);

	// --- B3: gold "?" ---
	const qSpring = spring({
		frame: frame - B3_START,
		fps,
		config: {damping: 12, mass: 0.9, stiffness: 140},
	});
	const qBaseScale = interpolate(qSpring, [0, 1], [0, 1], clamp);
	// Continuous pulse after spring lands (deterministic sine of frame).
	const pulseT = frame - 300;
	const qPulseScale = qBaseScale * (1 + 0.05 * Math.sin(pulseT / 8));
	const qOpacity =
		frame < B3_START
			? 0
			: 0.85 + 0.075 * (1 + Math.sin(pulseT / 8));

	// --- B4: faint coral figure fades in. ---
	const coralOpacity = interpolate(frame, [B4_START, B4_END], [0, 0.45], clamp);

	// --- B5: coral pulse (one slow pulse, then settle). ---
	const b5Local = frame - B5_START;
	// scale 1 -> 1.06 -> 1 across ~80 frames.
	const coralPulseScale = interpolate(
		b5Local,
		[0, 40, 80],
		[1, 1.06, 1],
		clamp,
	);
	const coralGlowOpacity = interpolate(
		b5Local,
		[0, 40, 80, 100],
		[0, 0.35, 0.2, 0.2],
		clamp,
	);
	const coralQOpacity = interpolate(b5Local, [10, 60], [0, 0.5], clamp);

	// --- Coin renderers. ---
	const leftCoins = [];
	for (let i = 0; i < LEFT_COIN_COUNT; i++) {
		const start = COIN_FIRST_FRAME + i * COIN_STAGGER;
		leftCoins.push(
			<Coin
				key={`L${i}`}
				cx={LEFT_CX}
				baseY={stackBaseY}
				index={i}
				fill={theme.teal}
				rim={theme.gold}
				frame={frame}
				fps={fps}
				startFrame={start}
			/>,
		);
	}
	const rightCoins = [];
	for (let i = 0; i < RIGHT_COIN_COUNT; i++) {
		const start = COIN_FIRST_FRAME + i * COIN_STAGGER;
		rightCoins.push(
			<Coin
				key={`R${i}`}
				cx={RIGHT_CX}
				baseY={stackBaseY}
				index={i}
				fill={theme.amberMute}
				rim={theme.ink}
				frame={frame}
				fps={fps}
				startFrame={start}
			/>,
		);
	}

	return (
		<AbsoluteFill
			style={{
				background: theme.bg,
				fontFamily: theme.font,
				color: theme.ink,
				overflow: 'hidden',
			}}
		>
			{/* Background silhouettes (behind everything). */}
			<Silhouette
				cx={LEFT_CX}
				cy={PEDESTAL_Y - 240}
				width={260}
				color={theme.silhouette}
				opacity={figFade * 0.55}
			/>
			<Silhouette
				cx={RIGHT_CX}
				cy={PEDESTAL_Y - 240}
				width={260}
				color={theme.silhouette}
				opacity={figFade * 0.55}
			/>

			{/* Left-stack gold glow behind the coins. */}
			<GlowDisc
				cx={LEFT_CX}
				cy={PEDESTAL_Y - 200}
				size={620}
				color={theme.gold}
				opacity={leftGlowOpacity}
			/>

			{/* Pedestals (slide in from edges). */}
			<Pedestal cx={LEFT_CX} offset={leftPedestalX} accent={theme.teal} />
			<Pedestal cx={RIGHT_CX} offset={rightPedestalX} accent={theme.amberMute} />

			{/* Coin stacks (bottom-up; later ones layered above earlier). */}
			{leftCoins}
			{rightCoins}

			{/* B4: faint coral third figure, behind/just left of the "?". */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					transform: `translate(-30px, 0) scale(${coralPulseScale})`,
					transformOrigin: `${CENTER_CX - 30}px ${PEDESTAL_Y - 220}px`,
				}}
			>
				<GlowDisc
					cx={CENTER_CX - 30}
					cy={PEDESTAL_Y - 220}
					size={520}
					color={theme.coral}
					opacity={coralGlowOpacity}
				/>
				<Silhouette
					cx={CENTER_CX - 30}
					cy={PEDESTAL_Y - 220}
					width={320}
					color={theme.coral}
					opacity={coralOpacity}
					blurPx={4}
				/>
			</div>

			{/* B3: gold "?" in the dead center. */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: CANVAS_W,
					height: CANVAS_H,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					pointerEvents: 'none',
				}}
			>
				<div
					style={{
						transform: `translateY(-60px) scale(${Math.max(0, qPulseScale)})`,
						fontSize: 360,
						lineHeight: 1,
						fontWeight: theme.weightMedium,
						color: theme.gold,
						opacity: qOpacity,
						fontFamily: theme.font,
					}}
				>
					?
				</div>
			</div>

			{/* B5: small coral "?" over the coral figure's head. */}
			<div
				style={{
					position: 'absolute',
					left: CENTER_CX - 30 - 50,
					top: PEDESTAL_Y - 420,
					width: 100,
					textAlign: 'center',
					fontSize: 120,
					lineHeight: 1,
					fontWeight: theme.weightMedium,
					color: theme.coral,
					opacity: coralQOpacity,
					fontFamily: theme.font,
				}}
			>
				?
			</div>

			<Vignette />
		</AbsoluteFill>
	);
};

export default S07_OutcomeTeaser;
