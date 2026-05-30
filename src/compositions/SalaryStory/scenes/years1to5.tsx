import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, springs} from '../theme';
import {Scene, Heading, FadeIn} from '../components/common';
import {Figure} from '../components/Figure';
import {CountUp} from '../components/CountUp';

// S14 — Marcus slow growth: counter creeps $6k -> $20k, nearly-flat bar.
export const S14_SlowGrowth: React.FC = () => {
	const frame = useCurrentFrame();
	const barH = interpolate(frame, [0, 140], [12, 80], {extrapolateRight: 'clamp'});
	return (
		<Scene>
			<Heading delay={0} size={48} color={C.marcus}>
				Year one… about $6,000. Year three… maybe $20,000.
			</Heading>
			<div style={{display: 'flex', alignItems: 'flex-end', gap: 80, marginTop: 70}}>
				<div style={{width: 200, height: 420, display: 'flex', alignItems: 'flex-end', borderBottom: `4px solid ${C.line}`}}>
					<div style={{width: '100%', height: barH, background: C.marcus, borderRadius: 8}} />
				</div>
				<CountUp from={6000} to={20000} durationInFrames={130} delay={10} color={C.marcus} fontSize={130} />
			</div>
		</Scene>
	);
};

// S15 — David's lifestyle: shiny new-stuff icons popping cheerfully.
export const S15_Lifestyle: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const items = ['🚙', '🍣', '📱', '👟', '⌚'];
	return (
		<Scene>
			<Heading delay={0} size={48} color={C.david}>
				A nicer car. More dinners out. The upgraded phone every year.
			</Heading>
			<div style={{display: 'flex', gap: 50, marginTop: 70, alignItems: 'center'}}>
				{items.map((e, i) => {
					const s = spring({frame: frame - 16 - i * 12, fps, config: springs.pop});
					const bounce = Math.sin((frame - i * 8) / 9) * 8;
					return (
						<div key={i} style={{fontSize: 120, transform: `scale(${s}) translateY(${bounce}px)`, opacity: s}}>{e}</div>
					);
				})}
			</div>
		</Scene>
	);
};

// S16 — "He feels normal": David becomes one of a grid of amber figures.
export const S16_FeelsNormal: React.FC = () => {
	const frame = useCurrentFrame();
	const rows = 4;
	const cols = 8;
	return (
		<Scene>
			<div style={{display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 24}}>
				{Array.from({length: rows * cols}).map((_, i) => {
					const row = Math.floor(i / cols);
					const op = interpolate(frame - row * 12, [0, 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
					return (
						<div key={i} style={{opacity: i === 0 ? 1 : op}}>
							<Figure color={C.david} size={120} />
						</div>
					);
				})}
			</div>
			<FadeIn delay={36} style={{position: 'absolute', bottom: 90}}>
				<div style={{fontSize: 50, fontWeight: 700, color: C.ink, fontFamily: FONT}}>
					He feels normal. Because he is normal.
				</div>
			</FadeIn>
		</Scene>
	);
};

// S17 — Invisible cost meter: faint red bar quietly grows behind David.
export const S17_InvisibleCost: React.FC = () => {
	const frame = useCurrentFrame();
	const h = interpolate(frame, [10, 110], [0, 360], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const labelOp = interpolate(frame, [90, 115], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<Scene>
			<div style={{position: 'relative', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', height: 500}}>
				<div style={{position: 'absolute', bottom: 0, width: 180, height: h, background: C.loss, opacity: 0.22, borderRadius: 10}} />
				<Figure color={C.david} size={280} />
			</div>
			<div style={{fontSize: 40, fontWeight: 600, color: C.loss, opacity: labelOp, fontFamily: FONT, marginTop: 30}}>
				the cost of waiting — invisible, until the very end
			</div>
		</Scene>
	);
};
