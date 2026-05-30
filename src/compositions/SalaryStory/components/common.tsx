import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {C, FONT, springs} from '../theme';

// Full-screen scene background. theme 'light' (paper) or 'dark' (navy).
export const Scene: React.FC<{
	children: React.ReactNode;
	theme?: 'light' | 'dark';
	style?: React.CSSProperties;
}> = ({children, theme = 'light', style}) => (
	<AbsoluteFill
		style={{
			background: theme === 'light' ? C.paper : C.navy,
			fontFamily: FONT,
			justifyContent: 'center',
			alignItems: 'center',
			...style,
		}}
	>
		{children}
	</AbsoluteFill>
);

// Small kicker label at the top of a scene.
export const Kicker: React.FC<{text: string; color?: string; delay?: number}> = ({
	text,
	color = C.sub,
	delay = 0,
}) => {
	const frame = useCurrentFrame();
	const op = interpolate(frame - delay, [0, 12], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return (
		<div
			style={{
				position: 'absolute',
				top: 70,
				left: 0,
				right: 0,
				textAlign: 'center',
				fontSize: 28,
				fontWeight: 600,
				letterSpacing: 6,
				textTransform: 'uppercase',
				color,
				opacity: op,
			}}
		>
			{text}
		</div>
	);
};

// Stamp that slams in with scale + slight rotation.
export const Stamp: React.FC<{
	text: string;
	color?: string;
	delay?: number;
	rotate?: number;
	fontSize?: number;
	bg?: string;
}> = ({text, color = C.loss, delay = 0, rotate = -8, fontSize = 64, bg}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame: frame - delay, fps, config: {damping: 9, stiffness: 200, mass: 0.9}});
	const scale = interpolate(s, [0, 1], [2.4, 1]);
	const op = interpolate(frame - delay, [0, 5], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return (
		<div
			style={{
				transform: `scale(${scale}) rotate(${rotate}deg)`,
				opacity: op,
				border: `6px solid ${color}`,
				color,
				background: bg,
				padding: '14px 34px',
				borderRadius: 14,
				fontWeight: 900,
				fontSize,
				letterSpacing: 2,
				textTransform: 'uppercase',
			}}
		>
			{text}
		</div>
	);
};

// Animated checkmark item (icon springs, label fades).
export const CheckItem: React.FC<{
	label: string;
	delay?: number;
	color?: string;
	cross?: boolean;
	fontSize?: number;
}> = ({label, delay = 0, color = C.marcus, cross = false, fontSize = 44}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame: frame - delay, fps, config: springs.pop});
	const op = interpolate(frame - delay, [0, 8], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const mark = cross ? C.loss : color;
	return (
		<div
			style={{
				display: 'flex',
				alignItems: 'center',
				gap: 22,
				opacity: op,
				transform: `translateX(${interpolate(s, [0, 1], [-30, 0])}px)`,
			}}
		>
			<svg width={56} height={56} viewBox="0 0 56 56" style={{transform: `scale(${s})`}}>
				<circle cx="28" cy="28" r="26" fill="none" stroke={mark} strokeWidth="5" />
				{cross ? (
					<path d="M18 18 L38 38 M38 18 L18 38" stroke={mark} strokeWidth="6" strokeLinecap="round" />
				) : (
					<path d="M16 29 L25 38 L41 19" stroke={mark} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
				)}
			</svg>
			<span style={{fontSize, fontWeight: 600, color: C.ink, fontFamily: FONT}}>{label}</span>
		</div>
	);
};

// A pulsing question mark.
export const PulseQ: React.FC<{size?: number; color?: string}> = ({
	size = 160,
	color = C.ink,
}) => {
	const frame = useCurrentFrame();
	const pulse = 1 + Math.sin(frame / 8) * 0.12;
	const op = 0.7 + Math.sin(frame / 8) * 0.3;
	return (
		<div
			style={{
				fontSize: size,
				fontWeight: 900,
				color,
				transform: `scale(${pulse})`,
				opacity: op,
				fontFamily: FONT,
			}}
		>
			?
		</div>
	);
};

// A simple coin disc with a $ glyph.
export const Coin: React.FC<{size?: number; color?: string}> = ({
	size = 60,
	color = C.gold,
}) => (
	<div
		style={{
			width: size,
			height: size,
			borderRadius: '50%',
			background: color,
			border: `${size * 0.06}px solid rgba(0,0,0,0.12)`,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			color: C.white,
			fontWeight: 900,
			fontFamily: FONT,
			fontSize: size * 0.5,
		}}
	>
		$
	</div>
);

// Fade + rise wrapper for arbitrary content.
export const FadeIn: React.FC<{
	children: React.ReactNode;
	delay?: number;
	from?: number;
	style?: React.CSSProperties;
}> = ({children, delay = 0, from = 24, style}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame: frame - delay, fps, config: springs.gentle});
	const op = interpolate(frame - delay, [0, 12], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return (
		<div style={{opacity: op, transform: `translateY(${interpolate(s, [0, 1], [from, 0])}px)`, ...style}}>
			{children}
		</div>
	);
};

// Big centered heading used across reveal scenes.
export const Heading: React.FC<{
	children: React.ReactNode;
	color?: string;
	size?: number;
	delay?: number;
}> = ({children, color = C.ink, size = 96, delay = 0}) => (
	<FadeIn delay={delay}>
		<div
			style={{
				fontSize: size,
				fontWeight: 800,
				color,
				textAlign: 'center',
				lineHeight: 1.05,
				letterSpacing: -1,
				maxWidth: 1500,
			}}
		>
			{children}
		</div>
	</FadeIn>
);
