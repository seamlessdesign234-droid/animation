import {
	AbsoluteFill,
	Img,
	Sequence,
	interpolate,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {FONT, SERIF} from '../lib/theme';

// Vertical 1080x1920 Instagram carousel: cover + 3 looks + outro.
// Drop look1.jpg / look2.jpg / look3.jpg into public/ to render the photos.

const cream = '#f3ece1';
const ivory = '#faf5ec';
const sand = '#e8dcc8';
const cocoa = '#3a2a1f';
const espresso = '#1f160f';
const terracotta = '#b04a3a';
const gold = '#b08a4a';

type Look = {
	src: string;
	number: string;
	trend: string;
	tagline: string;
	chips: string[];
	accent: string;
};

const LOOKS: Look[] = [
	{
		src: 'look1.jpg',
		number: '01',
		trend: 'Coastal Boho',
		tagline: 'crochet · denim · zigzag slides',
		chips: ['crochet vest', 'wide-leg denim', 'crossbody', 'woven slides'],
		accent: cocoa,
	},
	{
		src: 'look2.jpg',
		number: '02',
		trend: 'Quiet Luxury',
		tagline: 'silk halter · raffia · red kitten heel',
		chips: ['cowl halter', 'light wash denim', 'raffia clutch', 'red heels'],
		accent: terracotta,
	},
	{
		src: 'look3.jpg',
		number: '03',
		trend: 'Office Siren',
		tagline: 'tailored vest · shell buttons · woven flats',
		chips: ['waistcoat', 'shell buttons', 'crochet tote', 'woven flats'],
		accent: espresso,
	},
];

const Grain: React.FC<{opacity?: number}> = ({opacity = 0.06}) => {
	// Subtle film grain via radial gradients; deterministic.
	return (
		<AbsoluteFill
			style={{
				pointerEvents: 'none',
				opacity,
				backgroundImage:
					'radial-gradient(rgba(0,0,0,0.6) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)',
				backgroundSize: '3px 3px, 5px 5px',
				backgroundPosition: '0 0, 1px 2px',
				mixBlendMode: 'overlay',
			}}
		/>
	);
};

const SlideFrame: React.FC<{
	children: React.ReactNode;
	bg?: string;
	enter: number;
	exit: number;
}> = ({children, bg = cream, enter, exit}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	// Slide in from the right, out to the left — carousel swipe feel.
	const inProg = spring({frame, fps, config: {damping: 26, stiffness: 140, mass: 0.8}, durationInFrames: enter});
	const inX = interpolate(inProg, [0, 1], [1100, 0]);
	const inOpacity = interpolate(frame, [0, enter * 0.4], [0, 1], {extrapolateRight: 'clamp'});
	const outStart = durationInFrames - exit;
	const outX = interpolate(frame, [outStart, durationInFrames], [0, -1100], {extrapolateLeft: 'clamp'});
	const outOpacity = interpolate(frame, [outStart, outStart + exit * 0.7], [1, 0], {extrapolateLeft: 'clamp'});
	return (
		<AbsoluteFill
			style={{
				transform: `translateX(${inX + outX}px)`,
				opacity: inOpacity * outOpacity,
				background: bg,
				fontFamily: FONT,
			}}
		>
			{children}
		</AbsoluteFill>
	);
};

const TopBar: React.FC<{index: string; total: string}> = ({index, total}) => {
	return (
		<div
			style={{
				position: 'absolute',
				top: 56,
				left: 56,
				right: 56,
				display: 'flex',
				justifyContent: 'space-between',
				alignItems: 'center',
				color: espresso,
				fontFamily: FONT,
				fontSize: 26,
				fontWeight: 600,
				letterSpacing: 6,
				textTransform: 'uppercase',
			}}
		>
			<div>The Edit · Summer ’26</div>
			<div style={{display: 'flex', gap: 10, alignItems: 'center'}}>
				<span style={{color: espresso}}>{index}</span>
				<span style={{width: 22, height: 1, background: espresso, opacity: 0.6}} />
				<span style={{opacity: 0.5}}>{total}</span>
			</div>
		</div>
	);
};

const ProgressDots: React.FC<{active: number; total: number; color?: string}> = ({active, total, color = espresso}) => {
	return (
		<div style={{position: 'absolute', bottom: 56, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 14}}>
			{new Array(total).fill(0).map((_, i) => (
				<div
					key={i}
					style={{
						width: i === active ? 36 : 10,
						height: 10,
						borderRadius: 999,
						background: color,
						opacity: i === active ? 0.95 : 0.3,
						transition: 'all 0.3s',
					}}
				/>
			))}
		</div>
	);
};

const Cover: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const titleIn = spring({frame, fps, config: {damping: 18, stiffness: 110}, durationInFrames: 30});
	const titleY = interpolate(titleIn, [0, 1], [40, 0]);
	const titleOpacity = interpolate(frame, [4, 22], [0, 1], {extrapolateRight: 'clamp'});

	const lineIn = interpolate(spring({frame: frame - 10, fps, config: {damping: 22, stiffness: 90}, durationInFrames: 40}), [0, 1], [0, 1]);

	const subIn = interpolate(frame, [22, 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const subY = interpolate(subIn, [0, 1], [24, 0]);

	const chipsIn = interpolate(frame, [34, 54], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<SlideFrame bg={cream} enter={28} exit={14}>
			<TopBar index="00" total="04" />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '0 80px'}}>
				<div
					style={{
						color: terracotta,
						fontFamily: FONT,
						fontSize: 28,
						letterSpacing: 12,
						fontWeight: 700,
						textTransform: 'uppercase',
						opacity: titleOpacity,
						transform: `translateY(${titleY}px)`,
					}}
				>
					Lookbook · 03
				</div>
				<div
					style={{
						color: espresso,
						fontFamily: SERIF,
						fontSize: 220,
						lineHeight: 0.92,
						letterSpacing: -6,
						fontWeight: 400,
						textAlign: 'center',
						marginTop: 28,
						opacity: titleOpacity,
						transform: `translateY(${titleY}px)`,
					}}
				>
					<div style={{fontStyle: 'italic', fontWeight: 300}}>Styled</div>
					<div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28}}>
						<span style={{height: 6, background: espresso, width: lineIn * 220, transformOrigin: 'left'}} />
						<span style={{fontWeight: 500}}>3</span>
						<span style={{height: 6, background: espresso, width: lineIn * 220, transformOrigin: 'right'}} />
					</div>
					<div style={{fontWeight: 500, letterSpacing: 18, fontSize: 170}}>WAYS</div>
				</div>
				<div
					style={{
						color: cocoa,
						fontFamily: FONT,
						fontSize: 34,
						marginTop: 40,
						opacity: subIn,
						transform: `translateY(${subY}px)`,
						letterSpacing: 2,
					}}
				>
					one pair of jeans · three vibes
				</div>
				<div
					style={{
						display: 'flex',
						gap: 14,
						marginTop: 46,
						opacity: chipsIn,
						transform: `translateY(${(1 - chipsIn) * 20}px)`,
					}}
				>
					{['#boho', '#quietluxury', '#officesiren'].map((t) => (
						<div
							key={t}
							style={{
								padding: '14px 26px',
								borderRadius: 999,
								background: 'rgba(31,22,15,0.08)',
								color: espresso,
								fontSize: 26,
								fontWeight: 600,
								letterSpacing: 1,
							}}
						>
							{t}
						</div>
					))}
				</div>
			</AbsoluteFill>
			<div
				style={{
					position: 'absolute',
					bottom: 110,
					left: 0,
					right: 0,
					textAlign: 'center',
					color: cocoa,
					fontFamily: FONT,
					fontSize: 24,
					letterSpacing: 8,
					textTransform: 'uppercase',
					opacity: 0.7,
				}}
			>
				swipe →
			</div>
			<ProgressDots active={0} total={5} />
			<Grain />
		</SlideFrame>
	);
};

