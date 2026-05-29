import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {
	TransitionSeries,
	linearTiming,
} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';
import {FONT, palette} from '../lib/theme';

// 20s @ 30fps = 600 frames, 1920x1080.
// 6 steps * 120 frames - 5 transitions * 24 = 600.

const C = {
	bean: '#6f4e37',
	beanDark: '#4a3221',
	green: '#4caf50',
	greenDark: '#2e7d32',
	red: '#e53935',
	sun: '#ffca28',
	flame: '#ff7043',
	cream: '#f3e9dc',
	steam: '#cfd8dc',
};

// ---- Icons (each in a 200x200 viewBox) ----

const PlantIcon: React.FC = () => {
	const frame = useCurrentFrame();
	const sway = Math.sin(frame / 18) * 3;
	return (
		<svg viewBox="0 0 200 200" width={300} height={300} style={{transform: `rotate(${sway}deg)`, transformOrigin: '100px 190px'}}>
			<rect x="94" y="80" width="12" height="110" rx="6" fill={C.greenDark} />
			<path d="M100 120 C60 110 40 80 38 50 C80 55 98 85 100 120Z" fill={C.green} />
			<path d="M100 120 C140 110 160 80 162 50 C120 55 102 85 100 120Z" fill={C.greenDark} />
			<circle cx="78" cy="150" r="14" fill={C.red} />
			<circle cx="122" cy="150" r="14" fill={C.red} />
			<circle cx="100" cy="170" r="14" fill={C.red} />
		</svg>
	);
};

const BasketIcon: React.FC = () => {
	const frame = useCurrentFrame();
	const bob = Math.sin(frame / 12) * 4;
	return (
		<svg viewBox="0 0 200 200" width={300} height={300}>
			<g transform={`translate(0 ${bob})`}>
				<circle cx="80" cy="78" r="13" fill={C.red} />
				<circle cx="108" cy="72" r="13" fill={C.red} />
				<circle cx="94" cy="88" r="13" fill={C.red} />
				<circle cx="122" cy="86" r="13" fill={C.red} />
			</g>
			<path d="M50 95 L150 95 L138 165 L62 165 Z" fill={C.bean} />
			<path d="M50 95 L150 95 L146 110 L54 110 Z" fill={C.beanDark} />
			<line x1="66" y1="110" x2="74" y2="160" stroke={C.beanDark} strokeWidth="3" />
			<line x1="100" y1="110" x2="100" y2="162" stroke={C.beanDark} strokeWidth="3" />
			<line x1="134" y1="110" x2="126" y2="160" stroke={C.beanDark} strokeWidth="3" />
		</svg>
	);
};

const SunIcon: React.FC = () => {
	const frame = useCurrentFrame();
	const rot = frame * 1.2;
	return (
		<svg viewBox="0 0 200 200" width={300} height={300}>
			<g transform={`rotate(${rot} 100 70)`}>
				{new Array(12).fill(0).map((_, i) => (
					<rect key={i} x="97" y="8" width="6" height="26" rx="3" fill={C.sun} transform={`rotate(${i * 30} 100 70)`} />
				))}
			</g>
			<circle cx="100" cy="70" r="34" fill={C.sun} />
			<ellipse cx="100" cy="165" rx="70" ry="16" fill={C.bean} />
			<circle cx="78" cy="162" r="8" fill={C.beanDark} />
			<circle cx="100" cy="168" r="8" fill={C.beanDark} />
			<circle cx="122" cy="162" r="8" fill={C.beanDark} />
		</svg>
	);
};

