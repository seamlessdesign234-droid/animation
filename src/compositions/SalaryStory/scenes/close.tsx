import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, springs} from '../theme';
import {Scene, FadeIn, PulseQ} from '../components/common';
import {Figure} from '../components/Figure';
import {JacobAvatar} from '../components/JacobAvatar';
import {TextReveal} from '../components/TextReveal';

const recap = [
	{name: 'Marcus', color: C.marcus, total: '$1.13M'},
	{name: 'Sarah', color: C.sarah, total: '$600k'},
	{name: 'David', color: C.david, total: '$415k'},
];

// S58 — Three recap: all three figures + totals.
export const S58_Recap: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<Scene>
			<div style={{fontSize: 42, color: C.sub, fontWeight: 600, fontFamily: FONT, marginBottom: 50}}>
				Same paycheck. Three very different endings.
			</div>
			<div style={{display: 'flex', gap: 130}}>
				{recap.map((r, i) => {
					const op = interpolate(frame - i * 16, [0, 14], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
					return (
						<div key={r.name} style={{textAlign: 'center', opacity: op}}>
							<Figure color={r.color} label={r.name} size={180} />
							<div style={{fontSize: 54, fontWeight: 900, color: r.color, fontFamily: FONT, marginTop: 14}}>{r.total}</div>
						</div>
					);
				})}
			</div>
		</Scene>
	);
};

// S59 — Which are you?: cycle a pulsing highlight across the three.
export const S59_WhichAreYou: React.FC = () => {
	const frame = useCurrentFrame();
	const active = Math.floor(frame / 24) % 3;
	return (
		<Scene>
			<div style={{display: 'flex', gap: 130}}>
				{recap.map((r, i) => (
					<div key={r.name} style={{textAlign: 'center', position: 'relative', transform: `scale(${i === active ? 1.1 : 0.92})`, opacity: i === active ? 1 : 0.45}}>
						<div style={{position: 'absolute', top: -90, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
							{i === active && <PulseQ size={90} color={r.color} />}
						</div>
						<Figure color={r.color} label={r.name} size={190} />
					</div>
				))}
			</div>
			<FadeIn delay={20} style={{marginTop: 50}}>
				<div style={{fontSize: 70, fontWeight: 900, color: C.ink, fontFamily: FONT}}>Which are you?</div>
			</FadeIn>
		</Scene>
	);
};

// S60 — Jacob outro: avatar returns center, sign-off, subscribe CTA.
export const S60_Outro: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const enter = spring({frame, fps, config: springs.gentle});
	const cta = spring({frame: frame - 40, fps, config: springs.pop});
	return (
		<Scene theme="dark">
			<div style={{transform: `scale(${enter})`}}>
				<JacobAvatar size={340} />
			</div>
			<div style={{marginTop: 40}}>
				<TextReveal text="Spend less. Invest sooner. Once you're in, stay in." fontSize={56} weight={800} color={C.white} stagger={5} />
			</div>
			<div style={{display: 'flex', gap: 24, marginTop: 50, transform: `scale(${cta})`, opacity: cta}}>
				<div style={{background: C.loss, color: C.white, padding: '18px 44px', borderRadius: 50, fontWeight: 800, fontSize: 40, fontFamily: FONT}}>
					▶ Subscribe
				</div>
				<div style={{border: `3px solid ${C.gold}`, color: C.gold, padding: '18px 44px', borderRadius: 50, fontWeight: 800, fontSize: 40, fontFamily: FONT}}>
					I'm Jacob
				</div>
			</div>
		</Scene>
	);
};
