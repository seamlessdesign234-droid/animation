import {
	interpolate,
	interpolateColors,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {C, FONT, springs} from '../theme';
import {Scene, Heading, FadeIn, Coin} from '../components/common';
import {Figure} from '../components/Figure';

// S08 — Names drop in: figures recolor gray->teal/amber, labels spring down.
export const S08_Names: React.FC = () => {
	const frame = useCurrentFrame();
	const t = interpolate(frame, [6, 26], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const teal = interpolateColors(t, [0, 1], [C.gray, C.marcus]);
	const amber = interpolateColors(t, [0, 1], [C.gray, C.david]);
	return (
		<Scene>
			<Heading delay={0} size={56} color={C.sub}>
				Let's call them Marcus and David.
			</Heading>
			<div style={{display: 'flex', gap: 260, marginTop: 60}}>
				<FadeIn delay={20}>
					<Figure color={teal} label="Marcus" size={320} />
				</FadeIn>
				<FadeIn delay={28}>
					<Figure color={amber} label="David" size={320} />
				</FadeIn>
			</div>
		</Scene>
	);
};

// S09 — Same-life montage: mirrored icon pairs pop in symmetrically.
const MirrorIcon: React.FC<{emoji: string; delay: number; side: -1 | 1}> = ({emoji, delay, side}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame: frame - delay, fps, config: springs.pop});
	return (
		<div style={{fontSize: 110, transform: `scale(${s})`, opacity: s}}>{emoji}</div>
	);
};
export const S09_SameLife: React.FC = () => {
	const icons = ['🏢', '🚗', '🍽️'];
	return (
		<Scene>
			<Heading delay={0} size={48} color={C.sub}>
				Same apartment building. Same kind of car. Same Friday dinners.
			</Heading>
			<div style={{display: 'flex', gap: 160, marginTop: 70}}>
				<div style={{display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center'}}>
					<Figure color={C.marcus} size={150} />
					<div style={{display: 'flex', gap: 30}}>
						{icons.map((e, i) => <MirrorIcon key={i} emoji={e} delay={20 + i * 12} side={-1} />)}
					</div>
				</div>
				<div style={{display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center'}}>
					<Figure color={C.david} size={150} />
					<div style={{display: 'flex', gap: 30}}>
						{icons.map((e, i) => <MirrorIcon key={i} emoji={e} delay={20 + i * 12} side={1} />)}
					</div>
				</div>
			</div>
		</Scene>
	);
};

// S10 — The one difference: everything dims, spotlight center.
export const S10_OneDifference: React.FC = () => {
	const frame = useCurrentFrame();
	const dim = interpolate(frame, [10, 40], [1, 0.12], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const beam = interpolate(frame, [25, 55], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<Scene theme="dark">
			<div style={{position: 'absolute', inset: 0, background: `radial-gradient(circle at 50% 50%, rgba(224,168,46,${0.22 * beam}) 0%, rgba(15,27,45,0) 45%)`}} />
			<div style={{display: 'flex', gap: 260, opacity: dim}}>
				<Figure color={C.marcus} size={260} />
				<Figure color={C.david} size={260} />
			</div>
			<FadeIn delay={28} style={{position: 'absolute', bottom: 170}}>
				<div style={{fontSize: 54, fontWeight: 700, color: C.white, fontFamily: FONT}}>
					There is only <span style={{color: C.gold}}>one</span> difference.
				</div>
			</FadeIn>
		</Scene>
	);
};

// S11 — Marcus invests: $500 coin drops into INDEX FUND basket each month.
export const S11_MarcusInvests: React.FC = () => {
	const frame = useCurrentFrame();
	const coins = 6;
	const fill = interpolate(frame, [20, 140], [0, 130], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<Scene>
			<Heading delay={0} size={48} color={C.marcus}>
				Marcus invests $500 a month — a boring, broad index fund.
			</Heading>
			<div style={{position: 'relative', marginTop: 60, width: 460, height: 340}}>
				{Array.from({length: coins}).map((_, i) => {
					const start = 20 + i * 18;
					const local = frame - start;
					const drop = interpolate(local, [0, 16], [-260, 150], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
					const vis = local > 0 && local < 18 ? 1 : 0;
					return (
						<div key={i} style={{position: 'absolute', left: 200, top: drop, opacity: vis}}>
							<Coin size={56} />
						</div>
					);
				})}
				{/* basket */}
				<div style={{position: 'absolute', bottom: 0, left: 80, width: 300, height: 180, border: `8px solid ${C.marcus}`, borderTop: 'none', borderRadius: '0 0 24px 24px', overflow: 'hidden', background: C.panel}}>
					<div style={{position: 'absolute', bottom: 0, left: 0, right: 0, height: fill, background: `${C.marcus}33`}} />
					<div style={{position: 'absolute', bottom: 14, left: 0, right: 0, textAlign: 'center', fontWeight: 800, color: C.marcus, fontFamily: FONT, fontSize: 30}}>
						INDEX FUND
					</div>
				</div>
			</div>
		</Scene>
	);
};

// S12 — David waits: money flows to lifestyle, LATER stamp thuds down.
export const S12_DavidWaits: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const stamp = spring({frame: frame - 70, fps, config: {damping: 9, stiffness: 180}});
	const stampScale = interpolate(stamp, [0, 1], [3, 1]);
	const items = ['🚗', '🍔', '📱'];
	return (
		<Scene>
			<Heading delay={0} size={52} color={C.david}>
				David decides he'll start "later."
			</Heading>
			<div style={{display: 'flex', gap: 70, marginTop: 60}}>
				{items.map((e, i) => {
					const op = interpolate(frame - 20 - i * 12, [0, 10], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
					return <div key={i} style={{fontSize: 130, opacity: op}}>{e}</div>;
				})}
			</div>
			{frame > 64 && (
				<div style={{marginTop: 50, transform: `scale(${stampScale}) rotate(-7deg)`, opacity: interpolate(frame - 70, [0, 4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}), display: 'flex', alignItems: 'center', gap: 18, border: `6px solid ${C.david}`, color: C.david, padding: '12px 30px', borderRadius: 12, fontWeight: 900, fontSize: 64}}>
					😴 LATER
				</div>
			)}
		</Scene>
	);
};

// S13 — $500 lock-in: huge "$500 / month" with a settle shake.
export const S13_LockIn: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame, fps, config: {damping: 10, stiffness: 160}});
	const scale = interpolate(s, [0, 1], [0.3, 1]);
	const shake = frame > 26 && frame < 40 ? Math.sin(frame * 3) * 3 : 0;
	return (
		<Scene>
			<div style={{transform: `scale(${scale}) translateX(${shake}px)`, textAlign: 'center'}}>
				<div style={{fontSize: 200, fontWeight: 900, color: C.ink, letterSpacing: -4}}>$500</div>
				<div style={{fontSize: 60, fontWeight: 600, color: C.sub}}>per month</div>
			</div>
			<FadeIn delay={36} style={{position: 'absolute', bottom: 160}}>
				<div style={{fontSize: 44, fontWeight: 600, color: C.sub, fontFamily: FONT}}>
					That's the entire difference.
				</div>
			</FadeIn>
		</Scene>
	);
};
