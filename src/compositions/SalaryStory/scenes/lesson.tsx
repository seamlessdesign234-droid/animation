import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, springs} from '../theme';
import {Scene, FadeIn} from '../components/common';
import {GrowBar} from '../components/GrowBar';
import {Figure} from '../components/Figure';
import {TextReveal} from '../components/TextReveal';

// S47 — All three bars rise in sequence.
export const S47_ThreeBars: React.FC = () => (
	<Scene>
		<div style={{display: 'flex', alignItems: 'flex-end', gap: 120}}>
			<GrowBar value={1130000} max={1130000} color={C.marcus} maxHeight={520} width={170} valueLabel="$1.13M" label="Marcus" delay={6} />
			<GrowBar value={600000} max={1130000} color={C.sarah} maxHeight={520} width={170} valueLabel="$600k" label="Sarah" delay={24} />
			<GrowBar value={415000} max={1130000} color={C.david} maxHeight={520} width={170} valueLabel="$415k" label="David" delay={42} />
		</div>
	</Scene>
);

// S48 — Two villains drop in heavy.
const HeavyWord: React.FC<{text: string; color: string; delay: number}> = ({text, color, delay}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame: frame - delay, fps, config: {damping: 11, stiffness: 220, mass: 1.4}});
	const y = interpolate(s, [0, 1], [-200, 0]);
	const shake = frame > delay + 12 && frame < delay + 20 ? Math.sin(frame * 4) * 4 : 0;
	return (
		<div style={{fontSize: 110, fontWeight: 900, color, fontFamily: FONT, transform: `translateY(${y + shake}px)`, opacity: interpolate(frame - delay, [0, 6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
			{text}
		</div>
	);
};
export const S48_Villains: React.FC = () => (
	<Scene>
		<div style={{fontSize: 46, fontWeight: 600, color: C.sub, fontFamily: FONT, marginBottom: 60}}>Two things destroyed wealth:</div>
		<div style={{display: 'flex', gap: 120}}>
			<HeavyWord text="WAITING" color={C.david} delay={10} />
			<HeavyWord text="PANICKING" color={C.sarah} delay={30} />
		</div>
	</Scene>
);

// S49 — The secret over calm Marcus.
export const S49_Secret: React.FC = () => (
	<Scene>
		<FadeIn><Figure color={C.marcus} size={180} /></FadeIn>
		<div style={{marginTop: 50}}>
			<TextReveal text="Start early. Don't touch it." fontSize={96} weight={900} stagger={8} color={C.ink} />
		</div>
	</Scene>
);
