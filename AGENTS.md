# Instructions for coding agents (Hermes and others)

This is a finished 3D website. Your job is content changes only.

## Allowed
- Edit `src/content.ts`: text, button labels, WhatsApp number, contact details, places and their steps.
- Add original photos to `photos-raw/` and run `npm run photos`.
- Run `npm run terrain` once if `public/terrain/` is missing.

## Not allowed
- Do not edit `src/scene/`, `src/ui/`, `src/style.css` or the config files unless the user explicitly asks for a change to the 3D scene or layout.
- Do not rename fields or change the TypeScript types in `src/content.ts`. Change values only.
- Do not add dependencies.
- Do not invent place names, distances, prices or claims about Mervis's trips. If unsure, ask the user.

## Places
- `places` is the journey in order. Keep at least one place. Each needs `name`, `label`, `cta`, `kind`, `lon`, `lat` and one to five `beats`.
- `lon`/`lat` must be a real position inside Malawi (see README.md for reference coordinates). `kind` is `'lake'`, `'mountain'` or `'plateau'`.
- Photo paths look like `/photos/lake-kayak.jpg` and must match a file in `public/photos/`.

## After every change
1. Run `npm run build`. It must finish with no errors.
2. If it fails, undo your last edit and try a smaller change.
3. Tell the user what you changed, in one or two lines.

## Deploying
`npm run build` creates `dist/`. Upload that folder to the static host the user names. Include `public/terrain/` if it exists.
