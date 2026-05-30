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

// Lock these to match S07.
const LEFT_CX = 480;
const RIGHT_CX = 1440;
const CENTER_CX = 960;

// Figure baseline (head+shoulders centered around here).
const FIG_CY = 480;
const FIG_W = 260;

const clamp = {
	extrapolateLeft: 'clamp' as const,
	extrapolateRight: 'clamp' as const,
};

// Beat anchors (component-local frames @30fps).
const B1_START = 0;
const B1_END = 80;
const B2_START = 80;
const B2_END = 430;
const B3_START = 430;
const B3_END = 730;
const B4_START = 730;
const B4_END = 990;
const B5_START = 990;
const B5_END = 1530;
const B6_START = 1530;
const B6_END = 1850;
const B7_START = 1850;
const B7_END = 2160;

const Vignette: React.FC = () => (
	<AbsoluteFill
		style={{
			background:
				'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.08) 100%)',
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

// Small mirrored icons used in B3.
const BuildingIcon: React.FC<{size: number; color: string}> = ({size, color}) => (
	<svg width={size} height={size} viewBox="0 0 64 64">
		<rect x={14} y={10} width={36} height={50} fill={color} rx={2} />
		<rect x={20} y={18} width={6} height={6} fill={theme.bg} />
		<rect x={29} y={18} width={6} height={6} fill={theme.bg} />
		<rect x={38} y={18} width={6} height={6} fill={theme.bg} />
		<rect x={20} y={28} width={6} height={6} fill={theme.bg} />
		<rect x={29} y={28} width={6} height={6} fill={theme.bg} />
		<rect x={38} y={28} width={6} height={6} fill={theme.bg} />
		<rect x={20} y={38} width={6} height={6} fill={theme.bg} />
		<rect x={29} y={38} width={6} height={6} fill={theme.bg} />
		<rect x={38} y={38} width={6} height={6} fill={theme.bg} />
		<rect x={28} y={48} width={8} height={12} fill={theme.bg} />
	</svg>
);

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

const ClockZ: React.FC<{size: number; color: string}> = ({size, color}) => (
	<svg width={size} height={size} viewBox="0 0 64 64">
		<circle cx={26} cy={36} r={18} fill="none" stroke={color} strokeWidth={3} />
		<line x1={26} y1={36} x2={26} y2={24} stroke={color} strokeWidth={3} strokeLinecap="round" />
		<line x1={26} y1={36} x2={34} y2={40} stroke={color} strokeWidth={3} strokeLinecap="round" />
		<text x={44} y={20} fill={color} fontSize={12} fontWeight={500}>
			z
		</text>
		<text x={50} y={14} fill={color} fontSize={9} fontWeight={500}>
			z
		</text>
	</svg>
);

// Jar / basket used by B5 (Marcus, filling) and B6 (David, empty).
const Jar: React.FC<{
	cx: number;
	cy: number;
	width: number;
	height: number;
	accent: string;
	fillPct: number; // 0..1
	fillColor: string;
	label: string;
	opacity?: number;
}> = ({cx, cy, width, height, accent, fillPct, fillColor, label, opacity = 1}) => {
	const left = cx - width / 2;
	const top = cy - height / 2;
	const fillH = (height - 18) * Math.max(0, Math.min(1, fillPct));
	return (
		<div
			style={{
				position: 'absolute',
				left,
				top,
				width,
				height,
				opacity,
			}}
		>
			{/* Jar body */}
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
				{/* Fill */}
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
			{/* Lip */}
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
			{/* Label */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					bottom: -38,
					textAlign: 'center',
					fontSize: 22,
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

// A falling gold coin animation used by Marcus.
const FallingCoin: React.FC<{
	cx: number;
	startY: number;
	endY: number;
	frame: number;
	startFrame: number;
	fps: number;
}> = ({cx, startY, endY, frame, startFrame, fps}) => {
	const local = frame - startFrame;
	if (local < 0) return null;
	const fall = spring({
		frame: local,
		fps,
		config: {damping: 16, mass: 0.9, stiffness: 130},
	});
	const y = interpolate(fall, [0, 1], [startY, endY], clamp);
	// After it lands, fade out (it joins the jar fill instead).
	const opacity = interpolate(local, [0, 4, 30, 36], [0, 1, 1, 0], clamp);
	return (
		<div
			style={{
				position: 'absolute',
				left: cx - 30,
				top: y,
				width: 60,
				height: 22,
				borderRadius: '50%',
				background: theme.gold,
				opacity,
				boxShadow: `0 0 0 2px ${theme.amber} inset`,
			}}
		/>
	);
};

// "$500" label that floats above Marcus before each drop.
const MoneyTag: React.FC<{
	cx: number;
	y: number;
	frame: number;
	startFrame: number;
}> = ({cx, y, frame, startFrame}) => {
	const local = frame - startFrame;
	const opacity = interpolate(local, [-10, 0, 20, 30], [0, 1, 1, 0], clamp);
	return (
		<div
			style={{
				position: 'absolute',
				left: cx - 80,
				top: y,
				width: 160,
				textAlign: 'center',
				fontSize: 38,
				fontWeight: theme.weightMedium,
				color: theme.gold,
				opacity,
				letterSpacing: 1,
			}}
		>
			$500
		</div>
	);
};

// "Bad option" chip with a red strike-through that draws across.
const StrikeChip: React.FC<{
	cx: number;
	cy: number;
	label: string;
	frame: number;
	startFrame: number;
	opacity: number;
}> = ({cx, cy, label, frame, startFrame, opacity}) => {
	const local = frame - startFrame;
	const appear = interpolate(local, [0, 12], [0, 1], clamp);
	const strike = interpolate(local, [14, 30], [0, 1], clamp);
	const width = 220;
	const height = 56;
	return (
		<div
			style={{
				position: 'absolute',
				left: cx - width / 2,
				top: cy - height / 2,
				width,
				height,
				opacity: opacity * appear,
				borderRadius: 28,
				border: `2px solid ${theme.ink}`,
				background: theme.bg,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				fontSize: 22,
				fontWeight: theme.weightMedium,
				color: theme.ink,
				letterSpacing: 1,
			}}
		>
			{label}
			<div
				style={{
					position: 'absolute',
					left: 16,
					right: 16,
					top: '50%',
					height: 4,
					background: theme.red,
					borderRadius: 2,
					transform: `scaleX(${strike})`,
					transformOrigin: 'left center',
				}}
			/>
		</div>
	);
};

export const S08_MeetTheTwo: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	// ---------- B1: figures recolor from gray to teal/amber, name labels drop in ----------
	const colorT = interpolate(frame, [0, 30], [0, 1], clamp);
	const marcusColor = interpolateColors(colorT, [0, 1], [theme.silhouette, theme.teal]);
	const davidColor = interpolateColors(colorT, [0, 1], [theme.silhouette, theme.amber]);

	const nameSpring = spring({
		frame: frame - 20,
		fps,
		config: {damping: 13, mass: 0.9, stiffness: 140},
	});
	const nameY = interpolate(nameSpring, [0, 1], [-40, 0], clamp);
	const nameOpacity = interpolate(frame, [20, 50], [0, 1], clamp);

	// ---------- B2: birthday badge + $60k tags ----------
	const badgeSpring = spring({
		frame: frame - B2_START,
		fps,
		config: {damping: 12, stiffness: 150},
	});
	const badgeScale = interpolate(badgeSpring, [0, 1], [0, 1], clamp);
	const badgeOpacity = interpolate(frame, [B2_START, B2_START + 20], [0, 1], clamp);

	const salaryOpacity = interpolate(
		frame,
		[B2_START + 80, B2_START + 130],
		[0, 1],
		clamp,
	);
	const salaryY = interpolate(
		spring({
			frame: frame - (B2_START + 80),
			fps,
			config: {damping: 14, stiffness: 130},
		}),
		[0, 1],
		[30, 0],
		clamp,
	);

	// Sparkle / arrow upbeat (frames ~ B2_START+160 onward).
	const sparkleOpacity = interpolate(
		frame,
		[B2_START + 180, B2_START + 220],
		[0, 1],
		clamp,
	);
	const sparkleBob = Math.sin((frame - (B2_START + 180)) / 10) * 6;

	// ---------- B3: mirrored icon pairs ----------
	const iconStarts = [B3_START + 20, B3_START + 70, B3_START + 120];
	const iconSprings = iconStarts.map((s) =>
		spring({frame: frame - s, fps, config: {damping: 13, stiffness: 150}}),
	);
	const iconOpacities = iconStarts.map((s) =>
		interpolate(frame, [s - 5, s + 20], [0, 1], clamp),
	);

	// ---------- B4: dim-and-spotlight "ONE DIFFERENCE" ----------
	const dim = interpolate(
		frame,
		[B4_START, B4_START + 30, B4_END - 40, B4_END],
		[1, 0.35, 0.35, 1],
		clamp,
	);
	const spotlightOpacity = interpolate(
		frame,
		[B4_START + 10, B4_START + 50, B4_END - 30, B4_END],
		[0, 1, 1, 0],
		clamp,
	);
	const oneDiffSpring = spring({
		frame: frame - (B4_START + 30),
		fps,
		config: {damping: 13, stiffness: 150},
	});
	const oneDiffScale = interpolate(oneDiffSpring, [0, 1], [0.85, 1], clamp);
	const oneDiffOpacity = interpolate(
		frame,
		[B4_START + 30, B4_START + 60, B4_END - 50, B4_END - 20],
		[0, 1, 1, 0],
		clamp,
	);

	// ---------- B5: Marcus focus, coins drop into jar, strike chips, market grid ----------
	const b5MarcusBright = interpolate(
		frame,
		[B5_START, B5_START + 30, B6_START - 20, B6_START],
		[1, 1, 1, 0.4],
		clamp,
	);
	const b5DavidDim = interpolate(
		frame,
		[B5_START, B5_START + 30],
		[1, 0.35],
		clamp,
	);

	// Four coin drops, staggered ~40 frames.
	const COIN_STARTS = [B5_START + 30, B5_START + 70, B5_START + 110, B5_START + 150];
	const JAR_CY = 820;
	const JAR_H = 260;
	const JAR_TOP = JAR_CY - JAR_H / 2;
	const COIN_START_Y = 580;
	const COIN_END_Y = JAR_TOP + 30;

	// Jar fill: 0 -> 0.55 over the coin drops.
	const marcusFill = interpolate(
		frame,
		[B5_START + 30, B5_START + 200],
		[0, 0.55],
		clamp,
	);

	// Strike chips: "MAGIC STOCK", "CRYPTO", "TRENDING"
	const CHIP_START = B5_START + 230;
	const chipStarts = [CHIP_START, CHIP_START + 35, CHIP_START + 70];
	const chipFade = interpolate(
		frame,
		[CHIP_START, CHIP_START + 15, B5_START + 430, B5_START + 470],
		[0, 1, 1, 0],
		clamp,
	);

	// Market grid (6x6) appears with the "little piece of the entire market" beat.
	const GRID_START = B5_START + 400;
	const gridOpacity = interpolate(
		frame,
		[GRID_START, GRID_START + 40, B5_END - 20, B5_END],
		[0, 0.9, 0.9, 0.6],
		clamp,
	);
	const tealSliceOpacity = interpolate(
		frame,
		[GRID_START + 25, GRID_START + 60],
		[0, 1],
		clamp,
	);

	// ---------- B6: David focus, LATER stamp slams onto empty amber jar ----------
	const b6DavidBright = interpolate(
		frame,
		[B6_START, B6_START + 30],
		[0.35, 1],
		clamp,
	);
	const b6MarcusDim = interpolate(
		frame,
		[B6_START, B6_START + 30, B7_START - 20, B7_START],
		[1, 0.55, 0.55, 1],
		clamp,
	);

	const stampLocal = frame - (B6_START + 40);
	const stampSpring = spring({
		frame: stampLocal,
		fps,
		config: {damping: 12, stiffness: 160},
	});
	const stampScale = interpolate(stampSpring, [0, 1], [1.4, 1], clamp);
	const stampRot = interpolate(stampSpring, [0, 1], [-12, -6], clamp);
	const stampOpacity = interpolate(stampLocal, [0, 6], [0, 1], clamp);

	const clockOpacity = interpolate(
		frame,
		[B6_START + 80, B6_START + 120],
		[0, 1],
		clamp,
	);

	const EXCUSE_START = B6_START + 130;
	const excuseStarts = [EXCUSE_START, EXCUSE_START + 35, EXCUSE_START + 70];
	const excuseFade = (s: number) =>
		interpolate(frame, [s, s + 25, B7_START - 20, B7_START], [0, 0.7, 0.7, 0.4], clamp);

	// ---------- B7: both bright, $500/month lock ----------
	const both500Spring = spring({
		frame: frame - B7_START,
		fps,
		config: {damping: 12, stiffness: 140},
	});
	const big500Scale = interpolate(both500Spring, [0, 1], [0.3, 1], clamp);
	const big500Opacity = interpolate(frame, [B7_START, B7_START + 25], [0, 1], clamp);
	// Tiny 2px settle-shake right at the end of the spring.
	const shakeT = frame - (B7_START + 30);
	const shake =
		shakeT > 0 && shakeT < 18
			? Math.sin(shakeT / 1.2) * Math.max(0, 2 - shakeT / 9)
			: 0;
	// Anticipatory pulse glow behind $500 in the last ~40 frames.
	const pulseGlow =
		interpolate(frame, [B7_END - 60, B7_END - 20], [0, 0.55], clamp) *
		(0.7 + 0.3 * Math.sin((frame - (B7_END - 60)) / 6));

	// B7 final hold: freeze all motion in the last ~15 frames (no new motion).
	// (We don't add anything new in this window — pulseGlow keeps repeating but
	// won't introduce new elements; everything else has already locked.)

	// ---------- Side dim multipliers (combine B5, B6 and B4 dims) ----------
	const marcusSideOpacity = Math.min(
		dim,
		Math.min(b5MarcusBright, b6MarcusDim),
	);
	const davidSideOpacity = Math.min(dim, Math.min(b5DavidDim, b6DavidBright));

	// =========================================================================

	const NAME_FONT = 36;

	return (
		<AbsoluteFill
			style={{
				background: theme.bg,
				fontFamily: theme.font,
				color: theme.ink,
				overflow: 'hidden',
			}}
		>
			{/* -------- MARCUS SIDE (left) -------- */}
			<div style={{position: 'absolute', inset: 0, opacity: marcusSideOpacity}}>
				<Figure cx={LEFT_CX} cy={FIG_CY} width={FIG_W} color={marcusColor} />
				{/* Name */}
				<div
					style={{
						position: 'absolute',
						left: LEFT_CX - 200,
						top: FIG_CY - FIG_W * 0.6 - 70 + nameY,
						width: 400,
						textAlign: 'center',
						fontSize: NAME_FONT,
						fontWeight: theme.weightMedium,
						color: theme.teal,
						opacity: nameOpacity,
						letterSpacing: 3,
					}}
				>
					MARCUS
				</div>
				{/* Salary tag */}
				<div
					style={{
						position: 'absolute',
						left: LEFT_CX - 160,
						top: FIG_CY + FIG_W * 0.7 + salaryY,
						width: 320,
						textAlign: 'center',
						fontSize: 30,
						fontWeight: theme.weightRegular,
						color: theme.ink,
						opacity: salaryOpacity,
					}}
				>
					$60,000 / yr
				</div>
				{/* Sparkle/arrow */}
				<div
					style={{
						position: 'absolute',
						left: LEFT_CX + 130,
						top: FIG_CY - 180 + sparkleBob,
						fontSize: 40,
						color: theme.gold,
						opacity: sparkleOpacity,
					}}
				>
					↑
				</div>
			</div>

			{/* -------- DAVID SIDE (right) -------- */}
			<div style={{position: 'absolute', inset: 0, opacity: davidSideOpacity}}>
				<Figure cx={RIGHT_CX} cy={FIG_CY} width={FIG_W} color={davidColor} />
				{/* Name */}
				<div
					style={{
						position: 'absolute',
						left: RIGHT_CX - 200,
						top: FIG_CY - FIG_W * 0.6 - 70 + nameY,
						width: 400,
						textAlign: 'center',
						fontSize: NAME_FONT,
						fontWeight: theme.weightMedium,
						color: theme.amber,
						opacity: nameOpacity,
						letterSpacing: 3,
					}}
				>
					DAVID
				</div>
				{/* Salary tag */}
				<div
					style={{
						position: 'absolute',
						left: RIGHT_CX - 160,
						top: FIG_CY + FIG_W * 0.7 + salaryY,
						width: 320,
						textAlign: 'center',
						fontSize: 30,
						fontWeight: theme.weightRegular,
						color: theme.ink,
						opacity: salaryOpacity,
					}}
				>
					$60,000 / yr
				</div>
				{/* Sparkle/arrow */}
				<div
					style={{
						position: 'absolute',
						left: RIGHT_CX - 170,
						top: FIG_CY - 180 + sparkleBob,
						fontSize: 40,
						color: theme.gold,
						opacity: sparkleOpacity,
					}}
				>
					↑
				</div>
			</div>

			{/* -------- B2: shared 30 birthday badge -------- */}
			<div
				style={{
					position: 'absolute',
					left: CENTER_CX - 90,
					top: 90,
					width: 180,
					height: 180,
					opacity: badgeOpacity * dim,
					transform: `scale(${badgeScale})`,
				}}
			>
				<div
					style={{
						position: 'absolute',
						inset: 0,
						borderRadius: '50%',
						border: `4px solid ${theme.gold}`,
						background: theme.bg,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontSize: 88,
						fontWeight: theme.weightMedium,
						color: theme.gold,
					}}
				>
					30
				</div>
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						bottom: -34,
						textAlign: 'center',
						fontSize: 18,
						letterSpacing: 3,
						color: theme.ink,
						fontWeight: theme.weightMedium,
					}}
				>
					BIRTHDAY
				</div>
			</div>

			{/* -------- B3: mirrored icon pairs -------- */}
			{[
				{Icon: BuildingIcon, label: 'APARTMENT'},
				{Icon: CarIcon, label: 'CAR'},
				{Icon: PlateIcon, label: 'FRI. DINNER'},
			].map((it, i) => {
				const op = iconOpacities[i] * dim;
				const sc = interpolate(iconSprings[i], [0, 1], [0.6, 1], clamp);
				const y = 760;
				const xOffset = (i - 1) * 180;
				const size = 90;
				return (
					<React.Fragment key={it.label}>
						{/* Left mirror */}
						<div
							style={{
								position: 'absolute',
								left: LEFT_CX + xOffset - size / 2,
								top: y,
								width: size,
								opacity: op,
								transform: `scale(${sc})`,
								textAlign: 'center',
							}}
						>
							<it.Icon size={size} color={theme.teal} />
							<div
								style={{
									fontSize: 13,
									letterSpacing: 2,
									color: theme.ink,
									marginTop: 4,
									fontWeight: theme.weightMedium,
								}}
							>
								{it.label}
							</div>
						</div>
						{/* Right mirror */}
						<div
							style={{
								position: 'absolute',
								left: RIGHT_CX + xOffset - size / 2,
								top: y,
								width: size,
								opacity: op,
								transform: `scale(${sc})`,
								textAlign: 'center',
							}}
						>
							<it.Icon size={size} color={theme.amber} />
							<div
								style={{
									fontSize: 13,
									letterSpacing: 2,
									color: theme.ink,
									marginTop: 4,
									fontWeight: theme.weightMedium,
								}}
							>
								{it.label}
							</div>
						</div>
					</React.Fragment>
				);
			})}

			{/* -------- B4: spotlight + "ONE DIFFERENCE" -------- */}
			<GlowDisc
				cx={CENTER_CX}
				cy={CANVAS_H / 2}
				size={1100}
				color={theme.gold}
				opacity={spotlightOpacity * 0.35}
			/>
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
						transform: `scale(${oneDiffScale})`,
						fontSize: 132,
						fontWeight: theme.weightMedium,
						color: theme.ink,
						opacity: oneDiffOpacity,
						letterSpacing: 8,
					}}
				>
					ONE DIFFERENCE
				</div>
			</div>

			{/* -------- B5: Marcus's INDEX FUND jar + falling coins -------- */}
			{frame >= B5_START - 5 && frame <= B6_START + 60 ? (
				<>
					<Jar
						cx={LEFT_CX}
						cy={JAR_CY}
						width={220}
						height={JAR_H}
						accent={theme.teal}
						fillPct={marcusFill}
						fillColor={theme.gold}
						label="INDEX FUND"
						opacity={interpolate(
							frame,
							[B5_START, B5_START + 25, B6_START + 40, B6_START + 60],
							[0, 1, 1, 0.4],
							clamp,
						)}
					/>
					{COIN_STARTS.map((s, i) => (
						<FallingCoin
							key={`mc-${i}`}
							cx={LEFT_CX}
							startY={COIN_START_Y}
							endY={COIN_END_Y}
							frame={frame}
							startFrame={s}
							fps={fps}
						/>
					))}
					{COIN_STARTS.map((s, i) => (
						<MoneyTag
							key={`mt-${i}`}
							cx={LEFT_CX}
							y={530}
							frame={frame}
							startFrame={s - 10}
						/>
					))}
				</>
			) : null}

			{/* -------- B5: NOT chips (MAGIC STOCK / CRYPTO / TRENDING) -------- */}
			{frame >= CHIP_START - 5 && frame <= B5_END ? (
				<>
					<StrikeChip
						cx={CENTER_CX}
						cy={300}
						label="MAGIC STOCK"
						frame={frame}
						startFrame={chipStarts[0]}
						opacity={chipFade}
					/>
					<StrikeChip
						cx={CENTER_CX}
						cy={360}
						label="CRYPTO"
						frame={frame}
						startFrame={chipStarts[1]}
						opacity={chipFade}
					/>
					<StrikeChip
						cx={CENTER_CX}
						cy={420}
						label="TRENDING"
						frame={frame}
						startFrame={chipStarts[2]}
						opacity={chipFade}
					/>
				</>
			) : null}

			{/* -------- B5: market grid behind the jar -------- */}
			{frame >= GRID_START - 5 ? (
				<div
					style={{
						position: 'absolute',
						left: LEFT_CX - 180,
						top: 600,
						width: 360,
						height: 360,
						opacity: gridOpacity,
						display: 'grid',
						gridTemplateColumns: 'repeat(6, 1fr)',
						gridTemplateRows: 'repeat(6, 1fr)',
						gap: 6,
						zIndex: -1,
					}}
				>
					{Array.from({length: 36}).map((_, i) => {
						const row = Math.floor(i / 6);
						const col = i % 6;
						// Teal cluster = a 2x2 block somewhere in the grid.
						const isCluster = row >= 2 && row <= 3 && col >= 2 && col <= 3;
						return (
							<div
								key={i}
								style={{
									background: isCluster ? theme.teal : theme.ink,
									opacity: isCluster ? tealSliceOpacity : 0.18,
									borderRadius: 4,
								}}
							/>
						);
					})}
				</div>
			) : null}

			{/* -------- B6: David's empty jar + LATER stamp + clock + excuses -------- */}
			{frame >= B6_START - 5 && frame <= B7_START + 30 ? (
				<>
					<Jar
						cx={RIGHT_CX}
						cy={JAR_CY}
						width={220}
						height={JAR_H}
						accent={theme.amber}
						fillPct={0}
						fillColor={theme.amber}
						label="SAVINGS"
						opacity={interpolate(
							frame,
							[B6_START, B6_START + 25, B7_START + 10, B7_START + 30],
							[0, 1, 1, 0.4],
							clamp,
						)}
					/>
					{/* LATER stamp */}
					<div
						style={{
							position: 'absolute',
							left: RIGHT_CX - 130,
							top: JAR_CY - 60,
							width: 260,
							height: 120,
							opacity: stampOpacity,
							transform: `translate(0,0) scale(${stampScale}) rotate(${stampRot}deg)`,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							border: `6px solid ${theme.red}`,
							borderRadius: 12,
							fontSize: 56,
							fontWeight: theme.weightMedium,
							color: theme.red,
							letterSpacing: 6,
							background: 'rgba(247,245,239,0.85)',
						}}
					>
						LATER
					</div>
					{/* Snoozing clock */}
					<div
						style={{
							position: 'absolute',
							left: RIGHT_CX + 140,
							top: JAR_CY - 40,
							opacity: clockOpacity,
						}}
					>
						<ClockZ size={90} color={theme.amber} />
					</div>
					{/* Excuse stack */}
					{[
						'when the raises come',
						"when the apartment's paid down",
						'when things settle down',
					].map((line, i) => (
						<div
							key={line}
							style={{
								position: 'absolute',
								left: RIGHT_CX - 240,
								top: 540 + i * 36,
								width: 480,
								textAlign: 'center',
								fontSize: 22,
								color: theme.ink,
								opacity: excuseFade(excuseStarts[i]),
								fontStyle: 'italic',
							}}
						>
							{line}
						</div>
					))}
				</>
			) : null}

			{/* -------- B7: locked "$500 / month" with anticipation glow -------- */}
			{frame >= B7_START - 5 ? (
				<>
					<GlowDisc
						cx={CENTER_CX}
						cy={CANVAS_H / 2}
						size={780}
						color={theme.gold}
						opacity={pulseGlow}
					/>
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
								transform: `translate(${shake}px, ${-shake}px) scale(${big500Scale})`,
								opacity: big500Opacity,
								textAlign: 'center',
							}}
						>
							<div
								style={{
									fontSize: 200,
									fontWeight: theme.weightMedium,
									color: theme.gold,
									lineHeight: 1,
									letterSpacing: 2,
								}}
							>
								$500
							</div>
							<div
								style={{
									fontSize: 40,
									fontWeight: theme.weightRegular,
									color: theme.ink,
									letterSpacing: 6,
									marginTop: 10,
								}}
							>
								/ MONTH
							</div>
						</div>
					</div>
				</>
			) : null}

			<Vignette />
		</AbsoluteFill>
	);
};

export default S08_MeetTheTwo;
