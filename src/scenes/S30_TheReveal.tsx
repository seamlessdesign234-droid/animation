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

const clamp = {
	extrapolateLeft: 'clamp' as const,
	extrapolateRight: 'clamp' as const,
};

// Beats.
const B1_END = 360;
const B2_START = 360;
const B2_END = 480;
const B3_START = 480;
const B3_END = 690;
const B4_START = 690;
const B4_END = 810;
const B5_START = 810;
const B5_END = 1140;
const B6_START = 1140;
const B6_END = 1530;

// Final numbers.
const MARCUS_TOTAL = 1_130_000;
const DAVID_TOTAL = 415_000;

const Vignette: React.FC<{intensity?: number}> = ({intensity = 0.1}) => (
	<AbsoluteFill
		style={{
			background: `radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,0,0,${intensity}) 100%)`,
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

const formatDollars = (v: number) =>
	'$' + Math.max(0, Math.round(v)).toLocaleString('en-US');

const TagChip: React.FC<{
	label: string;
	color: string;
	opacity: number;
	scale?: number;
}> = ({label, color, opacity, scale = 1}) => (
	<div
		style={{
			display: 'inline-block',
			padding: '8px 18px',
			border: `2px solid ${color}`,
			borderRadius: 999,
			fontSize: 18,
			fontWeight: theme.weightMedium,
			color,
			letterSpacing: 3,
			background: theme.bg,
			opacity,
			transform: `scale(${scale})`,
			margin: 4,
		}}
	>
		{label}
	</div>
);

const Envelope: React.FC<{
	color: string;
	width: number;
	height: number;
	openProgress: number; // 0 = sealed, 1 = open
	contentColor: string;
	contentLabel?: string; // e.g. "M" or "D" on the seal
	revealedNode?: React.ReactNode;
}> = ({color, width, height, openProgress, contentColor, contentLabel, revealedNode}) => {
	// Seal flap rotates up; "?" fades out; revealed content fades in.
	const flapRot = interpolate(openProgress, [0, 1], [0, -160], clamp);
	const qOpacity = interpolate(openProgress, [0, 0.3], [1, 0], clamp);
	const revealOpacity = interpolate(openProgress, [0.4, 1], [0, 1], clamp);
	return (
		<div style={{position: 'relative', width, height}}>
			{/* Envelope body */}
			<div
				style={{
					position: 'absolute',
					inset: 0,
					border: `4px solid ${color}`,
					borderRadius: 10,
					background: theme.bg,
				}}
			/>
			{/* Static crease (back V) */}
			<svg
				viewBox={`0 0 ${width} ${height}`}
				width={width}
				height={height}
				style={{position: 'absolute', inset: 0, opacity: 1 - openProgress}}
			>
				<polyline
					points={`0,0 ${width / 2},${height * 0.6} ${width},0`}
					fill="none"
					stroke={color}
					strokeWidth={4}
				/>
			</svg>
			{/* "?" mark */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: height * 0.45,
					textAlign: 'center',
					fontSize: 64,
					fontWeight: theme.weightMedium,
					color,
					lineHeight: 1,
					opacity: qOpacity,
				}}
			>
				?
			</div>
			{/* Seal */}
			{contentLabel ? (
				<div
					style={{
						position: 'absolute',
						left: width / 2 - 24,
						top: height * 0.6,
						width: 48,
						height: 48,
						borderRadius: '50%',
						background: theme.gold,
						border: `3px solid ${theme.amber}`,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontSize: 20,
						fontWeight: theme.weightMedium,
						color: theme.ink,
						opacity: 1 - openProgress * 1.4,
					}}
				>
					{contentLabel}
				</div>
			) : null}
			{/* Flap that lifts on open */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width,
					height: height * 0.65,
					transformOrigin: 'top center',
					transform: `rotateX(${flapRot}deg)`,
				}}
			>
				<svg
					viewBox={`0 0 ${width} ${height * 0.65}`}
					width={width}
					height={height * 0.65}
					style={{display: 'block'}}
				>
					<polygon
						points={`0,0 ${width},0 ${width / 2},${height * 0.6}`}
						fill={theme.bg}
						stroke={color}
						strokeWidth={4}
					/>
				</svg>
			</div>
			{/* Revealed content (number) */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: 0,
					bottom: 0,
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					opacity: revealOpacity,
					color: contentColor,
				}}
			>
				{revealedNode}
			</div>
		</div>
	);
};

