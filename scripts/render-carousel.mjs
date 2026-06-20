// Renders each LookbookCarousel slide as a standalone 1080x1920 PNG
// suitable for uploading as an Instagram carousel post.
import {execSync} from 'node:child_process';
import {mkdirSync} from 'node:fs';

mkdirSync('out/carousel', {recursive: true});

// Pick a frame where each slide's animation has fully settled.
const slides = [
	{name: 'slide-1-cover', frame: 50},
	{name: 'slide-2-look-01', frame: 130},
	{name: 'slide-3-look-02', frame: 224},
	{name: 'slide-4-look-03', frame: 318},
	{name: 'slide-5-outro', frame: 410},
];

for (const {name, frame} of slides) {
	const out = `out/carousel/${name}.png`;
	console.log(`\n=== ${name} (frame ${frame}) -> ${out} ===`);
	execSync(`npx remotion still LookbookCarousel ${out} --frame=${frame}`, {stdio: 'inherit'});
}
console.log('\nCarousel stills ready in out/carousel/ — upload to Instagram in order.');
