import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, springs} from '../theme';
import {Scene, Heading, FadeIn} from '../components/common';
import {Timeline} from '../components/Timeline';
import {CountUp} from '../components/CountUp';
import {Figure} from '../components/Figure';

// S50 — Rewind to 25: playhead rewinds 30 -> 25, +5 years glows.
export const S50_Rewind: React.FC = () => {
	const frame = useCurrentFrame();
	// Timeline now spans 25..70. Marcus's old start (30) rewinds to 25.
	const startProg = interpolate(frame, [10, 50], [5 / 45, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const glow = 0.4 + Math.abs(Math.sin(frame / 8)) * 0.5;
	return (
		<Scene>
			<Heading delay={0} size={46}>What if Marcus had started at 25, not 30?</Heading>
			<div style={{position: 'relative', marginTop: 70}}>
				<Timeline startAge={25} endAge={70} markers={[25, 30, 40, 50, 60, 70]} progress={startProg} color={C.marcus} />
				<div style={{position: 'absolute', left: 60, top: -10, fontSize: 34, fontWeight: 800, color: C.gold, opacity: glow, fontFamily: FONT}}>
					+5 years
				</div>
			</div>
		</Scene>
	);
};

// S51 — +$30k contributions chip (deliberately small).
export const S51_PlusContrib: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame, fps, config: springs.pop});
	return (
		<Scene>
			<Heading delay={0} size={50} color={C.sub}>He'd only put in about $30,000 more.</Heading>
			<div style={{marginTop: 60, transform: `scale(${s})`, padding: '16px 36px', borderRadius: 40, background: `${C.marcus}22`, border: `4px solid ${C.marcus}`, color: C.marcus, fontWeight: 800, fontSize: 50, fontFamily: FONT}}>
				+$30,000 contributed
			</div>
		</Scene>
	);
};

// S52 — New total: counts $1,130,000 -> $1,900,000.
export const S52_NewTotal: React.FC = () => (
	<Scene>
		<FadeIn><Figure color={C.marcus} label="Marcus, started at 25" size={170} /></FadeIn>
		<div style={{marginTop: 30}}>
			<CountUp from={1130000} to={1900000} durationInFrames={75} delay={10} color={C.marcus} fontSize={180} />
		</div>
	</Scene>
);

// S53 — $30k -> +$770k: tiny chip morphs into huge number.
export const S53_Mismatch: React.FC = () => {
	const frame = useCurrentFrame();
	const grow = interpolate(frame, [20, 60], [0.3, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<Scene>
			<div style={{display: 'flex', alignItems: 'center', gap: 50}}>
				<div style={{fontSize: 50, fontWeight: 800, color: C.sub, fontFamily: FONT, padding: '10px 24px', border: `3px solid ${C.line}`, borderRadius: 30}}>
					+$30k
				</div>
				<div style={{fontSize: 60, color: C.sub}}>→</div>
				<div style={{fontSize: 200 * grow, fontWeight: 900, color: C.marcus, fontFamily: FONT, transformOrigin: 'left center'}}>
					+$770,000
				</div>
			</div>
			<FadeIn delay={56} style={{marginTop: 40}}>
				<div style={{fontSize: 40, color: C.sub, fontWeight: 600, fontFamily: FONT}}>of extra wealth.</div>
			</FadeIn>
		</Scene>
	);
};

// S54 — Front of the line: queue of dots, glow burst reaches the front only.
export const S54_FrontOfLine: React.FC = () => {
	const frame = useCurrentFrame();
	const burst = interpolate(frame, [20, 60], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const n = 9;
	return (
		<Scene>
			<Heading delay={0} size={44} color={C.sub}>Each year costs you a place at the very front of the line.</Heading>
			<div style={{display: 'flex', gap: 30, marginTop: 70, alignItems: 'center'}}>
				{Array.from({length: n}).map((_, i) => {
					// front = i 0 (gets glow), back = high i
					const reach = burst * (n - 1);
					const lit = reach >= i;
					const isFront = i === 0;
					return (
						<div key={i} style={{
							width: isFront ? 80 : 56,
							height: isFront ? 80 : 56,
							borderRadius: '50%',
							background: lit ? C.marcus : C.faint,
							boxShadow: isFront && lit ? `0 0 40px ${C.gold}` : 'none',
						}} />
					);
				})}
			</div>
		</Scene>
	);
};
