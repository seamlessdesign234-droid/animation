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

// 1080x1920 vertical, 30fps, 48s = 1440 frames.

const RCB_RED = '#E2231A';
const RCB_RED_DEEP = '#8a0d08';
const GOLD = '#F5C518';
const INK = '#0a0a14';

type Caption = {
	from: number;
	duration: number;
	text: string;
	emphasis?: string;
};

// Captions distributed across the 48s video so they read like broadcast subtitles.
const CAPTIONS: Caption[] = [
	{from: 0, duration: 75, text: 'Namaste dosto! Main hoon Aanya'},
	{from: 75, duration: 90, text: 'Aaj baat karenge IPL ke sabse bade clash ki'},
	{from: 165, duration: 75, text: 'RCB vs Gujarat Titans', emphasis: 'RCB vs GT'},
	{from: 240, duration: 90, text: 'Ek taraf — strong team, disciplined bowling'},
	{from: 330, duration: 75, text: 'Powerful batting line up'},
	{from: 405, duration: 90, text: 'Lekin doston... aaj ka din RCB ka hai!'},
	{from: 495, duration: 75, text: 'Aur main kyun keh rahi hoon yeh?'},
	{from: 570, duration: 105, text: 'Kyunki RCB sirf ek team nahi — yeh ek emotion hai'},
	{from: 675, duration: 75, text: 'Meri prediction sun lo'},
	{from: 750, duration: 90, text: 'Aaj RCB ki batting fire pe hogi'},
	{from: 840, duration: 90, text: 'Top order karega dhmaakaa'},
	{from: 930, duration: 90, text: 'Toh RCB fans — tayaar ho jao!'},
	{from: 1020, duration: 90, text: 'Jersey pehno, Josh high rakho'},
	{from: 1110, duration: 90, text: 'Support karo apni team ko'},
	{from: 1200, duration: 105, text: 'RCB wins tonight! Ee Sala Cup Namde!', emphasis: 'PREDICTION'},
	{from: 1305, duration: 75, text: 'Like karo, share karo dosto ke saath'},
	{from: 1380, duration: 60, text: 'Milte hain next video mein!'},
];

const SECTIONS: {from: number; to: number; label: string}[] = [
	{from: 0, to: 240, label: 'INTRO'},
	{from: 240, to: 615, label: 'MATCHUP'},
	{from: 615, to: 1110, label: 'PREDICTION'},
	{from: 1110, to: 1440, label: 'CALL TO ACTION'},
];

const Vignette: React.FC = () => (
	<AbsoluteFill
		style={{
			background:
				'radial-gradient(ellipse at center, rgba(0,0,0,0) 35%, rgba(0,0,0,0.55) 100%)',
			pointerEvents: 'none',
		}}
	/>
);

