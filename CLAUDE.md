# Remotion

This project uses [Remotion](https://www.remotion.dev/) to create videos programmatically with React. A video is a **Composition**: it has dimensions, a frame rate, and a duration measured in frames. Remotion renders the React tree **frame-by-frame** into a video file — it is not an interactive app.

The most important rule: **all React code must be deterministic.** The same frame must always produce the exact same output.

## Project structure

Compositions are registered in `src/Root.tsx`. Each `<Composition>` needs an `id`, a `component`, `durationInFrames`, `width`, `height`, `fps`, and `defaultProps` (which must match the component's props shape).

```tsx
import {Composition} from 'remotion';
import {MyComp} from './MyComp';

export const Root: React.FC = () => {
	return (
		<>
			<Composition
				id="MyComp"
				component={MyComp}
				durationInFrames={120}
				width={1920}
				height={1080}
				fps={30}
				defaultProps={{}}
			/>
		</>
	);
};
```

Default canvas is `1920x1080` at `30fps`. Components read the current frame (starting at `0`) via `useCurrentFrame()`:

```tsx
export const MyComp: React.FC = () => {
	const frame = useCurrentFrame();
	return <div>Frame {frame}</div>;
};
```

## Component rules

You can use any standard HTML and CSS, plus SVG. For media, use Remotion's components instead of the native tags so that rendering stays in sync with the timeline.

**Video** — use `<OffthreadVideo>` (not `<video>`). Props: `src`, `startFrom` (trim frames off the left), `endAt` (limit duration), `volume` (0–1).

```tsx
import {OffthreadVideo} from 'remotion';

export const MyComp: React.FC = () => {
	return (
		<div>
			<OffthreadVideo
				src="https://remotion.dev/bbb.mp4"
				style={{width: '100%'}}
			/>
		</div>
	);
};
```

**Images** — use `<Img>` (not `<img>`):

```tsx
import {Img} from 'remotion';

export const MyComp: React.FC = () => {
	return <Img src="https://remotion.dev/logo.png" style={{width: '100%'}} />;
};
```

**GIFs** — require the `@remotion/gif` package and the `<Gif>` tag:

```tsx
import {Gif} from '@remotion/gif';

export const MyComp: React.FC = () => {
	return (
		<Gif
			src="https://media.giphy.com/media/l0MYd5y8e1t0m/giphy.gif"
			style={{width: '100%'}}
		/>
	);
};
```

**Audio** — use `<Audio>`. Props: `startFrom`, `endAt`, `volume`.

```tsx
import {Audio} from 'remotion';

export const MyComp: React.FC = () => {
	return <Audio src="https://remotion.dev/audio.mp3" />;
};
```

Assets can be remote URLs or local files placed in `public/` and referenced with `staticFile()`:

```tsx
import {Audio, staticFile} from 'remotion';

export const MyComp: React.FC = () => {
	return <Audio src={staticFile('audio.mp3')} />;
};
```

## Layout components

**`<AbsoluteFill>`** — an absolutely positioned, full-size `<div>`. Stack them to layer elements; later children render on top.

```tsx
import {AbsoluteFill} from 'remotion';

export const MyComp: React.FC = () => {
	return (
		<AbsoluteFill>
			<AbsoluteFill style={{background: 'blue'}}>
				<div>This is in the back</div>
			</AbsoluteFill>
			<AbsoluteFill style={{background: 'blue'}}>
				<div>This is in front</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
```

**`<Sequence>`** — time-shifts its children. `from` is the start frame, `durationInFrames` is how long it stays mounted. Inside a `Sequence`, `useCurrentFrame()` is **rebased to 0** at the sequence's start.

```tsx
import {Sequence} from 'remotion';

export const MyComp: React.FC = () => {
	return (
		<Sequence from={10} durationInFrames={20}>
			<div>This only appears after 10 frames</div>
		</Sequence>
	);
};
```

```tsx
import {Sequence} from 'remotion';

export const Child: React.FC = () => {
	const frame = useCurrentFrame();

	return <div>At frame 10, this should be 0: {frame}</div>;
};

export const MyComp: React.FC = () => {
	return (
		<Sequence from={10} durationInFrames={20}>
			<Child />
		</Sequence>
	);
};
```

**`<Series>`** — plays children back-to-back. `<Series.Sequence>` takes `durationInFrames` (no `from`), and an optional `offset` to overlap/gap relative to the previous one.

```tsx
import {Series} from 'remotion';

export const MyComp: React.FC = () => {
	return (
		<Series>
			<Series.Sequence durationInFrames={20}>
				<div>This only appears immediately</div>
			</Series.Sequence>
			<Series.Sequence durationInFrames={30}>
				<div>This only appears after 20 frames</div>
			</Series.Sequence>
			<Series.Sequence durationInFrames={30} offset={-8}>
				<div>This only appears after 42 frames</div>
			</Series.Sequence>
		</Series>
	);
};
```

**`<TransitionSeries>`** — like `Series`, but you can place `<TransitionSeries.Transition>` between sequences. A transition takes a `timing` (e.g. `springTiming`, `linearTiming`) and a `presentation` (e.g. `fade`, `wipe`).

```tsx
import {
	linearTiming,
	springTiming,
	TransitionSeries,
} from '@remotion/transitions';

import {fade} from '@remotion/transitions/fade';
import {wipe} from '@remotion/transitions/wipe';

export const MyComp: React.FC = () => {
	return (
		<TransitionSeries>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Fill color="blue" />
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				timing={springTiming({config: {damping: 200}})}
				presentation={fade()}
			/>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Fill color="black" />
			</TransitionSeries.Sequence>
			<TransitionSeries.Transition
				timing={linearTiming({durationInFrames: 30})}
				presentation={wipe()}
			/>
			<TransitionSeries.Sequence durationInFrames={60}>
				<Fill color="white" />
			</TransitionSeries.Sequence>
		</TransitionSeries>
	);
};
```

## Animation helpers

**`random(seed)`** — Remotion forbids `Math.random()` because it is non-deterministic. Use `random()` with a seed; it returns a stable value between 0 and 1.

```tsx
import {random} from 'remotion';

export const MyComp: React.FC = () => {
	return <div>Random number: {random('my-seed')}</div>;
};
```

**`interpolate()`** — maps a value from an input range to an output range. Almost always pass `extrapolateLeft`/`extrapolateRight: 'clamp'` to avoid values shooting past the range.

```tsx
import {interpolate} from 'remotion';

export const MyComp: React.FC = () => {
	const frame = useCurrentFrame();
	const value = interpolate(frame, [0, 100], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return (
		<div>
			Frame {frame}: {value}
		</div>
	);
};
```

**`spring()`** — physics-based animation. Needs `fps`, `frame`, and a `config` (e.g. `{damping: 200}`).

```tsx
import {spring} from 'remotion';

export const MyComp: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const value = spring({
		fps,
		frame,
		config: {
			damping: 200,
		},
	});
	return (
		<div>
			Frame {frame}: {value}
		</div>
	);
};
```

## Hooks

**`useCurrentFrame()`** — returns the current frame number (rebased to 0 inside a `Sequence`).

**`useVideoConfig()`** — returns the composition's config:

```tsx
import {useVideoConfig} from 'remotion';

export const MyComp: React.FC = () => {
	const {fps, durationInFrames, height, width} = useVideoConfig();
	return (
		<div>
			fps: {fps}
			durationInFrames: {durationInFrames}
			height: {height}
			width: {width}
		</div>
	);
};
```

## Making UI components (this is the key mental shift)

Remotion components look like React components, but they are **not interactive**. They are a frame-by-frame rendering of a video. Crucially:

- **No user interaction.** No `onClick`, `onHover`, or any event handlers — nobody is clicking a rendered video.
- **No `useState` for interactivity.** State driven by user actions does not exist. Animation is driven purely by the current frame.
- **Deterministic & pure.** The same frame must always produce the same pixels. Avoid `useEffect`, `Date.now()`, `Math.random()`, and other side effects / non-deterministic sources.
- **Frame-based, not time-based.** Drive every animation off `useCurrentFrame()` via `interpolate()` or `spring()` — never `setTimeout`/`setInterval` or wall-clock time.

A normal interactive React button — **not** how Remotion works:

```tsx
const Button = () => {
  const [clicked, setClicked] = useState(false);
  
  return (
    <button 
      onClick={() => setClicked(true)}
      style={{ background: clicked ? 'blue' : 'gray' }}
    >
      Click me!
    </button>
  );
};
```

The Remotion equivalent — appearance is computed from the frame:

```tsx
import { useCurrentFrame, interpolate } from 'remotion';

const AnimatedButton = () => {
  const frame = useCurrentFrame();
  
  // Animate scale over 30 frames
  const scale = interpolate(frame, [0, 30], [1, 1.2], {
    extrapolateRight: 'clamp'
  });
  
  return (
    <div style={{
      transform: `scale(${scale})`,
      background: 'blue',
      padding: '10px 20px',
      display: 'inline-block'
    }}>
      Click me!
    </div>
  );
};
```