const LookSlide: React.FC<{look: Look; index: number; activeDot: number}> = ({look, index, activeDot}) => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();

	// Slow ken-burns on the photo.
	const zoom = interpolate(frame, [0, durationInFrames], [1.04, 1.12]);
	const pan = interpolate(frame, [0, durationInFrames], [-10, 10]);

	// Chip / trend text reveals.
	const chipIn = spring({frame: frame - 6, fps, config: {damping: 22, stiffness: 110}, durationInFrames: 24});
	const chipY = interpolate(chipIn, [0, 1], [30, 0]);

	const trendIn = spring({frame: frame - 14, fps, config: {damping: 18, stiffness: 90}, durationInFrames: 32});
	const trendY = interpolate(trendIn, [0, 1], [60, 0]);
	const trendOpacity = interpolate(frame, [14, 32], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	const taglineOpacity = interpolate(frame, [26, 44], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	const creditsIn = interpolate(frame, [34, 56], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	// Big number watermark fades subtly.
	const numOpacity = interpolate(frame, [0, 20], [0, 0.18], {extrapolateRight: 'clamp'});

	return (
		<SlideFrame bg={ivory} enter={26} exit={14}>
			{/* Photo card */}
			<div
				style={{
					position: 'absolute',
					top: 130,
					left: 56,
					right: 56,
					bottom: 540,
					overflow: 'hidden',
					borderRadius: 12,
					boxShadow: '0 40px 80px rgba(31,22,15,0.18), 0 8px 18px rgba(31,22,15,0.10)',
					background: sand,
				}}
			>
				<Img
					src={staticFile(look.src)}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						objectPosition: 'center 22%',
						transform: `scale(${zoom}) translateX(${pan}px)`,
					}}
				/>
				{/* Gradient base for legibility */}
				<div
					style={{
						position: 'absolute',
						inset: 0,
						background:
							'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.35) 100%)',
					}}
				/>
				{/* Number watermark */}
				<div
					style={{
						position: 'absolute',
						right: 24,
						top: 18,
						color: '#fff',
						fontFamily: SERIF,
						fontStyle: 'italic',
						fontSize: 240,
						lineHeight: 1,
						opacity: numOpacity,
						textShadow: '0 6px 30px rgba(0,0,0,0.4)',
					}}
				>
					{look.number}
				</div>
				{/* In-photo trend pill (bottom-left) */}
				<div
					style={{
						position: 'absolute',
						left: 22,
						bottom: 22,
						display: 'flex',
						alignItems: 'center',
						gap: 14,
						opacity: chipIn,
						transform: `translateY(${chipY}px)`,
					}}
				>
					<div
						style={{
							padding: '10px 18px',
							background: 'rgba(255,255,255,0.92)',
							borderRadius: 999,
							color: look.accent,
							fontFamily: FONT,
							fontWeight: 800,
							fontSize: 22,
							letterSpacing: 3,
							textTransform: 'uppercase',
						}}
					>
						Look {look.number}
					</div>
					<div
						style={{
							padding: '10px 18px',
							background: 'rgba(0,0,0,0.55)',
							backdropFilter: 'blur(6px)',
							borderRadius: 999,
							color: '#fff',
							fontFamily: FONT,
							fontWeight: 600,
							fontSize: 22,
							letterSpacing: 2,
						}}
					>
						trend ’26
					</div>
				</div>
			</div>
			<TopBar index={look.number} total="04" />
			{/* Trend headline area below photo */}
			<div
				style={{
					position: 'absolute',
					left: 56,
					right: 56,
					bottom: 200,
					textAlign: 'center',
				}}
			>
				<div
					style={{
						color: look.accent,
						fontFamily: SERIF,
						fontSize: 132,
						lineHeight: 1,
						fontWeight: 500,
						letterSpacing: -2,
						transform: `translateY(${trendY}px)`,
						opacity: trendOpacity,
					}}
				>
					<span style={{fontStyle: 'italic', fontWeight: 300}}>{look.trend.split(' ')[0]}</span>{' '}
					<span>{look.trend.split(' ').slice(1).join(' ')}</span>
				</div>
				<div
					style={{
						color: cocoa,
						fontFamily: FONT,
						fontSize: 30,
						marginTop: 18,
						letterSpacing: 4,
						textTransform: 'lowercase',
						opacity: taglineOpacity,
					}}
				>
					{look.tagline}
				</div>
				{/* Credit chips */}
				<div
					style={{
						marginTop: 26,
						display: 'flex',
						justifyContent: 'center',
						gap: 10,
						flexWrap: 'wrap',
						opacity: creditsIn,
						transform: `translateY(${(1 - creditsIn) * 14}px)`,
					}}
				>
					{look.chips.map((c) => (
						<div
							key={c}
							style={{
								padding: '10px 18px',
								borderRadius: 999,
								border: `1px solid ${look.accent}`,
								color: look.accent,
								fontFamily: FONT,
								fontWeight: 600,
								fontSize: 22,
								letterSpacing: 1,
							}}
						>
							{c}
						</div>
					))}
				</div>
			</div>
			<ProgressDots active={activeDot} total={5} />
			<Grain />
		</SlideFrame>
	);
};

