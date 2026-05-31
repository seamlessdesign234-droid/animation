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

const LEFT_CX = 480;
const RIGHT_CX = 1440;
const CENTER_CX = 960;

const FIG_CY = 460;
const FIG_W = 200;

const clamp = {
	extrapolateLeft: 'clamp' as const,
	extrapolateRight: 'clamp' as const,
};

// Beats.
const B1_END = 420;
const B2_START = 420;
const B2_END = 870;
const B3_START = 870;
const B3_END = 1230;
const B4_START = 1230;
const B4_END = 1690;
const B5_START = 1690;
const B5_END = 2020;
const B6_START = 2020;
const B6_END = 2250;

const Vignette: React.FC<{intensity?: number}> = ({intensity = 0.08}) => (
	<AbsoluteFill
		style={{
			background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,${intensity}) 100%)`,
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

const Jar: React.FC<{
	cx: number;
	cy: number;
	width: number;
	height: number;
	accent: string;
	fillPct: number;
	fillColor: string;
	label: string;
	opacity?: number;
}> = ({cx, cy, width, height, accent, fillPct, fillColor, label, opacity = 1}) => {
	const left = cx - width / 2;
	const top = cy - height / 2;
	const fillH = (height - 18) * Math.max(0, Math.min(1, fillPct));
	return (
		<div style={{position: 'absolute', left, top, width, height, opacity}}>
			<div
				style={{
					position: 'absolute',
					inset: 0,
					borderRadius: 18,
					border: `4px solid ${accent}`,
					background: 'rgba(255,255,255,0.4)',
					boxSizing: 'border-box',
					overflow: 'hidden',
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: 6,
						right: 6,
						bottom: 6,
						height: fillH,
						background: fillColor,
						borderRadius: 12,
						opacity: 0.85,
					}}
				/>
			</div>
			<div
				style={{
					position: 'absolute',
					left: -10,
					right: -10,
					top: -10,
					height: 16,
					borderRadius: 10,
					background: accent,
				}}
			/>
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					bottom: -38,
					textAlign: 'center',
					fontSize: 20,
					fontWeight: theme.weightMedium,
					color: theme.ink,
					letterSpacing: 1,
				}}
			>
				{label}
			</div>
		</div>
	);
};

const CarIcon: React.FC<{size: number; color: string}> = ({size, color}) => (
	<svg width={size} height={size} viewBox="0 0 64 64">
		<path
			d="M 6 38 L 12 22 Q 14 18 18 18 L 46 18 Q 50 18 52 22 L 58 38 L 58 46 L 50 46 L 50 42 L 14 42 L 14 46 L 6 46 Z"
			fill={color}
		/>
		<circle cx={18} cy={46} r={5} fill={theme.ink} />
		<circle cx={46} cy={46} r={5} fill={theme.ink} />
		<rect x={18} y={22} width={12} height={10} fill={theme.bg} />
		<rect x={34} y={22} width={12} height={10} fill={theme.bg} />
	</svg>
);

const PlateIcon: React.FC<{size: number; color: string}> = ({size, color}) => (
	<svg width={size} height={size} viewBox="0 0 64 64">
		<circle cx={32} cy={34} r={22} fill={color} />
		<circle cx={32} cy={34} r={14} fill={theme.bg} />
		<rect x={6} y={20} width={3} height={28} fill={color} rx={1} />
		<rect x={55} y={20} width={3} height={28} fill={color} rx={1} />
	</svg>
);

const CheckTick: React.FC<{size: number; color: string; opacity: number}> = ({
	size,
	color,
	opacity,
}) => (
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		style={{opacity}}
	>
		<path
			d="M 4 12 L 10 18 L 20 6"
			fill="none"
			stroke={color}
			strokeWidth={3}
			strokeLinecap="round"
			strokeLinejoin="round"
		/>
	</svg>
);

export const S26_DavidDoublesGrinds: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	// ============================================================
	// B1: Head-start gap callback + David resolves
	// ============================================================
	const trackOpacity = interpolate(
		frame,
		[20, 80, B1_END - 80, B1_END],
		[0, 1, 1, 0],
		clamp,
	);
	// Marcus far along track, David back at start line.
	const TRACK_Y = 880;
	const TRACK_LEFT = 220;
	const TRACK_RIGHT = 1700;
	const TRACK_LEN = TRACK_RIGHT - TRACK_LEFT;

	// David's resolve: at ~B1_START+200 he straightens, small clench glow.
	const resolveProgress = spring({
		frame: frame - 200,
		fps,
		config: {damping: 14, stiffness: 130},
	});
	const davidResolveScale = interpolate(resolveProgress, [0, 1], [1, 1.06], clamp);
	const resolveGlow = interpolate(
		frame,
		[220, 280, B1_END - 60, B1_END],
		[0, 0.4, 0.4, 0],
		clamp,
	);

	// ============================================================
	// B2: $500 → $1000 flip, 2× badge, SAME tags
	// ============================================================
	// Numerical flip: render $500 then crossfade/flip to $1000.
	const flipProgress = spring({
		frame: frame - (B2_START + 40),
		fps,
		config: {damping: 13, stiffness: 140},
	});
	// 0..1 from 500 → 1000 (we'll display two stacked elements that swap)
	const oldOpacity = interpolate(flipProgress, [0, 0.5, 1], [1, 0.4, 0], clamp);
	const newOpacity = interpolate(flipProgress, [0, 0.4, 1], [0, 0.3, 1], clamp);
	const newScale = interpolate(flipProgress, [0, 1], [0.6, 1], clamp);

	const flipChipOpacity = interpolate(
		frame,
		[B2_START + 10, B2_START + 50, B3_END - 60, B3_END],
		[0, 1, 1, 0.5],
		clamp,
	);

	// 2× badge
	const twoXSpring = spring({
		frame: frame - (B2_START + 70),
		fps,
		config: {damping: 12, stiffness: 160},
	});
	const twoXScale = interpolate(twoXSpring, [0, 1], [0.3, 1], clamp);
	const twoXOpacity = interpolate(
		frame,
		[B2_START + 70, B2_START + 110, B3_END - 60, B3_END],
		[0, 1, 1, 0.5],
		clamp,
	);
	const twoXPulse = 1 + 0.05 * Math.sin((frame - (B2_START + 110)) / 8);

	// Sameness link tags (SAME FUND / SAME MARKET) — connector line + chips.
	const samenessOpacity = interpolate(
		frame,
		[B2_START + 160, B2_START + 220, B2_END - 30, B2_END + 30],
		[0, 1, 1, 0],
		clamp,
	);

	// ============================================================
	// B3: lifestyle downgrade — car → modest, plate strike
	// ============================================================
	const downgradeOpacity = interpolate(
		frame,
		[B3_START + 10, B3_START + 60],
		[0, 1],
		clamp,
	);
	// Big car shrinks, small car grows in its place.
	const carShrink = interpolate(
		frame,
		[B3_START + 40, B3_START + 120],
		[1, 0.55],
		clamp,
	);
	// Strike on the plate icon
	const plateStrike = interpolate(
		frame,
		[B3_START + 140, B3_START + 200],
		[0, 1],
		clamp,
	);
	// "DISCIPLINED" tag
	const disciplinedOpacity = interpolate(
		frame,
		[B3_START + 220, B3_START + 280, B3_END - 30, B3_END + 10],
		[0, 1, 1, 0.4],
		clamp,
	);

	// ============================================================
	// B4: ticker 40 → 60, David grinds (jar fills, bar climbs)
	// ============================================================
	const yearF = interpolate(
		frame,
		[B4_START, B4_END],
		[40, 60],
		clamp,
	);
	const yearDisplay = Math.min(60, Math.floor(yearF + 0.001));

	// Calendar-flip vibe: a brief flash on every integer change.
	const yearFlash =
		0.5 + 0.5 * Math.cos((yearF - yearDisplay) * Math.PI * 2);

	// David's jar fill: starts ~0 at B4_START → ~0.75 at B4_END.
	const davidJarFill = interpolate(
		frame,
		[B4_START, B4_END],
		[0, 0.78],
		clamp,
	);
	// David's bar grows steadily.
	const davidBarH = interpolate(
		frame,
		[B4_START, B4_END, B6_END],
		[10, 360, 380],
		clamp,
	);

	// Effort ticks ("no excuses · every month")
	const effortOpacity = interpolate(
		frame,
		[B4_START + 80, B4_START + 130, B4_END - 60, B4_END + 20],
		[0, 1, 1, 0.6],
		clamp,
	);
	// Tick stamps every ~40 frames, 6 ticks
	const TICK_COUNT = 6;
	const TICK_STEP = (B4_END - B4_START - 160) / TICK_COUNT;

	// ============================================================
	// B5: Marcus calm, his bar continues to climb effortlessly
	// ============================================================
	// Marcus bar — already substantial when scene starts (from S22 ending vibe),
	// climbs smoothly throughout the scene, biggest gains during B5.
	const marcusBarH = interpolate(
		frame,
		[0, B4_START, B4_END, B5_END, B6_END],
		[300, 380, 470, 540, 560],
		clamp,
	);
	const marcusJarFill = interpolate(
		frame,
		[0, B5_END, B6_END],
		[0.85, 0.95, 0.97],
		clamp,
	);
	// Brief brightening on Marcus during B5; rest of scene he's secondary but visible.
	const marcusBright = interpolate(
		frame,
		[B5_START, B5_START + 40, B5_END, B5_END + 40],
		[0.7, 1, 1, 0.85],
		clamp,
	);
	// David dims slightly during B5 to push focus to Marcus.
	const davidBright = interpolate(
		frame,
		[B5_START, B5_START + 40, B5_END, B5_END + 40],
		[1, 0.6, 0.6, 1],
		clamp,
	);
	// Marcus relaxed: small idle bob
	const marcusBob = Math.sin(frame / 22) * 4;

	// ============================================================
	// B6: AGE 60 + sealed envelopes
	// ============================================================
	const age60Opacity = interpolate(
		frame,
		[B6_START, B6_START + 40],
		[0, 1],
		clamp,
	);
	const age60Spring = spring({
		frame: frame - B6_START,
		fps,
		config: {damping: 13, stiffness: 150},
	});
	const age60Scale = interpolate(age60Spring, [0, 1], [0.6, 1], clamp);

	const envSpring = spring({
		frame: frame - (B6_START + 60),
		fps,
		config: {damping: 13, stiffness: 130},
	});
	const envOpacity = interpolate(
		frame,
		[B6_START + 60, B6_START + 110],
		[0, 1],
		clamp,
	);
	const envScale = interpolate(envSpring, [0, 1], [0.4, 1], clamp);
	const envY = interpolate(envSpring, [0, 1], [60, 0], clamp);

	// Anticipatory pulse on envelopes near the end.
	const antPulse =
		interpolate(frame, [B6_END - 120, B6_END - 20], [0, 0.5], clamp) *
		(0.7 + 0.3 * Math.sin((frame - (B6_END - 120)) / 6));

	// ============================================================
	// YEAR TICKER (top-center)
	// ============================================================
	// Pre-B4 display: stays at 40 (the "starting now" age).
	const tickerNumber = frame < B4_START ? 40 : yearDisplay;
	const tickerOpacity = interpolate(
		frame,
		[40, 100, B5_START, B5_START + 60, B6_END],
		[0, 1, 1, 0.45, 0.45],
		clamp,
	);

	// ============================================================
	// Side opacities (B1 = focus right for resolve; B2/B3 mostly David;
	// B5 focus left; B6 both bright).
	// ============================================================
	const marcusSideOp = interpolate(
		frame,
		[0, B1_END, B2_START + 60, B2_END, B3_START + 60, B3_END, B5_START, B5_START + 40, B6_START, B6_START + 60],
		[0.7, 0.7, 0.55, 0.55, 0.45, 0.45, 0.9, 1, 1, 1],
		clamp,
	) * marcusBright;
	const davidSideOp = interpolate(
		frame,
		[0, 200, B1_END, B2_START + 60, B3_START, B3_END, B5_START, B5_START + 40, B6_START, B6_START + 60],
		[1, 1, 1, 1, 1, 1, 1, 0.6, 1, 1],
		clamp,
	) * davidBright;

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
			{/* -------- YEAR TICKER -------- */}
			<div
				style={{
					position: 'absolute',
					left: CENTER_CX - 200,
					top: 50,
					width: 400,
					textAlign: 'center',
					opacity: tickerOpacity,
				}}
			>
				<div
					style={{
						fontSize: 18,
						letterSpacing: 6,
						color: theme.ink,
						opacity: 0.55,
						fontWeight: theme.weightMedium,
					}}
				>
					AGE
				</div>
				<div
					style={{
						fontSize: 88,
						lineHeight: 1,
						fontWeight: theme.weightMedium,
						color: theme.ink,
						marginTop: 4,
						fontVariantNumeric: 'tabular-nums',
						opacity: frame >= B4_START && frame < B4_END ? yearFlash : 1,
					}}
				>
					{tickerNumber}
				</div>
			</div>

			{/* ============================================================
			    B1: head-start gap callback
			    ============================================================ */}
			{frame <= B1_END + 20 ? (
				<div style={{position: 'absolute', inset: 0, opacity: trackOpacity}}>
					{/* Track lane */}
					<div
						style={{
							position: 'absolute',
							left: TRACK_LEFT,
							top: TRACK_Y - 30,
							width: TRACK_LEN,
							height: 60,
							borderTop: `3px solid ${theme.ink}`,
							borderBottom: `3px solid ${theme.ink}`,
							background: `repeating-linear-gradient(90deg, ${theme.ink}22 0 18px, transparent 18px 36px)`,
							opacity: 0.85,
						}}
					/>
					{/* Start line */}
					<div
						style={{
							position: 'absolute',
							left: TRACK_LEFT - 4,
							top: TRACK_Y - 70,
							width: 8,
							height: 140,
							background: theme.ink,
							borderRadius: 3,
						}}
					/>
					{/* Marcus far ahead */}
					<Figure
						cx={TRACK_LEFT + TRACK_LEN * 0.75}
						cy={TRACK_Y - 60}
						width={70}
						color={theme.teal}
					/>
					{/* David back at start, with resolve glow */}
					<GlowDisc
						cx={TRACK_LEFT + 20}
						cy={TRACK_Y - 60}
						size={220}
						color={theme.amber}
						opacity={resolveGlow}
					/>
					<div
						style={{
							position: 'absolute',
							left: TRACK_LEFT + 20 - 35,
							top: TRACK_Y - 60 - 42,
							width: 70,
							transform: `scale(${davidResolveScale})`,
							transformOrigin: 'center bottom',
						}}
					>
						<Figure cx={35} cy={42} width={70} color={theme.amber} />
					</div>
					{/* Caption */}
					<div
						style={{
							position: 'absolute',
							left: 0,
							right: 0,
							top: 220,
							textAlign: 'center',
							fontSize: 30,
							color: theme.ink,
							opacity: interpolate(frame, [60, 140, B1_END - 60, B1_END], [0, 1, 1, 0], clamp),
							fontStyle: 'italic',
							fontWeight: theme.weightMedium,
						}}
					>
						At forty, David finally gets serious.
					</div>
				</div>
			) : null}

			{/* ============================================================
			    Main two-side layout (visible from ~B2 onward)
			    ============================================================ */}
			{frame >= B1_END - 40 ? (
				<>
					{/* MARCUS SIDE */}
					<div style={{position: 'absolute', inset: 0, opacity: marcusSideOp}}>
						<div
							style={{
								transform: `translateY(${marcusBob}px)`,
								position: 'absolute',
								left: LEFT_CX - FIG_W / 2,
								top: FIG_CY - FIG_W * 0.6,
								width: FIG_W,
								height: FIG_W * 1.2,
							}}
						>
							<Figure cx={FIG_W / 2} cy={FIG_W * 0.6} width={FIG_W} color={theme.teal} />
						</div>
						<div
							style={{
								position: 'absolute',
								left: LEFT_CX - 200,
								top: FIG_CY - FIG_W * 0.75 - 20,
								width: 400,
								textAlign: 'center',
								fontSize: 26,
								fontWeight: theme.weightMedium,
								color: theme.teal,
								letterSpacing: 3,
							}}
						>
							MARCUS
						</div>

						<Jar
							cx={LEFT_CX - 100}
							cy={780}
							width={170}
							height={240}
							accent={theme.teal}
							fillPct={marcusJarFill}
							fillColor={theme.gold}
							label="INDEX FUND"
						/>

						{/* Growth bar */}
						<div
							style={{
								position: 'absolute',
								left: LEFT_CX + 60,
								top: 900 - marcusBarH,
								width: 32,
								height: marcusBarH,
								background: theme.teal,
								borderRadius: 4,
								opacity: 0.85,
							}}
						/>
						<div
							style={{
								position: 'absolute',
								left: LEFT_CX + 48,
								top: 906,
								width: 56,
								textAlign: 'center',
								fontSize: 11,
								letterSpacing: 1,
								color: theme.ink,
								opacity: 0.4,
							}}
						>
							GROWTH
						</div>

						{/* Marcus contribution chip — unchanged $500/mo */}
						<div
							style={{
								position: 'absolute',
								left: LEFT_CX - 140,
								top: 250,
								width: 280,
								textAlign: 'center',
							}}
						>
							<div
								style={{
									display: 'inline-block',
									padding: '10px 22px',
									borderRadius: 999,
									border: `2px solid ${theme.teal}`,
									background: theme.bg,
									fontSize: 22,
									fontWeight: theme.weightMedium,
									color: theme.ink,
									letterSpacing: 2,
								}}
							>
								$500 / mo
							</div>
						</div>
					</div>

					{/* DAVID SIDE */}
					<div style={{position: 'absolute', inset: 0, opacity: davidSideOp}}>
						<Figure cx={RIGHT_CX} cy={FIG_CY} width={FIG_W} color={theme.amber} />
						<div
							style={{
								position: 'absolute',
								left: RIGHT_CX - 200,
								top: FIG_CY - FIG_W * 0.75 - 20,
								width: 400,
								textAlign: 'center',
								fontSize: 26,
								fontWeight: theme.weightMedium,
								color: theme.amber,
								letterSpacing: 3,
							}}
						>
							DAVID
						</div>

						<Jar
							cx={RIGHT_CX - 100}
							cy={780}
							width={170}
							height={240}
							accent={theme.amber}
							fillPct={davidJarFill}
							fillColor={theme.gold}
							label="INDEX FUND"
						/>

						{/* David's growth bar */}
						<div
							style={{
								position: 'absolute',
								left: RIGHT_CX + 60,
								top: 900 - davidBarH,
								width: 32,
								height: davidBarH,
								background: theme.amber,
								borderRadius: 4,
								opacity: 0.85,
							}}
						/>
						<div
							style={{
								position: 'absolute',
								left: RIGHT_CX + 48,
								top: 906,
								width: 56,
								textAlign: 'center',
								fontSize: 11,
								letterSpacing: 1,
								color: theme.ink,
								opacity: 0.4,
							}}
						>
							GROWTH
						</div>

						{/* David contribution chip: $500 fading to $1,000 */}
						<div
							style={{
								position: 'absolute',
								left: RIGHT_CX - 160,
								top: 250,
								width: 320,
								textAlign: 'center',
								opacity: flipChipOpacity,
							}}
						>
							<div style={{position: 'relative', height: 56}}>
								{/* Old $500 */}
								<div
									style={{
										position: 'absolute',
										left: 0,
										right: 0,
										top: 0,
										opacity: oldOpacity,
									}}
								>
									<span
										style={{
											display: 'inline-block',
											padding: '10px 22px',
											borderRadius: 999,
											border: `2px solid ${theme.amber}`,
											background: theme.bg,
											fontSize: 22,
											fontWeight: theme.weightMedium,
											color: theme.ink,
											letterSpacing: 2,
										}}
									>
										$500 / mo
									</span>
								</div>
								{/* New $1,000 */}
								<div
									style={{
										position: 'absolute',
										left: 0,
										right: 0,
										top: 0,
										opacity: newOpacity,
										transform: `scale(${newScale})`,
									}}
								>
									<span
										style={{
											display: 'inline-block',
											padding: '10px 26px',
											borderRadius: 999,
											background: theme.amber,
											color: theme.bg,
											fontSize: 26,
											fontWeight: theme.weightMedium,
											letterSpacing: 2,
										}}
									>
										$1,000 / mo
									</span>
								</div>
							</div>
						</div>

						{/* 2× badge */}
						<div
							style={{
								position: 'absolute',
								left: RIGHT_CX + 130,
								top: 240,
								width: 90,
								height: 90,
								opacity: twoXOpacity,
								transform: `scale(${twoXScale * twoXPulse})`,
								borderRadius: '50%',
								background: theme.gold,
								color: theme.ink,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								fontSize: 36,
								fontWeight: theme.weightMedium,
								letterSpacing: 1,
							}}
						>
							2×
						</div>

						{/* DISCIPLINED tag */}
						<div
							style={{
								position: 'absolute',
								left: RIGHT_CX - 140,
								top: FIG_CY + FIG_W * 0.7,
								width: 280,
								textAlign: 'center',
								opacity: disciplinedOpacity,
							}}
						>
							<span
								style={{
									display: 'inline-block',
									padding: '6px 16px',
									border: `2px solid ${theme.ink}`,
									borderRadius: 999,
									fontSize: 16,
									letterSpacing: 4,
									color: theme.ink,
									fontWeight: theme.weightMedium,
								}}
							>
								DISCIPLINED
							</span>
						</div>
					</div>

					{/* Sameness link: SAME FUND / SAME MARKET */}
					{frame >= B2_START + 140 ? (
						<div
							style={{
								position: 'absolute',
								left: CENTER_CX - 180,
								top: 380,
								width: 360,
								textAlign: 'center',
								opacity: samenessOpacity,
							}}
						>
							<div
								style={{
									height: 2,
									background: theme.ink,
									opacity: 0.3,
									marginBottom: 10,
								}}
							/>
							<div
								style={{
									fontSize: 14,
									letterSpacing: 5,
									color: theme.ink,
									opacity: 0.6,
									fontWeight: theme.weightMedium,
								}}
							>
								SAME FUND · SAME MARKET
							</div>
							<div
								style={{
									height: 2,
									background: theme.ink,
									opacity: 0.3,
									marginTop: 10,
								}}
							/>
						</div>
					) : null}

					{/* ============================================================
					    B3: Lifestyle downgrade icons (right side, below David)
					    ============================================================ */}
					{frame >= B3_START - 5 && frame <= B4_START + 30 ? (
						<div
							style={{
								position: 'absolute',
								left: RIGHT_CX + 130,
								top: 380,
								width: 320,
								opacity: downgradeOpacity *
									interpolate(frame, [B4_START, B4_START + 30], [1, 0.4], clamp),
							}}
						>
							{/* Car: big shrinks, small grows */}
							<div style={{position: 'relative', height: 110, marginBottom: 12}}>
								<div
									style={{
										position: 'absolute',
										left: 0,
										top: 0,
										transform: `scale(${carShrink})`,
										transformOrigin: 'left top',
										opacity: interpolate(
											frame,
											[B3_START + 40, B3_START + 120],
											[1, 0.5],
											clamp,
										),
									}}
								>
									<CarIcon size={100} color={theme.amber} />
								</div>
								<div
									style={{
										position: 'absolute',
										left: 130,
										top: 30,
										opacity: interpolate(
											frame,
											[B3_START + 40, B3_START + 120],
											[0, 1],
											clamp,
										),
									}}
								>
									<CarIcon size={60} color={theme.amber} />
								</div>
								<div
									style={{
										position: 'absolute',
										left: 0,
										right: 0,
										bottom: -20,
										fontSize: 12,
										letterSpacing: 3,
										color: theme.ink,
										opacity: 0.55,
										fontWeight: theme.weightMedium,
									}}
								>
									DOWNGRADE
								</div>
							</div>
							{/* Plate with strike */}
							<div style={{position: 'relative', height: 100, marginTop: 28}}>
								<PlateIcon size={80} color={theme.amber} />
								<div
									style={{
										position: 'absolute',
										left: 0,
										top: 38,
										width: 80,
										height: 4,
										background: theme.red,
										transform: `scaleX(${plateStrike}) rotate(-12deg)`,
										transformOrigin: 'left center',
										borderRadius: 2,
									}}
								/>
								<div
									style={{
										position: 'absolute',
										left: 90,
										top: 30,
										fontSize: 14,
										letterSpacing: 2,
										color: theme.ink,
										opacity: plateStrike * 0.7,
										fontWeight: theme.weightMedium,
									}}
								>
									CUT THE DINNERS
								</div>
							</div>
						</div>
					) : null}

					{/* ============================================================
					    B4: effort ticks (right side, under David)
					    ============================================================ */}
					{frame >= B4_START - 10 ? (
						<div
							style={{
								position: 'absolute',
								left: RIGHT_CX - 220,
								top: 660,
								width: 440,
								textAlign: 'center',
								opacity: effortOpacity,
							}}
						>
							<div
								style={{
									fontSize: 14,
									letterSpacing: 4,
									color: theme.ink,
									opacity: 0.6,
									fontWeight: theme.weightMedium,
								}}
							>
								NO EXCUSES · EVERY MONTH
							</div>
							<div
								style={{
									display: 'flex',
									justifyContent: 'center',
									gap: 8,
									marginTop: 8,
								}}
							>
								{Array.from({length: TICK_COUNT}).map((_, i) => {
									const tStart = B4_START + 80 + i * TICK_STEP;
									const sp = spring({
										frame: frame - tStart,
										fps,
										config: {damping: 14, stiffness: 160},
									});
									const sc = interpolate(sp, [0, 1], [0, 1], clamp);
									return (
										<div
											key={i}
											style={{
												width: 26,
												height: 26,
												transform: `scale(${sc})`,
											}}
										>
											<CheckTick size={26} color={theme.amber} opacity={sc} />
										</div>
									);
								})}
							</div>
						</div>
					) : null}

					{/* ============================================================
					    B5: calm cue for Marcus — small "still $500" whisper
					    ============================================================ */}
					{frame >= B5_START - 10 && frame <= B6_START + 60 ? (
						<div
							style={{
								position: 'absolute',
								left: LEFT_CX - 220,
								top: 660,
								width: 440,
								textAlign: 'center',
								opacity: interpolate(
									frame,
									[B5_START, B5_START + 40, B6_START, B6_START + 60],
									[0, 0.85, 0.85, 0.4],
									clamp,
								),
							}}
						>
							<div
								style={{
									fontSize: 16,
									letterSpacing: 3,
									color: theme.ink,
									opacity: 0.7,
									fontWeight: theme.weightRegular,
									fontStyle: 'italic',
								}}
							>
								same quiet $500 · barely thinks about it
							</div>
						</div>
					) : null}

					{/* ============================================================
					    B6: AGE 60 + sealed envelopes
					    ============================================================ */}
					{frame >= B6_START - 5 ? (
						<>
							{/* AGE 60 chips next to each figure */}
							<div
								style={{
									position: 'absolute',
									left: LEFT_CX - 90,
									top: FIG_CY - 230,
									width: 180,
									textAlign: 'center',
									opacity: age60Opacity,
									transform: `scale(${age60Scale})`,
								}}
							>
								<span
									style={{
										display: 'inline-block',
										padding: '8px 18px',
										border: `2px solid ${theme.teal}`,
										borderRadius: 999,
										fontSize: 18,
										fontWeight: theme.weightMedium,
										letterSpacing: 4,
										color: theme.teal,
										background: theme.bg,
									}}
								>
									AGE 60
								</span>
							</div>
							<div
								style={{
									position: 'absolute',
									left: RIGHT_CX - 90,
									top: FIG_CY - 230,
									width: 180,
									textAlign: 'center',
									opacity: age60Opacity,
									transform: `scale(${age60Scale})`,
								}}
							>
								<span
									style={{
										display: 'inline-block',
										padding: '8px 18px',
										border: `2px solid ${theme.amber}`,
										borderRadius: 999,
										fontSize: 18,
										fontWeight: theme.weightMedium,
										letterSpacing: 4,
										color: theme.amber,
										background: theme.bg,
									}}
								>
									AGE 60
								</span>
							</div>

							{/* Sealed envelopes */}
							<GlowDisc
								cx={LEFT_CX}
								cy={950}
								size={420}
								color={theme.teal}
								opacity={antPulse * 0.5}
							/>
							<GlowDisc
								cx={RIGHT_CX}
								cy={950}
								size={420}
								color={theme.amber}
								opacity={antPulse * 0.5}
							/>

							{/* Marcus envelope (sealed) */}
							<div
								style={{
									position: 'absolute',
									left: LEFT_CX - 160,
									top: 900 + envY,
									width: 320,
									height: 180,
									opacity: envOpacity,
									transform: `scale(${envScale})`,
								}}
							>
								<div
									style={{
										position: 'absolute',
										inset: 0,
										border: `4px solid ${theme.teal}`,
										borderRadius: 10,
										background: theme.bg,
									}}
								/>
								<svg
									viewBox="0 0 320 180"
									width={320}
									height={180}
									style={{position: 'absolute', inset: 0}}
								>
									<polyline
										points="0,0 160,110 320,0"
										fill="none"
										stroke={theme.teal}
										strokeWidth={4}
									/>
								</svg>
								<div
									style={{
										position: 'absolute',
										left: 0,
										right: 0,
										top: 88,
										textAlign: 'center',
										fontSize: 64,
										fontWeight: theme.weightMedium,
										color: theme.teal,
										lineHeight: 1,
									}}
								>
									?
								</div>
								{/* Wax seal */}
								<div
									style={{
										position: 'absolute',
										left: 320 / 2 - 22,
										top: 116,
										width: 44,
										height: 44,
										borderRadius: '50%',
										background: theme.gold,
										border: `3px solid ${theme.amber}`,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										fontSize: 18,
										fontWeight: theme.weightMedium,
										color: theme.ink,
									}}
								>
									M
								</div>
							</div>

							{/* David envelope (sealed) */}
							<div
								style={{
									position: 'absolute',
									left: RIGHT_CX - 160,
									top: 900 + envY,
									width: 320,
									height: 180,
									opacity: envOpacity,
									transform: `scale(${envScale})`,
								}}
							>
								<div
									style={{
										position: 'absolute',
										inset: 0,
										border: `4px solid ${theme.amber}`,
										borderRadius: 10,
										background: theme.bg,
									}}
								/>
								<svg
									viewBox="0 0 320 180"
									width={320}
									height={180}
									style={{position: 'absolute', inset: 0}}
								>
									<polyline
										points="0,0 160,110 320,0"
										fill="none"
										stroke={theme.amber}
										strokeWidth={4}
									/>
								</svg>
								<div
									style={{
										position: 'absolute',
										left: 0,
										right: 0,
										top: 88,
										textAlign: 'center',
										fontSize: 64,
										fontWeight: theme.weightMedium,
										color: theme.amber,
										lineHeight: 1,
									}}
								>
									?
								</div>
								<div
									style={{
										position: 'absolute',
										left: 320 / 2 - 22,
										top: 116,
										width: 44,
										height: 44,
										borderRadius: '50%',
										background: theme.gold,
										border: `3px solid ${theme.amber}`,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										fontSize: 18,
										fontWeight: theme.weightMedium,
										color: theme.ink,
									}}
								>
									D
								</div>
							</div>

							{/* "Time to open the accounts." caption */}
							<div
								style={{
									position: 'absolute',
									left: 0,
									right: 0,
									top: 720,
									textAlign: 'center',
									fontSize: 28,
									color: theme.ink,
									fontStyle: 'italic',
									opacity: interpolate(
										frame,
										[B6_START + 140, B6_START + 200],
										[0, 0.9],
										clamp,
									),
									fontWeight: theme.weightMedium,
								}}
							>
								time to open the accounts…
							</div>
						</>
					) : null}
				</>
			) : null}

			<Vignette
				intensity={
					0.08 +
					0.06 * interpolate(frame, [B6_START, B6_END], [0, 1], clamp)
				}
			/>
		</AbsoluteFill>
	);
};

export default S26_DavidDoublesGrinds;
