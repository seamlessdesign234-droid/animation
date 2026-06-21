import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {linearTiming, TransitionSeries} from '@remotion/transitions';
import {slide} from '@remotion/transitions/slide';

// 1080x1920 vertical carousel, 30fps.
const SLIDE_DURATION = 90;
const TRANSITION_DURATION = 20;

const SERIF_FONT = 'Georgia, "Times New Roman", Times, serif';

const SLIDES = [
	{src: staticFile('images/dress-1.jpeg'), personSrc: staticFile('images/dress-1-person.png')},
	{src: staticFile('images/dress-2.jpeg'), personSrc: staticFile('images/dress-2-person.png')},
	{src: staticFile('images/dress-3.jpeg'), personSrc: staticFile('images/dress-3-person.png')},
];

// The title sits behind the model (she overlaps the lettering) while the
// rest of the scene (curtain, couch) stays in front of the text.
// `personSrc` is a background-removed cutout of the same photo, aligned
// pixel-for-pixel with `src`, layered on top of the title.
const Slide: React.FC<{src: string; personSrc: string}> = ({src, personSrc}) => (
	<AbsoluteFill style={{background: '#000000'}}>
		<Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
		<AbsoluteFill style={{alignItems: 'center', paddingTop: 96}}>
			<div
				style={{
					color: '#ffffff',
					fontFamily: SERIF_FONT,
					fontSize: 28,
					fontWeight: 400,
					letterSpacing: 8,
					textTransform: 'uppercase',
					textShadow: '0 2px 10px rgba(0,0,0,0.6)',
				}}
			>
				New Collection
			</div>
		</AbsoluteFill>
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: 40}}>
			<div
				style={{
					color: '#241910',
					fontFamily: SERIF_FONT,
					fontWeight: 700,
					fontSize: 150,
					lineHeight: 1.02,
					letterSpacing: 4,
					textTransform: 'uppercase',
					textAlign: 'center',
					opacity: 0.92,
				}}
			>
				Summer<br />Dresses
			</div>
		</AbsoluteFill>
		<Img src={personSrc} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
	</AbsoluteFill>
);

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
					<Slide src={SLIDES[0].src} personSrc={SLIDES[0].personSrc} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					timing={linearTiming({durationInFrames: TRANSITION_DURATION})}
					presentation={slide()}
				/>
				<TransitionSeries.Sequence durationInFrames={SLIDE_DURATION}>
					<Slide src={SLIDES[1].src} personSrc={SLIDES[1].personSrc} />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					timing={linearTiming({durationInFrames: TRANSITION_DURATION})}
					presentation={slide()}
				/>
				<TransitionSeries.Sequence durationInFrames={SLIDE_DURATION}>
					<Slide src={SLIDES[2].src} personSrc={SLIDES[2].personSrc} />
				</TransitionSeries.Sequence>
			</TransitionSeries>
			<Dots count={SLIDES.length} />
		</AbsoluteFill>
	);
};

export const SUMMER_DRESSES_CAROUSEL_DURATION =
	SLIDE_DURATION * SLIDES.length - TRANSITION_DURATION * (SLIDES.length - 1);