const Outro: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const inProg = spring({frame, fps, config: {damping: 18, stiffness: 110}, durationInFrames: 30});
	const titleY = interpolate(inProg, [0, 1], [40, 0]);
	const opacity = interpolate(frame, [4, 22], [0, 1], {extrapolateRight: 'clamp'});

	const arrowBob = Math.sin(frame / 6) * 10;
	const ctaIn = interpolate(frame, [20, 38], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	return (
		<SlideFrame bg={cocoa} enter={26} exit={14}>
			<TopBar index="04" total="04" />
			<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', padding: '0 80px', color: cream}}>
				<div
					style={{
						color: gold,
						fontFamily: FONT,
						fontSize: 28,
						letterSpacing: 12,
						fontWeight: 700,
						textTransform: 'uppercase',
						opacity,
						transform: `translateY(${titleY}px)`,
					}}
				>
					Your turn
				</div>
				<div
					style={{
						color: cream,
						fontFamily: SERIF,
						fontSize: 180,
						lineHeight: 0.96,
						letterSpacing: -4,
						textAlign: 'center',
						marginTop: 32,
						opacity,
						transform: `translateY(${titleY}px)`,
					}}
				>
					<span style={{fontStyle: 'italic', fontWeight: 300}}>Which</span>{' '}
					<span style={{fontWeight: 500}}>look</span>
					<br />
					<span style={{fontStyle: 'italic', fontWeight: 300}}>wins?</span>
				</div>
				<div
					style={{
						display: 'flex',
						gap: 28,
						marginTop: 60,
						opacity: ctaIn,
					}}
				>
					{['01', '02', '03'].map((n) => (
						<div
							key={n}
							style={{
								width: 120,
								height: 120,
								borderRadius: '50%',
								border: `2px solid ${cream}`,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								color: cream,
								fontFamily: SERIF,
								fontStyle: 'italic',
								fontSize: 64,
							}}
						>
							{n}
						</div>
					))}
				</div>
				<div
					style={{
						marginTop: 80,
						color: cream,
						fontFamily: FONT,
						fontSize: 32,
						letterSpacing: 4,
						textTransform: 'uppercase',
						opacity: ctaIn,
						transform: `translateY(${arrowBob}px)`,
					}}
				>
					comment below ↓
				</div>
				<div
					style={{
						marginTop: 36,
						padding: '20px 44px',
						borderRadius: 999,
						background: gold,
						color: espresso,
						fontFamily: FONT,
						fontSize: 30,
						fontWeight: 800,
						letterSpacing: 4,
						textTransform: 'uppercase',
						opacity: ctaIn,
						boxShadow: '0 18px 40px rgba(176,138,74,0.4)',
					}}
				>
					save · share · follow
				</div>
			</AbsoluteFill>
			<ProgressDots active={4} total={5} color={cream} />
			<Grain opacity={0.08} />
		</SlideFrame>
	);
};

