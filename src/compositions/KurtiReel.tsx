import {
	AbsoluteFill,
	OffthreadVideo,
	Sequence,
	interpolate,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

// Vertical reel: 1080x1920 @ 30fps. 720 frames = 24s.
// Trendy display font stack (Impact/Bebas-like fallback for bold reel captions).
const DISPLAY_FONT =
	'"Bebas Neue", "Oswald", "Impact", "Helvetica Neue", Helvetica, Arial, sans-serif';
const BODY_FONT =
	'"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

// Warm fashion palette
const C = {
	cream: '#fff7ed',
	saffron: '#f59e0b',
	terracotta: '#c2410c',
	gold: '#fbbf24',
	ink: '#1c1917',
	rose: '#fb7185',
	plum: '#7c2d6f',
};

// ----- Reusable bits -----

const Vignette: React.FC<{strength?: number}> = ({strength = 0.55}) => (
	<AbsoluteFill
		style={{
			background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${strength}) 100%)`,
			pointerEvents: 'none',
		}}
	/>
);

const TopGradient: React.FC = () => (
	<AbsoluteFill
		style={{
			background:
				'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0) 78%, rgba(0,0,0,0.7) 100%)',
			pointerEvents: 'none',
		}}
	/>
);

// Top progress dots, like Instagram/TikTok story progress.
const ProgressDots: React.FC<{count: number; activeIndex: number; progress: number}> = ({
	count,
	activeIndex,
	progress,
}) => {
	return (
		<div
			style={{
				position: 'absolute',
				top: 40,
				left: 40,
				right: 40,
				display: 'flex',
				gap: 8,
				zIndex: 50,
			}}
		>
			{new Array(count).fill(0).map((_, i) => {
				const fill = i < activeIndex ? 1 : i === activeIndex ? progress : 0;
				return (
					<div
						key={i}
						style={{
							flex: 1,
							height: 5,
							borderRadius: 3,
							background: 'rgba(255,255,255,0.28)',
							overflow: 'hidden',
						}}
					>
						<div
							style={{
								width: `${fill * 100}%`,
								height: '100%',
								background: '#ffffff',
								borderRadius: 3,
							}}
						/>
					</div>
				);
			})}
		</div>
	);
};

const BrandMark: React.FC = () => (
	<div
		style={{
			position: 'absolute',
			top: 70,
			left: 0,
			right: 0,
			display: 'flex',
			justifyContent: 'center',
			zIndex: 40,
		}}
	>
		<div
			style={{
				color: C.cream,
				fontFamily: DISPLAY_FONT,
				fontSize: 36,
				letterSpacing: 8,
				fontWeight: 700,
				textShadow: '0 2px 12px rgba(0,0,0,0.6)',
			}}
		>
			MEHER · STUDIO
		</div>
	</div>
);

// Big animated caption block used on each clip.
const Caption: React.FC<{
	kicker?: string;
	title: string;
	accent?: string;
	position?: 'bottom' | 'center' | 'top';
}> = ({kicker, title, accent = C.gold, position = 'bottom'}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const enter = spring({frame, fps, config: {damping: 16, stiffness: 140, mass: 0.7}});
	const y = interpolate(enter, [0, 1], [80, 0]);
	const opacity = interpolate(frame, [0, 8], [0, 1], {extrapolateRight: 'clamp'});

	const justify =
		position === 'bottom' ? 'flex-end' : position === 'top' ? 'flex-start' : 'center';
	const pad =
		position === 'bottom' ? {paddingBottom: 260} : position === 'top' ? {paddingTop: 260} : {};

	return (
		<AbsoluteFill
			style={{justifyContent: justify, alignItems: 'center', ...pad}}
		>
			<div
				style={{
					transform: `translateY(${y}px)`,
					opacity,
					textAlign: 'center',
					padding: '0 60px',
				}}
			>
				{kicker ? (
					<div
						style={{
							display: 'inline-block',
							background: accent,
							color: C.ink,
							fontFamily: DISPLAY_FONT,
							fontWeight: 700,
							fontSize: 36,
							letterSpacing: 6,
							padding: '10px 22px',
							borderRadius: 6,
							marginBottom: 24,
							boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
						}}
					>
						{kicker}
					</div>
				) : null}
				<div
					style={{
						color: C.cream,
						fontFamily: DISPLAY_FONT,
						fontWeight: 700,
						fontSize: 150,
						lineHeight: 0.92,
						letterSpacing: 1,
						textShadow:
							'0 4px 24px rgba(0,0,0,0.65), 0 2px 6px rgba(0,0,0,0.5)',
						textTransform: 'uppercase',
					}}
				>
					{title}
				</div>
			</div>
		</AbsoluteFill>
	);
};

// Clip wrapper: Ken Burns zoom on the video + optional film-cut flash.
const Clip: React.FC<{
	src: string;
	startFrom?: number;
	zoomFrom?: number;
	zoomTo?: number;
	durationInFrames: number;
	children?: React.ReactNode;
}> = ({src, startFrom = 0, zoomFrom = 1.05, zoomTo = 1.18, durationInFrames, children}) => {
	const frame = useCurrentFrame();
	const scale = interpolate(frame, [0, durationInFrames], [zoomFrom, zoomTo], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	// Quick cut-in flash
	const flash = interpolate(frame, [0, 4, 9], [0.85, 0.0, 0.0], {
		extrapolateRight: 'clamp',
	});
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{overflow: 'hidden'}}>
				<div
					style={{
						width: '100%',
						height: '100%',
						transform: `scale(${scale})`,
						transformOrigin: 'center center',
					}}
				>
					<OffthreadVideo
						src={src}
						startFrom={startFrom}
						muted
						style={{width: '100%', height: '100%', objectFit: 'cover'}}
					/>
				</div>
			</AbsoluteFill>
			<AbsoluteFill style={{background: '#ffffff', opacity: flash, pointerEvents: 'none'}} />
			<TopGradient />
			<Vignette />
			{children}
		</AbsoluteFill>
	);
};

// Diagonal wipe transition overlay (white bar sweeps).
const WipeOut: React.FC = () => {
	const frame = useCurrentFrame();
	const x = interpolate(frame, [0, 8], [-1400, 1800], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return (
		<AbsoluteFill style={{pointerEvents: 'none', overflow: 'hidden'}}>
			<div
				style={{
					position: 'absolute',
					top: -200,
					left: x,
					width: 2400,
					height: 2400,
					background: C.cream,
					transform: 'rotate(15deg)',
				}}
			/>
		</AbsoluteFill>
	);
};

// Opening hook
const Hook: React.FC<{duration: number}> = ({duration}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = spring({frame, fps, config: {damping: 10, stiffness: 220, mass: 0.6}});
	const scale = interpolate(pop, [0, 1], [0.6, 1]);
	const shake = interpolate(frame, [10, 14, 30, 36], [0, 14, 14, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const dx = Math.sin(frame * 1.3) * shake;
	const dy = Math.cos(frame * 1.7) * shake * 0.5;
	const exit = interpolate(frame, [duration - 18, duration - 2], [0, -1600], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const exitOpacity = interpolate(frame, [duration - 16, duration - 4], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return (
		<AbsoluteFill
			style={{justifyContent: 'center', alignItems: 'center', pointerEvents: 'none'}}
		>
			<div
				style={{
					transform: `translate(${dx + exit}px, ${dy}px) scale(${scale}) rotate(-3deg)`,
					opacity: exitOpacity,
					background: C.terracotta,
					padding: '36px 56px',
					borderRadius: 22,
					boxShadow: '0 30px 90px rgba(194,65,12,0.55)',
					border: `4px solid ${C.gold}`,
				}}
			>
				<div
					style={{
						color: C.cream,
						fontFamily: DISPLAY_FONT,
						fontWeight: 700,
						fontSize: 140,
						lineHeight: 0.95,
						letterSpacing: 2,
						textAlign: 'center',
						textTransform: 'uppercase',
					}}
				>
					Stop
					<br />
					Scrolling
				</div>
				<div
					style={{
						color: C.gold,
						fontFamily: BODY_FONT,
						fontWeight: 700,
						fontSize: 42,
						letterSpacing: 6,
						textAlign: 'center',
						marginTop: 12,
					}}
				>
					✦ NEW KURTI DROP ✦
				</div>
			</div>
		</AbsoluteFill>
	);
};

// Final CTA card
const CTA: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pop = spring({frame, fps, config: {damping: 11, stiffness: 170, mass: 0.7}});
	const scale = interpolate(pop, [0, 1], [0.5, 1]);
	const pulse = 1 + 0.04 * Math.sin(frame / 5);
	const swipeIn = interpolate(
		spring({frame, fps, config: {damping: 18, stiffness: 100}}),
		[0, 1],
		[1400, 0]
	);

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				background:
					'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.15) 50%, rgba(0,0,0,0.7) 100%)',
			}}
		>
			<div
				style={{
					transform: `translateX(${swipeIn}px)`,
					color: C.cream,
					fontFamily: BODY_FONT,
					fontWeight: 600,
					fontSize: 44,
					letterSpacing: 8,
					marginBottom: 28,
					textTransform: 'uppercase',
					textShadow: '0 2px 12px rgba(0,0,0,0.7)',
				}}
			>
				Limited Edition
			</div>
			<div
				style={{
					transform: `scale(${scale})`,
					color: C.cream,
					fontFamily: DISPLAY_FONT,
					fontWeight: 700,
					fontSize: 220,
					lineHeight: 0.9,
					letterSpacing: 2,
					textAlign: 'center',
					textShadow: '0 6px 30px rgba(0,0,0,0.6)',
					textTransform: 'uppercase',
				}}
			>
				Shop
				<br />
				Now
			</div>
			<div
				style={{
					transform: `scale(${scale * pulse})`,
					marginTop: 50,
					background: `linear-gradient(90deg, ${C.saffron}, ${C.rose})`,
					padding: '28px 62px',
					borderRadius: 999,
					boxShadow: '0 22px 60px rgba(251,113,133,0.55)',
				}}
			>
				<div
					style={{
						color: C.cream,
						fontFamily: BODY_FONT,
						fontWeight: 800,
						fontSize: 50,
						letterSpacing: 2,
					}}
				>
					Link in Bio →
				</div>
			</div>
			<div
				style={{
					transform: `translateX(${-swipeIn}px)`,
					marginTop: 60,
					color: C.gold,
					fontFamily: DISPLAY_FONT,
					fontWeight: 700,
					fontSize: 56,
					letterSpacing: 12,
					textShadow: '0 2px 12px rgba(0,0,0,0.6)',
				}}
			>
				MEHER · STUDIO
			</div>
		</AbsoluteFill>
	);
};

// ----- Composition timeline -----

type Segment = {
	src: string;
	startFrom: number;
	dur: number;
	kicker?: string;
	title: string;
	accent?: string;
	zoomFrom?: number;
	zoomTo?: number;
	position?: 'bottom' | 'center' | 'top';
};

const HOOK_DUR = 75; // 2.5s
const SEGMENTS: Segment[] = [
	// Opening hero shot under the hook caption
	{
		src: 'kurti/clip2-garden-a.mp4',
		startFrom: 10,
		dur: HOOK_DUR + 60, // hook + lingering shot
		title: '',
		zoomFrom: 1.1,
		zoomTo: 1.25,
	},
	{
		src: 'kurti/clip1-blockprint.mp4',
		startFrom: 30,
		dur: 135,
		kicker: '01 / BLOCK PRINT',
		title: 'Hand\nBlocked\nBeauty',
		accent: C.gold,
		zoomFrom: 1.04,
		zoomTo: 1.16,
		position: 'bottom',
	},
	{
		src: 'kurti/clip3-patterned.mp4',
		startFrom: 20,
		dur: 135,
		kicker: '02 / STATEMENT',
		title: 'Bold\nPatterns',
		accent: C.rose,
		zoomFrom: 1.05,
		zoomTo: 1.18,
		position: 'bottom',
	},
	{
		src: 'kurti/clip4-garden-b.mp4',
		startFrom: 10,
		dur: 120,
		kicker: '03 / ALL DAY',
		title: 'Effort\nless\nGrace',
		accent: C.saffron,
		zoomFrom: 1.06,
		zoomTo: 1.18,
		position: 'bottom',
	},
	{
		src: 'kurti/clip5-garden-c.mp4',
		startFrom: 20,
		dur: 150, // ends with CTA on top
		kicker: '04 / FINALE',
		title: 'Made\nFor You',
		accent: C.gold,
		zoomFrom: 1.05,
		zoomTo: 1.2,
		position: 'bottom',
	},
];

const CTA_DUR = 90; // 3s end card

const TOTAL =
	SEGMENTS.reduce((a, s) => a + s.dur, 0) + CTA_DUR;

export const KURTI_REEL_DURATION = TOTAL;

export const KurtiReel: React.FC = () => {
	const frame = useCurrentFrame();

	// Compute segment offsets for progress dots
	const offsets: number[] = [];
	let acc = 0;
	for (const s of SEGMENTS) {
		offsets.push(acc);
		acc += s.dur;
	}
	const ctaStart = acc;

	// active progress index (excluding the hook segment)
	let activeIndex = 0;
	let progress = 0;
	if (frame >= ctaStart) {
		activeIndex = SEGMENTS.length; // all filled, CTA active
		progress = Math.min(1, (frame - ctaStart) / CTA_DUR);
	} else {
		for (let i = 0; i < SEGMENTS.length; i++) {
			const start = offsets[i];
			const end = start + SEGMENTS[i].dur;
			if (frame >= start && frame < end) {
				activeIndex = i;
				progress = (frame - start) / SEGMENTS[i].dur;
				break;
			}
		}
	}

	return (
		<AbsoluteFill style={{background: C.ink, fontFamily: BODY_FONT}}>
			{/* Render each segment */}
			{SEGMENTS.map((seg, i) => {
				const from = offsets[i];
				return (
					<Sequence key={i} from={from} durationInFrames={seg.dur} layout="none">
						<Clip
							src={staticFile(seg.src)}
							startFrom={seg.startFrom}
							durationInFrames={seg.dur}
							zoomFrom={seg.zoomFrom}
							zoomTo={seg.zoomTo}
						>
							{i === 0 ? (
								<Sequence durationInFrames={HOOK_DUR} layout="none">
									<Hook duration={HOOK_DUR} />
								</Sequence>
							) : null}
							{seg.title ? (
								<Caption
									kicker={seg.kicker}
									title={seg.title}
									accent={seg.accent}
									position={seg.position}
								/>
							) : null}
							{/* Outgoing wipe in the last 10 frames of each non-final segment */}
							{i < SEGMENTS.length - 1 ? (
								<Sequence from={seg.dur - 10} durationInFrames={10} layout="none">
									<WipeOut />
								</Sequence>
							) : null}
						</Clip>
					</Sequence>
				);
			})}

			{/* Final CTA */}
			<Sequence from={ctaStart} durationInFrames={CTA_DUR} layout="none">
				<AbsoluteFill>
					<Clip
						src={staticFile('kurti/clip5-garden-c.mp4')}
						startFrom={140}
						durationInFrames={CTA_DUR}
						zoomFrom={1.15}
						zoomTo={1.35}
					>
						<CTA />
					</Clip>
				</AbsoluteFill>
			</Sequence>

			{/* Overlays that persist across the reel */}
			<BrandMark />
			<ProgressDots
				count={SEGMENTS.length + 1}
				activeIndex={activeIndex}
				progress={progress}
			/>
		</AbsoluteFill>
	);
};