const Stamp: React.FC<{
	label: string;
	color: string;
	scale: number;
	rotation: number;
	opacity: number;
	width?: number;
	height?: number;
	fontSize?: number;
}> = ({label, color, scale, rotation, opacity, width = 520, height = 130, fontSize = 60}) => (
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
			letterSpacing: 6,
			background: 'rgba(247,245,239,0.85)',
			transform: `scale(${scale}) rotate(${rotation}deg)`,
			opacity,
		}}
	>
		{label}
	</div>
);

const CheckMark: React.FC<{size: number; color: string; opacity: number}> = ({
	size,
	color,
	opacity,
}) => (
	<svg width={size} height={size} viewBox="0 0 24 24" style={{opacity}}>
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

export const S30_TheReveal: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	// ============================================================
	// Spotlight side opacities
	// ============================================================
	const marcusSpot = interpolate(
		frame,
		[0, 60, B2_END, B3_START + 20, B5_START, B5_START + 60],
		[0.85, 1, 1, 0.5, 0.9, 1],
		clamp,
	);
	const davidSpot = interpolate(
		frame,
		[0, 60, B2_END, B3_START + 20, B5_START, B5_START + 60],
		[0.5, 0.5, 0.5, 1, 1, 1],
		clamp,
	);

	// ============================================================
	// B1: Marcus tags fade in around sealed card
	// ============================================================
	const marcusTags = ['STARTED AT 30', '$500 / MO', 'NEVER DOUBLED', '30 YEARS'];
	const marcusTagStarts = [40, 110, 180, 250];
	const marcusTagOpacity = (s: number) =>
		interpolate(
			frame,
			[s, s + 25, B5_START - 60, B5_START + 30],
			[0, 1, 1, 0],
			clamp,
		);

	// ============================================================
	// B2: Marcus envelope opens, count to $1,130,000
	// ============================================================
	const marcusOpenProg = spring({
		frame: frame - B2_START,
		fps,
		config: {damping: 14, stiffness: 110},
	});
	const marcusCountVal = interpolate(
		frame,
		[B2_START + 20, B2_END + 10],
		[0, MARCUS_TOTAL],
		clamp,
	);
	const marcusBigOpacity = interpolate(
		frame,
		[B2_START + 30, B2_START + 80, B5_START - 30, B5_START + 30],
		[0, 1, 1, 0],
		clamp,
	);
	const marcusBigScale = interpolate(
		spring({
			frame: frame - (B2_START + 30),
			fps,
			config: {damping: 12, stiffness: 150},
		}),
		[0, 1],
		[0.5, 1],
		clamp,
	);
	const marcusGlowOpacity =
		interpolate(
			frame,
			[B2_START + 30, B2_START + 90, B5_START - 30, B5_START + 30],
			[0, 0.65, 0.65, 0],
			clamp,
		) *
		(0.85 + 0.15 * (1 + Math.sin((frame - (B2_START + 30)) / 8)) / 2);

	// ============================================================
	// B3: David tags
	// ============================================================
	const davidTags = ['DOUBLED TO $1,000 / MO', '15 YEARS', 'DISCIPLINED'];
	const davidTagStarts = [B3_START + 30, B3_START + 100, B3_START + 170];
	const davidTagOpacity = (s: number) =>
		interpolate(
			frame,
			[s, s + 25, B5_START - 60, B5_START + 30],
			[0, 1, 1, 0],
			clamp,
		);

	// ============================================================
	// B4: David opens — UNDERWHELMING
	// ============================================================
	const davidOpenProg = spring({
		frame: frame - B4_START,
		fps,
		config: {damping: 16, stiffness: 110},
	});
	const davidCountVal = interpolate(
		frame,
		[B4_START + 20, B4_END + 10],
		[0, DAVID_TOTAL],
		clamp,
	);
	const davidBigOpacity = interpolate(
		frame,
		[B4_START + 30, B4_START + 80, B5_START - 30, B5_START + 30],
		[0, 1, 1, 0],
		clamp,
	);
	const davidBigScale = interpolate(
		spring({
			frame: frame - (B4_START + 30),
			fps,
			config: {damping: 14, stiffness: 130},
		}),
		[0, 1],
		[0.55, 0.78], // deliberately smaller than Marcus
		clamp,
	);
	// Muted glow.
	const davidGlowOpacity = interpolate(
		frame,
		[B4_START + 30, B4_START + 80, B5_START - 30, B5_START + 30],
		[0, 0.18, 0.18, 0],
		clamp,
	);

	// ============================================================
	// B5: bars side-by-side from same baseline, scaled to ratio
	// ============================================================
	// Layout: bars centered, between the figures.
	const BAR_BASELINE = 900;
	const MAX_BAR_H = 620; // Marcus's full bar
	const RATIO = DAVID_TOTAL / MARCUS_TOTAL; // ≈ 0.3673

	const barReveal = interpolate(
		frame,
		[B5_START, B5_START + 90],
		[0, 1],
		clamp,
	);
	const marcusBarH = MAX_BAR_H * barReveal;
	const davidBarH = MAX_BAR_H * RATIO * barReveal;
	const barsContainerOpacity = interpolate(
		frame,
		[B5_START - 10, B5_START + 30, B6_END],
		[0, 1, 1],
		clamp,
	);

	// Half-of-Marcus reference line.
	const halfLineY = BAR_BASELINE - (MAX_BAR_H / 2) * barReveal;
	const halfLineOpacity = interpolate(
		frame,
		[B5_START + 60, B5_START + 120],
		[0, 0.7],
		clamp,
	);

	// "LESS THAN HALF" stamp.
	const lessStampLocal = frame - (B5_START + 160);
	const lessStampSpring = spring({
		frame: lessStampLocal,
		fps,
		config: {damping: 11, stiffness: 170},
	});
	const lessStampScale = interpolate(lessStampSpring, [0, 1], [1.4, 1], clamp);
	const lessStampRot = interpolate(lessStampSpring, [0, 1], [-12, -8], clamp);
	const lessStampOpacity = interpolate(
		lessStampLocal,
		[0, 8],
		[0, 1],
		clamp,
	);

	// Inline labels on the bars during B5.
	const barLabelOpacity = interpolate(
		frame,
		[B5_START + 30, B5_START + 90],
		[0, 1],
		clamp,
	);

	// ============================================================
	// B6: checklist + "STARTED 15 YEARS LATE" stamp
	// ============================================================
	const checklistItems = [
		'saved aggressively',
		'stayed consistent',
		'sacrificed',
	];
	const checklistStarts = [
		B6_START + 30,
		B6_START + 90,
		B6_START + 150,
	];

	// "STARTED 15 YEARS LATE" stamp slams in.
	const lateStampLocal = frame - (B6_START + 240);
	const lateStampSpring = spring({
		frame: lateStampLocal,
		fps,
		config: {damping: 10, stiffness: 180},
	});
	const lateStampScale = interpolate(lateStampSpring, [0, 1], [1.6, 1], clamp);
	const lateStampRot = interpolate(lateStampSpring, [0, 1], [-22, -16], clamp);
	const lateStampOpacity = interpolate(
		lateStampLocal,
		[0, 8],
		[0, 1],
		clamp,
	);

	// Subtle screen-shake on stamp impact.
	const shakeT = lateStampLocal;
	const shake =
		shakeT >= 0 && shakeT < 16
			? Math.sin(shakeT * 1.4) * Math.max(0, 6 - shakeT * 0.4)
			: 0;

	// "those 15 years were the whole game." caption.
	const wholeGameOpacity = interpolate(
		frame,
		[B6_START + 290, B6_START + 340, B6_END - 15, B6_END],
		[0, 1, 1, 1],
		clamp,
	);

	// ============================================================
	// Envelope card dimensions / positions
	// ============================================================
	const ENV_W = 360;
	const ENV_H = 220;
	// Envelopes live high in B1-B4; fade out as bars take over in B5.
	const envOpacity = interpolate(
		frame,
		[0, 30, B5_START - 30, B5_START + 30],
		[0, 1, 1, 0],
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
				transform: `translate(${shake}px, ${-shake}px)`,
			}}
		>
			{/* Names */}
			<div
				style={{
					position: 'absolute',
					left: LEFT_CX - 200,
					top: 70,
					width: 400,
					textAlign: 'center',
					fontSize: 32,
					letterSpacing: 4,
					color: theme.teal,
					fontWeight: theme.weightMedium,
					opacity: marcusSpot,
				}}
			>
				MARCUS
			</div>
			<div
				style={{
					position: 'absolute',
					left: RIGHT_CX - 200,
					top: 70,
					width: 400,
					textAlign: 'center',
					fontSize: 32,
					letterSpacing: 4,
					color: theme.amber,
					fontWeight: theme.weightMedium,
					opacity: davidSpot,
				}}
			>
				DAVID
			</div>

			{/* ============================================================
			    Envelopes (B1-B4)
			    ============================================================ */}
			<div style={{position: 'absolute', inset: 0, opacity: envOpacity}}>
				{/* Marcus envelope */}
				<div
					style={{
						position: 'absolute',
						left: LEFT_CX - ENV_W / 2,
						top: 200,
						width: ENV_W,
						height: ENV_H,
						opacity: marcusSpot,
					}}
				>
					<GlowDisc
						cx={ENV_W / 2}
						cy={ENV_H / 2}
						size={520}
						color={theme.gold}
						opacity={marcusGlowOpacity}
					/>
					<Envelope
						color={theme.teal}
						width={ENV_W}
						height={ENV_H}
						openProgress={Math.max(0, Math.min(1, marcusOpenProg))}
						contentColor={theme.teal}
						contentLabel="M"
						revealedNode={
							<div style={{textAlign: 'center'}}>
								<div
									style={{
										fontSize: 12,
										letterSpacing: 4,
										color: theme.ink,
										opacity: 0.55,
										fontWeight: theme.weightMedium,
									}}
								>
									MARCUS · AGE 60
								</div>
								<div
									style={{
										fontSize: 36,
										fontWeight: theme.weightMedium,
										color: theme.gold,
										fontVariantNumeric: 'tabular-nums',
										marginTop: 4,
										letterSpacing: 1,
									}}
								>
									{formatDollars(marcusCountVal)}
								</div>
							</div>
						}
					/>
				</div>

				{/* David envelope */}
				<div
					style={{
						position: 'absolute',
						left: RIGHT_CX - ENV_W / 2,
						top: 200,
						width: ENV_W,
						height: ENV_H,
						opacity: davidSpot,
					}}
				>
					<GlowDisc
						cx={ENV_W / 2}
						cy={ENV_H / 2}
						size={420}
						color={theme.amber}
						opacity={davidGlowOpacity}
					/>
					<Envelope
						color={theme.amber}
						width={ENV_W}
						height={ENV_H}
						openProgress={Math.max(0, Math.min(1, davidOpenProg))}
						contentColor={theme.amber}
						contentLabel="D"
						revealedNode={
							<div style={{textAlign: 'center'}}>
								<div
									style={{
										fontSize: 12,
										letterSpacing: 4,
										color: theme.ink,
										opacity: 0.55,
										fontWeight: theme.weightMedium,
									}}
								>
									DAVID · AGE 60
								</div>
								<div
									style={{
										fontSize: 30,
										fontWeight: theme.weightMedium,
										color: theme.amber,
										fontVariantNumeric: 'tabular-nums',
										marginTop: 4,
										letterSpacing: 1,
									}}
								>
									{formatDollars(davidCountVal)}
								</div>
							</div>
						}
					/>
				</div>

				{/* Marcus tags (around card) */}
				<div
					style={{
						position: 'absolute',
						left: LEFT_CX - 280,
						top: 460,
						width: 560,
						textAlign: 'center',
					}}
				>
					{marcusTags.map((label, i) => (
						<TagChip
							key={label}
							label={label}
							color={theme.teal}
							opacity={marcusTagOpacity(marcusTagStarts[i]) * marcusSpot}
						/>
					))}
				</div>

				{/* David tags */}
				<div
					style={{
						position: 'absolute',
						left: RIGHT_CX - 280,
						top: 460,
						width: 560,
						textAlign: 'center',
					}}
				>
					{davidTags.map((label, i) => (
						<TagChip
							key={label}
							label={label}
							color={theme.amber}
							opacity={davidTagOpacity(davidTagStarts[i]) * davidSpot}
						/>
					))}
				</div>
			</div>

			{/* ============================================================
			    B2/B4: Big number card centered (Marcus then David)
			    ============================================================ */}
			{/* Marcus big reveal */}
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
						opacity: marcusBigOpacity,
						transform: `scale(${marcusBigScale})`,
					}}
				>
					<div
						style={{
							fontSize: 16,
							letterSpacing: 6,
							color: theme.ink,
							opacity: 0.55,
							fontWeight: theme.weightMedium,
							marginBottom: 12,
						}}
					>
						MARCUS · AGE 60
					</div>
					<div
						style={{
							fontSize: 180,
							lineHeight: 1,
							fontWeight: theme.weightMedium,
							color: theme.gold,
							fontVariantNumeric: 'tabular-nums',
							textShadow: `0 0 40px ${theme.gold}55`,
						}}
					>
						{formatDollars(marcusCountVal)}
					</div>
				</div>
			</div>

			{/* David big reveal (separate layer) */}
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
						opacity: davidBigOpacity,
						transform: `scale(${davidBigScale})`,
					}}
				>
					<div
						style={{
							fontSize: 16,
							letterSpacing: 6,
							color: theme.ink,
							opacity: 0.55,
							fontWeight: theme.weightMedium,
							marginBottom: 12,
						}}
					>
						DAVID · AGE 60
					</div>
					<div
						style={{
							fontSize: 180,
							lineHeight: 1,
							fontWeight: theme.weightMedium,
							color: theme.amber,
							fontVariantNumeric: 'tabular-nums',
						}}
					>
						{formatDollars(davidCountVal)}
					</div>
				</div>
			</div>

			{/* ============================================================
			    B5/B6: Side-by-side bars + reference line + stamps
			    ============================================================ */}
			{frame >= B5_START - 20 ? (
				<div style={{position: 'absolute', inset: 0, opacity: barsContainerOpacity}}>
					{/* Baseline */}
					<div
						style={{
							position: 'absolute',
							left: 460,
							right: 460,
							top: BAR_BASELINE,
							height: 3,
							background: theme.ink,
							opacity: 0.5,
						}}
					/>

					{/* Marcus bar */}
					<div
						style={{
							position: 'absolute',
							left: CENTER_CX - 320,
							top: BAR_BASELINE - marcusBarH,
							width: 220,
							height: marcusBarH,
							background: theme.teal,
							borderRadius: 8,
							boxShadow: `0 0 0 4px ${theme.teal}33`,
						}}
					/>
					{/* Marcus bar number */}
					<div
						style={{
							position: 'absolute',
							left: CENTER_CX - 380,
							top: BAR_BASELINE - marcusBarH - 70,
							width: 340,
							textAlign: 'center',
							opacity: barLabelOpacity,
						}}
					>
						<div
							style={{
								fontSize: 14,
								letterSpacing: 4,
								color: theme.teal,
								fontWeight: theme.weightMedium,
								marginBottom: 4,
							}}
						>
							MARCUS
						</div>
						<div
							style={{
								fontSize: 42,
								fontWeight: theme.weightMedium,
								color: theme.gold,
								fontVariantNumeric: 'tabular-nums',
								lineHeight: 1,
							}}
						>
							$1,130,000
						</div>
					</div>

					{/* David bar */}
					<div
						style={{
							position: 'absolute',
							left: CENTER_CX + 100,
							top: BAR_BASELINE - davidBarH,
							width: 220,
							height: davidBarH,
							background: theme.amber,
							borderRadius: 8,
							opacity: 0.95,
						}}
					/>
					{/* David bar number */}
					<div
						style={{
							position: 'absolute',
							left: CENTER_CX + 40,
							top: BAR_BASELINE - davidBarH - 70,
							width: 340,
							textAlign: 'center',
							opacity: barLabelOpacity,
						}}
					>
						<div
							style={{
								fontSize: 14,
								letterSpacing: 4,
								color: theme.amber,
								fontWeight: theme.weightMedium,
								marginBottom: 4,
							}}
						>
							DAVID
						</div>
						<div
							style={{
								fontSize: 42,
								fontWeight: theme.weightMedium,
								color: theme.amber,
								fontVariantNumeric: 'tabular-nums',
								lineHeight: 1,
							}}
						>
							$415,000
						</div>
					</div>

					{/* HALF reference line across both bars */}
					<div
						style={{
							position: 'absolute',
							left: CENTER_CX - 380,
							right: CENTER_CX - 380,
							top: halfLineY,
							width: 760,
							height: 3,
							borderTop: `3px dashed ${theme.ink}`,
							opacity: halfLineOpacity,
						}}
					/>
					<div
						style={{
							position: 'absolute',
							left: CENTER_CX + 340,
							top: halfLineY - 14,
							width: 220,
							fontSize: 14,
							letterSpacing: 3,
							color: theme.ink,
							opacity: halfLineOpacity,
							fontWeight: theme.weightMedium,
						}}
					>
						HALF OF MARCUS
					</div>

					{/* LESS THAN HALF stamp */}
					{frame >= B5_START + 150 ? (
						<div
							style={{
								position: 'absolute',
								left: CENTER_CX - 260,
								top: 380,
								width: 520,
								height: 130,
							}}
						>
							<Stamp
								label="LESS THAN HALF"
								color={theme.red}
								scale={lessStampScale}
								rotation={lessStampRot}
								opacity={lessStampOpacity}
								width={520}
								height={130}
								fontSize={50}
							/>
						</div>
					) : null}
				</div>
			) : null}

			{/* ============================================================
			    B6: David checklist + "STARTED 15 YEARS LATE" stamp
			    ============================================================ */}
			{frame >= B6_START - 10 ? (
				<div
					style={{
						position: 'absolute',
						left: RIGHT_CX - 280,
						top: 200,
						width: 560,
					}}
				>
					<div
						style={{
							fontSize: 16,
							letterSpacing: 4,
							color: theme.ink,
							opacity: 0.6,
							fontWeight: theme.weightMedium,
							marginBottom: 14,
							textAlign: 'left',
						}}
					>
						DAVID DID EVERYTHING RIGHT…
					</div>
					{checklistItems.map((line, i) => {
						const s = checklistStarts[i];
						const local = frame - s;
						const sp = spring({
							frame: local,
							fps,
							config: {damping: 13, stiffness: 160},
						});
						const sc = interpolate(sp, [0, 1], [0.6, 1], clamp);
						const op = interpolate(frame, [s, s + 25], [0, 1], clamp);
						return (
							<div
								key={line}
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: 12,
									marginBottom: 12,
									opacity: op,
									transform: `scale(${sc})`,
									transformOrigin: 'left center',
								}}
							>
								<CheckMark size={36} color={theme.teal} opacity={1} />
								<span
									style={{
										fontSize: 28,
										color: theme.ink,
										fontWeight: theme.weightRegular,
									}}
								>
									{line}
								</span>
							</div>
						);
					})}

					{/* STARTED 15 YEARS LATE stamp slams across */}
					{frame >= B6_START + 230 ? (
						<div
							style={{
								position: 'absolute',
								left: -40,
								top: 30,
								width: 620,
							}}
						>
							<Stamp
								label="STARTED 15 YEARS LATE"
								color={theme.red}
								scale={lateStampScale}
								rotation={lateStampRot}
								opacity={lateStampOpacity}
								width={620}
								height={150}
								fontSize={42}
							/>
						</div>
					) : null}

					{/* Whole-game caption */}
					<div
						style={{
							marginTop: 40,
							fontSize: 22,
							color: theme.ink,
							fontStyle: 'italic',
							opacity: wholeGameOpacity,
							fontWeight: theme.weightMedium,
							letterSpacing: 1,
						}}
					>
						…those 15 years were the whole game.
					</div>
				</div>
			) : null}

			<Vignette intensity={0.08 + 0.06 * interpolate(frame, [B5_START, B6_END], [0, 1], clamp)} />
		</AbsoluteFill>
	);
};

export default S30_TheReveal;
