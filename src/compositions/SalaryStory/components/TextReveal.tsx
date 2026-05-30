import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT} from '../theme';

// Kinetic typography: words spring/fade in one at a time.
export const TextReveal: React.FC<{
	text: string;
	delay?: number;
	stagger?: number;
	fontSize?: number;
	weight?: number;
	color?: string;
	maxWidth?: number;
	align?: 'center' | 'left';
	lineHeight?: number;
	uppercase?: boolean;
}> = ({
	text,
	delay = 0,
	stagger = 6,
	fontSize = 80,
	weight = 800,
	color = C.ink,
	maxWidth = 1400,
	align = 'center',
	lineHeight = 1.1,
	uppercase = false,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const words = text.split(' ');

	return (
		<div
			style={{
				display: 'flex',
				flexWrap: 'wrap',
				gap: `${fontSize * 0.16}px ${fontSize * 0.28}px`,
				maxWidth,
				justifyContent: align === 'center' ? 'center' : 'flex-start',
				fontFamily: FONT,
				lineHeight,
			}}
		>
			{words.map((w, i) => {
				const local = frame - delay - i * stagger;
				const s = spring({frame: local, fps, config: {damping: 16, stiffness: 130, mass: 0.7}});
				const y = interpolate(s, [0, 1], [28, 0]);
				const op = interpolate(local, [0, 8], [0, 1], {
					extrapolateLeft: 'clamp',
					extrapolateRight: 'clamp',
				});
				return (
					<span
						key={i}
						style={{
							display: 'inline-block',
							fontSize,
							fontWeight: weight,
							color,
							opacity: op,
							transform: `translateY(${y}px)`,
							textTransform: uppercase ? 'uppercase' : 'none',
							letterSpacing: uppercase ? 2 : -0.5,
						}}
					>
						{w}
					</span>
				);
			})}
		</div>
	);
};
