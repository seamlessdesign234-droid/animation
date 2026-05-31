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
const B1_END = 150;
const B2_START = 150;
const B2_END = 280;
const B3_START = 280;
const B3_END = 400;
const B4_START = 400;
const B4_END = 520;
const B5_START = 520;
const B5_END = 930;

// Bar geometry.
const BASELINE_Y = 920;
const MAX_BAR_H = 600;
const BAR_W = 220;

// Slot centers (left → right): MARCUS, SARAH, DAVID (descending heights).
const MARCUS_CX = 480;
const SARAH_CX = 960;
const DAVID_CX = 1440;

// Real ratios.
const MARCUS_VAL = 1_130_000;
const SARAH_VAL = 600_000;
const DAVID_VAL = 415_000;
const MARCUS_RATIO = 1.0;
const SARAH_RATIO = 0.53;
const DAVID_RATIO = 0.37;

const formatDollars = (v: number) =>
	'$' + Math.max(0, Math.round(v)).toLocaleString('en-US');

const Vignette: React.FC = () => (
	<AbsoluteFill
		style={{
			background:
				'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.10) 100%)',
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
			letterSpacing: 6,
			background: 'rgba(247,245,239,0.88)',
			transform: `scale(${scale}) rotate(${rotation}deg)`,
			opacity,
		}}
	>
		{label}
	</div>
);

type Slot = {
	cx: number;
	color: string;
	name: string;
	descriptor: string;
	ratio: number;
	value: number;
	growStart: number;
	growEnd: number;
};

