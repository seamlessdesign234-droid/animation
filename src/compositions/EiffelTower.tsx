import {ThreeCanvas} from '@remotion/three';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

const IRON = '#7a5a32';
const IRON_DARK = '#5c421f';

// A single tapered square-section segment (radialSegments=4 → square lattice look).
const Segment: React.FC<{y: number; h: number; rb: number; rt: number; color?: string}> = ({y, h, rb, rt, color = IRON}) => (
	<mesh position={[0, y + h / 2, 0]} rotation={[0, Math.PI / 4, 0]}>
		<cylinderGeometry args={[rt, rb, h, 4]} />
		<meshStandardMaterial color={color} metalness={0.5} roughness={0.55} />
	</mesh>
);

const Platform: React.FC<{y: number; size: number}> = ({y, size}) => (
	<mesh position={[0, y, 0]} rotation={[0, Math.PI / 4, 0]}>
		<boxGeometry args={[size, 0.14, size]} />
		<meshStandardMaterial color={IRON_DARK} metalness={0.5} roughness={0.5} />
	</mesh>
);

// One splayed base leg, modelled in a local frame where +X points toward the
// corner; the leg tilts inward (top toward centre) within the X–Y plane.
const Leg: React.FC<{cornerDeg: number; R: number; r: number; h: number}> = ({cornerDeg, R, r, h}) => {
	const len = Math.hypot(R - r, h);
	const tilt = Math.atan2(R - r, h);
	return (
		<group rotation={[0, (cornerDeg * Math.PI) / 180, 0]}>
			<mesh position={[(R + r) / 2, h / 2, 0]} rotation={[0, 0, tilt]}>
				<cylinderGeometry args={[0.07, 0.16, len, 5]} />
				<meshStandardMaterial color={IRON} metalness={0.5} roughness={0.55} />
			</mesh>
		</group>
	);
};

const Tower: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const rise = spring({frame, fps, config: {damping: 30, mass: 1.4, stiffness: 50}});
	const scale = interpolate(rise, [0, 1], [0.25, 1]);
	const rotY = (frame / fps) * 0.5; // slow turntable

	const corners = [45, 135, 225, 315];
	return (
		<group position={[0, -4.1, 0]} rotation={[0, rotY, 0]} scale={[scale, scale, scale]}>
			{/* open base: four inward-leaning legs from y=0 to the first platform */}
			{corners.map((c) => (
				<Leg key={c} cornerDeg={c} R={1.35} r={0.45} h={2.2} />
			))}
			{/* first-floor arch band suggesting the iconic base arches */}
			<mesh position={[0, 1.5, 0]} rotation={[Math.PI / 2, 0, Math.PI / 4]}>
				<torusGeometry args={[1.0, 0.05, 8, 4]} />
				<meshStandardMaterial color={IRON_DARK} metalness={0.5} roughness={0.5} />
			</mesh>
			<Platform y={2.2} size={1.1} />
			{/* slender upper body */}
			<Segment y={2.2} h={2.2} rb={0.5} rt={0.26} />
			<Platform y={4.4} size={0.62} />
			<Segment y={4.4} h={2.6} rb={0.24} rt={0.08} />
			{/* spire */}
			<mesh position={[0, 7.45, 0]} rotation={[0, Math.PI / 4, 0]}>
				<coneGeometry args={[0.1, 1.3, 4]} />
				<meshStandardMaterial color={IRON_DARK} metalness={0.6} roughness={0.4} />
			</mesh>
			<mesh position={[0, 8.2, 0]}>
				<sphereGeometry args={[0.07, 12, 12]} />
				<meshStandardMaterial color={'#ffd27a'} emissive={'#ffb648'} emissiveIntensity={0.9} />
			</mesh>
		</group>
	);
};

export const EiffelTower3D: React.FC = () => {
	const {width, height} = useVideoConfig();
	return (
		<ThreeCanvas
			width={width}
			height={height}
			camera={{position: [0, 0, 13], fov: 40}}
			style={{position: 'absolute'}}
			gl={{antialias: true}}
		>
			<ambientLight intensity={0.7} />
			<directionalLight position={[6, 10, 6]} intensity={1.4} color={'#fff2d6'} />
			<directionalLight position={[-6, 4, -4]} intensity={0.5} color={'#9ab4ff'} />
			<Tower />
		</ThreeCanvas>
	);
};
