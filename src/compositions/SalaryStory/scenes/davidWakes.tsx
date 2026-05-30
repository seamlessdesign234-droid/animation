import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, springs} from '../theme';
import {Scene, Heading, FadeIn} from '../components/common';
import {Figure} from '../components/Figure';
import {Timeline} from '../components/Timeline';
import {GrowBar} from '../components/GrowBar';

// S26 — David doubles: $500 -> $1,000, a "2x" badge pops.
export const S26_Doubles: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const flip = interpolate(frame, [20, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const value = frame < 30 ? 500 : 1000;
	const badge = spring({frame: frame - 38, fps, config: springs.pop});
	return (
		<Scene>
			<Heading delay={0} size={48} color={C.david}>David is going to invest $1,000 a month. Double.</Heading>
			<div style={{display: 'flex', alignItems: 'center', gap: 50, marginTop: 60}}>
				<div style={{fontSize: 160, fontWeight: 900, color: C.david, transform: `scale(${1 + flip * 0.0})`, fontFamily: FONT}}>
					${value.toLocaleString()}
				</div>
				<div style={{transform: `scale(${badge})`, background: C.david, color: C.white, borderRadius: '50%', width: 130, height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60, fontWeight: 900, fontFamily: FONT}}>
					2×
				</div>
			</div>
		</Scene>
	);
};

// S27 — 15-year grind: years flip 45->60, David's bar climbing.
export const S27_Grind: React.FC = () => {
	const frame = useCurrentFrame();
	const age = Math.round(interpolate(frame, [10, 130], [45, 60], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
	const grow = interpolate(frame, [10, 130], [40, 400], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<Scene>
			<Heading delay={0} size={52} color={C.david}>For fifteen years, David grinds.</Heading>
			<div style={{display: 'flex', alignItems: 'flex-end', gap: 80, marginTop: 50}}>
				<div style={{fontSize: 150, fontWeight: 900, color: C.david, fontVariantNumeric: 'tabular-nums', fontFamily: FONT}}>age {age}</div>
				<div style={{width: 160, height: grow, background: C.david, borderRadius: 10}} />
			</div>
		</Scene>
	);
};

// S28 — Marcus relaxed: unchanged, calm, bar already tall.
export const S28_MarcusCalm: React.FC = () => (
	<Scene>
		<Heading delay={0} size={48} color={C.marcus}>Marcus just keeps his quiet $500 a month.</Heading>
		<div style={{display: 'flex', alignItems: 'flex-end', gap: 90, marginTop: 40}}>
			<Figure color={C.marcus} label="calm" size={220} />
			<GrowBar value={520000} max={600000} color={C.marcus} maxHeight={420} width={150} valueLabel="and growing" delay={8} />
		</div>
	</Scene>
);

// S29 — Both reach 60.
export const S29_BothSixty: React.FC = () => {
	const frame = useCurrentFrame();
	const progress = interpolate(frame, [10, 60], [0.6, 0.75], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<Scene>
			<Heading delay={0} size={70}>Now they're both 60.</Heading>
			<div style={{marginTop: 60}}>
				<Timeline startAge={30} endAge={70} markers={[30, 40, 50, 60, 70]} progress={0.75} color={C.ink} />
			</div>
			<div style={{display: 'flex', gap: 240, marginTop: 30}}>
				<FadeIn delay={20}><Figure color={C.marcus} label="Marcus" size={160} /></FadeIn>
				<FadeIn delay={26}><Figure color={C.david} label="David" size={160} /></FadeIn>
			</div>
		</Scene>
	);
};
