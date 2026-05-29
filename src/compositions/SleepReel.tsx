import {
	AbsoluteFill,
	Sequence,
	interpolate,
	random,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {FONT, palette} from '../lib/theme';

// 8s @ 30fps = 240 frames, 1080x1920 (vertical reel).

const Stars: React.FC = () => {
	// Deterministic starfield using seeded random.
	const stars = new Array(60).fill(0).map((_, i) => ({
		x: random(`x${i}`) * 1080,
		y: random(`y${i}`) * 1920,
		r: random(`r${i}`) * 2.5 + 0.5,
		tw: random(`t${i}`),
	}));
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill>
			{stars.map((s, i) => {
				const twinkle = 0.4 + 0.6 * Math.abs(Math.sin(frame / 20 + s.tw * 6));
				return (
					<div
						key={i}
						style={{position: 'absolute', left: s.x, top: s.y, width: s.r * 2, height: s.r * 2, borderRadius: '50%', background: '#ffffff', opacity: twinkle * 0.7}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

const ShakeTitle: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const enter = spring({frame, fps, config: {damping: 12, stiffness: 200, mass: 0.6}});
	const enterScale = interpolate(enter, [0, 1], [0.3, 1]);
	// Aggressive shake between frames 10-46, using seeded random for jitter.
	const shakeAmt = interpolate(frame, [8, 12, 44, 50], [0, 26, 26, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const dx = (random(`dx${frame}`) - 0.5) * shakeAmt;
	const dy = (random(`dy${frame}`) - 0.5) * shakeAmt;
	const rot = (random(`rot${frame}`) - 0.5) * (shakeAmt / 6);
	// Swipe away to the left after frame 50.
	const swipe = interpolate(frame, [50, 62], [0, -1400], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const swipeRot = interpolate(frame, [50, 62], [0, -18], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
			<div
				style={{
					transform: `translate(${dx + swipe}px, ${dy}px) rotate(${rot + swipeRot}deg) scale(${enterScale})`,
					background: palette.coral,
					padding: '40px 56px',
					borderRadius: 28,
					boxShadow: '0 30px 80px rgba(255,107,107,0.4)',
				}}
			>
				<div style={{color: palette.white, fontSize: 130, fontWeight: 900, fontFamily: FONT, textAlign: 'center', lineHeight: 1, letterSpacing: -2}}>
					YOU'RE<br />DOING IT<br />WRONG
				</div>
			</div>
		</AbsoluteFill>
	);
};

const Headline: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	// Swipes in from the right as the title swipes out.
	const inX = interpolate(spring({frame, fps, config: {damping: 18, stiffness: 120}}), [0, 1], [1300, 0]);
	return (
		<AbsoluteFill style={{justifyContent: 'flex-start', alignItems: 'center', paddingTop: 240}}>
			<div style={{transform: `translateX(${inX}px)`, textAlign: 'center'}}>
				<div style={{color: palette.amber, fontSize: 48, fontWeight: 800, letterSpacing: 4, fontFamily: FONT}}>3 TIPS FOR</div>
				<div style={{color: palette.white, fontSize: 150, fontWeight: 900, fontFamily: FONT, lineHeight: 1, marginTop: 8}}>BETTER<br />SLEEP</div>
			</div>
		</AbsoluteFill>
	);
};

const TIPS = [
	{n: '1', text: 'Keep a consistent\nsleep schedule', color: palette.accent},
	{n: '2', text: 'No screens 1 hour\nbefore bed', color: palette.accent2},
	{n: '3', text: 'Keep your room\ncool & dark', color: palette.mint},
];

const Tip: React.FC<{index: number}> = ({index}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const tip = TIPS[index];
	const enter = spring({frame, fps, config: {damping: 16, stiffness: 130, mass: 0.8}});
	// Fly in alternating from left/right.
	const fromX = index % 2 === 0 ? -1200 : 1200;
	const x = interpolate(enter, [0, 1], [fromX, 0]);
	const opacity = interpolate(frame, [0, 8], [0, 1], {extrapolateRight: 'clamp'});
	return (
		<div style={{transform: `translateX(${x}px)`, opacity, display: 'flex', alignItems: 'center', gap: 32, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 28, padding: '34px 40px', margin: '0 60px', backdropFilter: 'blur(4px)'}}>
			<div style={{minWidth: 110, height: 110, borderRadius: '50%', background: tip.color, display: 'flex', justifyContent: 'center', alignItems: 'center', color: palette.ink, fontSize: 64, fontWeight: 900, fontFamily: FONT}}>{tip.n}</div>
			<div style={{color: palette.white, fontSize: 54, fontWeight: 700, fontFamily: FONT, whiteSpace: 'pre-line', lineHeight: 1.1}}>{tip.text}</div>
		</div>
	);
};

const Tips: React.FC = () => {
	return (
		<AbsoluteFill style={{justifyContent: 'center', alignItems: 'stretch', gap: 44, paddingTop: 120}}>
			<Sequence from={0} durationInFrames={200} layout="none">
				<Tip index={0} />
			</Sequence>
			<Sequence from={18} durationInFrames={200} layout="none">
				<Tip index={1} />
			</Sequence>
			<Sequence from={36} durationInFrames={200} layout="none">
				<Tip index={2} />
			</Sequence>
		</AbsoluteFill>
	);
};

const Follow: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = spring({frame, fps, config: {damping: 11, stiffness: 180, mass: 0.7}});
	const scale = interpolate(pop, [0, 1], [0, 1]);
	const pulse = 1 + 0.04 * Math.sin(frame / 5);
	return (
		<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 220}}>
			<div style={{transform: `scale(${scale * pulse})`, background: `linear-gradient(90deg, ${palette.accent}, ${palette.accent2})`, padding: '34px 64px', borderRadius: 999, boxShadow: '0 20px 60px rgba(124,92,255,0.5)'}}>
				<div style={{color: palette.white, fontSize: 66, fontWeight: 900, fontFamily: FONT}}>Follow for more →</div>
			</div>
		</AbsoluteFill>
	);
};

export const SleepReel: React.FC = () => {
	return (
		<AbsoluteFill style={{background: `linear-gradient(180deg, #161a3a 0%, #0a0c1e 100%)`, fontFamily: FONT}}>
			<Stars />
			<Sequence durationInFrames={64}>
				<ShakeTitle />
			</Sequence>
			<Sequence from={52} durationInFrames={188}>
				<Headline />
			</Sequence>
			<Sequence from={92} durationInFrames={148}>
				<Tips />
			</Sequence>
			<Sequence from={200} durationInFrames={40}>
				<Follow />
			</Sequence>
		</AbsoluteFill>
	);
};