export const S47_ThreeBars: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	// ============================================================
	// B1: header strip + empty slots
	// ============================================================
	const headerOpacity = interpolate(frame, [10, 80], [0, 1], clamp);
	const slotFadeIn = interpolate(frame, [30, 110], [0, 1], clamp);

	// ============================================================
	// Slot definitions (VO order: Marcus → David → Sarah).
	// Visual order left→right: Marcus, Sarah, David.
	// ============================================================
	const slots: Slot[] = [
		{
			cx: MARCUS_CX,
			color: theme.teal,
			name: 'MARCUS',
			descriptor: 'started early · never flinched',
			ratio: MARCUS_RATIO,
			value: MARCUS_VAL,
			growStart: B2_START,
			growEnd: B2_END,
		},
		{
			cx: SARAH_CX,
			color: theme.coral,
			name: 'SARAH',
			descriptor: 'started early · panicked once',
			ratio: SARAH_RATIO,
			value: SARAH_VAL,
			growStart: B4_START,
			growEnd: B4_END,
		},
		{
			cx: DAVID_CX,
			color: theme.amber,
			name: 'DAVID',
			descriptor: 'started late · saved double',
			ratio: DAVID_RATIO,
			value: DAVID_VAL,
			growStart: B3_START,
			growEnd: B3_END,
		},
	];

	// ============================================================
	// B5 stamps: "WAITING" over David, "PANICKING" over Sarah
	// ============================================================
	const waitingLocal = frame - (B5_START + 30);
	const waitingSpring = spring({
		frame: waitingLocal,
		fps,
		config: {damping: 11, stiffness: 170},
	});
	const waitingScale = interpolate(waitingSpring, [0, 1], [1.4, 1], clamp);
	const waitingRot = interpolate(waitingSpring, [0, 1], [-12, -8], clamp);
	const waitingOpacity = interpolate(waitingLocal, [0, 8], [0, 1], clamp);

	const panickingLocal = frame - (B5_START + 100);
	const panickingSpring = spring({
		frame: panickingLocal,
		fps,
		config: {damping: 11, stiffness: 170},
	});
	const panickingScale = interpolate(panickingSpring, [0, 1], [1.4, 1], clamp);
	const panickingRot = interpolate(panickingSpring, [0, 1], [-12, -8], clamp);
	const panickingOpacity = interpolate(panickingLocal, [0, 8], [0, 1], clamp);

	// Small screen-shake on each stamp impact.
	const shake1 =
		waitingLocal >= 0 && waitingLocal < 14
			? Math.sin(waitingLocal * 1.6) * Math.max(0, 4 - waitingLocal * 0.3)
			: 0;
	const shake2 =
		panickingLocal >= 0 && panickingLocal < 14
			? Math.sin(panickingLocal * 1.6) * Math.max(0, 4 - panickingLocal * 0.3)
			: 0;
	const shake = shake1 + shake2;

	// Marcus subtle brightening glow during B5.
	const marcusGlow = interpolate(
		frame,
		[B5_START, B5_START + 80, B5_END - 20, B5_END],
		[0, 0.45, 0.45, 0.45],
		clamp,
	);

	// ============================================================
	// Per-slot grow/count progress
	// ============================================================
	const computeBar = (s: Slot) => {
		const sp = spring({
			frame: frame - s.growStart,
			fps,
			config: {damping: 13, stiffness: 130},
		});
		const grow = interpolate(sp, [0, 1], [0, 1], clamp);
		const height = MAX_BAR_H * s.ratio * grow;
		const count = interpolate(
			frame,
			[s.growStart, s.growEnd + 10],
			[0, s.value],
			clamp,
		);
		const numberOpacity = interpolate(
			frame,
			[s.growStart, s.growStart + 20],
			[0, 1],
			clamp,
		);
		const descriptorOpacity = interpolate(
			frame,
			[s.growStart + 30, s.growStart + 70],
			[0, 1],
			clamp,
		);
		return {height, count, numberOpacity, descriptorOpacity};
	};

	return (
		<AbsoluteFill
			style={{
				background: theme.bg,
				fontFamily: theme.font,
				color: theme.ink,
				overflow: 'hidden',
				transform: `translate(${shake}px, ${-shake / 2}px)`,
			}}
		>
			{/* ============================================================
			    Header strip
			    ============================================================ */}
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					top: 90,
					textAlign: 'center',
					opacity: headerOpacity,
				}}
			>
				<div
					style={{
						display: 'inline-block',
						padding: '10px 28px',
						border: `2px solid ${theme.ink}`,
						borderRadius: 999,
						fontSize: 20,
						letterSpacing: 6,
						color: theme.ink,
						fontWeight: theme.weightMedium,
						background: theme.bg,
					}}
				>
					SAME SALARY · SAME 30 YEARS
				</div>
			</div>

			{/* ============================================================
			    Shared baseline
			    ============================================================ */}
			<div
				style={{
					position: 'absolute',
					left: 200,
					right: 200,
					top: BASELINE_Y,
					height: 3,
					background: theme.ink,
					opacity: 0.5 * slotFadeIn,
				}}
			/>

			{/* ============================================================
			    Three slots
			    ============================================================ */}
			{slots.map((s) => {
				const {height, count, numberOpacity, descriptorOpacity} = computeBar(s);
				const isMarcus = s.name === 'MARCUS';
				return (
					<React.Fragment key={s.name}>
						{/* Marcus glow during B5 */}
						{isMarcus ? (
							<GlowDisc
								cx={s.cx}
								cy={BASELINE_Y - MAX_BAR_H / 2}
								size={620}
								color={theme.gold}
								opacity={marcusGlow}
							/>
						) : null}

						{/* Bar */}
						<div
							style={{
								position: 'absolute',
								left: s.cx - BAR_W / 2,
								top: BASELINE_Y - height,
								width: BAR_W,
								height,
								background: s.color,
								borderRadius: 8,
								boxShadow: isMarcus ? `0 0 0 4px ${theme.gold}33` : undefined,
							}}
						/>

						{/* Number above bar */}
						<div
							style={{
								position: 'absolute',
								left: s.cx - 220,
								top: BASELINE_Y - height - 88,
								width: 440,
								textAlign: 'center',
								opacity: numberOpacity,
							}}
						>
							<div
								style={{
									fontSize: 44,
									lineHeight: 1,
									fontWeight: theme.weightMedium,
									color: isMarcus ? theme.gold : s.color,
									fontVariantNumeric: 'tabular-nums',
									letterSpacing: 1,
								}}
							>
								{formatDollars(count)}
							</div>
						</div>

						{/* Name label below baseline */}
						<div
							style={{
								position: 'absolute',
								left: s.cx - 220,
								top: BASELINE_Y + 22,
								width: 440,
								textAlign: 'center',
								opacity: slotFadeIn,
							}}
						>
							<div
								style={{
									fontSize: 30,
									letterSpacing: 6,
									color: s.color,
									fontWeight: theme.weightMedium,
								}}
							>
								{s.name}
							</div>
							<div
								style={{
									marginTop: 6,
									fontSize: 16,
									color: theme.ink,
									opacity: descriptorOpacity * 0.75,
									fontStyle: 'italic',
									fontWeight: theme.weightRegular,
								}}
							>
								{s.descriptor}
							</div>
						</div>
					</React.Fragment>
				);
			})}

			{/* ============================================================
			    B5: WAITING stamp over David
			    ============================================================ */}
			{frame >= B5_START + 20 ? (
				<div
					style={{
						position: 'absolute',
						left: DAVID_CX - 200,
						top: BASELINE_Y - MAX_BAR_H * DAVID_RATIO - 30,
						width: 400,
					}}
				>
					<Stamp
						label="WAITING"
						color={theme.red}
						scale={waitingScale}
						rotation={waitingRot}
						opacity={waitingOpacity}
						width={400}
						height={120}
						fontSize={48}
					/>
					<div
						style={{
							marginTop: 12,
							textAlign: 'center',
							fontSize: 16,
							letterSpacing: 3,
							color: theme.red,
							opacity: waitingOpacity,
							fontStyle: 'italic',
							fontWeight: theme.weightMedium,
						}}
					>
						starting late cost David.
					</div>
				</div>
			) : null}

			{/* ============================================================
			    B5: PANICKING stamp over Sarah
			    ============================================================ */}
			{frame >= B5_START + 90 ? (
				<div
					style={{
						position: 'absolute',
						left: SARAH_CX - 220,
						top: BASELINE_Y - MAX_BAR_H * SARAH_RATIO - 30,
						width: 440,
					}}
				>
					<Stamp
						label="PANICKING"
						color={theme.red}
						scale={panickingScale}
						rotation={panickingRot}
						opacity={panickingOpacity}
						width={440}
						height={120}
						fontSize={44}
					/>
					<div
						style={{
							marginTop: 12,
							textAlign: 'center',
							fontSize: 16,
							letterSpacing: 3,
							color: theme.red,
							opacity: panickingOpacity,
							fontStyle: 'italic',
							fontWeight: theme.weightMedium,
						}}
					>
						selling in fear cost Sarah.
					</div>
				</div>
			) : null}

			{/* "Two things destroyed wealth" caption above bars during B5 */}
			{frame >= B5_START - 5 ? (
				<div
					style={{
						position: 'absolute',
						left: 0,
						right: 0,
						top: 170,
						textAlign: 'center',
						fontSize: 26,
						color: theme.ink,
						opacity: interpolate(
							frame,
							[B5_START, B5_START + 40, B5_END - 20, B5_END],
							[0, 0.9, 0.9, 0.9],
							clamp,
						),
						fontStyle: 'italic',
						fontWeight: theme.weightMedium,
					}}
				>
					two things destroyed wealth — and neither was income.
				</div>
			) : null}

			<Vignette />
		</AbsoluteFill>
	);
};

export default S47_ThreeBars;