// Slide timings (frames @ 30fps)
const COVER = 70;
const LOOK = 100;
const OUTRO = 80;
// Slides overlap by OVERLAP frames so the swipe transition reads smoothly.
const OVERLAP = 6;

export const LookbookCarousel: React.FC = () => {
	let cursor = 0;
	const cover = {from: cursor, dur: COVER};
	cursor += COVER - OVERLAP;
	const slides = LOOKS.map((look) => {
		const seq = {from: cursor, dur: LOOK, look};
		cursor += LOOK - OVERLAP;
		return seq;
	});
	const outro = {from: cursor, dur: OUTRO};

	return (
		<AbsoluteFill style={{background: cream}}>
			<Sequence from={cover.from} durationInFrames={cover.dur}>
				<Cover />
			</Sequence>
			{slides.map((s, i) => (
				<Sequence key={i} from={s.from} durationInFrames={s.dur}>
					<LookSlide look={s.look} index={i} activeDot={i + 1} />
				</Sequence>
			))}
			<Sequence from={outro.from} durationInFrames={outro.dur}>
				<Outro />
			</Sequence>
		</AbsoluteFill>
	);
};

export const LOOKBOOK_DURATION = COVER + (LOOK - OVERLAP) * LOOKS.length + (OUTRO - OVERLAP);
