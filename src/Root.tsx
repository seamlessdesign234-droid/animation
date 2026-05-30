import {Composition} from 'remotion';
import {AiAdoption} from './compositions/AiAdoption';
import {MapTrip} from './compositions/MapTrip';
import {SleepReel} from './compositions/SleepReel';
import {CoffeeExplainer} from './compositions/CoffeeExplainer';
import {SalaryStory, SALARY_STORY_DURATION} from './compositions/SalaryStory';

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
				id="SalaryStory"
				component={SalaryStory}
				durationInFrames={SALARY_STORY_DURATION}
				width={1920}
				height={1080}
				fps={30}
			/>
		</>
	);
};
