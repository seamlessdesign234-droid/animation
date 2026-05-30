import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C, FONT} from '../theme';
import {Scene, Heading, FadeIn, Stamp} from '../components/common';
import {Figure} from '../components/Figure';
import {LineChart} from '../components/LineChart';
import {CountUp} from '../components/CountUp';

// S39 — Sarah appears beside Marcus.
export const S39_SarahAppears: React.FC = () => (
	<Scene>
		<Heading delay={0} size={44} color={C.sub}>Sarah did everything right — and it still went wrong.</Heading>
		<div style={{display: 'flex', gap: 200, marginTop: 50}}>
			<Figure color={C.marcus} label="Marcus" size={220} />
			<FadeIn delay={20}><Figure color={C.sarah} label="Sarah" size={220} /></FadeIn>
		</div>
	</Scene>
);

// S40 — Neck and neck: two overlapping rising lines years 1-12.
export const S40_NeckAndNeck: React.FC = () => {
	const frame = useCurrentFrame();
	const progress = interpolate(frame, [10, 90], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const pts = Array.from({length: 20}, (_, i) => ({x: i / 19, y: Math.pow(i / 19, 1.8)}));
	const pts2 = pts.map((p) => ({x: p.x, y: p.y * 0.97}));
	return (
		<Scene>
			<Heading delay={0} size={44}>For twelve years, she and Marcus run neck and neck.</Heading>
			<div style={{position: 'relative', marginTop: 30, width: 1200, height: 460}}>
				<AbsoluteFill><LineChart points={pts} color={C.marcus} progress={progress} width={1200} height={460} label="Marcus" /></AbsoluteFill>
				<AbsoluteFill><LineChart points={pts2} color={C.sarah} progress={progress} width={1200} height={460} showAxes={false} label="" /></AbsoluteFill>
			</div>
		</Scene>
	);
};

// Sarah's full storyline points (shared across S41-S44).
// x: 0..1 over time. Marcus keeps climbing; Sarah crashes, cashes out, misses recovery, buys high.
const marcusFull = Array.from({length: 40}, (_, i) => {
	const x = i / 39;
	return {x, y: Math.pow(x, 1.9)};
});

// S41 — The crash: Sarah's line plunges, red flash, -40% tag.
export const S41_Crash: React.FC = () => {
	const frame = useCurrentFrame();
	const flash = interpolate(frame, [20, 30, 60], [0, 0.5, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const shake = frame > 20 && frame < 40 ? Math.sin(frame * 4) * 6 : 0;
	const drop = interpolate(frame, [20, 50], [0.62, 0.22], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const pts = [
		{x: 0, y: 0}, {x: 0.3, y: 0.3}, {x: 0.55, y: 0.6}, {x: 0.6, y: 0.62}, {x: 0.72, y: drop},
	];
	return (
		<Scene>
			<AbsoluteFill style={{boxShadow: `inset 0 0 200px ${C.loss}`, opacity: flash, pointerEvents: 'none'}} />
			<Heading delay={0} size={50} color={C.loss}>The market crashes. Hard.</Heading>
			<div style={{marginTop: 20, transform: `translateX(${shake}px)`}}>
				<LineChart points={pts} color={C.sarah} progress={1} width={1100} height={440} strokeWidth={9} />
			</div>
			{frame > 40 && (
				<div style={{position: 'absolute', right: 220, top: 520}}>
					<Stamp text="−40%" color={C.loss} delay={40} rotate={6} fontSize={70} />
				</div>
			)}
		</Scene>
	);
};

// S42 — Panic sell: line drops flat to CASH rail, color drains to gray.
export const S42_PanicSell: React.FC = () => {
	const frame = useCurrentFrame();
	const drain = interpolate(frame, [40, 80], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const color = `rgb(${Math.round(216 + (154 - 216) * drain)}, ${Math.round(90 + (160 - 90) * drain)}, ${Math.round(48 + (166 - 48) * drain)})`;
	const cashProgress = interpolate(frame, [20, 60], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const pts = [
		{x: 0, y: 0.6}, {x: 0.15, y: 0.22}, {x: 0.18, y: 0.18},
		{x: 0.18 + 0.6 * cashProgress, y: 0.18},
	];
	return (
		<Scene>
			<Heading delay={0} size={48} color={C.sarah}>Sarah panics. She pulls everything out, moves it to cash.</Heading>
			<div style={{position: 'relative', marginTop: 30}}>
				<LineChart points={pts} color={color} progress={1} width={1100} height={440} strokeWidth={9} />
				<div style={{position: 'absolute', right: 40, top: 280, fontWeight: 800, fontSize: 40, color: C.gray, fontFamily: FONT}}>CASH</div>
			</div>
		</Scene>
	);
};

// S43 — Recovery without her: Marcus rockets up, Sarah flat, gap opens.
export const S43_Recovery: React.FC = () => {
	const frame = useCurrentFrame();
	const progress = interpolate(frame, [10, 90], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const sarahFlat = [{x: 0, y: 0.18}, {x: 1, y: 0.18}];
	return (
		<Scene>
			<Heading delay={0} size={42} color={C.sub}>The best days come right after the worst — and Sarah missed it.</Heading>
			<div style={{position: 'relative', marginTop: 30, width: 1100, height: 440}}>
				<AbsoluteFill><LineChart points={marcusFull} color={C.marcus} progress={progress} width={1100} height={440} label="Marcus" /></AbsoluteFill>
				<AbsoluteFill><LineChart points={sarahFlat} color={C.gray} progress={1} width={1100} height={440} showAxes={false} dashed /></AbsoluteFill>
			</div>
		</Scene>
	);
};

// S44 — Buys back higher: mark sell point (low) vs buy point (high).
export const S44_BuysHigher: React.FC = () => {
	const frame = useCurrentFrame();
	const op = interpolate(frame, [30, 50], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<Scene>
			<Heading delay={0} size={44} color={C.sarah}>She bought back in much higher than where she sold.</Heading>
			<div style={{position: 'relative', marginTop: 30, width: 1100, height: 440}}>
				<LineChart points={marcusFull} color={C.marcus} progress={1} width={1100} height={440} />
				{/* sell point low-left, buy point high-right */}
				<div style={{position: 'absolute', left: 250, top: 300, opacity: op}}>
					<div style={{width: 30, height: 30, borderRadius: '50%', background: C.loss}} />
					<div style={{fontSize: 26, color: C.loss, fontWeight: 700, fontFamily: FONT}}>sold</div>
				</div>
				<div style={{position: 'absolute', left: 760, top: 120, opacity: op}}>
					<div style={{width: 30, height: 30, borderRadius: '50%', background: C.sarah}} />
					<div style={{fontSize: 26, color: C.sarah, fontWeight: 700, fontFamily: FONT}}>bought</div>
				</div>
				<svg width={1100} height={440} style={{position: 'absolute', inset: 0, opacity: op}}>
					<line x1={265} y1={315} x2={775} y2={135} stroke={C.loss} strokeWidth={4} strokeDasharray="10 10" />
				</svg>
			</div>
		</Scene>
	);
};

// S45 — Sarah's total ~$600k next to Marcus's $1,130,000.
export const S45_SarahTotal: React.FC = () => (
	<Scene>
		<div style={{display: 'flex', gap: 160, alignItems: 'flex-end'}}>
			<div style={{textAlign: 'center'}}>
				<Figure color={C.marcus} label="Marcus" size={150} />
				<div style={{marginTop: 20}}><CountUp from={0} to={1130000} durationInFrames={55} delay={10} color={C.marcus} fontSize={90} /></div>
			</div>
			<div style={{textAlign: 'center'}}>
				<Figure color={C.sarah} label="Sarah" size={150} />
				<div style={{marginTop: 20}}><CountUp from={0} to={600000} durationInFrames={55} delay={10} color={C.sarah} fontSize={90} /></div>
			</div>
		</div>
		<FadeIn delay={60} style={{marginTop: 30}}>
			<div style={{fontSize: 40, color: C.sub, fontWeight: 600, fontFamily: FONT}}>Roughly half of Marcus.</div>
		</FadeIn>
	</Scene>
);

// S46 — Cost of one panic: stamp.
export const S46_CostOfPanic: React.FC = () => (
	<Scene>
		<Stamp text="1 panic = −$500,000" color={C.loss} delay={6} rotate={-5} fontSize={72} />
	</Scene>
);