const TopBar: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const enter = spring({frame, fps, config: {damping: 22, stiffness: 130}, durationInFrames: 25});
	const y = interpolate(enter, [0, 1], [-160, 0]);

	const sec = SECTIONS.find((s) => frame >= s.from && frame < s.to) ?? SECTIONS[0];
	const sectionProgress = (frame - sec.from) / Math.max(1, sec.to - sec.from);
	const barFill = interpolate(sectionProgress, [0, 1], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill style={{transform: `translateY(${y}px)`}}>
			<div
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					padding: '36px 48px 28px',
					background:
						'linear-gradient(180deg, rgba(10,10,20,0.92) 0%, rgba(10,10,20,0.55) 75%, rgba(10,10,20,0) 100%)',
				}}
			>
				<div style={{display: 'flex', alignItems: 'center', gap: 18}}>
					<div
						style={{
							width: 14,
							height: 14,
							borderRadius: '50%',
							background: RCB_RED,
							boxShadow: `0 0 18px ${RCB_RED}`,
						}}
					/>
					<div
						style={{
							color: '#fff',
							fontFamily: FONT,
							fontWeight: 800,
							fontSize: 30,
							letterSpacing: 3,
						}}
					>
						LIVE
					</div>
					<div
						style={{
							flex: 1,
							color: GOLD,
							fontFamily: FONT,
							fontWeight: 800,
							fontSize: 28,
							letterSpacing: 4,
							textAlign: 'right',
						}}
					>
						IPL · MATCH PREVIEW
					</div>
				</div>
				<div style={{display: 'flex', alignItems: 'center', gap: 24, marginTop: 22}}>
					<div
						style={{
							color: '#fff',
							fontFamily: FONT,
							fontWeight: 900,
							fontSize: 72,
							letterSpacing: -1,
							lineHeight: 1,
						}}
					>
						RCB
					</div>
					<div
						style={{
							color: GOLD,
							fontFamily: FONT,
							fontWeight: 800,
							fontSize: 40,
							letterSpacing: 2,
						}}
					>
						VS
					</div>
					<div
						style={{
							color: '#fff',
							fontFamily: FONT,
							fontWeight: 900,
							fontSize: 72,
							letterSpacing: -1,
							lineHeight: 1,
						}}
					>
						GT
					</div>
				</div>
				<div
					style={{
						marginTop: 22,
						display: 'flex',
						alignItems: 'center',
						gap: 18,
					}}
				>
					<div
						style={{
							color: '#fff',
							opacity: 0.85,
							fontFamily: FONT,
							fontSize: 22,
							fontWeight: 700,
							letterSpacing: 4,
							minWidth: 220,
						}}
					>
						{sec.label}
					</div>
					<div
						style={{
							flex: 1,
							height: 4,
							borderRadius: 2,
							background: 'rgba(255,255,255,0.18)',
							overflow: 'hidden',
						}}
					>
						<div
							style={{
								width: `${barFill * 100}%`,
								height: '100%',
								background: `linear-gradient(90deg, ${RCB_RED}, ${GOLD})`,
							}}
						/>
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

const LowerThird: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	// Visible after intro overlay only, then exits before the second caption settles.
	const inEnter = spring({frame: frame - 78, fps, config: {damping: 20, stiffness: 140}, durationInFrames: 22});
	const inExit = interpolate(frame, [175, 205], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

	const visible = inEnter * inExit;
	if (visible < 0.02) return null;

	const x = interpolate(visible, [0, 1], [-700, 0]);

	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 340,
					transform: `translateX(${x}px)`,
					display: 'flex',
					alignItems: 'stretch',
					boxShadow: '0 18px 60px rgba(0,0,0,0.5)',
				}}
			>
				<div
					style={{
						width: 14,
						background: `linear-gradient(180deg, ${RCB_RED}, ${RCB_RED_DEEP})`,
					}}
				/>
				<div
					style={{
						background: 'rgba(10,10,20,0.88)',
						backdropFilter: 'blur(8px)',
						padding: '24px 40px 26px',
						borderTop: `2px solid ${GOLD}`,
						borderBottom: `2px solid ${GOLD}`,
					}}
				>
					<div
						style={{
							color: GOLD,
							fontFamily: FONT,
							fontWeight: 800,
							fontSize: 24,
							letterSpacing: 4,
						}}
					>
						HOST · ANALYST
					</div>
					<div
						style={{
							color: '#fff',
							fontFamily: FONT,
							fontWeight: 900,
							fontSize: 64,
							letterSpacing: -1,
							lineHeight: 1.05,
							marginTop: 6,
						}}
					>
						AANYA
					</div>
					<div
						style={{
							color: '#cfd6e4',
							fontFamily: FONT,
							fontWeight: 600,
							fontSize: 24,
							letterSpacing: 1,
							marginTop: 8,
						}}
					>
						RCB Match Prediction
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

