# Remotion Video Projects

Four programmatic videos built with [Remotion](https://www.remotion.dev/). Every
animation is deterministic and frame-driven (`useCurrentFrame`, `interpolate`,
`spring`) per the conventions in [`CLAUDE.md`](./CLAUDE.md).

## Quick start

```bash
npm install
npm run dev          # open Remotion Studio to preview
npm run render:all   # render every composition to out/*.mp4
```

Render a single composition:

```bash
npx remotion render AiAdoption out/ai-adoption.mp4
```

## Compositions

| ID | Size | Length | Output |
|----|------|--------|--------|
| `AiAdoption` | 1920×1080 | 12s | `out/ai-adoption.mp4` |
| `MapTrip` | 1920×1080 | 18s | `out/map-trip.mp4` |
| `SleepReel` | 1080×1920 | 8s | `out/sleep-reel.mp4` |
| `CoffeeExplainer` | 1920×1080 | 20s | `out/coffee-explainer.mp4` |

### 1. AiAdoption — animated infographic (12s)
"Global AI Adoption 2025" data story in four scenes: an animated title, a
bar chart of adoption by industry that springs up bar-by-bar, a rapid
count-up to **78% of companies**, and a closing card. Scenes are laid out
with `<Sequence>` and cross-faded.

### 2. MapTrip — map + 3D camera trip (18s)
A camera zooms out of Los Angeles, then a dashed flight arc draws to New York
with the camera following the plane. The trip continues across the Atlantic to
Paris (camera pulls back over the ocean, then zooms in), and finishes by
revealing a rotating **3D Eiffel Tower** built with `@remotion/three`
(react-three-fiber). The map is a stylized equirectangular projection with a
graticule and simplified continents; the "camera" is a CSS transform
(translate + scale) over the map layer. See `src/lib/geo.ts` for the
projection and arc math.

### 3. SleepReel — vertical Instagram Reel (8s, 1080×1920)
Bold "YOU'RE DOING IT WRONG" title shakes (seeded `random()` jitter) then
swipes off-screen to reveal "3 Tips for Better Sleep". Three tip cards fly in
one by one from alternating sides, ending on a pulsing "Follow for more"
button over a twinkling starfield.

### 4. CoffeeExplainer — step-by-step explainer (20s)
Six scenes tracing a coffee bean from **Farm → Harvest → Dry & Process →
Roast → Grind → Brew**. Each step has a hand-drawn animated SVG icon, a
label/description, and a forward arrow; scenes connect with slide
transitions (`<TransitionSeries>`), and a progress strip tracks the journey.

## Project layout

```
src/
  index.ts                 # registerRoot
  Root.tsx                 # the four <Composition>s
  lib/
    theme.ts               # shared fonts, colors, spring presets
    geo.ts                 # map projection + flight-arc math
  compositions/
    AiAdoption.tsx
    MapTrip.tsx
    EiffelTower.tsx        # 3D tower (react-three-fiber)
    SleepReel.tsx
    CoffeeExplainer.tsx
scripts/render-all.mjs
```
