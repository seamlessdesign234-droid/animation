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
import {FONT} from '../lib/theme';

// 1080x1920 vertical, 30fps, 1440 frames (48s).
// Caption style mirrors the reference reel: clean white sans-serif,
// slight drop shadow, centered, with a quick spring entrance.

const RCB_RED = '#d11f2d';
const RCB_GOLD = '#d4af37';
const RCB_DARK = '#0c0c0c';
const GT_NAVY = '#0a1e3c';
const GT_GOLD = '#c9a24a';

const RcbBadge: React.FC<{size: number}> = ({size}) => {
	// Stylized RCB crest: dark roundel, gold ring, gold lion silhouette, RCB wordmark.
	return (
		<svg width={size} height={size} viewBox="0 0 200 200">
			<defs>
				<radialGradient id="rcbBg" cx="50%" cy="40%" r="65%">
					<stop offset="0%" stopColor="#2a0608" />
					<stop offset="100%" stopColor={RCB_DARK} />
				</radialGradient>
			</defs>
			<circle cx="100" cy="100" r="96" fill="url(#rcbBg)" stroke={RCB_GOLD} strokeWidth="4" />
			<circle cx="100" cy="100" r="86" fill="none" stroke={RCB_RED} strokeWidth="1.5" opacity="0.7" />
			{/* Lion silhouette (simplified, rampant) */}
			<g fill={RCB_GOLD} transform="translate(100 96) scale(0.85)">
				<path d="M -38 -28 L -22 -42 L -10 -36 L -2 -52 L 6 -38 L 18 -50 L 22 -34 L 34 -42 L 30 -22 L 42 -16 L 30 -8 L 38 6 L 22 4 L 26 22 L 10 16 L 14 34 L -2 22 L -8 38 L -16 22 L -28 32 L -26 14 L -40 16 L -32 2 L -44 -8 L -34 -16 Z" />
				{/* Crown points */}
				<path d="M -22 -50 L -16 -60 L -10 -52 L -2 -64 L 6 -52 L 14 -62 L 18 -50 Z" />
			</g>
			{/* RCB wordmark */}
			<rect x="40" y="138" width="120" height="34" rx="4" fill={RCB_GOLD} />
			<text
				x="100"
				y="163"
				fill={RCB_DARK}
				fontSize="26"
				fontWeight="900"
				fontFamily={FONT}
				textAnchor="middle"
				letterSpacing="2"
			>
				RCB
			</text>
		</svg>
	);
};

const GtBadge: React.FC<{size: number}> = ({size}) => {
	// Stylized GT crest: navy roundel, gold ring, triangle + star motif, GT wordmark.
	return (
		<svg width={size} height={size} viewBox="0 0 200 200">
			<defs>
				<radialGradient id="gtBg" cx="50%" cy="40%" r="65%">
					<stop offset="0%" stopColor="#16335f" />
					<stop offset="100%" stopColor={GT_NAVY} />
				</radialGradient>
			</defs>
			<circle cx="100" cy="100" r="96" fill="url(#gtBg)" stroke={GT_GOLD} strokeWidth="4" />
			<circle cx="100" cy="100" r="86" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.25" />
			{/* Triangle outline */}
			<polygon
				points="100,32 170,142 30,142"
				fill="none"
				stroke={GT_GOLD}
				strokeWidth="4"
				strokeLinejoin="round"
			/>
			{/* Inner triangle */}
			<polygon points="100,52 152,134 48,134" fill={GT_NAVY} stroke={GT_GOLD} strokeWidth="1.5" />
			{/* GT wordmark inside triangle */}
			<text
				x="100"
				y="118"
				fill="#ffffff"
				fontSize="46"
				fontWeight="900"
				fontFamily={FONT}
				textAnchor="middle"
				letterSpacing="2"
			>
				GT
			</text>
			{/* Bottom lightning accent */}
			<polygon points="60,156 100,150 140,156 100,164" fill={GT_GOLD} />
		</svg>
	);
};

const TopBar: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const enter = spring({frame, fps, config: {damping: 18, stiffness: 120, mass: 0.8}});
	const y = interpolate(enter, [0, 1], [-160, 0]);
	const opacity = interpolate(frame, [0, 14], [0, 1], {extrapolateRight: 'clamp'});

	const vsPulse = 1 + 0.06 * Math.sin(frame / 12);

	return (
		<div
			style={{
				position: 'absolute',
				top: 0,
				left: 0,
				right: 0,
				transform: `translateY(${y}px)`,
				opacity,
				padding: '40px 48px 32px',
				background: 'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 36,
			}}
		>
			<div style={{display: 'flex', alignItems: 'center', gap: 18}}>
				<RcbBadge size={150} />
				<div style={{display: 'flex', flexDirection: 'column'}}>
					<div
						style={{
							color: '#ffffff',
							fontFamily: FONT,
							fontSize: 36,
							fontWeight: 900,
							letterSpacing: 2,
							lineHeight: 1,
							textShadow: '0 2px 10px rgba(0,0,0,0.6)',
						}}
					>
						RCB
					</div>
					<div
						style={{
							color: RCB_GOLD,
							fontFamily: FONT,
							fontSize: 14,
							fontWeight: 700,
							letterSpacing: 2,
							marginTop: 4,
							textShadow: '0 2px 6px rgba(0,0,0,0.7)',
						}}
					>
						BENGALURU
					</div>
				</div>
			</div>

			<div
				style={{
					transform: `scale(${vsPulse})`,
					color: '#ffffff',
					fontFamily: FONT,
					fontWeight: 900,
					fontSize: 52,
					letterSpacing: 2,
					textShadow: '0 3px 14px rgba(0,0,0,0.8)',
					padding: '6px 18px',
					border: '2px solid rgba(255,255,255,0.85)',
					borderRadius: 12,
				}}
			>
				VS
			</div>

			<div style={{display: 'flex', alignItems: 'center', gap: 18}}>
				<div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
					<div
						style={{
							color: '#ffffff',
							fontFamily: FONT,
							fontSize: 36,
							fontWeight: 900,
							letterSpacing: 2,
							lineHeight: 1,
							textShadow: '0 2px 10px rgba(0,0,0,0.6)',
						}}
					>
						GT
					</div>
					<div
						style={{
							color: GT_GOLD,
							fontFamily: FONT,
							fontSize: 14,
							fontWeight: 700,
							letterSpacing: 2,
							marginTop: 4,
							textShadow: '0 2px 6px rgba(0,0,0,0.7)',
						}}
					>
						GUJARAT
					</div>
				</div>
				<GtBadge size={150} />
			</div>
		</div>
	);
};

