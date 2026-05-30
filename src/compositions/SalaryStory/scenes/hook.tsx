import {
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {C, FONT, springs} from '../theme';
import {Scene, CheckItem, Heading, FadeIn, PulseQ} from '../components/common';
import {Figure} from '../components/Figure';
import {GrowBar} from '../components/GrowBar';

// S03 — Two identical silhouettes slide in and meet center.
export const S03_TwoIdentical: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame, fps, config: springs.gentle});
	const offset = interpolate(s, [0, 1], [700, 0]);
	return (
		<Scene>
			<Heading delay={36} size={64} color={C.sub}>
				Two men. Same age. Same job.
			</Heading>
			<div style={{display: 'flex', gap: 220, marginTop: 60}}>
				<div style={{transform: `translateX(${-offset}px)`}}>
					<Figure color={C.gray} size={300} />
				</div>
				<div style={{transform: `translateX(${offset}px)`}}>
					<Figure color={C.gray} size={300} />
				</div>
			</div>
		</Scene>
	);
};

// S04 — Sameness checklist stamps in.
export const S04_Checklist: React.FC = () => {
	const items = [
		'Same age',
		'Same job',
		'$60,000 / year',
		'Same raises',
		'Same taxes',
	];
	return (
		<Scene>
			<div style={{display: 'flex', flexDirection: 'column', gap: 30, alignItems: 'flex-start'}}>
				{items.map((it, i) => (
					<CheckItem key={it} label={it} delay={i * 14} color={C.marcus} fontSize={56} />
				))}
			</div>
		</Scene>
	);
};

// S05 — Cross out luck (lottery + inheritance get red X).
const LuckIcon: React.FC<{label: string; emoji: string; delay: number}> = ({label, emoji, delay}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = spring({frame: frame - delay, fps, config: springs.pop});
	const slash = interpolate(frame - delay - 18, [0, 14], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return (
		<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, transform: `scale(${pop})`, position: 'relative'}}>
			<div style={{fontSize: 160}}>{emoji}</div>
			<div style={{fontSize: 44, fontWeight: 700, color: C.ink, fontFamily: FONT}}>{label}</div>
			<svg width={360} height={300} viewBox="0 0 360 300" style={{position: 'absolute', inset: 0}}>
				<line x1={40} y1={40} x2={40 + 280 * slash} y2={40 + 220 * slash} stroke={C.loss} strokeWidth={16} strokeLinecap="round" />
			</svg>
		</div>
	);
};
export const S05_NoLuck: React.FC = () => (
	<Scene>
		<Heading delay={0} size={56} color={C.sub}>
			Neither won the lottery. Neither inherited a dime.
		</Heading>
		<div style={{display: 'flex', gap: 200, marginTop: 70}}>
			<LuckIcon label="Lottery" emoji="🎟️" delay={18} />
			<LuckIcon label="Inheritance" emoji="🏛️" delay={34} />
		</div>
	</Scene>
);

// S06 — Mismatched outcome: two money piles, one huge one tiny, ? between.
export const S06_Mismatch: React.FC = () => (
	<Scene>
		<Heading delay={0} size={48} color={C.sub}>
			One is sitting on over a million. The other wonders how he'll retire.
		</Heading>
		<div style={{display: 'flex', alignItems: 'flex-end', gap: 120, marginTop: 50}}>
			<GrowBar value={1130000} max={1200000} color={C.marcus} maxHeight={460} width={170} valueLabel="$1.1M" delay={20} />
			<div style={{paddingBottom: 200}}>
				<PulseQ size={140} color={C.ink} />
			</div>
			<GrowBar value={180000} max={1200000} color={C.gray} maxHeight={460} width={170} valueLabel="?" delay={28} showValue />
		</div>
	</Scene>
);

// S07 — Third-person teaser: faceless coral silhouette fades in/out behind.
export const S07_Teaser: React.FC = () => {
	const frame = useCurrentFrame();
	const op = interpolate(frame, [10, 45, 80, 110], [0, 0.55, 0.55, 0.12], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return (
		<Scene>
			<div style={{filter: 'blur(2px)', opacity: op}}>
				<Figure color={C.sarah} size={320} />
			</div>
			<FadeIn delay={30} style={{position: 'absolute', bottom: 150}}>
				<div style={{fontSize: 44, fontWeight: 600, color: C.sub, fontFamily: FONT}}>
					…there's a third person I haven't told you about yet.
				</div>
			</FadeIn>
		</Scene>
	);
};
