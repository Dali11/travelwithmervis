import { content, type Place } from './content';

export interface BeatInfo {
  place: Place;
  /** Index of this beat within its place, and how many beats the place has. */
  b: number;
  n: number;
  title: string;
  text: string;
  photo?: string;
  photoAlt?: string;
}

/** All steps of all places, flattened in scroll order. */
export function flatBeats(): BeatInfo[] {
  const out: BeatInfo[] = [];
  content.places.forEach((place) => {
    place.beats.forEach((beat, b) => {
      out.push({ place, b, n: place.beats.length, ...beat });
    });
  });
  return out;
}
