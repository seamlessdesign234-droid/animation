// Renders every composition in src/Root.tsx to out/<id>.mp4
import {execSync} from 'node:child_process';

const jobs = [
	['AiAdoption', 'out/ai-adoption.mp4'],
	['MapTrip', 'out/map-trip.mp4'],
	['SleepReel', 'out/sleep-reel.mp4'],
	['CoffeeExplainer', 'out/coffee-explainer.mp4'],
	['LookbookCarousel', 'out/lookbook.mp4'],
];

for (const [id, out] of jobs) {
	console.log(`\n=== Rendering ${id} -> ${out} ===`);
	execSync(`npx remotion render ${id} ${out}`, {stdio: 'inherit'});
}
console.log('\nAll renders complete.');
