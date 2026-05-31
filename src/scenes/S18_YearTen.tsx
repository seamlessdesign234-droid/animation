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

// Beat anchors.
const B1_END = 80;
const B2_START = 80;
const B2_END = 470;
const B3_START = 470;
const B3_END = 610;
const B4_START = 610;
const B4_END = 985;
const B5_START = 985;
const B5_END = 1260;

const Vignette: React.FC = () => (
	<AbsoluteFill
		style={{
			background:
				'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.10) 100%)',
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
	// Round to whole dollars, formatted with commas.
	const rounded = Math.max(0, Math.round(value));
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

export const S18_YearTen: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	// -------- B1: year ticker races 5 -> 10 quickly then snaps --------
	// Ease-in for first ~55f, then snap to 10 by frame 65.
	const yearF = interpolate(
		frame,
		[0, 55, 65],
		[5, 9.4, 10],
		clamp,
	);
	const yearDisplay = Math.min(10, Math.floor(yearF + 0.001));
	const speedStreakOpacity = interpolate(
		frame,
		[6, 20, 45, 62],
		[0, 0.35, 0.35, 0],
		clamp,
	);
	// Number quick-fade (cross-fades successive integers).
	const numFlash = interpolate(
		frame,
		[55, 62, 70],
		[0.4, 0.2, 1],
		clamp,
	);

	// AGE 40 badge enters as the ticker lands.
	const ageBadgeSpring = spring({
		frame: frame - 60,
		fps,
		config: {damping: 12, stiffness: 160},
	});
	const ageBadgeScale = interpolate(ageBadgeSpring, [0, 1], [0.3, 1], clamp);
	const ageBadgeOpacity = interpolate(frame, [55, 78], [0, 1], clamp);

	// -------- B2: Marcus value climbs $20k -> $100k --------
	const marcusValue = interpolate(
		frame,
		[B2_START, B2_START + 30, B2_END - 40, B2_END],
		[20000, 22000, 99000, 100000],
		clamp,
	);
	// Bar height grows along with it (now substantial — not just flat).
	const marcusBarH = interpolate(
		frame,
		[B2_START, B2_END],
		[110, 360],
		clamp,
	);
	// Jar fill creeps up.
	const marcusJarFill = interpolate(
		frame,
		[B2_START, B2_END],
		[0.42, 0.85],
		clamp,
	);

	// -------- Side focus opacities --------
	// B2 focus left, B3 focus right, B4 re-center on Marcus, B5 both visible behind track.
	const marcusSideOp = interpolate(
		frame,
		[B2_START, B2_START + 30, B3_START, B3_START + 30, B4_START, B4_START + 30, B5_START, B5_START + 60],
		[0.95, 1, 1, 0.55, 0.55, 1, 1, 0.85],
		clamp,
	);
	const davidSideOp = interpolate(
		frame,
		[B2_START, B2_START + 30, B3_START, B3_START + 30, B4_START, B4_START + 30, B5_START, B5_START + 60],
		[0.85, 0.45, 0.45, 1, 1, 0.55, 0.55, 0.85],
		clamp,
	);

	// -------- B3: David "READY TO START" tag pulse --------
	const readyOpacity = interpolate(
		frame,
		[B3_START + 20, B3_START + 50, B4_START + 30, B4_START + 60],
		[0, 1, 1, 0.4],
		clamp,
	);
	// Gentle sine pulse on scale + opacity.
	const readyPulse = 1 + 0.04 * Math.sin((frame - (B3_START + 50)) / 6);
	const readyPulseOpacity =
		readyOpacity * (0.85 + 0.15 * (1 + Math.sin((frame - (B3_START + 50)) / 6)) / 2);

	// David AGE 40 badge: snaps in at start of B3.
	const davidAgeSpring = spring({
		frame: frame - (B3_START + 10),
		fps,
		config: {damping: 12, stiffness: 160},
	});
	const davidAgeScale = interpolate(davidAgeSpring, [0, 1], [0.3, 1], clamp);
	const davidAgeOpacity = interpolate(
		frame,
		[B3_START + 10, B3_START + 40],
		[0, 1],
		clamp,
	);

	// -------- B4: deflation caption beside Marcus's $100k --------
	const deflateOpacity = interpolate(
		frame,
		[B4_START + 30, B4_START + 70, B5_START - 30, B5_START + 30],
		[0, 1, 1, 0],
		clamp,
	);
	// Tiny "not rich yet" check note below
	const notRichOpacity = interpolate(
		frame,
		[B4_START + 130, B4_START + 170, B5_START - 30, B5_START + 20],
		[0, 0.75, 0.75, 0],
		clamp,
	);
	// Re-center: glow softly behind Marcus's $100k figure.
	const recenterGlow = interpolate(
		frame,
		[B4_START, B4_START + 60, B5_START - 30, B5_START + 30],
		[0, 0.25, 0.25, 0],
		clamp,
	);

	// -------- B5: race-track head start --------
	const trackOpacity = interpolate(
		frame,
		[B5_START, B5_START + 60],
		[0, 1],
		clamp,
	);
	// Markers slide into position.
	const marcusMarkerProg = spring({
		frame: frame - (B5_START + 30),
		fps,
		config: {damping: 16, stiffness: 110},
	});
	const davidMarkerProg = spring({
		frame: frame - (B5_START + 60),
		fps,
		config: {damping: 16, stiffness: 110},
	});

	// Track geometry.
	const TRACK_Y = 880;
	const TRACK_LEFT = 220;
	const TRACK_RIGHT = 1700;
	const TRACK_LEN = TRACK_RIGHT - TRACK_LEFT;
	const MARCUS_X = interpolate(marcusMarkerProg, [0, 1], [TRACK_LEFT - 80, TRACK_LEFT + TRACK_LEN * 0.75], clamp);
	const DAVID_X = interpolate(davidMarkerProg, [0, 1], [TRACK_LEFT - 80, TRACK_LEFT + 20], clamp);

	const bracketOpacity = interpolate(
		frame,
		[B5_START + 110, B5_START + 160],
		[0, 1],
		clamp,
	);

	// "almost unfair" anticipatory glow on Marcus marker.
	const unfairGlow =
		interpolate(frame, [B5_START + 180, B5_END - 30], [0, 0.6], clamp) *
		(0.7 + 0.3 * Math.sin((frame - (B5_START + 180)) / 7));

	// Big-card "$100,000" presentation in B4 (centered).
	const bigNumberOpacity = interpolate(
		frame,
		[B4_START + 10, B4_START + 50, B5_START - 30, B5_START + 30],
		[0, 1, 1, 0],
		clamp,
	);
	const bigNumberSpring = spring({
		frame: frame - (B4_START + 10),
		fps,
		config: {damping: 13, stiffness: 140},
	});
	const bigNumberScale = interpolate(bigNumberSpring, [0, 1], [0.7, 1], clamp);

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
				<div style={{position: 'relative', height: 100, marginTop: 4}}>
					{/* speed streak under the number while jumping */}
					<div
						style={{
							position: 'absolute',
							left: 40,
							right: 40,
							top: 48,
							height: 6,
							background: theme.gold,
							borderRadius: 3,
							opacity: speedStreakOpacity,
							filter: 'blur(2px)',
						}}
					/>
					<div
						style={{
							fontSize: 96,
							lineHeight: 1,
							fontWeight: theme.weightMedium,
							color: theme.ink,
							fontVariantNumeric: 'tabular-nums',
							opacity: numFlash,
						}}
					>
						{yearDisplay}
					</div>
				</div>
				<div
					style={{
						display: 'flex',
						justifyContent: 'center',
						gap: 12,
						marginTop: 8,
						flexWrap: 'wrap',
						width: 400,
					}}
				>
					{Array.from({length: 10}).map((_, i) => (
						<div
							key={i}
							style={{
								width: 8,
								height: 8,
								borderRadius: '50%',
								background: i + 1 <= yearDisplay ? theme.gold : theme.ink,
								opacity: i + 1 <= yearDisplay ? 1 : 0.2,
							}}
						/>
					))}
				</div>
			</div>

			{/* -------- AGE 40 center badge (B1 land) -------- */}
			<div
				style={{
					position: 'absolute',
					left: CENTER_CX - 110,
					top: 260,
					width: 220,
					textAlign: 'center',
					opacity: ageBadgeOpacity *
						interpolate(frame, [B4_START, B4_START + 30, B5_START - 30, B5_START + 30], [1, 0.4, 0.4, 0], clamp),
					transform: `scale(${ageBadgeScale})`,
				}}
			>
				<div
					style={{
						display: 'inline-block',
						padding: '12px 28px',
						border: `3px solid ${theme.ink}`,
						borderRadius: 999,
						fontSize: 28,
						fontWeight: theme.weightMedium,
						letterSpacing: 6,
						color: theme.ink,
						background: theme.bg,
					}}
				>
					AGE 40
				</div>
			</div>

			{/* -------- MARCUS SIDE -------- */}
			<div style={{position: 'absolute', inset: 0, opacity: marcusSideOp}}>
				<Figure cx={LEFT_CX} cy={FIG_CY} width={FIG_W} color={theme.teal} />
				<div
					style={{
						position: 'absolute',
						left: LEFT_CX - 200,
						top: FIG_CY - FIG_W * 0.75,
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
					cx={LEFT_CX - 90}
					cy={780}
					width={170}
					height={240}
					accent={theme.teal}
					fillPct={marcusJarFill}
					fillColor={theme.gold}
					label="INDEX FUND"
				/>

				{/* Vertical growth bar */}
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
						left: LEFT_CX + 50,
						top: 906,
						width: 52,
						textAlign: 'center',
						fontSize: 11,
						letterSpacing: 1,
						color: theme.ink,
						opacity: 0.4,
					}}
				>
					GROWTH
				</div>

				{/* Counter */}
				<div
					style={{
						position: 'absolute',
						left: LEFT_CX - 220,
						top: 950,
						width: 440,
						textAlign: 'center',
					}}
				>
					<div
						style={{
							fontSize: 13,
							letterSpacing: 3,
							color: theme.ink,
							opacity: 0.5,
							fontWeight: theme.weightMedium,
							marginBottom: 4,
						}}
					>
						BALANCE
					</div>
					<CountUp value={marcusValue} color={theme.ink} size={42} />
				</div>
			</div>

			{/* -------- DAVID SIDE -------- */}
			<div style={{position: 'absolute', inset: 0, opacity: davidSideOp}}>
				<Figure cx={RIGHT_CX} cy={FIG_CY} width={FIG_W} color={theme.amber} />
				<div
					style={{
						position: 'absolute',
						left: RIGHT_CX - 200,
						top: FIG_CY - FIG_W * 0.75,
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
					cx={RIGHT_CX - 90}
					cy={780}
					width={170}
					height={240}
					accent={theme.amber}
					fillPct={0}
					fillColor={theme.amber}
					label="SAVINGS"
				/>
				{/* David counter $0 */}
				<div
					style={{
						position: 'absolute',
						left: RIGHT_CX - 220,
						top: 950,
						width: 440,
						textAlign: 'center',
					}}
				>
					<div
						style={{
							fontSize: 13,
							letterSpacing: 3,
							color: theme.ink,
							opacity: 0.5,
							fontWeight: theme.weightMedium,
							marginBottom: 4,
						}}
					>
						BALANCE
					</div>
					<CountUp value={0} color={theme.ink} size={42} />
				</div>

				{/* David's AGE 40 badge in B3 (next to him) */}
				<div
					style={{
						position: 'absolute',
						left: RIGHT_CX - 100,
						top: FIG_CY - 230,
						width: 200,
						textAlign: 'center',
						opacity: davidAgeOpacity,
						transform: `scale(${davidAgeScale})`,
					}}
				>
					<div
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
						AGE 40
					</div>
				</div>

				{/* READY TO START tag (pulsing) */}
				<div
					style={{
						position: 'absolute',
						left: RIGHT_CX - 180,
						top: FIG_CY + 60,
						width: 360,
						textAlign: 'center',
						opacity: readyPulseOpacity,
						transform: `scale(${readyPulse})`,
					}}
				>
					<div
						style={{
							display: 'inline-block',
							padding: '10px 24px',
							borderRadius: 999,
							background: theme.amber,
							color: theme.bg,
							fontSize: 22,
							fontWeight: theme.weightMedium,
							letterSpacing: 4,
						}}
					>
						READY TO START
					</div>
				</div>
			</div>

			{/* -------- B4: Big $100,000 card centered, deflated caption -------- */}
			{frame >= B4_START - 5 && frame <= B5_START + 35 ? (
				<>
					<GlowDisc
						cx={CENTER_CX}
						cy={CANVAS_H / 2}
						size={900}
						color={theme.teal}
						opacity={recenterGlow}
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
								textAlign: 'center',
								opacity: bigNumberOpacity,
								transform: `scale(${bigNumberScale})`,
							}}
						>
							<div
								style={{
									fontSize: 14,
									letterSpacing: 6,
									color: theme.ink,
									opacity: 0.55,
									fontWeight: theme.weightMedium,
									marginBottom: 8,
								}}
							>
								MARCUS · YEAR 10
							</div>
							<div
								style={{
									fontSize: 160,
									lineHeight: 1,
									fontWeight: theme.weightMedium,
									color: theme.gold,
									fontVariantNumeric: 'tabular-nums',
								}}
							>
								$100,000
							</div>
							<div
								style={{
									marginTop: 24,
									fontSize: 28,
									color: theme.ink,
									opacity: deflateOpacity,
									fontStyle: 'italic',
									fontWeight: theme.weightRegular,
								}}
							>
								solid — but not life-changing.
							</div>
							<div
								style={{
									marginTop: 18,
									fontSize: 16,
									letterSpacing: 4,
									color: theme.ink,
									opacity: notRichOpacity,
									fontWeight: theme.weightMedium,
								}}
							>
								<span
									style={{
										display: 'inline-block',
										padding: '4px 12px',
										border: `2px solid ${theme.ink}`,
										borderRadius: 999,
										opacity: 0.6,
									}}
								>
									NOT RICH YET
								</span>
							</div>
						</div>
					</div>
				</>
			) : null}

			{/* -------- B5: Race-track head-start -------- */}
			{frame >= B5_START - 5 ? (
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
							background:
								`repeating-linear-gradient(90deg, ${theme.ink}22 0 18px, transparent 18px 36px)`,
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
					<div
						style={{
							position: 'absolute',
							left: TRACK_LEFT - 80,
							top: TRACK_Y + 80,
							width: 160,
							textAlign: 'center',
							fontSize: 14,
							letterSpacing: 3,
							color: theme.ink,
							opacity: 0.55,
							fontWeight: theme.weightMedium,
						}}
					>
						START
					</div>

					{/* David marker (back at the line) */}
					<div
						style={{
							position: 'absolute',
							left: DAVID_X - 36,
							top: TRACK_Y - 110,
							width: 72,
						}}
					>
						<Figure cx={36} cy={50} width={70} color={theme.amber} />
						<div
							style={{
								position: 'absolute',
								left: -40,
								top: 110,
								width: 152,
								textAlign: 'center',
								fontSize: 14,
								letterSpacing: 3,
								color: theme.amber,
								fontWeight: theme.weightMedium,
							}}
						>
							DAVID
						</div>
					</div>

					{/* Marcus marker (far ahead) */}
					<div
						style={{
							position: 'absolute',
							left: MARCUS_X - 36,
							top: TRACK_Y - 110,
							width: 72,
						}}
					>
						<GlowDisc cx={36} cy={50} size={220} color={theme.gold} opacity={unfairGlow} />
						<Figure cx={36} cy={50} width={70} color={theme.teal} />
						<div
							style={{
								position: 'absolute',
								left: -40,
								top: 110,
								width: 152,
								textAlign: 'center',
								fontSize: 14,
								letterSpacing: 3,
								color: theme.teal,
								fontWeight: theme.weightMedium,
							}}
						>
							MARCUS
						</div>
					</div>

					{/* Head-start bracket between them */}
					<div
						style={{
							position: 'absolute',
							left: DAVID_X + 20,
							top: TRACK_Y - 160,
							width: Math.max(0, MARCUS_X - DAVID_X - 40),
							height: 40,
							opacity: bracketOpacity,
						}}
					>
						<div
							style={{
								position: 'absolute',
								left: 0,
								top: 20,
								width: '100%',
								height: 3,
								background: theme.ink,
								opacity: 0.55,
							}}
						/>
						<div
							style={{
								position: 'absolute',
								left: 0,
								top: 8,
								width: 3,
								height: 26,
								background: theme.ink,
								opacity: 0.55,
							}}
						/>
						<div
							style={{
								position: 'absolute',
								right: 0,
								top: 8,
								width: 3,
								height: 26,
								background: theme.ink,
								opacity: 0.55,
							}}
						/>
						<div
							style={{
								position: 'absolute',
								left: 0,
								right: 0,
								top: -28,
								textAlign: 'center',
								fontSize: 16,
								letterSpacing: 4,
								color: theme.ink,
								fontWeight: theme.weightMedium,
								fontStyle: 'italic',
							}}
						>
							head start
						</div>
					</div>

					{/* "almost unfair" caption near final beat */}
					<div
						style={{
							position: 'absolute',
							left: 0,
							right: 0,
							top: 220,
							textAlign: 'center',
							fontSize: 26,
							color: theme.ink,
							fontStyle: 'italic',
							opacity: interpolate(
								frame,
								[B5_START + 200, B5_START + 240, B5_END - 15, B5_END],
								[0, 0.85, 0.85, 0.85],
								clamp,
							),
						}}
					>
						almost unfair…
					</div>
				</div>
			) : null}

			<Vignette />
		</AbsoluteFill>
	);
};

export default S18_YearTen;
