import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, springs} from '../theme';
import {Scene, Heading, FadeIn} from '../components/common';
import {CountUp} from '../components/CountUp';

// Equation row: terms fly in, result counts up.
const Equation: React.FC<{a: string; b: string; result: number; color: string; delay?: number}> = ({a, b, result, color, delay = 0}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const sa = spring({frame: frame - delay, fps, config: springs.snappy});
	const sb = spring({frame: frame - delay - 12, fps, config: springs.snappy});
	return (
		<div style={{display: 'flex', alignItems: 'center', gap: 30, fontFamily: FONT, fontWeight: 800, fontSize: 90, color}}>
			<span style={{opacity: sa, transform: `translateX(${interpolate(sa, [0, 1], [-60, 0])}px)`}}>{a}</span>
			<span style={{opacity: interpolate(frame - delay - 6, [0, 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>×</span>
			<span style={{opacity: sb, transform: `translateX(${interpolate(sb, [0, 1], [60, 0])}px)`}}>{b}</span>
			<span style={{opacity: interpolate(frame - delay - 18, [0, 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>=</span>
			<CountUp from={0} to={result} durationInFrames={40} delay={delay + 24} color={C.ink} fontSize={90} />
		</div>
	);
};

// S34 — Marcus's contributions: $500 x 360 = $180,000.
export const S34_MarcusContrib: React.FC = () => (
	<Scene>
		<Heading delay={0} size={44} color={C.marcus}>$500 a month, for 360 months…</Heading>
		<div style={{marginTop: 60}}>
			<Equation a="$500" b="360" result={180000} color={C.marcus} delay={14} />
		</div>
	</Scene>
);

// S35 — David's contributions: $1,000 x 180 = $180,000.
export const S35_DavidContrib: React.FC = () => (
	<Scene>
		<Heading delay={0} size={44} color={C.david}>$1,000 a month, for 180 months…</Heading>
		<div style={{marginTop: 60}}>
			<Equation a="$1,000" b="180" result={180000} color={C.david} delay={14} />
		</div>
	</Scene>
);

// S36 — Same to the dollar: two $180,000 slide together, merge flash.
export const S36_SameDollar: React.FC = () => {
	const frame = useCurrentFrame();
	const t = interpolate(frame, [10, 50], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const gap = interpolate(t, [0, 1], [500, 0]);
	const flash = interpolate(frame, [48, 56, 70], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const merged = frame > 54;
	return (
		<Scene>
			{!merged ? (
				<div style={{display: 'flex', gap: 0, position: 'relative'}}>
					<div style={{transform: `translateX(${-gap}px)`, fontSize: 110, fontWeight: 900, color: C.marcus, fontFamily: FONT}}>$180,000</div>
					<div style={{transform: `translateX(${gap}px)`, fontSize: 110, fontWeight: 900, color: C.david, fontFamily: FONT, position: 'absolute', right: 0}}>$180,000</div>
				</div>
			) : (
				<div style={{textAlign: 'center'}}>
					<div style={{fontSize: 140, fontWeight: 900, color: C.ink, fontFamily: FONT, textShadow: `0 0 ${flash * 60}px ${C.gold}`}}>$180,000</div>
					<div style={{fontSize: 60, fontWeight: 900, color: C.gold, fontFamily: FONT, letterSpacing: 6}}>SAME</div>
				</div>
			)}
			<FadeIn delay={64} style={{position: 'absolute', bottom: 150}}>
				<div style={{fontSize: 44, color: C.sub, fontWeight: 600, fontFamily: FONT}}>The exact same amount of their own money. To the dollar.</div>
			</FadeIn>
		</Scene>
	);
};

// S37 — Outcomes diverge: from one base, two bars shoot to different heights.
export const S37_Diverge: React.FC = () => {
	const frame = useCurrentFrame();
	const hM = interpolate(frame, [20, 80], [0, 520], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const hD = interpolate(frame, [20, 80], [0, 190], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<Scene>
			<Heading delay={0} size={44} color={C.sub}>One walked away with over a million. The other with $400k.</Heading>
			<div style={{display: 'flex', alignItems: 'flex-end', gap: 120, marginTop: 40}}>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
					<div style={{color: C.marcus, fontWeight: 800, fontSize: 34, marginBottom: 12, fontFamily: FONT}}>$1.13M</div>
					<div style={{width: 170, height: hM, background: C.marcus, borderRadius: 10}} />
				</div>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
					<div style={{color: C.david, fontWeight: 800, fontSize: 34, marginBottom: 12, fontFamily: FONT}}>$415k</div>
					<div style={{width: 170, height: hD, background: C.david, borderRadius: 10}} />
				</div>
			</div>
			<div style={{width: 600, height: 8, background: C.ink, borderRadius: 4, marginTop: 4}} />
		</Scene>
	);
};

// S38 — It was time: a clock glows, word TIME locks center.
export const S38_Time: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const spin = interpolate(frame, [0, 90], [0, 720], {extrapolateRight: 'clamp'});
	const settle = spring({frame: frame - 50, fps, config: springs.gentle});
	return (
		<Scene>
			<svg width={260} height={260} viewBox="0 0 200 200">
				<circle cx="100" cy="100" r="88" fill="none" stroke={C.gold} strokeWidth="10" />
				<line x1="100" y1="100" x2="100" y2="40" stroke={C.ink} strokeWidth="8" strokeLinecap="round" transform={`rotate(${spin} 100 100)`} />
				<line x1="100" y1="100" x2="140" y2="100" stroke={C.ink} strokeWidth="6" strokeLinecap="round" transform={`rotate(${spin * 12} 100 100)`} />
				<circle cx="100" cy="100" r="10" fill={C.ink} />
			</svg>
			<div style={{fontSize: 130, fontWeight: 900, color: C.ink, fontFamily: FONT, letterSpacing: 8, marginTop: 30, transform: `scale(${interpolate(settle, [0, 1], [0.6, 1])})`, opacity: settle}}>
				TIME
			</div>
		</Scene>
	);
};
