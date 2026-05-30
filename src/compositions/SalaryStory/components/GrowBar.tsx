import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, fmt, springs} from '../theme';

// Vertical bar whose height springs up on entry.
export const GrowBar: React.FC<{
	value: number;
	max: number;
	color: string;
	label?: string;
	valueLabel?: string;
	width?: number;
	maxHeight?: number;
	delay?: number;
	showValue?: boolean;
}> = ({
	value,
	max,
	color,
	label,
	valueLabel,
	width = 150,
	maxHeight = 560,
	delay = 0,
	showValue = true,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const grow = spring({
		frame: frame - delay,
		fps,
		config: springs.gentle,
	});
	const targetH = (value / max) * maxHeight;
	const h = targetH * grow;
	const valueOpacity = interpolate(frame - delay, [10, 24], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'flex-end',
				height: maxHeight + 110,
			}}
		>
			{showValue && (
				<div
					style={{
						fontFamily: FONT,
						fontSize: 36,
						fontWeight: 800,
						color,
						opacity: valueOpacity,
						marginBottom: 14,
						fontVariantNumeric: 'tabular-nums',
					}}
				>
					{valueLabel ?? fmt(value)}
				</div>
			)}
			<div
				style={{
					width,
					height: h,
					background: color,
					borderRadius: 12,
					boxShadow: `0 0 0 0 ${color}`,
				}}
			/>
			{label && (
				<div
					style={{
						fontFamily: FONT,
						fontSize: 30,
						fontWeight: 600,
						color: C.ink,
						marginTop: 18,
						textTransform: 'uppercase',
						letterSpacing: 2,
					}}
				>
					{label}
				</div>
			)}
		</div>
	);
};