const RoastIcon: React.FC = () => {
	const frame = useCurrentFrame();
	const flick = 1 + Math.sin(frame / 4) * 0.12;
	return (
		<svg viewBox="0 0 200 200" width={300} height={300}>
			<ellipse cx="100" cy="95" rx="62" ry="22" fill={C.beanDark} />
			<rect x="38" y="95" width="124" height="28" rx="12" fill={C.bean} />
			<rect x="160" y="100" width="34" height="10" rx="5" fill={C.beanDark} />
			<circle cx="84" cy="92" r="10" fill={C.beanDark} />
			<circle cx="104" cy="90" r="10" fill={C.beanDark} />
			<circle cx="122" cy="93" r="10" fill={C.beanDark} />
			<g transform={`translate(100 150) scale(${flick})`}>
				<path d="M0 -28 C16 -10 16 8 0 20 C-16 8 -16 -10 0 -28Z" fill={C.flame} />
				<path d="M0 -16 C8 -6 8 6 0 14 C-8 6 -8 -6 0 -16Z" fill={C.sun} />
			</g>
		</svg>
	);
};

const GrinderIcon: React.FC = () => {
	const frame = useCurrentFrame();
	const crank = frame * 6;
	return (
		<svg viewBox="0 0 200 200" width={300} height={300}>
			<rect x="68" y="70" width="64" height="80" rx="10" fill={C.beanDark} />
			<rect x="78" y="120" width="44" height="26" rx="4" fill={C.cream} />
			<path d="M74 70 L126 70 L116 46 L84 46Z" fill={C.bean} />
			<g transform={`rotate(${crank} 100 40)`}>
				<line x1="100" y1="40" x2="100" y2="14" stroke={C.beanDark} strokeWidth="6" />
				<circle cx="100" cy="12" r="9" fill={C.bean} />
			</g>
			<circle cx="100" cy="40" r="6" fill={C.bean} />
			<circle cx="90" cy="170" r="5" fill={C.beanDark} />
			<circle cx="104" cy="174" r="5" fill={C.beanDark} />
			<circle cx="116" cy="169" r="5" fill={C.beanDark} />
		</svg>
	);
};

const CupIcon: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<svg viewBox="0 0 200 200" width={300} height={300}>
			{[0, 1, 2].map((i) => {
				const t = (frame + i * 22) % 66;
				const y = 70 - t;
				const op = interpolate(t, [0, 20, 50, 66], [0, 0.8, 0.3, 0], {extrapolateRight: 'clamp'});
				const wob = Math.sin((frame + i * 10) / 8) * 6;
				return <path key={i} d={`M${78 + i * 22} ${y} q ${wob} -14 0 -28`} stroke={C.steam} strokeWidth="6" fill="none" strokeLinecap="round" opacity={op} />;
			})}
			<path d="M50 85 L150 85 L140 160 Q138 172 124 172 L76 172 Q62 172 60 160 Z" fill={C.cream} />
			<rect x="58" y="85" width="84" height="14" rx="7" fill={C.bean} />
			<path d="M150 100 q34 4 34 28 q0 24 -36 26" stroke={C.cream} strokeWidth="12" fill="none" />
			<ellipse cx="100" cy="92" rx="38" ry="7" fill={C.beanDark} />
		</svg>
	);
};

type Step = {label: string; sub: string; icon: React.FC; accent: string};
const STEPS: Step[] = [
	{label: 'Farm', sub: 'Coffee cherries ripen on the plant', icon: PlantIcon, accent: C.green},
	{label: 'Harvest', sub: 'Ripe cherries are hand-picked', icon: BasketIcon, accent: C.red},
	{label: 'Dry & Process', sub: 'Beans dry in the sun', icon: SunIcon, accent: C.sun},
	{label: 'Roast', sub: 'Heat develops flavor & aroma', icon: RoastIcon, accent: C.flame},
	{label: 'Grind', sub: 'Roasted beans are ground fresh', icon: GrinderIcon, accent: C.bean},
	{label: 'Brew', sub: 'Hot water makes the perfect cup', icon: CupIcon, accent: C.beanDark},
];

