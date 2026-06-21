import {AbsoluteFill, Img} from 'remotion';

// Plain still: the title sits behind the model (she overlaps the lettering)
// while the rest of the scene (curtain, couch) stays in front of the text.
// `personSrc` is a background-removed cutout of the same photo, aligned
// pixel-for-pixel with `src`, layered on top of the title.
const SERIF_FONT = 'Georgia, "Times New Roman", Times, serif';

export const SummerDressesPhoto: React.FC<{src: string; personSrc: string}> = ({src, personSrc}) => {
	return (
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
};
