import {interpolate, useCurrentFrame} from 'remotion';
import {C, FONT} from '../theme';
import {Scene, Heading, FadeIn} from '../components/common';
import {Timeline} from '../components/Timeline';
import {Figure} from '../components/Figure';
import {CountUp} from '../components/CountUp';

// S18 — Timeline playhead slides 30 -> 40.
export const S18_Timeline40: React.FC = () => {
	const frame = useCurrentFrame();
	const progress = interpolate(frame, [10, 70], [0, 0.25], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<Scene>
			<Heading delay={0} size={64}>Ten years go by. Just like that.</Heading>
			<div style={{marginTop: 80}}>
				<Timeline startAge={30} endAge={70} markers={[30, 40, 50, 60, 70]} progress={progress} />
			</div>
		</Scene>
	);
};

// S19 — Marcus hits $100k.
export const S19_Marcus100k: React.FC = () => (
	<Scene>
		<FadeIn>
			<Figure color={C.marcus} label="Marcus" size={200} />
		</FadeIn>
		<div style={{marginTop: 40}}>
			<CountUp from={20000} to={100000} durationInFrames={60} delay={10} color={C.marcus} fontSize={170} />
		</div>
		<FadeIn delay={70} style={{marginTop: 20}}>
			<div style={{fontSize: 40, color: C.sub, fontFamily: FONT, fontWeight: 600}}>after 10 quiet years</div>
		</FadeIn>
	</Scene>
);

// S20 — David at $0, "starting now…" tag blinks.
export const S20_DavidZero: React.FC = () => {
	const frame = useCurrentFrame();
	const blink = 0.4 + Math.abs(Math.sin(frame / 7)) * 0.6;
	return (
		<Scene>
			<FadeIn>
				<Figure color={C.david} label="David" size={200} />
			</FadeIn>
			<div style={{fontSize: 170, fontWeight: 800, color: C.david, marginTop: 40, fontFamily: FONT}}>$0</div>
			<div style={{marginTop: 24, padding: '12px 28px', border: `4px solid ${C.david}`, borderRadius: 40, color: C.david, fontWeight: 800, fontSize: 38, opacity: blink, fontFamily: FONT}}>
				starting now…
			</div>
		</Scene>
	);
};

// S21 — Head start on a race track.
export const S21_HeadStart: React.FC = () => {
	const frame = useCurrentFrame();
	const drift = Math.sin(frame / 14) * 8;
	return (
		<Scene>
			<Heading delay={0} size={60}>What he really got was a head start.</Heading>
			<div style={{position: 'relative', width: 1300, height: 160, marginTop: 80, background: C.line, borderRadius: 12}}>
				{/* lane lines */}
				<div style={{position: 'absolute', top: 78, left: 0, right: 0, height: 4, background: C.faint}} />
				<div style={{position: 'absolute', left: 30, top: 30}}><Figure color={C.david} size={100} /></div>
				<div style={{position: 'absolute', left: 980 + drift, top: 30}}><Figure color={C.marcus} size={100} /></div>
				{/* finish */}
				<div style={{position: 'absolute', right: 20, top: 0, bottom: 0, width: 18, background: 'repeating-linear-gradient(45deg,#000,#000 8px,#fff 8px,#fff 16px)'}} />
			</div>
		</Scene>
	);
};
