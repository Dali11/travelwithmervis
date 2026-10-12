# Travel with Mervis: real Malawi in 3D

A mobile-first 3D flight over real Malawi. Scroll and the camera flies from Lake Malawi to Mulanje Mountain, circling and climbing the massif while Mervis's photos appear as floating cards. The lake, the border and the mountains sit at their real positions. The sky changes from sunrise to dusk as you scroll.

Built with Vite, TypeScript, three.js and Tailwind CSS.

## Run it

```bash
npm install
npm run dev        # dev server; also reachable from your phone on the same Wi-Fi
npm run build      # type-checks, then builds to dist/
```

Deploy by uploading `dist/` to any static host.

## Real terrain (run once)

```bash
npm run terrain
```

This downloads real elevation data for Malawi (about 85 small tiles from the free AWS Terrain Tiles, built from SRTM) and writes `public/terrain/terrain.bin` and `terrain.json`. Keep those files in the project and deploy them.

Without them the page still works: Lake Malawi and the border always use real outlines, and the heights are estimated from known landmarks (Mulanje 3,002 m, Zomba, Nyika, Dedza and others). The estimate is good for a demo. The real data is what makes the ridges and valleys true.

Credit the data in the footer (already in `content.ts`): Mapzen Terrain Tiles (SRTM and others), outlines from Natural Earth.

## Add the photos

Put the originals in `photos-raw/` named `lake-kayak`, `mountain-trek`, `forest-river`, `waterfall-pool`, `misty-summit` (.jpg or .jpeg), then run `npm run photos`. They are resized into `public/photos/`.

## What to edit

Only `src/content.ts` (plus photo files).

- `whatsapp`: number with country code, digits only, e.g. `'265991234567'`.
- `contact`, `hero`, `plan`, `nav`, `footer`: text.
- `places`: the journey, in order. Each place has a real `lon`/`lat`, a `kind` and one to five `beats` (steps). Each beat is a page section with its own camera move and photo card.
  - `kind: 'lake'` sweeps low over the water.
  - `kind: 'mountain'` or `'plateau'` circles the place while climbing to the summit.
  - `radiusKm` is the rough size of the mountain (default 14).

To add a place, copy an existing one and change the name, coordinates and beats. Coordinates (lon, lat): Mulanje 35.57, -16.00 · Zomba 35.32, -15.35 · Nyika 33.88, -10.60 · Dedza 34.25, -14.30 · Lilongwe 33.78, -13.98 · Senga Bay 34.50, -13.72 · Nkhata Bay 34.29, -11.60 · Mzuzu 34.02, -11.46.

## Project layout

```
src/content.ts          <- all editable content
src/ui/                 page sections and the enquiry form, built from content.ts
src/scene/              the 3D code (do not edit unless changing the scene itself)
  geo.ts                real outlines: Lake Malawi and the border (Natural Earth)
  terrain.ts            the ground: real elevation or estimate, lake bed, colours
  lake.ts               the water and sailboats
  weather.ts            clouds and the mist ring around mountains
  world.ts              renderer, lights, camera path
  cards.ts  atmosphere.ts  palette.ts  helpers.ts  experience.ts
scripts/fetch-terrain.mjs   downloads real elevation
scripts/optimize-photos.mjs resizes photos
```
