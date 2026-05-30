import {interpolate} from 'remotion';
import {C, FONT} from '../theme';

// Animated line chart that draws left-to-right via strokeDashoffset.
// points: array of {x,y} in 0..1 space (y=0 bottom, y=1 top).
export const LineChart: React.FC<{
	points: {x: number; y: number}[];
	color: string;
	progress: number; // 0..1 how much of the line is drawn
	width?: number;
	height?: number;
	strokeWidth?: number;
	dashed?: boolean;
	showAxes?: boolean;
	label?: string;
}> = ({
	points,
	color,
	progress,
	width = 1200,
	height = 560,
	strokeWidth = 8,
	dashed = false,
	showAxes = true,
	label,
}) => {
	const pad = 20;
	const toPx = (pt: {x: number; y: number}) => ({
		x: pad + pt.x * (width - pad * 2),
		y: height - pad - pt.y * (height - pad * 2),
	});
	const px = points.map(toPx);
	const d = px
		.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
		.join(' ');

	// Approximate path length for dash animation.
	let length = 0;
	for (let i = 1; i < px.length; i++) {
		length += Math.hypot(px[i].x - px[i - 1].x, px[i].y - px[i - 1].y);
	}
	const offset = length * (1 - Math.max(0, Math.min(1, progress)));
	const last = px[Math.max(0, Math.floor((px.length - 1) * progress))];

	return (
		<svg width={width} height={height} style={{overflow: 'visible'}}>
			{showAxes && (
				<>
					<line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke={C.line} strokeWidth={3} />
					<line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke={C.line} strokeWidth={3} />
				</>
			)}
			<path
				d={d}
				fill="none"
				stroke={color}
				strokeWidth={strokeWidth}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeDasharray={dashed ? '14 14' : length}
				strokeDashoffset={dashed ? 0 : offset}
			/>
			{progress > 0.02 && last && (
				<circle cx={last.x} cy={last.y} r={strokeWidth + 4} fill={color} />
			)}
			{label && (
				<text
					x={pad + 8}
					y={pad + 30}
					fontFamily={FONT}
					fontSize={28}
					fontWeight={700}
					fill={color}
				>
					{label}
				</text>
			)}
		</svg>
	);
};
