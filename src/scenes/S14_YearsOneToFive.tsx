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

const FIG_CY = 480;
const FIG_W = 220;

const clamp = {
	extrapolateLeft: 'clamp' as const,
	extrapolateRight: 'clamp' as const,
};

// Beat anchors.
const B1_END = 230;
const B2_START = 230;
const B2_END = 650;
const B3_START = 650;
const B3_END = 905;
const B4_START = 905;
const B4_END = 1235;
const B5_START = 1235;
const B5_END = 1865;
const B6_START = 1865;
const B6_END = 2195;
const B7_START = 2195;
const B7_END = 2400;

const Vignette: React.FC<{intensity: number}> = ({intensity}) => (
	<AbsoluteFill
		style={{
			background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,0,0,${
				0.08 + 0.1 * intensity
			}) 100%)`,
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

const CountUp: React.FC<{value: number; color: string; size: number}> = ({
	value,
	color,
	size,
}) => {
	const rounded = Math.max(0, Math.round(value / 50) * 50);
	const formatted = '$' + rounded.toLocaleString('en-US');
	return (
		<span
			style={{
				fontSize: size,
				fontWeight: theme.weightMedium,
				color,
				fontVariantNumeric: 'tabular-nums',
				letterSpacing: 1,
			}}
		>
			{formatted}
		</span>
	);
};

const FallingCoin: React.FC<{
	cx: number;
	startY: number;
	endY: number;
	frame: number;
	startFrame: number;
	fps: number;
}> = ({cx, startY, endY, frame, startFrame, fps}) => {
	const local = frame - startFrame;
	if (local < 0 || local > 50) return null;
	const fall = spring({
		frame: local,
		fps,
		config: {damping: 16, mass: 0.9, stiffness: 130},
	});
	const y = interpolate(fall, [0, 1], [startY, endY], clamp);
	const opacity = interpolate(local, [0, 4, 30, 40], [0, 1, 1, 0], clamp);
	return (
		<div
			style={{
				position: 'absolute',
				left: cx - 24,
				top: y,
				width: 48,
				height: 16,
				borderRadius: '50%',
				background: theme.gold,
				opacity,
				boxShadow: `0 0 0 2px ${theme.amber} inset`,
			}}
		/>
	);
};

// Lifestyle icons for B4.
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

const PhoneIcon: React.FC<{size: number; color: string}> = ({size, color}) => (
	<svg width={size} height={size} viewBox="0 0 64 64">
		<rect x={20} y={6} width={24} height={52} rx={5} fill={color} />
		<rect x={24} y={12} width={16} height={32} fill={theme.bg} />
		<circle cx={32} cy={52} r={2.5} fill={theme.bg} />
	</svg>
);

const PlaneIcon: React.FC<{size: number; color: string}> = ({size, color}) => (
	<svg width={size} height={size} viewBox="0 0 64 64">
		<path
			d="M 6 36 L 28 28 L 36 10 L 42 12 L 38 30 L 56 26 L 58 32 L 40 38 L 36 54 L 30 52 L 30 40 L 8 44 Z"
			fill={color}
		/>
	</svg>
);

const BellIcon: React.FC<{size: number; color: string}> = ({size, color}) => (
	<svg width={size} height={size} viewBox="0 0 64 64">
		<path
			d="M 32 8 Q 16 8 16 28 L 14 44 L 50 44 L 48 28 Q 48 8 32 8 Z"
			fill={color}
		/>
		<circle cx={32} cy={52} r={4} fill={color} />
	</svg>
);

const Sparkle: React.FC<{cx: number; cy: number; opacity: number; color: string}> = ({
	cx,
	cy,
	opacity,
	color,
}) => (
	<svg
		width={32}
		height={32}
		viewBox="0 0 32 32"
		style={{position: 'absolute', left: cx - 16, top: cy - 16, opacity}}
	>
		<path
			d="M 16 2 L 18 14 L 30 16 L 18 18 L 16 30 L 14 18 L 2 16 L 14 14 Z"
			fill={color}
		/>
	</svg>
);

export const S14_YearsOneToFive: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	// -------- Year ticker (1 -> 5 across the scene) --------
	// Year 1 stays during B1 (calm). Years advance 1→3 across B2.
	// Continue 3→5 across B3..B7.
	const yearTickerOpacity = interpolate(frame, [30, 90], [0, 1], clamp);
	const yearF = interpolate(
		frame,
		[B1_END, B2_END, B5_END, B7_END],
		[1, 3, 4.5, 5],
		clamp,
	);
	const yearDisplay = Math.max(1, Math.min(5, Math.floor(yearF + 0.001)));

	// -------- Marcus account (slow build to ~$20k) --------
	// Smooth ease across B2; gentle continued creep through B3..B7 (but doesn't exceed ~$24k).
	const marcusValue = interpolate(
		frame,
		[B2_START, B2_START + 140, B2_END, B5_END, B7_END],
		[0, 6000, 20000, 22500, 24000],
		clamp,
	);
	// Jar fill stays modest (this scene = "nothing dramatic").
	const marcusJarFill = interpolate(
		frame,
		[B2_START, B2_END, B7_END],
		[0, 0.32, 0.42],
		clamp,
	);
	// Growth bar — short, nearly flat.
	const marcusBarH = interpolate(
		frame,
		[B2_START, B2_END, B7_END],
		[0, 90, 110],
		clamp,
	);

	// Marcus's side opacity: dims slightly in B3 (doubt), bright otherwise; cools a touch in B6/B7.
	const marcusOpacity = interpolate(
		frame,
		[B3_START, B3_START + 30, B3_END, B3_END + 30, B6_START, B6_END, B7_END],
		[1, 0.7, 0.7, 0.95, 0.95, 0.85, 0.8],
		clamp,
	);

	// Marcus monthly coin drops (12/yr * ~3yr = ~36; we drop 18 spread coins to imply "monthly").
	const MARCUS_COIN_START_Y = 600;
	const MARCUS_JAR_CY = 820;
	const MARCUS_JAR_H = 260;
	const MARCUS_COIN_END_Y = MARCUS_JAR_CY - MARCUS_JAR_H / 2 + 30;
	const marcusCoinStarts: number[] = [];
	for (let i = 0; i < 18; i++) {
		marcusCoinStarts.push(B2_START + 20 + i * 22);
	}

	// -------- B3 thought bubble --------
	const bubbleSpring = spring({
		frame: frame - (B3_START + 20),
		fps,
		config: {damping: 13, stiffness: 140},
	});
	const bubbleScale = interpolate(bubbleSpring, [0, 1], [0.6, 1], clamp);
	const bubbleOpacity = interpolate(
		frame,
		[B3_START + 20, B3_START + 60, B3_END - 30, B3_END],
		[0, 1, 1, 0],
		clamp,
	);

	// -------- B4 lifestyle icons (David) --------
	// Staggered ~70 frames apart starting at B4_START + 20.
	const lifestyleStarts = [
		B4_START + 20,
		B4_START + 90,
		B4_START + 160,
		B4_START + 230,
	];

	// David side overall brightness/energy.
	const davidBright = interpolate(
		frame,
		[B4_START, B4_START + 40, B5_END, B6_START + 40],
		[0.65, 1, 1, 0.85],
		clamp,
	);

	// -------- B5 crowd grid --------
	// 3 rows x 6 cols of small David figures fade in row-by-row.
	const CROWD_ROW_STARTS = [B5_START + 20, B5_START + 120, B5_START + 220];
	const crowdFadeOut = interpolate(
		frame,
		[B6_START + 60, B6_START + 180],
		[1, 0],
		clamp,
	);

	// -------- B6 alarm bell --------
	const bellOpacity = interpolate(
		frame,
		[B6_START + 20, B6_START + 60, B7_START - 20, B7_START + 30],
		[0, 1, 1, 0.5],
		clamp,
	);
	const bellMuteStrike = interpolate(
		frame,
		[B6_START + 70, B6_START + 110],
		[0, 1],
		clamp,
	);

	// -------- B6/B7 vignette cooling --------
	const vignetteIntensity = interpolate(
		frame,
		[B6_START, B6_END, B7_END],
		[0, 0.4, 0.7],
		clamp,
	);

	// -------- B7 red cost bar (hidden cost) --------
	const costBarH = interpolate(
		frame,
		[B7_START + 10, B7_END - 15],
		[0, 520],
		clamp,
	);
	const costBarOpacity = interpolate(
		frame,
		[B7_START + 10, B7_START + 60, B7_END - 15, B7_END],
		[0, 0.25, 0.25, 0.25],
		clamp,
	);
	const costLabelOpacity = interpolate(
		frame,
		[B7_START + 60, B7_START + 110],
		[0, 0.55],
		clamp,
	);

	return (
		<AbsoluteFill
			style={{
				background: theme.bg,
				fontFamily: theme.font,
				color: theme.ink,
				overflow: 'hidden',
			}}
		>
			{/* -------- Year ticker (top center) -------- */}
			<div
				style={{
					position: 'absolute',
					left: CENTER_CX - 200,
					top: 60,
					width: 400,
					textAlign: 'center',
					opacity: yearTickerOpacity,
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
					YEAR
				</div>
				<div
					style={{
						fontSize: 96,
						lineHeight: 1,
						fontWeight: theme.weightMedium,
						color: theme.ink,
						marginTop: 4,
						fontVariantNumeric: 'tabular-nums',
					}}
				>
					{yearDisplay}
				</div>
				{/* Five small dots, the current one colored. */}
				<div
					style={{
						display: 'flex',
						justifyContent: 'center',
						gap: 14,
						marginTop: 12,
					}}
				>
					{[1, 2, 3, 4, 5].map((y) => (
						<div
							key={y}
							style={{
								width: 10,
								height: 10,
								borderRadius: '50%',
								background: y <= yearDisplay ? theme.gold : theme.ink,
								opacity: y <= yearDisplay ? 1 : 0.2,
							}}
						/>
					))}
				</div>
			</div>

			{/* -------- MARCUS SIDE (left) -------- */}
			<div style={{position: 'absolute', inset: 0, opacity: marcusOpacity}}>
				<Figure cx={LEFT_CX} cy={FIG_CY} width={FIG_W} color={theme.teal} />
				{/* Name label */}
				<div
					style={{
						position: 'absolute',
						left: LEFT_CX - 200,
						top: FIG_CY - FIG_W * 0.7,
						width: 400,
						textAlign: 'center',
						fontSize: 28,
						fontWeight: theme.weightMedium,
						color: theme.teal,
						letterSpacing: 3,
					}}
				>
					MARCUS
				</div>

				{/* Index Fund jar */}
				<Jar
					cx={LEFT_CX - 90}
					cy={MARCUS_JAR_CY}
					width={180}
					height={MARCUS_JAR_H}
					accent={theme.teal}
					fillPct={marcusJarFill}
					fillColor={theme.gold}
					label="INDEX FUND"
				/>

				{/* Coin drops */}
				{marcusCoinStarts.map((s, i) => (
					<FallingCoin
						key={`mc-${i}`}
						cx={LEFT_CX - 90}
						startY={MARCUS_COIN_START_Y}
						endY={MARCUS_COIN_END_Y}
						frame={frame}
						startFrame={s}
						fps={fps}
					/>
				))}

				{/* Counter */}
				<div
					style={{
						position: 'absolute',
						left: LEFT_CX - 200,
						top: 740,
						width: 400,
						textAlign: 'center',
					}}
				>
					<div
						style={{
							fontSize: 14,
							letterSpacing: 3,
							color: theme.ink,
							opacity: 0.5,
							fontWeight: theme.weightMedium,
							marginBottom: 4,
						}}
					>
						BALANCE
					</div>
					<CountUp value={marcusValue} color={theme.ink} size={44} />
				</div>

				{/* Growth bar (vertical, short) */}
				<div
					style={{
						position: 'absolute',
						left: LEFT_CX + 60,
						top: MARCUS_JAR_CY + MARCUS_JAR_H / 2 - marcusBarH,
						width: 28,
						height: marcusBarH,
						background: theme.teal,
						borderRadius: 4,
						opacity: 0.85,
					}}
				/>
				<div
					style={{
						position: 'absolute',
						left: LEFT_CX + 50,
						top: MARCUS_JAR_CY + MARCUS_JAR_H / 2 + 6,
						width: 48,
						textAlign: 'center',
						fontSize: 11,
						letterSpacing: 1,
						color: theme.ink,
						opacity: 0.4,
					}}
				>
					GROWTH
				</div>
			</div>

			{/* -------- B3: Thought bubble over Marcus -------- */}
			{frame >= B3_START && frame <= B3_END + 5 ? (
				<div
					style={{
						position: 'absolute',
						left: LEFT_CX - 200,
						top: 280,
						width: 400,
						opacity: bubbleOpacity,
						transform: `scale(${bubbleScale})`,
						transformOrigin: 'center bottom',
					}}
				>
					<div
						style={{
							borderRadius: 28,
							border: `3px solid ${theme.teal}`,
							background: theme.bg,
							padding: '18px 22px',
							textAlign: 'center',
							fontSize: 24,
							fontStyle: 'italic',
							fontWeight: theme.weightMedium,
							color: theme.ink,
							lineHeight: 1.3,
						}}
					>
						"Is this even worth it?"
					</div>
					{/* tail */}
					<div
						style={{
							margin: '0 auto',
							marginTop: -2,
							width: 0,
							height: 0,
							borderLeft: '14px solid transparent',
							borderRight: '14px solid transparent',
							borderTop: `18px solid ${theme.teal}`,
						}}
					/>
					{/* tail inner */}
					<div
						style={{
							margin: '0 auto',
							marginTop: -24,
							marginLeft: 'calc(50% - 10px)',
							width: 0,
							height: 0,
							borderLeft: '10px solid transparent',
							borderRight: '10px solid transparent',
							borderTop: `13px solid ${theme.bg}`,
						}}
					/>
				</div>
			) : null}

			{/* -------- DAVID SIDE (right) -------- */}
			<div style={{position: 'absolute', inset: 0, opacity: davidBright}}>
				<Figure cx={RIGHT_CX} cy={FIG_CY} width={FIG_W} color={theme.amber} />
				<div
					style={{
						position: 'absolute',
						left: RIGHT_CX - 200,
						top: FIG_CY - FIG_W * 0.7,
						width: 400,
						textAlign: 'center',
						fontSize: 28,
						fontWeight: theme.weightMedium,
						color: theme.amber,
						letterSpacing: 3,
					}}
				>
					DAVID
				</div>

				{/* Empty amber jar (callback to LATER) */}
				<Jar
					cx={RIGHT_CX - 90}
					cy={MARCUS_JAR_CY}
					width={180}
					height={MARCUS_JAR_H}
					accent={theme.amber}
					fillPct={0}
					fillColor={theme.amber}
					label="SAVINGS"
				/>
			</div>

			{/* -------- B4: David lifestyle icons -------- */}
			{[
				{Icon: CarIcon, label: 'NICER CAR'},
				{Icon: PlateIcon, label: 'DINNERS OUT'},
				{Icon: PhoneIcon, label: 'NEW PHONE'},
				{Icon: PlaneIcon, label: 'WEEKEND TRIP'},
			].map((it, i) => {
				const s = lifestyleStarts[i];
				const local = frame - s;
				if (local < -10 || frame > B5_END + 30) return null;
				const sp = spring({
					frame: local,
					fps,
					config: {damping: 12, stiffness: 150},
				});
				const sc = interpolate(sp, [0, 1], [0.4, 1], clamp);
				const op = interpolate(
					frame,
					[s, s + 20, B5_START + 200, B5_START + 280],
					[0, 1, 1, 0],
					clamp,
				);
				const cols = i % 2;
				const rows = Math.floor(i / 2);
				const x = RIGHT_CX + 60 + cols * 130;
				const y = 660 + rows * 130;
				const sparkOp = interpolate(local, [10, 30, 50], [0, 1, 0], clamp);
				return (
					<React.Fragment key={it.label}>
						<div
							style={{
								position: 'absolute',
								left: x - 50,
								top: y,
								width: 100,
								textAlign: 'center',
								opacity: op,
								transform: `scale(${sc})`,
							}}
						>
							<it.Icon size={80} color={theme.amber} />
							<div
								style={{
									fontSize: 12,
									letterSpacing: 2,
									color: theme.ink,
									marginTop: 2,
									fontWeight: theme.weightMedium,
								}}
							>
								{it.label}
							</div>
						</div>
						<Sparkle cx={x + 40} cy={y - 6} opacity={sparkOp} color={theme.gold} />
					</React.Fragment>
				);
			})}

			{/* -------- B5: Crowd grid of David clones -------- */}
			{frame >= B5_START - 5 ? (
				<div
					style={{
						position: 'absolute',
						left: 1000,
						top: 240,
						width: 880,
						height: 600,
						opacity: crowdFadeOut,
					}}
				>
					{[0, 1, 2].map((row) => {
						const rowStart = CROWD_ROW_STARTS[row];
						const rowOpacity = interpolate(
							frame,
							[rowStart, rowStart + 40],
							[0, 1],
							clamp,
						);
						return (
							<div
								key={row}
								style={{
									position: 'absolute',
									left: 0,
									top: row * 200,
									width: 880,
									height: 180,
									display: 'flex',
									justifyContent: 'space-between',
									opacity: rowOpacity,
								}}
							>
								{[0, 1, 2, 3, 4, 5].map((col) => (
									<div key={col} style={{position: 'relative', width: 120, height: 180}}>
										<Figure
											cx={60}
											cy={90}
											width={90}
											color={theme.amber}
											opacity={0.7}
										/>
									</div>
								))}
							</div>
						);
					})}
				</div>
			) : null}

			{/* -------- B6: Muted alarm bell -------- */}
			{frame >= B6_START - 5 ? (
				<div
					style={{
						position: 'absolute',
						left: CENTER_CX - 60,
						top: 240,
						width: 120,
						height: 120,
						opacity: bellOpacity,
					}}
				>
					<BellIcon size={120} color={theme.ink} />
					{/* mute strike */}
					<div
						style={{
							position: 'absolute',
							left: 10,
							right: 10,
							top: 60,
							height: 4,
							background: theme.red,
							borderRadius: 2,
							transform: `scaleX(${bellMuteStrike}) rotate(-15deg)`,
							transformOrigin: 'left center',
						}}
					/>
					<div
						style={{
							position: 'absolute',
							left: 0,
							right: 0,
							bottom: -28,
							textAlign: 'center',
							fontSize: 13,
							letterSpacing: 3,
							color: theme.ink,
							opacity: 0.5,
							fontWeight: theme.weightMedium,
						}}
					>
						NO ALARM
					</div>
				</div>
			) : null}

			{/* -------- B7: Hidden red cost bar BEHIND David -------- */}
			{frame >= B7_START - 5 ? (
				<>
					<div
						style={{
							position: 'absolute',
							left: RIGHT_CX - 14,
							top: 900 - costBarH,
							width: 28,
							height: costBarH,
							background: theme.red,
							opacity: costBarOpacity,
							borderRadius: 4,
							zIndex: -1,
						}}
					/>
					<div
						style={{
							position: 'absolute',
							left: RIGHT_CX - 200,
							top: 880 - costBarH - 30,
							width: 400,
							textAlign: 'center',
							fontSize: 14,
							letterSpacing: 3,
							color: theme.red,
							opacity: costLabelOpacity,
							fontStyle: 'italic',
							fontWeight: theme.weightMedium,
						}}
					>
						the cost of waiting
					</div>
				</>
			) : null}

			<Vignette intensity={vignetteIntensity} />
		</AbsoluteFill>
	);
};

export default S14_YearsOneToFive;
