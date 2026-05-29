import {
	AbsoluteFill,
	Sequence,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {FONT, palette, springs} from '../lib/theme';

// 12s @ 30fps = 360 frames, 1920x1080.

const Background: React.FC = () => {
	const frame = useCurrentFrame();
	// Slow drifting gradient — deterministic, frame-based.
	const shift = interpolate(frame, [0, 360], [0, 30]);
	return (
		<AbsoluteFill
			style={{
				background: `radial-gradient(circle at ${50 + shift / 6}% 20%, #1a2350 0%, ${palette.ink} 55%, #06081a 100%)`,
			}}
		/>
	);
};

// Fade helper based on the local frame within a Sequence.
const useSceneFade = (fadeOut = 12) => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const fadeIn = interpolate(frame, [0, 14], [0, 1], {extrapolateRight: 'clamp'});
	const out = interpolate(
		frame,
		[durationInFrames - fadeOut, durationInFrames],
		[1, 0],
		{extrapolateLeft: 'clamp'}
	);
	return Math.min(fadeIn, out);
};

const TitleScene: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const opacity = useSceneFade();
	const enter = spring({frame, fps, config: springs.gentle});
	const y = interpolate(enter, [0, 1], [60, 0]);
	const lineW = interpolate(spring({frame: frame - 10, fps, config: springs.smooth}), [0, 1], [0, 520]);
	return (
		<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity}}>
			<div style={{transform: `translateY(${y}px)`, textAlign: 'center'}}>
				<div style={{color: palette.accent, fontSize: 30, letterSpacing: 8, fontWeight: 700, marginBottom: 24}}>
					DATA REPORT
				</div>
				<div style={{color: palette.white, fontSize: 96, fontWeight: 800, lineHeight: 1.05, fontFamily: FONT}}>
					Global AI Adoption
				</div>
				<div style={{color: palette.accent2, fontSize: 130, fontWeight: 900, fontFamily: FONT}}>2025</div>
				<div style={{height: 8, width: lineW, background: `linear-gradient(90deg, ${palette.accent}, ${palette.accent2})`, borderRadius: 8, margin: '28px auto 0'}} />
			</div>
		</AbsoluteFill>
	);
};

type Bar = {label: string; value: number; color: string};
const BARS: Bar[] = [
	{label: 'Technology', value: 92, color: palette.accent},
	{label: 'Finance', value: 84, color: palette.accent2},
	{label: 'Healthcare', value: 71, color: palette.mint},
	{label: 'Retail', value: 63, color: palette.amber},
	{label: 'Manufacturing', value: 55, color: palette.coral},
];

const BarChartScene: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const opacity = useSceneFade();
	const chartH = 560;
	const maxVal = 100;
	return (
		<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity}}>
			<div style={{textAlign: 'center'}}>
				<div style={{color: palette.white, fontSize: 52, fontWeight: 800, fontFamily: FONT, marginBottom: 48}}>
					Adoption rate by industry
				</div>
				<div style={{display: 'flex', alignItems: 'flex-end', gap: 56, height: chartH, paddingLeft: 20}}>
					{BARS.map((bar, i) => {
						const grow = spring({frame: frame - 8 - i * 7, fps, config: {damping: 14, mass: 0.8, stiffness: 120}});
						const h = interpolate(grow, [0, 1], [0, (bar.value / maxVal) * chartH], {extrapolateRight: 'clamp'});
						const shownVal = Math.round(interpolate(grow, [0, 1], [0, bar.value], {extrapolateRight: 'clamp'}));
						return (
							<div key={bar.label} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', width: 150}}>
								<div style={{color: palette.white, fontSize: 40, fontWeight: 800, fontFamily: FONT, marginBottom: 10}}>{shownVal}%</div>
								<div style={{width: 110, height: h, borderRadius: '14px 14px 4px 4px', background: `linear-gradient(180deg, ${bar.color}, ${bar.color}aa)`, boxShadow: `0 0 40px ${bar.color}55`}} />
								<div style={{color: palette.slate, fontSize: 26, fontWeight: 600, fontFamily: FONT, marginTop: 18, width: 150, textAlign: 'center'}}>{bar.label}</div>
							</div>
						);
					})}
				</div>
			</div>
		</AbsoluteFill>
	);
};

const CounterScene: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const opacity = useSceneFade();
	// Rapid count-up using a fast spring that settles at 78.
	const progress = spring({frame, fps, config: {damping: 30, mass: 1.1, stiffness: 60}});
	const count = Math.round(interpolate(progress, [0, 1], [0, 78]));
	const pop = spring({frame: frame - 55, fps, config: springs.snappy});
	const scale = interpolate(pop, [0, 1], [1, 1.06]);
	return (
		<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity}}>
			<div style={{textAlign: 'center', transform: `scale(${scale})`}}>
				<div style={{color: palette.mint, fontSize: 260, fontWeight: 900, fontFamily: FONT, lineHeight: 1, textShadow: `0 0 60px ${palette.mint}55`}}>
					{count}%
				</div>
				<div style={{color: palette.white, fontSize: 56, fontWeight: 700, fontFamily: FONT, marginTop: 10}}>
					of companies
				</div>
				<div style={{color: palette.slate, fontSize: 34, fontWeight: 500, fontFamily: FONT, marginTop: 16}}>
					now use AI in at least one function
				</div>
			</div>
		</AbsoluteFill>
	);
};

const ClosingScene: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const opacity = useSceneFade(18);
	const enter = spring({frame, fps, config: springs.gentle});
	const scale = interpolate(enter, [0, 1], [0.85, 1]);
	return (
		<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', opacity}}>
			<div style={{textAlign: 'center', transform: `scale(${scale})`}}>
				<div style={{color: palette.white, fontSize: 72, fontWeight: 800, fontFamily: FONT}}>
					The era of AI is here.
				</div>
				<div style={{color: palette.accent, fontSize: 36, fontWeight: 600, fontFamily: FONT, marginTop: 22, letterSpacing: 2}}>
					Source: Global Industry Survey, 2025
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const AiAdoption: React.FC = () => {
	return (
		<AbsoluteFill style={{background: palette.ink, fontFamily: FONT}}>
			<Background />
			<Sequence durationInFrames={95}>
				<TitleScene />
			</Sequence>
			<Sequence from={90} durationInFrames={125}>
				<BarChartScene />
			</Sequence>
			<Sequence from={210} durationInFrames={95}>
				<CounterScene />
			</Sequence>
			<Sequence from={300} durationInFrames={60}>
				<ClosingScene />
			</Sequence>
		</AbsoluteFill>
	);
};
