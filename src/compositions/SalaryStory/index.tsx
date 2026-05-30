import {AbsoluteFill, Series} from 'remotion';
import {C} from './theme';

import {S01_Bumper, S02_Title} from './scenes/intro';
import {
	S03_TwoIdentical,
	S04_Checklist,
	S05_NoLuck,
	S06_Mismatch,
	S07_Teaser,
} from './scenes/hook';
import {
	S08_Names,
	S09_SameLife,
	S10_OneDifference,
	S11_MarcusInvests,
	S12_DavidWaits,
	S13_LockIn,
} from './scenes/meet';
import {
	S14_SlowGrowth,
	S15_Lifestyle,
	S16_FeelsNormal,
	S17_InvisibleCost,
} from './scenes/years1to5';
import {
	S18_Timeline40,
	S19_Marcus100k,
	S20_DavidZero,
	S21_HeadStart,
} from './scenes/year10';
import {S22_FlatLine, S23_Copies, S24_Vertical, S25_Explosion} from './scenes/compound';
import {
	S26_Doubles,
	S27_Grind,
	S28_MarcusCalm,
	S29_BothSixty,
} from './scenes/davidWakes';
import {
	S30_MarcusTotal,
	S31_DavidTotal,
	S32_LessThanHalf,
	S33_DidRight,
} from './scenes/reveal';
import {
	S34_MarcusContrib,
	S35_DavidContrib,
	S36_SameDollar,
	S37_Diverge,
	S38_Time,
} from './scenes/twist';
import {
	S39_SarahAppears,
	S40_NeckAndNeck,
	S41_Crash,
	S42_PanicSell,
	S43_Recovery,
	S44_BuysHigher,
	S45_SarahTotal,
	S46_CostOfPanic,
} from './scenes/sarah';
import {S47_ThreeBars, S48_Villains, S49_Secret} from './scenes/lesson';
import {
	S50_Rewind,
	S51_PlusContrib,
	S52_NewTotal,
	S53_Mismatch,
	S54_FrontOfLine,
} from './scenes/coda';
import {S55_Young, S56_NotYoung, S57_LaterPrice} from './scenes/meaning';
import {S58_Recap, S59_WhichAreYou, S60_Outro} from './scenes/close';

// Each scene with its duration in seconds (tuned starting budgets from the
// scene breakdown). frames = seconds * fps.
const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);

export const SCENES: {C: React.FC; sec: number}[] = [
	{C: S01_Bumper, sec: 2},
	{C: S02_Title, sec: 3},
	{C: S03_TwoIdentical, sec: 4},
	{C: S04_Checklist, sec: 5},
	{C: S05_NoLuck, sec: 4},
	{C: S06_Mismatch, sec: 5},
	{C: S07_Teaser, sec: 4},
	{C: S08_Names, sec: 3},
	{C: S09_SameLife, sec: 5},
	{C: S10_OneDifference, sec: 3},
	{C: S11_MarcusInvests, sec: 5},
	{C: S12_DavidWaits, sec: 5},
	{C: S13_LockIn, sec: 3},
	{C: S14_SlowGrowth, sec: 5},
	{C: S15_Lifestyle, sec: 5},
	{C: S16_FeelsNormal, sec: 4},
	{C: S17_InvisibleCost, sec: 4},
	{C: S18_Timeline40, sec: 3},
	{C: S19_Marcus100k, sec: 4},
	{C: S20_DavidZero, sec: 3},
	{C: S21_HeadStart, sec: 4},
	{C: S22_FlatLine, sec: 4},
	{C: S23_Copies, sec: 5},
	{C: S24_Vertical, sec: 5},
	{C: S25_Explosion, sec: 3},
	{C: S26_Doubles, sec: 4},
	{C: S27_Grind, sec: 5},
	{C: S28_MarcusCalm, sec: 3},
	{C: S29_BothSixty, sec: 3},
	{C: S30_MarcusTotal, sec: 5},
	{C: S31_DavidTotal, sec: 5},
	{C: S32_LessThanHalf, sec: 5},
	{C: S33_DidRight, sec: 4},
	{C: S34_MarcusContrib, sec: 4},
	{C: S35_DavidContrib, sec: 4},
	{C: S36_SameDollar, sec: 4},
	{C: S37_Diverge, sec: 4},
	{C: S38_Time, sec: 4},
	{C: S39_SarahAppears, sec: 3},
	{C: S40_NeckAndNeck, sec: 4},
	{C: S41_Crash, sec: 5},
	{C: S42_PanicSell, sec: 5},
	{C: S43_Recovery, sec: 5},
	{C: S44_BuysHigher, sec: 4},
	{C: S45_SarahTotal, sec: 4},
	{C: S46_CostOfPanic, sec: 3},
	{C: S47_ThreeBars, sec: 5},
	{C: S48_Villains, sec: 4},
	{C: S49_Secret, sec: 4},
	{C: S50_Rewind, sec: 3},
	{C: S51_PlusContrib, sec: 3},
	{C: S52_NewTotal, sec: 5},
	{C: S53_Mismatch, sec: 4},
	{C: S54_FrontOfLine, sec: 4},
	{C: S55_Young, sec: 5},
	{C: S56_NotYoung, sec: 5},
	{C: S57_LaterPrice, sec: 4},
	{C: S58_Recap, sec: 4},
	{C: S59_WhichAreYou, sec: 5},
	{C: S60_Outro, sec: 5},
];

export const SALARY_STORY_DURATION = SCENES.reduce((acc, sc) => acc + s(sc.sec), 0);

export const SalaryStory: React.FC = () => {
	return (
		<AbsoluteFill style={{background: C.paper}}>
			<Series>
				{SCENES.map((sc, i) => {
					const Comp = sc.C;
					return (
						<Series.Sequence key={i} durationInFrames={s(sc.sec)}>
							<Comp />
						</Series.Sequence>
					);
				})}
			</Series>
		</AbsoluteFill>
	);
};
