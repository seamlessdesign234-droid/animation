import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, springs} from '../theme';
import {Scene, Heading, FadeIn} from '../components/common';
import {CountUp} from '../components/CountUp';

// S55 — If you're young: hourglass with sand draining.
export const S55_Young: React.FC = () => {
	const frame = useCurrentFrame();
	const drain = interpolate(frame, [10, 140], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const top = 70 * (1 - drain);
	const bottom = 70 * drain;
	return (
		<Scene theme="dark">
			<Heading delay={0} size={44} color={C.white}>Your biggest financial advantage is quietly slipping away.</Heading>
			<svg width={300} height={420} viewBox="0 0 200 280" style={{marginTop: 30}}>
				<path d="M40 20 H160 L110 140 L160 260 H40 L90 140 Z" fill="none" stroke={C.gold} strokeWidth="8" />
				{/* top sand */}
				<path d={`M${50 + (70 - top) * 0.35} ${30 + (70 - top)} H${150 - (70 - top) * 0.35} L110 140 L90 140 Z`} fill={C.gold} opacity={0.9} />
				{/* bottom sand */}
				<path d={`M${90 - bottom * 0.5} ${250} H${110 + bottom * 0.5} L${100} ${250 - bottom * 1.4} Z`} fill={C.gold} />
				{/* stream */}
				<line x1="100" y1="140" x2="100" y2="240" stroke={C.gold} strokeWidth="3" opacity={drain < 1 ? 0.8 : 0} />
			</svg>
			<div style={{color: C.gold, fontWeight: 700, fontSize: 36, fontFamily: FONT, marginTop: 10}}>your advantage</div>
		</Scene>
	);
};

// S56 — If you're not young: David's $415k re-shown warmly.
export const S56_NotYoung: React.FC = () => (
	<Scene>
		<Heading delay={0} size={46} color={C.david}>Late is expensive. But late beats never — infinitely.</Heading>
		<div style={{marginTop: 40}}>
			<CountUp from={0} to={415000} durationInFrames={60} delay={10} color={C.david} fontSize={150} />
		</div>
		<FadeIn delay={70} style={{marginTop: 24}}>
			<div style={{fontSize: 40, color: C.sub, fontWeight: 600, fontFamily: FONT}}>still $400k you wouldn't have had.</div>
		</FadeIn>
	</Scene>
);

// S57 — "Later" price tag swings in.
export const S57_LaterPrice: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame, fps, config: {damping: 8, stiffness: 120}});
	const swing = Math.sin(frame / 6) * interpolate(frame, [0, 80], [10, 1], {extrapolateRight: 'clamp'});
	return (
		<Scene>
			<div style={{display: 'flex', alignItems: 'center', gap: 30, transform: `rotate(${swing * (1 - s) + swing * 0.3}deg)`, transformOrigin: 'top center'}}>
				<div style={{fontSize: 160, fontWeight: 900, color: C.ink, fontFamily: FONT}}>"Later"</div>
				<div style={{background: C.loss, color: C.white, padding: '20px 34px', borderRadius: 18, fontWeight: 900, fontSize: 70, fontFamily: FONT, transform: `scale(${s})`}}>
					$$$
				</div>
			</div>
			<FadeIn delay={40} style={{marginTop: 50}}>
				<div style={{fontSize: 44, color: C.sub, fontWeight: 600, fontFamily: FONT}}>the most expensive thing you'll ever buy.</div>
			</FadeIn>
		</Scene>
	);
};
