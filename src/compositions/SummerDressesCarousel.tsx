import {
	AbsoluteFill,
	Img,
	interpolate,
	spring,
	staticFile,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';

// 1080x1920 vertical carousel, 30fps.
const SLIDE_DURATION = 90;
const TRANSITION_DURATION = 20;

const SERIF_FONT = 'Georgia, "Times New Roman", Times, serif';

const SLIDES = [
	staticFile('images/dress-1.jpeg'),
	staticFile('images/dress-2.jpeg'),
	staticFile('images/dress-3.jpeg'),
];

const Slide: React.FC<{src: string}> = ({src}) => (
	<AbsoluteFill style={{background: '#000000'}}>
		<Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
		<AbsoluteFill
			style={{
				background:
					'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 24%, rgba(0,0,0,0) 68%, rgba(0,0,0,0.55) 100%)',
			}}
		/>
	</AbsoluteFill>
);

const Title: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const enter = spring({frame, fps, config: {damping: 200}});
	const opacity = interpolate(enter, [0, 1], [0, 1]);
	const y = interpolate(enter, [0, 1], [-30, 0]);
	return (
		<AbsoluteFill style={{alignItems: 'center', paddingTop: 96}}>
			<div style={{opacity, transform: `translateY(${y}px)`, textAlign: 'center'}}>
				<div
					style={{
						color: '#ffffff',
						fontFamily: SERIF_FONT,
						fontSize: 28,
						fontWeight: 400,
						letterSpacing: 8,
						textTransform: 'uppercase',
						opacity: 0.85,
					}}
				>
					New Collection
				</div>
				<div
					style={{
						color: '#ffffff',
						fontFamily: SERIF_FONT,
						fontSize: 96,
						fontWeight: 600,
						letterSpacing: 2,
						marginTop: 10,
						textShadow: '0 6px 30px rgba(0,0,0,0.45)',
					}}
				>
					Summer Dresses
				</div>
				<div style={{width: 120, height: 2, background: '#ffffff', margin: '22px auto 0', opacity: 0.8}} />
			</div>
		</AbsoluteFill>
	);
};

const Dots: React.FC<{count: number}> = ({count}) => {
	const frame = useCurrentFrame();
	const step = SLIDE_DURATION - TRANSITION_DURATION;
	const active = Math.min(count - 1, Math.floor(frame / step));
	return (
		<AbsoluteFill style={{justifyContent: 'flex-end', alignItems: 'center', paddingBottom: 110}}>
			<div style={{display: 'flex', gap: 14}}>
				{new Array(count).fill(0).map((_, i) => (
					<div
						key={i}
						style={{
							width: i === active ? 28 : 10,
							height: 10,
							borderRadius: 5,
							background: i === active ? '#ffffff' : 'rgba(255,255,255,0.45)',
						}}
					/>
				))}
			</div>
		</AbsoluteFill>
	);
};

export const SummerDressesCarousel: React.FC = () => {
	return (
		<AbsoluteFill style={{background: '#000000'}}>
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={SLIDE_DURATION}>
					<Slide src={SLIDES[0]} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					timing={linearTiming({durationInFrames: TRANSITION_DURATION})}
					presentation={slide()}
				/>
				<TransitionSeries.Sequence durationInFrames={SLIDE_DURATION}>
					<Slide src={SLIDES[1]} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					timing={linearTiming({durationInFrames: TRANSITION_DURATION})}
					presentation={slide()}
				/>
				<TransitionSeries.Sequence durationInFrames={SLIDE_DURATION}>
					<Slide src={SLIDES[2]} />
				</TransitionSeries.Sequence>
			</TransitionSeries>
			<Title />
			<Dots count={SLIDES.length} />
		</AbsoluteFill>
	);
};

export const SUMMER_DRESSES_CAROUSEL_DURATION =
	SLIDE_DURATION * SLIDES.length - TRANSITION_DURATION * (SLIDES.length - 1);
