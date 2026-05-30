import {OffthreadVideo, staticFile, useVideoConfig} from 'remotion';
import {C, FONT} from '../theme';

// Flat 2D Jacob fallback (navy suit, gold-stripe tie) — used if the
// avatar video is unavailable. Kept deterministic and self-contained.
const FlatJacob: React.FC<{size: number}> = ({size}) => (
	<svg width={size} height={size} viewBox="0 0 200 200">
		<circle cx="100" cy="100" r="100" fill={C.paper} />
		{/* suit */}
		<path d="M30 200 C30 150 55 128 100 128 C145 128 170 150 170 200 Z" fill={C.jacobNavy} />
		{/* shirt */}
		<path d="M84 130 L100 170 L116 130 Z" fill={C.white} />
		{/* tie */}
		<path d="M100 130 L108 142 L100 185 L92 142 Z" fill={C.gold} />
		{/* neck */}
		<rect x="88" y="108" width="24" height="28" fill="#E8C39E" />
		{/* head */}
		<circle cx="100" cy="80" r="42" fill="#F0CBA0" />
		{/* hair */}
		<path d="M58 78 C58 44 142 44 142 78 C142 62 120 50 100 50 C80 50 58 60 58 78 Z" fill="#3A2E22" />
	</svg>
);

// Jacob presenter avatar — uses the supplied cartoon advisor video,
// masked into a circle. The video loops/holds across the scene.
export const JacobAvatar: React.FC<{
	size?: number;
	startFrom?: number;
	ring?: boolean;
}> = ({size = 460, startFrom = 0, ring = true}) => {
	let video: React.ReactNode;
	try {
		video = (
			<OffthreadVideo
				src={staticFile('jacob-avatar.mp4')}
				startFrom={startFrom}
				muted
				style={{width: '100%', height: '100%', objectFit: 'cover'}}
			/>
		);
	} catch {
		video = <FlatJacob size={size} />;
	}

	return (
		<div
			style={{
				width: size,
				height: size,
				borderRadius: '50%',
				overflow: 'hidden',
				background: C.jacobNavy,
				border: ring ? `8px solid ${C.gold}` : 'none',
				boxShadow: '0 24px 60px rgba(15,27,45,0.28)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			{video}
		</div>
	);
};

// Small corner presenter used in some scenes.
export const JacobCorner: React.FC = () => (
	<div
		style={{
			position: 'absolute',
			right: 64,
			bottom: 64,
			display: 'flex',
			alignItems: 'center',
			gap: 18,
			fontFamily: FONT,
		}}
	>
		<JacobAvatar size={150} ring />
	</div>
);