const Caption: React.FC<{text: string}> = ({text}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	// Quick scale + fade in matching the reference reel feel.
	const pop = spring({frame, fps, config: {damping: 16, stiffness: 220, mass: 0.5}});
	const scale = interpolate(pop, [0, 1], [0.9, 1]);
	const opacity = interpolate(frame, [0, 6], [0, 1], {extrapolateRight: 'clamp'});

	return (
		<div
			style={{
				transform: `scale(${scale})`,
				opacity,
				color: '#ffffff',
				fontFamily: FONT,
				fontSize: 86,
				fontWeight: 800,
				letterSpacing: -1,
				textAlign: 'center',
				lineHeight: 1.1,
				textShadow:
					'0 4px 18px rgba(0,0,0,0.85), 0 1px 0 rgba(0,0,0,0.7), 0 0 1px rgba(0,0,0,0.5)',
				padding: '0 80px',
				maxWidth: 980,
			}}
		>
			{text}
		</div>
	);
};

// Caption script. Kept short and broadcast-style: simple, professional, on-theme.
const CAPTIONS: {from: number; duration: number; text: string}[] = [
	{from: 0, duration: 150, text: 'RCB vs GT'},
	{from: 150, duration: 150, text: 'Match Day'},
	{from: 300, duration: 180, text: 'Royal Challengers\nBengaluru'},
	{from: 480, duration: 120, text: 'take on'},
	{from: 600, duration: 180, text: 'Gujarat Titans'},
	{from: 780, duration: 180, text: 'The big clash'},
	{from: 960, duration: 180, text: 'Who takes\nthe win?'},
	{from: 1140, duration: 300, text: 'RCB vs GT'},
];

const Captions: React.FC = () => {
	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				// Sit a bit below center, like the reference reel.
				paddingTop: 640,
			}}
		>
			{CAPTIONS.map((c, i) => (
				<Sequence key={i} from={c.from} durationInFrames={c.duration} layout="none">
					<AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingTop: 640}}>
						<Caption text={c.text} />
					</AbsoluteFill>
				</Sequence>
			))}
		</AbsoluteFill>
	);
};

const BottomTicker: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const enter = spring({frame, fps, config: {damping: 20, stiffness: 130, mass: 0.8}});
	const y = interpolate(enter, [0, 1], [120, 0]);
	const exitStart = durationInFrames - 20;
	const exitY = interpolate(frame, [exitStart, durationInFrames], [0, 120], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<div
			style={{
				position: 'absolute',
				left: 0,
				right: 0,
				bottom: 0,
				transform: `translateY(${y + exitY}px)`,
				padding: '24px 40px 48px',
				background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 16,
			}}
		>
			<div
				style={{
					width: 14,
					height: 14,
					borderRadius: '50%',
					background: '#ff3b3b',
					boxShadow: '0 0 12px #ff3b3b',
				}}
			/>
			<div
				style={{
					color: '#ffffff',
					fontFamily: FONT,
					fontWeight: 800,
					fontSize: 28,
					letterSpacing: 4,
				}}
			>
				LIVE
			</div>
			<div style={{width: 2, height: 26, background: 'rgba(255,255,255,0.4)', margin: '0 14px'}} />
			<div
				style={{
					color: '#ffffff',
					fontFamily: FONT,
					fontWeight: 700,
					fontSize: 26,
					letterSpacing: 2,
				}}
			>
				RCB vs GT
			</div>
			<div style={{width: 2, height: 26, background: 'rgba(255,255,255,0.4)', margin: '0 14px'}} />
			<div
				style={{
					color: RCB_GOLD,
					fontFamily: FONT,
					fontWeight: 700,
					fontSize: 22,
					letterSpacing: 3,
				}}
			>
				MATCH DAY
			</div>
		</div>
	);
};

export const RcbVsGt: React.FC = () => {
	return (
		<AbsoluteFill style={{background: '#000', fontFamily: FONT}}>
			<OffthreadVideo src={staticFile('match-video.mp4')} />
			<TopBar />
			<Captions />
			<BottomTicker />
		</AbsoluteFill>
	);
};
