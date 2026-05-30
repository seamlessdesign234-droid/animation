import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, FONT, springs} from '../theme';
import {Scene, Heading, Coin, FadeIn} from '../components/common';
import {LineChart} from '../components/LineChart';

// Shared exponential curve points.
const expPoints = (n: number) =>
	Array.from({length: n}, (_, i) => {
		const x = i / (n - 1);
		return {x, y: Math.pow(x, 3.2)};
	});

// S22 — The boring flat line (low slope for first stretch).
export const S22_FlatLine: React.FC = () => {
	const frame = useCurrentFrame();
	const progress = interpolate(frame, [10, 90], [0, 0.45], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<Scene>
			<Heading delay={0} size={46} color={C.sub}>The first ten years feel almost pointless — it barely moves.</Heading>
			<div style={{marginTop: 40}}>
				<LineChart points={expPoints(40)} color={C.marcus} progress={progress} width={1200} height={460} />
			</div>
		</Scene>
	);
};

// S23 — Money makes copies: a coin splits into two, again and again.
const SplitCoin: React.FC<{depth: number; x: number; y: number; delay: number}> = ({depth, x, y, delay}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const s = spring({frame: frame - delay, fps, config: springs.pop});
	if (depth > 3) return null;
	const spread = 220 / (depth + 1);
	return (
		<>
			<div style={{position: 'absolute', left: x, top: y, transform: `scale(${s})`, opacity: s}}>
				<Coin size={70 - depth * 8} />
			</div>
			{s > 0.6 && (
				<>
					<SplitCoin depth={depth + 1} x={x - spread} y={y + 150} delay={delay + 18} />
					<SplitCoin depth={depth + 1} x={x + spread} y={y + 150} delay={delay + 18} />
				</>
			)}
		</>
	);
};
export const S23_Copies: React.FC = () => (
	<Scene>
		<Heading delay={0} size={48} color={C.marcus}>Your earnings start earning — money making copies of itself.</Heading>
		<div style={{position: 'relative', width: 900, height: 520, marginTop: 20}}>
			<SplitCoin depth={0} x={420} y={20} delay={14} />
		</div>
	</Scene>
);

// S24 — Curve goes vertical: speed-ramp draw of an exponential tail.
export const S24_Vertical: React.FC = () => {
	const frame = useCurrentFrame();
	// slow then fast: ease-in cubic
	const lin = interpolate(frame, [10, 140], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const progress = Math.pow(lin, 0.6);
	return (
		<Scene>
			<Heading delay={0} size={48}>It's slow, slow, slow… and then it goes vertical.</Heading>
			<div style={{marginTop: 30}}>
				<LineChart points={expPoints(60)} color={C.marcus} progress={progress} width={1200} height={500} strokeWidth={10} />
			</div>
		</Scene>
	);
};

// S25 — Explosion at the end: highlight the final steep segment.
export const S25_Explosion: React.FC = () => {
	const frame = useCurrentFrame();
	const pulse = 0.4 + Math.abs(Math.sin(frame / 8)) * 0.4;
	return (
		<Scene>
			<div style={{position: 'relative', marginTop: 20}}>
				<LineChart points={expPoints(60)} color={C.marcus} progress={1} width={1200} height={500} strokeWidth={10} />
				{/* highlight band over last 20% */}
				<div style={{position: 'absolute', right: 20, top: 0, width: 240, height: 500, background: C.gold, opacity: pulse * 0.3, borderRadius: 12}} />
			</div>
			<FadeIn delay={20}>
				<div style={{fontSize: 44, fontWeight: 800, color: C.gold, fontFamily: FONT, marginTop: 24}}>
					← all the growth is here
				</div>
			</FadeIn>
		</Scene>
	);
};
