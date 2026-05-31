import {Composition} from 'remotion';
import {AiAdoption} from './compositions/AiAdoption';
import {MapTrip} from './compositions/MapTrip';
import {SleepReel} from './compositions/SleepReel';
import {CoffeeExplainer} from './compositions/CoffeeExplainer';
import {S07_OutcomeTeaser} from './scenes/S07_OutcomeTeaser';
import {S08_MeetTheTwo} from './scenes/S08_MeetTheTwo';
import {S14_YearsOneToFive} from './scenes/S14_YearsOneToFive';
import {S18_YearTen} from './scenes/S18_YearTen';
import {S22_CompoundCurve} from './scenes/S22_CompoundCurve';
import {S26_DavidDoublesGrinds} from './scenes/S26_DavidDoublesGrinds';
import {S30_TheReveal} from './scenes/S30_TheReveal';
import {S39_Sarah} from './scenes/S39_Sarah';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="AiAdoption"
				component={AiAdoption}
				durationInFrames={360}
				width={1920}
				height={1080}
				fps={30}
			/>
			<Composition
				id="MapTrip"
				component={MapTrip}
				durationInFrames={540}
				width={1920}
				height={1080}
				fps={30}
			/>
			<Composition
				id="SleepReel"
				component={SleepReel}
				durationInFrames={240}
				width={1080}
				height={1920}
				fps={30}
			/>
			<Composition
				id="CoffeeExplainer"
				component={CoffeeExplainer}
				durationInFrames={600}
				width={1920}
				height={1080}
				fps={30}
			/>
			<Composition
				id="S07OutcomeTeaser"
				component={S07_OutcomeTeaser}
				durationInFrames={660}
				width={1920}
				height={1080}
				fps={30}
			/>
			<Composition
				id="S08MeetTheTwo"
				component={S08_MeetTheTwo}
				durationInFrames={2160}
				width={1920}
				height={1080}
				fps={30}
			/>
			<Composition
				id="S14YearsOneToFive"
				component={S14_YearsOneToFive}
				durationInFrames={2400}
				width={1920}
				height={1080}
				fps={30}
			/>
			<Composition
				id="S18YearTen"
				component={S18_YearTen}
				durationInFrames={1260}
				width={1920}
				height={1080}
				fps={30}
			/>
			<Composition
				id="S22CompoundCurve"
				component={S22_CompoundCurve}
				durationInFrames={1800}
				width={1920}
				height={1080}
				fps={30}
			/>
			<Composition
				id="S26DavidDoublesGrinds"
				component={S26_DavidDoublesGrinds}
				durationInFrames={2250}
				width={1920}
				height={1080}
				fps={30}
			/>
			<Composition
				id="S30TheReveal"
				component={S30_TheReveal}
				durationInFrames={1530}
				width={1920}
				height={1080}
				fps={30}
			/>
			<Composition
				id="S39Sarah"
				component={S39_Sarah}
				durationInFrames={3510}
				width={1920}
				height={1080}
				fps={30}
			/>
		</>
	);
};
