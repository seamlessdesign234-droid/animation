import {AbsoluteFill, Img} from 'remotion';

// Plain still: photo with the "Summer Dresses" title directly on top, no
// carousel chrome (no gradient bar, no dots).
const SERIF_FONT = 'Georgia, "Times New Roman", Times, serif';

export const SummerDressesPhoto: React.FC<{src: string}> = ({src}) => {
	return (
		<AbsoluteFill style={{background: '#000000'}}>
			<Img src={src} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
			<AbsoluteFill style={{alignItems: 'center', paddingTop: 96}}>
				<div style={{textAlign: 'center'}}>
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
					<div
						style={{
							color: '#ffffff',
							fontFamily: SERIF_FONT,
							fontSize: 96,
							fontWeight: 600,
							letterSpacing: 2,
							marginTop: 10,
							textShadow: '0 6px 30px rgba(0,0,0,0.6)',
						}}
					>
						Summer Dresses
					</div>
					<div style={{width: 120, height: 2, background: '#ffffff', margin: '22px auto 0'}} />
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
