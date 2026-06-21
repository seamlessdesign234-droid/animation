import {Composition, staticFile} from 'remotion';
import {AiAdoption} from './compositions/AiAdoption';
import {MapTrip} from './compositions/MapTrip';
import {SleepReel} from './compositions/SleepReel';
import {CoffeeExplainer} from './compositions/CoffeeExplainer';
import {
	SummerDressesCarousel,
	SUMMER_DRESSES_CAROUSEL_DURATION,
} from './compositions/SummerDressesCarousel';
import {SummerDressesPhoto} from './compositions/SummerDressesPhoto';

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
				id="SummerDressesCarousel"
				component={SummerDressesCarousel}
				durationInFrames={SUMMER_DRESSES_CAROUSEL_DURATION}
				width={1080}
				height={1920}
				fps={30}
			/>
			<Composition
				id="SummerDressesPhoto1"
				component={SummerDressesPhoto}
				durationInFrames={1}
				width={1080}
				height={1920}
				fps={30}
				defaultProps={{src: staticFile('images/dress-1.jpeg')}}
			/>
			<Composition
				id="SummerDressesPhoto2"
				component={SummerDressesPhoto}
				durationInFrames={1}
				width={1080}
				height={1920}
				fps={30}
				defaultProps={{src: staticFile('images/dress-2.jpeg')}}
			/>
			<Composition
				id="SummerDressesPhoto3"
				component={SummerDressesPhoto}
				durationInFrames={1}
				width={1080}
				height={1920}
				fps={30}
				defaultProps={{src: staticFile('images/dress-3.jpeg')}}
			/>
		</>
	);
};
