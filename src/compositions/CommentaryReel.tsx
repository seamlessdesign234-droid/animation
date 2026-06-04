import {
	AbsoluteFill,
	OffthreadVideo,
	interpolate,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {loadFont} from '@remotion/fonts';

const PLAYFAIR = 'PlayfairDisplayItalic';
const DEVANAGARI = 'NotoSansDevanagari';

loadFont({
	family: PLAYFAIR,
	url: staticFile('fonts/PlayfairDisplay-Italic.ttf'),
	weight: '700',
	style: 'italic',
});

loadFont({
	family: DEVANAGARI,
	url: staticFile('fonts/NotoSansDevanagari-Bold.woff2'),
	weight: '700',
	style: 'normal',
});

const YELLOW = '#FFD400';
const WHITE = '#FFFFFF';

type Phrase = {
	start: number;
	end: number;
	words: string[];
};

// Karaoke-style Hindi commentary phrases timed across the 22.5s (675 frame) clip.
const PHRASES: Phrase[] = [
	{start: 30, end: 105, words: ['रेट', 'के', 'दीवानों']},
	{start: 120, end: 230, words: ['विराट', 'के', 'बैट', 'से', 'विरासत']},
	{start: 250, end: 330, words: ['वक्त', 'भी', 'इनका']},
	{start: 350, end: 450, words: ['पे', 'मोहर', 'तख्त', 'की', 'मनमानी']},
	{start: 470, end: 555, words: ['बल्ले', 'की', 'ये', 'क़यामत']},
	{start: 575, end: 670, words: ['देखो', 'किंग', 'का', 'अंदाज़']},
];

const TopTitle: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const enter = spring({
		frame,
		fps,
		config: {damping: 22, stiffness: 110, mass: 0.9},
		durationInFrames: 30,
	});
	const opacity = interpolate(enter, [0, 1], [0, 1]);
	const ty = interpolate(enter, [0, 1], [-30, 0]);
	return (
		<div
			style={{
				position: 'absolute',
				top: 220,
				left: 0,
				right: 0,
				textAlign: 'center',
				opacity,
				transform: `translateY(${ty}px)`,
				fontFamily: PLAYFAIR,
				fontStyle: 'italic',
				fontWeight: 700,
				color: YELLOW,
				fontSize: 76,
				lineHeight: 1.1,
				letterSpacing: 0.5,
				textShadow:
					'0 2px 0 rgba(0,0,0,0.55), 0 6px 18px rgba(0,0,0,0.55), 0 0 30px rgba(0,0,0,0.35)',
				padding: '0 80px',
			}}
		>
			Goated Commentary by
			<br />
			Jatin Sapru
		</div>
	);
};

const Caption: React.FC<{phrase: Phrase}> = ({phrase}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const localFrame = frame - phrase.start;
	const totalFrames = phrase.end - phrase.start;
	const perWord = totalFrames / phrase.words.length;

	// Container fade in/out.
	const fadeIn = interpolate(localFrame, [0, 8], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const fadeOut = interpolate(
		localFrame,
		[totalFrames - 10, totalFrames],
		[1, 0],
		{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
	);
	const opacity = Math.min(fadeIn, fadeOut);

	// Subtle pop on entry.
	const pop = spring({
		frame: localFrame,
		fps,
		config: {damping: 14, stiffness: 180, mass: 0.7},
		durationInFrames: 18,
	});
	const scale = interpolate(pop, [0, 1], [0.92, 1]);

	// Determine the index of the word currently being "spoken".
	const activeIdx = Math.min(
		phrase.words.length - 1,
		Math.max(0, Math.floor(localFrame / perWord)),
	);

	return (
		<div
			style={{
				position: 'absolute',
				bottom: 320,
				left: 0,
				right: 0,
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				gap: 20,
				flexWrap: 'wrap',
				padding: '0 60px',
				opacity,
				transform: `scale(${scale})`,
				fontFamily: DEVANAGARI,
				fontWeight: 700,
				fontSize: 78,
				lineHeight: 1.15,
				textShadow:
					'0 3px 0 rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.65), 0 0 24px rgba(0,0,0,0.4)',
			}}
		>
			{phrase.words.map((w, i) => {
				const visible = i <= activeIdx;
				const isActive = i === activeIdx;
				return (
					<span
						key={i}
						style={{
							color: isActive ? YELLOW : WHITE,
							opacity: visible ? 1 : 0,
							transition: 'none',
						}}
					>
						{w}
					</span>
				);
			})}
		</div>
	);
};

const Captions: React.FC = () => {
	const frame = useCurrentFrame();
	const active = PHRASES.find((p) => frame >= p.start && frame <= p.end);
	if (!active) return null;
	return <Caption phrase={active} />;
};

export const CommentaryReel: React.FC = () => {
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<OffthreadVideo
				src={staticFile('commentary.mp4')}
				style={{width: '100%', height: '100%', objectFit: 'cover'}}
			/>
			<TopTitle />
			<Captions />
		</AbsoluteFill>
	);
};
