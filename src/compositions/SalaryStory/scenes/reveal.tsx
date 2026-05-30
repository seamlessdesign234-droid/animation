import {interpolate, useCurrentFrame} from 'remotion';
import {C, FONT} from '../theme';
import {Scene, Heading, FadeIn, Stamp, CheckItem} from '../components/common';
import {Figure} from '../components/Figure';
import {CountUp} from '../components/CountUp';
import {GrowBar} from '../components/GrowBar';

// S30 — Marcus total counts to $1,130,000, generous hold.
export const S30_MarcusTotal: React.FC = () => (
	<Scene>
		<FadeIn><Figure color={C.marcus} label="Marcus" size={190} /></FadeIn>
		<div style={{marginTop: 30}}>
			<CountUp from={0} to={1130000} durationInFrames={70} delay={10} color={C.marcus} fontSize={180} />
		</div>
	</Scene>
);

// S31 — David total counts to $415,000.
export const S31_DavidTotal: React.FC = () => (
	<Scene>
		<FadeIn><Figure color={C.david} label="David" size={190} /></FadeIn>
		<div style={{marginTop: 30}}>
			<CountUp from={0} to={415000} durationInFrames={70} delay={10} color={C.david} fontSize={180} />
		</div>
	</Scene>
);

// S32 — Less than half: two bars from same baseline, stamp.
export const S32_LessThanHalf: React.FC = () => (
	<Scene>
		<div style={{display: 'flex', alignItems: 'flex-end', gap: 140}}>
			<GrowBar value={1130000} max={1130000} color={C.marcus} maxHeight={520} width={180} valueLabel="$1,130,000" label="Marcus" delay={8} />
			<GrowBar value={415000} max={1130000} color={C.david} maxHeight={520} width={180} valueLabel="$415,000" label="David" delay={16} />
		</div>
		<div style={{position: 'absolute', top: 360}}>
			<Stamp text="less than half" color={C.loss} delay={50} rotate={-6} fontSize={58} />
		</div>
	</Scene>
);

// S33 — Did everything right, then red overstamp.
export const S33_DidRight: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<Scene>
			<div style={{display: 'flex', flexDirection: 'column', gap: 26, alignItems: 'flex-start'}}>
				<CheckItem label="Saved money" delay={0} color={C.david} fontSize={52} />
				<CheckItem label="Stayed consistent" delay={12} color={C.david} fontSize={52} />
				<CheckItem label="Sacrificed" delay={24} color={C.david} fontSize={52} />
			</div>
			{frame > 50 && (
				<div style={{position: 'absolute', top: 380}}>
					<Stamp text="started 15 years late" color={C.loss} delay={50} rotate={-7} fontSize={52} />
				</div>
			)}
		</Scene>
	);
};
