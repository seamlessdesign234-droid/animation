import {removeBackground} from '@imgly/background-removal-node';
import {writeFile} from 'fs/promises';
import path from 'path';

const SOURCES = ['dress-1', 'dress-2', 'dress-3'];

for (const name of SOURCES) {
	const src = path.resolve(`public/images/${name}.jpeg`);
	console.log(`Extracting person from ${src}...`);
	const blob = await removeBackground(src, {model: 'medium'});
	const buffer = Buffer.from(await blob.arrayBuffer());
	const out = path.resolve(`public/images/${name}-person.png`);
	await writeFile(out, buffer);
	console.log(`Wrote ${out}`);
}
