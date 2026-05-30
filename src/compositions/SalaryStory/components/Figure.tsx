import {C, FONT} from '../theme';

// Minimal flat person silhouette (head + shoulders), color-tinted.
export const Figure: React.FC<{
	color: string;
	label?: string;
	labelColor?: string;
	size?: number;
	opacity?: number;
	alarmed?: boolean;
}> = ({color, label, labelColor, size = 220, opacity = 1, alarmed = false}) => {
	return (
		<div
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				opacity,
			}}
		>
			<svg
				width={size}
				height={size}
				viewBox="0 0 200 200"
				style={{overflow: 'visible'}}
			>
				{/* shoulders / body */}
				<path
					d="M40 200 C40 140 60 116 100 116 C140 116 160 140 160 200 Z"
					fill={color}
				/>
				{/* head */}
				<circle cx="100" cy="68" r="44" fill={color} />
				{alarmed && (
					<>
						{/* worried brows */}
						<line x1="78" y1="56" x2="92" y2="62" stroke={C.white} strokeWidth="5" strokeLinecap="round" />
						<line x1="122" y1="56" x2="108" y2="62" stroke={C.white} strokeWidth="5" strokeLinecap="round" />
						<circle cx="100" cy="86" r="7" fill={C.white} />
					</>
				)}
			</svg>
			{label && (
				<div
					style={{
						fontFamily: FONT,
						fontSize: 32,
						fontWeight: 800,
						color: labelColor ?? color,
						marginTop: 14,
						textTransform: 'uppercase',
						letterSpacing: 3,
					}}
				>
					{label}
				</div>
			)}
		</div>
	);
};