const CaptionCard: React.FC<{caption: Caption}> = ({caption}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const enter = spring({frame, fps, config: {damping: 22, stiffness: 160, mass: 0.7}, durationInFrames: 14});
	const exit = interpolate(frame, [caption.duration - 10, caption.duration], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const visible = enter * exit;
	const y = interpolate(visible, [0, 1], [70, 0]);
	const opacity = visible;

	return (
		<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 280}}>
			<div
				style={{
					transform: `translateY(${y}px)`,
					opacity,
					maxWidth: 940,
					padding: '28px 44px',
					background: 'rgba(10,10,20,0.82)',
					backdropFilter: 'blur(10px)',
					border: `2px solid ${GOLD}`,
					borderRadius: 18,
					boxShadow: '0 24px 80px rgba(0,0,0,0.55)',
					position: 'relative',
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: 28,
						top: -18,
						background: RCB_RED,
						color: '#fff',
						fontFamily: FONT,
						fontWeight: 900,
						fontSize: 22,
						letterSpacing: 3,
						padding: '6px 16px',
						borderRadius: 6,
						boxShadow: `0 6px 18px ${RCB_RED}55`,
					}}
				>
					{caption.emphasis ?? 'AANYA SAYS'}
				</div>
				<div
					style={{
						color: '#fff',
						fontFamily: FONT,
						fontWeight: 800,
						fontSize: 56,
						lineHeight: 1.18,
						textAlign: 'center',
						letterSpacing: -0.5,
					}}
				>
					{caption.text}
				</div>
			</div>
		</AbsoluteFill>
	);
};

const ScoreTicker: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const enter = spring({frame: frame - 30, fps, config: {damping: 22, stiffness: 130}, durationInFrames: 22});
	const exit = interpolate(frame, [1410, 1440], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const visible = enter * exit;
	const y = interpolate(visible, [0, 1], [180, 0]);

	// Subtle scrolling marquee text inside the ticker.
	const scroll = (frame * 2.4) % 1200;
	const marquee = 'EE SALA CUP NAMDE  ·  RCB ARMY  ·  CHINNASWAMY ROARS  ·  KING KOHLI  ·  ';

	return (
		<AbsoluteFill style={{pointerEvents: 'none'}}>
			<div
				style={{
					position: 'absolute',
					left: 0,
					right: 0,
					bottom: 0,
					transform: `translateY(${y}px)`,
					background: `linear-gradient(180deg, rgba(10,10,20,0) 0%, rgba(10,10,20,0.95) 35%, ${INK} 100%)`,
					paddingTop: 40,
				}}
			>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: 0,
						background: `linear-gradient(90deg, ${RCB_RED_DEEP} 0%, ${RCB_RED} 50%, ${RCB_RED_DEEP} 100%)`,
						borderTop: `3px solid ${GOLD}`,
						borderBottom: `3px solid ${GOLD}`,
						height: 96,
						overflow: 'hidden',
					}}
				>
					<div
						style={{
							background: '#000',
							color: GOLD,
							fontFamily: FONT,
							fontWeight: 900,
							fontSize: 32,
							letterSpacing: 4,
							padding: '0 28px',
							height: '100%',
							display: 'flex',
							alignItems: 'center',
						}}
					>
						IPL FEED
					</div>
					<div
						style={{
							flex: 1,
							overflow: 'hidden',
							position: 'relative',
							height: '100%',
						}}
					>
						<div
							style={{
								position: 'absolute',
								whiteSpace: 'nowrap',
								left: -scroll,
								top: 0,
								height: '100%',
								display: 'flex',
								alignItems: 'center',
								color: '#fff',
								fontFamily: FONT,
								fontWeight: 800,
								fontSize: 32,
								letterSpacing: 3,
							}}
						>
							{marquee.repeat(6)}
						</div>
					</div>
				</div>
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						padding: '18px 40px 28px',
					}}
				>
					<div style={{display: 'flex', alignItems: 'center', gap: 16}}>
						<div
							style={{
								background: RCB_RED,
								color: '#fff',
								fontFamily: FONT,
								fontWeight: 900,
								fontSize: 26,
								letterSpacing: 2,
								padding: '8px 14px',
								borderRadius: 6,
							}}
						>
							RCB
						</div>
						<div
							style={{
								color: '#fff',
								fontFamily: FONT,
								fontWeight: 800,
								fontSize: 26,
								letterSpacing: 2,
							}}
						>
							HOME · CHINNASWAMY
						</div>
					</div>
					<div
						style={{
							color: GOLD,
							fontFamily: FONT,
							fontWeight: 900,
							fontSize: 26,
							letterSpacing: 4,
						}}
					>
						TONIGHT · 7:30 PM
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

