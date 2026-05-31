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

// Beats.
const B1_END = 220;
const B2_START = 220;
const B2_END = 550;
const B3_START = 550;
const B3_END = 820;
const B4_START = 820;
const B4_END = 1050;
const B5_START = 1050;
const B5_END = 1435;
const B6_START = 1435;
const B6_END = 2070;

// Key numbers.
const ORIGINAL_TOTAL = 1_130_000;
const NEW_TOTAL = 1_900_000;
const EXTRA_CONTRIB = 30_000;
const EXTRA_WEALTH = 770_000;

// Age timeline geometry.
const TL_X0 = 240;
const TL_X1 = 1680;
const TL_Y = 220;
const TL_AGE_MIN = 25; // leftmost when extended
const TL_AGE_MAX = 60;
const TL_RANGE = TL_AGE_MAX - TL_AGE_MIN; // 35

const ageToX = (age: number) =>
	TL_X0 + ((age - TL_AGE_MIN) / TL_RANGE) * (TL_X1 - TL_X0);

const GRAY = '#9A958A';

const formatDollars = (v: number) =>
	'$' + Math.max(0, Math.round(v)).toLocaleString('en-US');

const Vignette: React.FC = () => (
	<AbsoluteFill
		style={{
			background:
				'radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,0,0,0.10) 100%)',
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
}> = ({cx, cy, width, color, opacity = 1}) => {
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

export const S50_Coda: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	// ============================================================
	// B1: "one last number" caption
	// ============================================================
	const onLastSpring = spring({
		frame: frame - 30,
		fps,
		config: {damping: 13, stiffness: 130},
	});
	const onLastScale = interpolate(onLastSpring, [0, 1], [0.7, 1], clamp);
	const onLastOpacity = interpolate(
		frame,
		[20, 90, B1_END - 30, B1_END + 30],
		[0, 1, 1, 0.3],
		clamp,
	);

	// ============================================================
	// B2: timeline rewinds 30 → 25, "+5 YEARS" highlight
	// ============================================================
	const timelineOpacity = interpolate(
		frame,
		[B2_START, B2_START + 40],
		[0, 1],
		clamp,
	);
	// Start marker age: 30 (at B2_START) → 25 (at B2_END - 100)
	const startAge = interpolate(
		frame,
		[B2_START + 60, B2_END - 100],
		[30, 25],
		clamp,
	);
	const startX = ageToX(startAge);

	// +5 YEARS highlight band (between 25 and 30) — opacity grows once the marker has moved.
	const extendBandOpacity = interpolate(
		frame,
		[B2_END - 130, B2_END - 60, B6_START, B6_START + 60],
		[0, 0.7, 0.7, 0.4],
		clamp,
	);

	// Tags ("SAME $500/MO", "SAME FUND") under timeline.
	const sameTagsOpacity = interpolate(
		frame,
		[B2_END - 80, B2_END - 20, B5_START - 30, B5_START + 30],
		[0, 1, 1, 0],
		clamp,
	);

	// ============================================================
	// B3: "+$30,000 contributed" modest chip
	// ============================================================
	const chipSmallSpring = spring({
		frame: frame - (B3_START + 20),
		fps,
		config: {damping: 13, stiffness: 150},
	});
	const chipSmallScale = interpolate(chipSmallSpring, [0, 1], [0.5, 1], clamp);
	const chipSmallOpacity = interpolate(
		frame,
		[B3_START + 20, B3_START + 60, B5_START + 60, B5_START + 120],
		[0, 1, 1, 0],
		clamp,
	);
	const justThatOpacity = interpolate(
		frame,
		[B3_START + 120, B3_START + 170, B3_END - 20, B3_END + 30],
		[0, 0.85, 0.85, 0.5],
		clamp,
	);

	// ============================================================
	// B4: total climbs $1,130,000 → $1,900,000 with gold glow bloom
	// ============================================================
	const totalCount = interpolate(
		frame,
		[B4_START, B4_START + 30, B4_END],
		[ORIGINAL_TOTAL, ORIGINAL_TOTAL, NEW_TOTAL],
		clamp,
	);
	const totalSpring = spring({
		frame: frame - B4_START,
		fps,
		config: {damping: 13, stiffness: 130},
	});
	const totalScale = interpolate(totalSpring, [0, 1], [0.7, 1], clamp);
	const totalOpacity = interpolate(
		frame,
		[B4_START, B4_START + 40, B6_START - 30, B6_START + 30],
		[0, 1, 1, 0],
		clamp,
	);
	const totalGlowOpacity =
		interpolate(
			frame,
			[B4_START + 30, B4_END, B6_START - 30, B6_START + 30],
			[0, 0.55, 0.55, 0],
			clamp,
		) *
		(0.85 + 0.15 * (1 + Math.sin((frame - (B4_START + 30)) / 8)) / 2);

	// Show "BEFORE: $1,130,000 → AFTER: ..." sub-caption near total.
	const beforeAfterOpacity = interpolate(
		frame,
		[B4_START + 40, B4_START + 80, B5_END - 30, B5_END + 20],
		[0, 1, 1, 0],
		clamp,
	);

	// ============================================================
	// B5: mismatch — tiny +$30,000 vs huge +$770,000
	// ============================================================
	const smallContribLocal = frame - (B5_START + 20);
	const smallContribSpring = spring({
		frame: smallContribLocal,
		fps,
		config: {damping: 13, stiffness: 150},
	});
	const smallContribScale = interpolate(smallContribSpring, [0, 1], [0.3, 1], clamp);
	const smallContribOpacity = interpolate(
		frame,
		[B5_START + 20, B5_START + 60, B6_START - 30, B6_START + 30],
		[0, 1, 1, 0],
		clamp,
	);

	const arrowDraw = interpolate(
		frame,
		[B5_START + 120, B5_START + 200],
		[0, 1],
		clamp,
	);

	const bigWealthLocal = frame - (B5_START + 180);
	const bigWealthSpring = spring({
		frame: bigWealthLocal,
		fps,
		config: {damping: 12, stiffness: 160},
	});
	const bigWealthScale = interpolate(bigWealthSpring, [0, 1], [0.4, 1], clamp);
	const bigWealthOpacity = interpolate(
		frame,
		[B5_START + 180, B5_START + 230, B6_START - 30, B6_START + 30],
		[0, 1, 1, 0],
		clamp,
	);
	const bigWealthGlow =
		interpolate(
			frame,
			[B5_START + 220, B5_END - 80, B6_START - 10, B6_START + 30],
			[0, 0.6, 0.6, 0],
			clamp,
		) *
		(0.85 + 0.15 * (1 + Math.sin((frame - (B5_START + 220)) / 7)) / 2);

	const fiveYearsCaptionOpacity = interpolate(
		frame,
		[B5_END - 180, B5_END - 130, B6_START - 30, B6_START + 30],
		[0, 0.9, 0.9, 0],
		clamp,
	);

	// ============================================================
	// B6: front-of-the-line queue
	// ============================================================
	const queueOpacity = interpolate(
		frame,
		[B6_START, B6_START + 50],
		[0, 1],
		clamp,
	);

	// Queue setup: 6 figures, facing right; front (rightmost) is Marcus teal.
	// Each figure spaced 200px apart. Latecomers gray/dimmer.
	const QUEUE_CY = 700;
	const QUEUE_FRONT_X = 1500;
	const QUEUE_SPACING = 180;
	const QUEUE_COUNT = 6;

	// "Step back" animation: one specific figure (index 1, second from front) steps one place back.
	const stepBackLocal = frame - (B6_START + 240);
	const stepBackProgress = spring({
		frame: stepBackLocal,
		fps,
		config: {damping: 16, stiffness: 110},
	});
	const stepBackOffset = interpolate(stepBackProgress, [0, 1], [0, -QUEUE_SPACING], clamp);

	// Explosion glow at the front (callback to S22 vertical compounding shape).
	const explosionGlow =
		interpolate(
			frame,
			[B6_START + 80, B6_START + 200, B6_END - 20, B6_END],
			[0, 0.7, 0.7, 0.7],
			clamp,
		) *
		(0.85 + 0.15 * (1 + Math.sin((frame - (B6_START + 80)) / 9)) / 2);

	// "Every year you wait" caption.
	const everyYearOpacity = interpolate(
		frame,
		[B6_START + 280, B6_START + 340, B6_END - 15, B6_END],
		[0, 0.9, 0.9, 0.9],
		clamp,
	);

	// "FRONT OF THE LINE" label.
	const frontLabelOpacity = interpolate(
		frame,
		[B6_START + 120, B6_START + 180],
		[0, 1],
		clamp,
	);

	// ============================================================
	// Render
	// ============================================================
	return (
		<AbsoluteFill
			style={{
				background: theme.bg,
				fontFamily: theme.font,
				color: theme.ink,
				overflow: 'hidden',
			}}
		>
			{/* ============================================================
			    B1: "one last number" caption
			    ============================================================ */}
			{frame <= B2_START + 60 ? (
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						top: 470,
						textAlign: 'center',
						opacity: onLastOpacity,
						transform: `scale(${onLastScale})`,
					}}
				>
					<div
						style={{
							fontSize: 24,
							letterSpacing: 8,
							color: theme.ink,
							opacity: 0.55,
							fontWeight: theme.weightMedium,
							marginBottom: 14,
						}}
					>
						ONE LAST NUMBER
					</div>
					<div
						style={{
							fontSize: 38,
							color: theme.ink,
							fontStyle: 'italic',
							fontWeight: theme.weightRegular,
						}}
					>
						how powerful is time, really?
					</div>
				</div>
			) : null}

			{/* ============================================================
			    Age timeline (visible from B2 onward)
			    ============================================================ */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					opacity: timelineOpacity,
				}}
			>
				{/* +5 YEARS highlight band */}
				<div
					style={{
						position: 'absolute',
						left: ageToX(25),
						top: TL_Y - 18,
						width: ageToX(30) - ageToX(25),
						height: 36,
						background: theme.gold,
						opacity: extendBandOpacity * 0.35,
						borderRadius: 8,
					}}
				/>
				<div
					style={{
						position: 'absolute',
						left: ageToX(25) - 60,
						top: TL_Y - 70,
						width: ageToX(30) - ageToX(25) + 120,
						textAlign: 'center',
						fontSize: 18,
						letterSpacing: 4,
						color: theme.gold,
						opacity: extendBandOpacity,
						fontWeight: theme.weightMedium,
					}}
				>
					+5 YEARS
				</div>

				{/* Axis line */}
				<div
					style={{
						position: 'absolute',
						left: TL_X0,
						right: CANVAS_W - TL_X1,
						top: TL_Y,
						height: 3,
						background: theme.ink,
						opacity: 0.55,
					}}
				/>

				{/* Tick labels: 25, 30, 40, 50, 60 */}
				{[25, 30, 40, 50, 60].map((age) => {
					const x = ageToX(age);
					const isStart = age === 25 || age === 30;
					return (
						<React.Fragment key={age}>
							<div
								style={{
									position: 'absolute',
									left: x - 1,
									top: TL_Y - 10,
									width: 2,
									height: 20,
									background: theme.ink,
									opacity: 0.55,
								}}
							/>
							<div
								style={{
									position: 'absolute',
									left: x - 40,
									top: TL_Y + 18,
									width: 80,
									textAlign: 'center',
									fontSize: 18,
									letterSpacing: 2,
									color: theme.ink,
									opacity: isStart ? 0.85 : 0.55,
									fontWeight: theme.weightMedium,
								}}
							>
								{age}
							</div>
						</React.Fragment>
					);
				})}

				{/* Start marker (animated 30 → 25) */}
				<div
					style={{
						position: 'absolute',
						left: startX - 18,
						top: TL_Y - 36,
						width: 36,
						height: 72,
					}}
				>
					<div
						style={{
							position: 'absolute',
							left: 16,
							top: 0,
							width: 4,
							height: 72,
							background: theme.teal,
							borderRadius: 2,
						}}
					/>
					<svg width={36} height={24} viewBox="0 0 36 24" style={{position: 'absolute', left: 0, top: -20}}>
						<polygon points="18,24 0,0 36,0" fill={theme.teal} />
					</svg>
					<div
						style={{
							position: 'absolute',
							left: -50,
							top: -56,
							width: 136,
							textAlign: 'center',
							fontSize: 14,
							letterSpacing: 3,
							color: theme.teal,
							fontWeight: theme.weightMedium,
						}}
					>
						START
					</div>
				</div>

				{/* Same tags */}
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						top: TL_Y + 70,
						textAlign: 'center',
						opacity: sameTagsOpacity,
					}}
				>
					{['SAME $500 / MO', 'SAME FUND'].map((label) => (
						<span
							key={label}
							style={{
								display: 'inline-block',
								padding: '6px 14px',
								margin: '0 6px',
								border: `2px solid ${theme.ink}`,
								borderRadius: 999,
								fontSize: 14,
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
			</div>

			{/* ============================================================
			    B3: small "+$30,000 contributed" chip
			    ============================================================ */}
			{frame >= B3_START - 5 && frame <= B5_START + 130 ? (
				<div
					style={{
						position: 'absolute',
						left: CANVAS_W / 2 - 140,
						top: 400,
						width: 280,
						textAlign: 'center',
						opacity: chipSmallOpacity,
						transform: `scale(${chipSmallScale})`,
					}}
				>
					<div
						style={{
							display: 'inline-block',
							padding: '10px 22px',
							border: `2px solid ${theme.ink}`,
							borderRadius: 999,
							fontSize: 22,
							fontWeight: theme.weightMedium,
							color: theme.ink,
							letterSpacing: 1,
							background: theme.bg,
						}}
					>
						+{formatDollars(EXTRA_CONTRIB)} contributed
					</div>
					<div
						style={{
							marginTop: 14,
							fontSize: 18,
							color: theme.ink,
							opacity: justThatOpacity,
							fontStyle: 'italic',
						}}
					>
						that's it.
					</div>
				</div>
			) : null}

			{/* ============================================================
			    B4: Total CountUp $1.13M → $1.9M (centered)
			    ============================================================ */}
			{frame >= B4_START - 10 && frame <= B6_START + 30 ? (
				<>
					<GlowDisc
						cx={CANVAS_W / 2}
						cy={620}
						size={900}
						color={theme.gold}
						opacity={totalGlowOpacity}
					/>
					<div
						style={{
							position: 'absolute',
							left: 0,
							right: 0,
							top: 520,
							textAlign: 'center',
							opacity: totalOpacity,
							transform: `scale(${totalScale})`,
						}}
					>
						<div
							style={{
								fontSize: 16,
								letterSpacing: 6,
								color: theme.ink,
								opacity: 0.55,
								fontWeight: theme.weightMedium,
								marginBottom: 14,
							}}
						>
							MARCUS · AGE 60 · IF HE'D STARTED AT 25
						</div>
						<div
							style={{
								fontSize: 180,
								lineHeight: 1,
								fontWeight: theme.weightMedium,
								color: theme.gold,
								fontVariantNumeric: 'tabular-nums',
								textShadow: `0 0 50px ${theme.gold}66`,
							}}
						>
							{formatDollars(totalCount)}
						</div>
					</div>
					{/* before/after sub-caption */}
					<div
						style={{
							position: 'absolute',
							left: 0,
							right: 0,
							top: 800,
							textAlign: 'center',
							opacity: beforeAfterOpacity,
							fontSize: 22,
							letterSpacing: 3,
							color: theme.ink,
							fontWeight: theme.weightMedium,
						}}
					>
						<span style={{opacity: 0.7}}>
							started at 30 · {formatDollars(ORIGINAL_TOTAL)}
						</span>
						<span style={{margin: '0 14px', opacity: 0.4}}>→</span>
						<span style={{color: theme.gold}}>
							started at 25 · {formatDollars(NEW_TOTAL)}
						</span>
					</div>
				</>
			) : null}

			{/* ============================================================
			    B5: mismatch — tiny +$30k vs huge +$770k
			    ============================================================ */}
			{frame >= B5_START - 10 && frame <= B6_START + 30 ? (
				<>
					{/* Small chip on the left */}
					<div
						style={{
							position: 'absolute',
							left: 200,
							top: 540,
							width: 360,
							textAlign: 'center',
							opacity: smallContribOpacity,
							transform: `scale(${smallContribScale})`,
						}}
					>
						<div
							style={{
								fontSize: 13,
								letterSpacing: 4,
								color: theme.ink,
								opacity: 0.55,
								fontWeight: theme.weightMedium,
								marginBottom: 8,
							}}
						>
							EXTRA INPUT
						</div>
						<div
							style={{
								display: 'inline-block',
								padding: '10px 18px',
								border: `2px solid ${theme.ink}`,
								borderRadius: 999,
								fontSize: 28,
								fontWeight: theme.weightMedium,
								color: theme.ink,
								letterSpacing: 1,
								background: theme.bg,
								fontVariantNumeric: 'tabular-nums',
							}}
						>
							+{formatDollars(EXTRA_CONTRIB)}
						</div>
					</div>

					{/* Arrow from small to huge */}
					<svg
						width={400}
						height={60}
						viewBox="0 0 400 60"
						style={{
							position: 'absolute',
							left: 600,
							top: 620,
							opacity: arrowDraw,
						}}
					>
						<line
							x1={0}
							y1={30}
							x2={350 * arrowDraw}
							y2={30}
							stroke={theme.ink}
							strokeWidth={3}
							opacity={0.7}
						/>
						{arrowDraw > 0.9 ? (
							<polygon
								points={`${350},20 ${380},30 ${350},40`}
								fill={theme.ink}
								opacity={0.7}
							/>
						) : null}
					</svg>

					{/* Huge number on the right */}
					<div
						style={{
							position: 'absolute',
							left: 1020,
							top: 470,
							width: 740,
							textAlign: 'center',
							opacity: bigWealthOpacity,
							transform: `scale(${bigWealthScale})`,
						}}
					>
						<GlowDisc
							cx={370}
							cy={130}
							size={620}
							color={theme.gold}
							opacity={bigWealthGlow}
						/>
						<div
							style={{
								fontSize: 16,
								letterSpacing: 5,
								color: theme.ink,
								opacity: 0.55,
								fontWeight: theme.weightMedium,
								marginBottom: 14,
								position: 'relative',
							}}
						>
							EXTRA WEALTH
						</div>
						<div
							style={{
								fontSize: 140,
								lineHeight: 1,
								fontWeight: theme.weightMedium,
								color: theme.gold,
								fontVariantNumeric: 'tabular-nums',
								textShadow: `0 0 40px ${theme.gold}55`,
								position: 'relative',
							}}
						>
							+{formatDollars(EXTRA_WEALTH)}
						</div>
					</div>

					{/* 5 years caption */}
					<div
						style={{
							position: 'absolute',
							left: 0,
							right: 0,
							top: 820,
							textAlign: 'center',
							opacity: fiveYearsCaptionOpacity,
							fontSize: 26,
							color: theme.ink,
							fontStyle: 'italic',
							fontWeight: theme.weightMedium,
						}}
					>
						5 years you'd never have missed.
					</div>
				</>
			) : null}

			{/* ============================================================
			    B6: front-of-the-line queue
			    ============================================================ */}
			{frame >= B6_START - 10 ? (
				<div style={{position: 'absolute', inset: 0, opacity: queueOpacity}}>
					{/* Explosion glow at front (vertical compounding callback) */}
					<GlowDisc
						cx={QUEUE_FRONT_X + 80}
						cy={QUEUE_CY - 20}
						size={780}
						color={theme.gold}
						opacity={explosionGlow}
					/>
					{/* Vertical glow shape that echoes S22's vertical compounding tail */}
					<div
						style={{
							position: 'absolute',
							left: QUEUE_FRONT_X + 60,
							top: 180,
							width: 60,
							height: 600,
							background: `linear-gradient(180deg, ${theme.gold}cc 0%, ${theme.gold}55 60%, rgba(0,0,0,0) 100%)`,
							borderRadius: 30,
							opacity: explosionGlow,
							filter: 'blur(2px)',
						}}
					/>

					{/* Queue: 6 figures facing right (front at QUEUE_FRONT_X, others trailing left) */}
					{Array.from({length: QUEUE_COUNT}).map((_, i) => {
						// i=0 is the front (Marcus). Higher i = further back.
						const baseX = QUEUE_FRONT_X - i * QUEUE_SPACING;
						const isFront = i === 0;
						// Figure index 1 steps back one place.
						const isStepper = i === 1;
						const x = isStepper ? baseX + stepBackOffset : baseX;
						const color = isFront ? theme.teal : GRAY;
						const opacity = isFront ? 1 : interpolate(i, [1, 5], [0.85, 0.4], clamp);
						const figW = isFront ? 130 : 110;
						return (
							<Figure
								key={i}
								cx={x}
								cy={QUEUE_CY}
								width={figW}
								color={color}
								opacity={opacity}
							/>
						);
					})}

					{/* "FRONT OF THE LINE" label */}
					<div
						style={{
							position: 'absolute',
							left: QUEUE_FRONT_X - 200,
							top: QUEUE_CY - 200,
							width: 400,
							textAlign: 'center',
							opacity: frontLabelOpacity,
							fontSize: 18,
							letterSpacing: 6,
							color: theme.teal,
							fontWeight: theme.weightMedium,
						}}
					>
						FRONT OF THE LINE
					</div>

					{/* MARCUS name under front figure */}
					<div
						style={{
							position: 'absolute',
							left: QUEUE_FRONT_X - 100,
							top: QUEUE_CY + 100,
							width: 200,
							textAlign: 'center',
							fontSize: 18,
							letterSpacing: 4,
							color: theme.teal,
							opacity: frontLabelOpacity,
							fontWeight: theme.weightMedium,
						}}
					>
						MARCUS
					</div>

					{/* "every year you wait..." caption */}
					<div
						style={{
							position: 'absolute',
							left: 0,
							right: 0,
							top: 220,
							textAlign: 'center',
							fontSize: 28,
							color: theme.ink,
							opacity: everyYearOpacity,
							fontStyle: 'italic',
							fontWeight: theme.weightMedium,
						}}
					>
						every year you wait costs your place at the front.
					</div>
				</div>
			) : null}

			<Vignette />
		</AbsoluteFill>
	);
};

export default S50_Coda;
