import {interpolate} from 'remotion';
import {C, FONT} from '../theme';

// Horizontal age track with a moving playhead dot.
// progress is 0..1 across [startAge, endAge].
export const Timeline: React.FC<{
	startAge: number;
	endAge: number;
	markers: number[];
	progress: number;
	color?: string;
	width?: number;
	highlightFrom?: number; // optional age: glow the segment before currentAge
}> = ({
	startAge,
	endAge,
	markers,
	progress,
	color = C.marcus,
	width = 1300,
}) => {
	const p = Math.max(0, Math.min(1, progress));
	const currentAge = Math.round(startAge + (endAge - startAge) * p);
	const ageToX = (age: number) =>
		interpolate(age, [startAge, endAge], [0, width], {
			extrapolateLeft: 'clamp',
			extrapolateRight: 'clamp',
		});
	const dotX = p * width;

	return (
		<div style={{width, position: 'relative', height: 160}}>
			{/* base track */}
			<div
				style={{
					position: 'absolute',
					top: 70,
					left: 0,
					width,
					height: 10,
					borderRadius: 5,
					background: C.line,
				}}
			/>
			{/* filled track */}
			<div
				style={{
					position: 'absolute',
					top: 70,
					left: 0,
					width: dotX,
					height: 10,
					borderRadius: 5,
					background: color,
				}}
			/>
			{/* markers */}
			{markers.map((m) => (
				<div key={m} style={{position: 'absolute', left: ageToX(m), top: 56}}>
					<div
						style={{
							width: 4,
							height: 38,
							background: C.faint,
							borderRadius: 2,
							transform: 'translateX(-2px)',
						}}
					/>
					<div
						style={{
							fontFamily: FONT,
							fontSize: 28,
							fontWeight: 600,
							color: C.sub,
							marginTop: 8,
							transform: 'translateX(-50%)',
						}}
					>
						{m}
					</div>
				</div>
			))}
			{/* playhead */}
			<div
				style={{
					position: 'absolute',
					left: dotX,
					top: 75,
					transform: 'translate(-50%, -50%)',
				}}
			>
				<div
					style={{
						width: 34,
						height: 34,
						borderRadius: '50%',
						background: color,
						border: `5px solid ${C.paper}`,
						boxShadow: `0 0 0 3px ${color}`,
					}}
				/>
				<div
					style={{
						fontFamily: FONT,
						fontSize: 30,
						fontWeight: 800,
						color,
						position: 'absolute',
						top: -52,
						left: '50%',
						transform: 'translateX(-50%)',
						whiteSpace: 'nowrap',
					}}
				>
					age {currentAge}
				</div>
			</div>
		</div>
	);
};