const IntroOverlay: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const enter = spring({frame, fps, config: {damping: 18, stiffness: 110}, durationInFrames: 26});
	const exit = interpolate(frame, [55, 75], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const visible = enter * exit;
	if (visible < 0.02) return null;

	const slide = interpolate(visible, [0, 1], [80, 0]);

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				background: `rgba(10,10,20,${0.55 * visible})`,
			}}
		>
			<div style={{transform: `translateY(${slide}px)`, opacity: visible, textAlign: 'center'}}>
				<div
					style={{
						color: GOLD,
						fontFamily: FONT,
						fontWeight: 800,
						fontSize: 34,
						letterSpacing: 8,
					}}
				>
					IPL MATCH PREDICTION
				</div>
				<div
					style={{
						color: '#fff',
						fontFamily: FONT,
						fontWeight: 900,
						fontSize: 150,
						letterSpacing: -3,
						lineHeight: 1,
						marginTop: 20,
						textShadow: `0 12px 40px ${RCB_RED}aa`,
					}}
				>
					RCB
					<span style={{color: GOLD, margin: '0 24px'}}>vs</span>
					GT
				</div>
				<div
					style={{
						display: 'inline-block',
						marginTop: 24,
						padding: '14px 28px',
						background: RCB_RED,
						color: '#fff',
						fontFamily: FONT,
						fontWeight: 900,
						fontSize: 36,
						letterSpacing: 6,
						borderRadius: 10,
						boxShadow: `0 18px 50px ${RCB_RED}80`,
					}}
				>
					EE SALA CUP NAMDE
				</div>
			</div>
		</AbsoluteFill>
	);
};

const OutroOverlay: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const local = frame - 1320;
	const enter = spring({frame: local, fps, config: {damping: 18, stiffness: 110}, durationInFrames: 26});
	const exit = interpolate(frame, [1430, 1440], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const visible = enter * exit;
	if (visible < 0.02) return null;

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'center',
				alignItems: 'center',
				background: `rgba(10,10,20,${0.6 * visible})`,
			}}
		>
			<div style={{opacity: visible, textAlign: 'center'}}>
				<div
					style={{
						color: GOLD,
						fontFamily: FONT,
						fontWeight: 800,
						fontSize: 34,
						letterSpacing: 8,
					}}
				>
					FINAL CALL
				</div>
				<div
					style={{
						color: '#fff',
						fontFamily: FONT,
						fontWeight: 900,
						fontSize: 140,
						letterSpacing: -3,
						lineHeight: 1,
						marginTop: 16,
					}}
				>
					RCB
					<br />
					<span style={{color: GOLD}}>WINS</span>
					<br />
					TONIGHT
				</div>
				<div
					style={{
						marginTop: 36,
						color: '#cfd6e4',
						fontFamily: FONT,
						fontWeight: 700,
						fontSize: 30,
						letterSpacing: 4,
					}}
				>
					LIKE · SHARE · SUBSCRIBE
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const RcbPrediction: React.FC = () => {
	return (
		<AbsoluteFill style={{background: INK}}>
			<AbsoluteFill>
				<OffthreadVideo src={staticFile('aanya.mp4')} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
			</AbsoluteFill>
			<Vignette />
			<TopBar />
			<LowerThird />
			<ScoreTicker />
			{CAPTIONS.map((c, i) => (
				<Sequence key={i} from={c.from} durationInFrames={c.duration}>
					<CaptionCard caption={c} />
				</Sequence>
			))}
			<IntroOverlay />
			<OutroOverlay />
		</AbsoluteFill>
	);
};