const ProgressDots: React.FC<{active: number}> = ({active}) => {
	return (
		<div style={{position: 'absolute', bottom: 70, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 22}}>
			{STEPS.map((s, i) => (
				<div key={i} style={{display: 'flex', alignItems: 'center', gap: 22}}>
					<div style={{width: i === active ? 22 : 14, height: i === active ? 22 : 14, borderRadius: '50%', background: i <= active ? s.accent : 'rgba(255,255,255,0.25)', transition: 'none'}} />
					{i < STEPS.length - 1 && <div style={{width: 40, height: 4, borderRadius: 2, background: i < active ? STEPS[i].accent : 'rgba(255,255,255,0.2)'}} />}
				</div>
			))}
		</div>
	);
};

const StepScene: React.FC<{index: number}> = ({index}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const step = STEPS[index];
	const Icon = step.icon;
	const enter = spring({frame, fps, config: {damping: 16, stiffness: 130, mass: 0.8}});
	const iconScale = interpolate(enter, [0, 1], [0.4, 1]);
	const labelY = interpolate(spring({frame: frame - 6, fps, config: {damping: 20}}), [0, 1], [40, 0]);
	const labelOp = interpolate(frame, [6, 18], [0, 1], {extrapolateRight: 'clamp'});
	const isLast = index === STEPS.length - 1;
	// Arrow pulses forward to imply "next step".
	const arrowX = isLast ? 0 : Math.sin(frame / 8) * 14 + 14;
	const arrowOp = isLast ? 0 : interpolate(frame, [20, 32], [0, 1], {extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{background: `radial-gradient(circle at 50% 38%, #2a1d12 0%, #1a120b 60%, #100b06 100%)`, fontFamily: FONT}}>
			<div style={{position: 'absolute', top: 64, left: 0, right: 0, textAlign: 'center', color: C.cream, fontSize: 34, fontWeight: 700, letterSpacing: 6, opacity: 0.85}}>
				FROM FARM TO CUP
			</div>
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center'}}>
				<div style={{display: 'flex', alignItems: 'center', gap: 60}}>
					<div style={{textAlign: 'center'}}>
						<div style={{transform: `scale(${iconScale})`, width: 320, height: 320, borderRadius: 40, background: 'rgba(255,255,255,0.05)', border: `2px solid ${step.accent}55`, display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: `0 0 80px ${step.accent}33`}}>
							<Icon />
						</div>
						<div style={{transform: `translateY(${labelY}px)`, opacity: labelOp, marginTop: 36}}>
							<div style={{color: step.accent, fontSize: 40, fontWeight: 900, fontFamily: FONT}}>STEP {index + 1}</div>
							<div style={{color: palette.white, fontSize: 84, fontWeight: 900, fontFamily: FONT, lineHeight: 1.05}}>{step.label}</div>
							<div style={{color: C.steam, fontSize: 34, fontWeight: 500, fontFamily: FONT, marginTop: 12, maxWidth: 620}}>{step.sub}</div>
						</div>
					</div>
					{!isLast && (
						<svg width={140} height={120} viewBox="0 0 140 120" style={{opacity: arrowOp, transform: `translateX(${arrowX}px)`, alignSelf: 'flex-start', marginTop: 110}}>
							<path d="M10 60 L100 60 M100 60 L72 34 M100 60 L72 86" stroke={step.accent} strokeWidth="12" fill="none" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					)}
				</div>
			</AbsoluteFill>
			<ProgressDots active={index} />
		</AbsoluteFill>
	);
};

export const CoffeeExplainer: React.FC = () => {
	return (
		<AbsoluteFill style={{background: '#100b06'}}>
			<TransitionSeries>
				{STEPS.map((s, i) => (
					<TransitionSeries.Sequence key={s.label} durationInFrames={120}>
						<StepScene index={i} />
					</TransitionSeries.Sequence>
				)).reduce<React.ReactNode[]>((acc, seq, i) => {
					acc.push(seq);
					if (i < STEPS.length - 1) {
						acc.push(
							<TransitionSeries.Transition
								key={`t${i}`}
								timing={linearTiming({durationInFrames: 24})}
								presentation={slide({direction: 'from-right'})}
							/>
						);
					}
					return acc;
				}, [])}
			</TransitionSeries>
		</AbsoluteFill>
	);
};
