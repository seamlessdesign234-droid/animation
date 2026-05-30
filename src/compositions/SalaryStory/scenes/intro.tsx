import {
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';
import {C, FONT, springs} from '../theme';
import {Scene, FadeIn} from '../components/common';
import {JacobAvatar} from '../components/JacobAvatar';
import {TextReveal} from '../components/TextReveal';

// S01 — Channel bumper (~2s): Jacob slides in, channel name, wipes away.
export const S01_Bumper: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps, durationInFrames} = useVideoConfig();
	const enter = spring({frame, fps, config: springs.snappy});
	const x = interpolate(enter, [0, 1], [-500, 0]);
	// wipe away near the end
	const exit = interpolate(frame, [durationInFrames - 16, durationInFrames - 2], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const wipeX = exit * 2200;
	return (
		<Scene theme="dark">
			<div style={{display: 'flex', alignItems: 'center', gap: 40, transform: `translateX(${x - wipeX}px)`}}>
				<JacobAvatar size={300} />
				<div>
					<div style={{fontSize: 96, fontWeight: 900, color: C.white, letterSpacing: -1}}>
						Money, Simply
					</div>
					<div style={{fontSize: 40, fontWeight: 600, color: C.gold, letterSpacing: 4}}>
						WITH JACOB
					</div>
				</div>
			</div>
		</Scene>
	);
};

// S02 — Title card (~3s): big title typed/revealed word by word.
export const S02_Title: React.FC = () => {
	return (
		<Scene>
			<div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30}}>
				<FadeIn delay={2}>
					<div style={{width: 90, height: 6, background: C.gold, borderRadius: 3}} />
				</FadeIn>
				<TextReveal
					text="Two people. Same salary. 30 years."
					fontSize={120}
					weight={900}
					stagger={7}
					maxWidth={1500}
					color={C.ink}
				/>
				<FadeIn delay={40}>
					<div style={{fontSize: 40, fontWeight: 500, color: C.sub, fontFamily: FONT}}>
						One ends up a millionaire. The other doesn't.
					</div>
				</FadeIn>
			</div>
		</Scene>
	);
};
