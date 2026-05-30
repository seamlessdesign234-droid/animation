import {interpolate, useCurrentFrame} from 'remotion';
import {fmt, FONT} from '../theme';

// Animated number counter. Always rounds.
export const CountUp: React.FC<{
	from?: number;
	to: number;
	durationInFrames?: number;
	delay?: number;
	format?: 'currency' | 'plain';
	prefix?: string;
	suffix?: string;
	color?: string;
	fontSize?: number;
	weight?: number;
	style?: React.CSSProperties;
}> = ({
	from = 0,
	to,
	durationInFrames = 45,
	delay = 0,
	format = 'currency',
	prefix = '',
	suffix = '',
	color,
	fontSize = 120,
	weight = 800,
	style,
}) => {
	const frame = useCurrentFrame();
	// Ease-out so big numbers decelerate into their final value.
	const t = interpolate(frame - delay, [0, durationInFrames], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const eased = 1 - Math.pow(1 - t, 3);
	const value = from + (to - from) * eased;

	return (
		<span
			style={{
				fontFamily: FONT,
				fontSize,
				fontWeight: weight,
				color,
				fontVariantNumeric: 'tabular-nums',
				letterSpacing: -1,
				...style,
			}}
		>
			{prefix}
			{fmt(value, format)}
			{suffix}
		</span>
	);
};
