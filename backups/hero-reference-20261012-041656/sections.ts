import { content } from '../content';
import { flatBeats } from '../beats';
import { h, link } from './dom';

const photo = (src: string, alt: string, cls = '') => `<img class="${cls}" src="${src}" alt="${alt}" loading="lazy" />`;
const arrow = '<span aria-hidden="true">↗</span>';

function sectionHeading(kicker: string, title: string, copy = ''): string {
  return `<div class="section-heading"><p class="eyebrow">${kicker}</p><h2>${title}</h2>${copy ? `<p class="section-intro">${copy}</p>` : ''}</div>`;
}

/** Render the complete tourism website around the existing 3D Malawi scene. */
export function renderSections(root: HTMLElement): HTMLElement[] {
  root.innerHTML = `
    <section class="hero-section" id="top">
      <div class="hero-image" role="img" aria-label="A peaceful kayaking experience on Lake Malawi"></div>
      <div class="hero-shade" aria-hidden="true"></div>

      <div class="hero-content page-width">
        <div class="hero-editorial">
          <p class="eyebrow">EXPLORE · EXPERIENCE · LIVE</p>

          <h1>Malawi,<br><em>closer than</em><br>you imagine.</h1>

          <p class="hero-copy">
            Thoughtfully planned journeys into the landscapes, people and
            places that make Malawi unforgettable.
          </p>

          <div class="hero-actions">
            <a class="button button-green" href="#destinations">
              Explore destinations <span>→</span>
            </a>
            <a class="story-link" href="#about">
              Meet Mervis <span class="story-arrow">↗</span>
            </a>
          </div>

          <div class="hero-trust">
            <span class="hero-trust-mark" aria-hidden="true">✳</span>
            <span>Local stories. Meaningful journeys.<br>
              <strong>Made for the way you want to explore.</strong>
            </span>
          </div>
        </div>

        <div class="hero-caption">
          <span class="caption-line"></span>
          <span>Mulanje Mountain · Malawi</span>
        </div>

        <a class="scroll-cue" href="#destinations" aria-label="Scroll to discover">
          <span>SCROLL TO DISCOVER</span><span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>

    <section class="intro-strip"><div class="page-width intro-grid"><p class="eyebrow">THE WARM HEART OF AFRICA</p><p class="intro-statement">A little more wonder.<br><em>A little closer to what matters.</em></p><p class="intro-copy">From the still blue of Lake Malawi to misty mountain paths and vibrant communities, find the Malawi that stays with you.</p></div></section>

    <section class="content-section destinations-section" id="destinations"><div class="page-width">${sectionHeading('FIND YOUR MALAWI', 'Places that stay with you', 'Start with a place you have dreamed about, or find somewhere new.')}
      <div class="destination-grid">
        <a class="destination-card destination-large" href="#map"><div class="destination-photo photo-lake">${photo('/photos/lake-kayak.jpg','Kayak on Lake Malawi')}</div><div class="destination-overlay"><span class="card-index">01 / LAKES & ISLANDS</span><h3>Lake Malawi</h3><p>Clear water, quiet shores and days that slow right down.</p><span class="round-arrow">↗</span></div></a>
        <a class="destination-card" href="#map"><div class="destination-photo photo-mountain">${photo('/photos/mountain-trek.jpg','Hiker in Malawi mountain landscape')}</div><div class="destination-overlay"><span class="card-index">02 / HIKING & NATURE</span><h3>Mulanje Mountain</h3><p>Big views, forest trails and fresh mountain air.</p><span class="round-arrow">↗</span></div></a>
        <a class="destination-card" href="#map"><div class="destination-photo photo-forest">${photo('/photos/forest-river.jpg','River flowing through green forest')}</div><div class="destination-overlay"><span class="card-index">03 / GREEN ESCAPES</span><h3>Find your quiet</h3><p>Follow the water and let the world get a little quieter.</p><span class="round-arrow">↗</span></div></a>
      </div><div class="section-footnote"><span>More of Malawi is waiting.</span><a href="#map" class="text-link">Explore the map ${arrow}</a></div>
    </div></section>

    <section class="map-section" id="map"><div class="map-glow" aria-hidden="true"></div><div class="page-width map-layout"><div class="map-copy"><p class="eyebrow eyebrow-light">SEE THE COUNTRY DIFFERENTLY</p><h2>Malawi is more<br>than a place on<br><em>the map.</em></h2><p>Get a feel for the land before you go. Explore the lake, highlands and places in between in our little 3D love letter to Malawi.</p><div class="map-feature-list"><span><b>01</b> Lakes & islands</span><span><b>02</b> Highlands & trails</span><span><b>03</b> Nature & culture</span></div><a class="button button-cream" href="#plan">Plan a journey here <span>→</span></a><p class="map-hint">A little 3D. A lot of Malawi. <span>Drag-free, scroll-led exploration.</span></p></div><div class="map-visual"><div class="map-label map-label-north"><span class="map-dot"></span> Northern highlands</div><div class="map-label map-label-lake"><span class="map-dot"></span> Lake Malawi</div><div class="map-label map-label-south"><span class="map-dot"></span> Mount Mulanje</div><div class="map-compass">N<br>✣</div><div class="map-bottom-note"><span>THE WARM HEART OF AFRICA</span><span>13° S · 34° E</span></div></div></div><div class="map-scroll-progress" aria-hidden="true"><span></span></div></section>

    <section class="content-section experiences-section" id="experiences"><div class="page-width">${sectionHeading('MAKE IT YOUR OWN', 'Experiences, not just itineraries', 'Whether you want to switch off, get moving or get to know the people and places that make Malawi special.')}
      <div class="experience-grid">
        <article class="experience-card"><div class="experience-image">${photo('/photos/lake-kayak.jpg','Lake Malawi water experience')}</div><div class="experience-meta"><span>01 / WATER & WILDERNESS</span><span>↗</span></div><h3>Lake escapes</h3><p>Unhurried lakeside days, water adventures and island time.</p><a href="#plan" class="text-link">Explore this feeling ↗</a></article>
        <article class="experience-card"><div class="experience-image">${photo('/photos/mountain-trek.jpg','Mountain hiking experience')}</div><div class="experience-meta"><span>02 / OUTDOORS</span><span>↗</span></div><h3>Wild trails</h3><p>Walk into the highlands and find a new perspective.</p><a href="#plan" class="text-link">Find your trail ↗</a></article>
        <article class="experience-card"><div class="experience-image">${photo('/photos/waterfall-pool.jpg','Waterfall pool in a green landscape')}</div><div class="experience-meta"><span>03 / SLOW TRAVEL</span><span>↗</span></div><h3>Hidden corners</h3><p>Little discoveries, local favourites and room to breathe.</p><a href="#plan" class="text-link">Find hidden gems ↗</a></article>
      </div>
    </div></section>

    <section class="about-section" id="about"><div class="about-image">${photo('/photos/misty-summit.jpg','Misty mountain landscape in Malawi')}</div><div class="about-panel"><p class="eyebrow">A JOURNEY WITH MERVIS</p><h2>Travel with heart.<br><em>See with new eyes.</em></h2><p>Travel is about more than ticking places off a list. It is the people you meet, the stories you hear, and the moments you take home.</p><p>Travel With Mervis is an invitation to experience Malawi with curiosity, care and a little sense of adventure.</p><a href="#plan" class="button button-dark">Let's plan your trip <span>→</span></a><span class="handwritten">Tiyeni.<br>Let's go.</span></div></section>

    <section class="content-section planning-section" id="how"><div class="page-width">${sectionHeading('SIMPLE FROM THE START', 'Your trip, your way', 'A few details are all we need to start shaping something memorable.')}
      <div class="steps-grid"><article><span class="step-number">01</span><h3>Tell us what moves you</h3><p>Share your ideas, dates, group size and the kind of experience you want.</p></article><article><span class="step-number">02</span><h3>Make a plan together</h3><p>We can shape the places, pace and practical details around your trip.</p></article><article><span class="step-number">03</span><h3>Come experience Malawi</h3><p>Get ready for meaningful moments, new perspectives and stories to keep.</p></article></div>
    </div></section>

    <section class="quote-section"><div class="quote-mark">“</div><blockquote>Some places you visit.<br><em>Some places become part of you.</em></blockquote><p>COME FIND YOUR MALAWI</p></section>

    <section class="journal-section content-section" id="journal"><div class="page-width">${sectionHeading('NOTES FROM THE WARM HEART', 'Stories for the curious', 'A little inspiration for the places, people and experiences you might discover.')}
      <div class="journal-grid"><article class="journal-card journal-featured"><div class="journal-image">${photo('/photos/forest-river.jpg','Forest river and green landscape')}</div><p class="eyebrow">FIELD NOTES · NATURE</p><h3>Take the scenic route</h3><p>Sometimes the best part of a journey is what you discover along the way.</p><a href="#destinations" class="text-link">Find your own route ↗</a></article><article class="journal-card"><div class="journal-image">${photo('/photos/lake-kayak.jpg','Kayak on Lake Malawi')}</div><p class="eyebrow">SLOW TRAVEL · LAKES</p><h3>Let the lake set the pace</h3><a href="#destinations" class="text-link">Explore lakeside escapes ↗</a></article><article class="journal-card"><div class="journal-image">${photo('/photos/mountain-trek.jpg','Mountain path and hiker')}</div><p class="eyebrow">OUTDOORS · HIGHLANDS</p><h3>A different view from up high</h3><a href="#destinations" class="text-link">Explore the highlands ↗</a></article></div>
    </div></section>

    <section class="plan-section" id="plan"><div class="page-width plan-layout"><div class="plan-intro"><p class="eyebrow eyebrow-light">YOUR NEXT STORY STARTS HERE</p><h2>Let's make a little<br><em>room for wonder.</em></h2><p>Tell us a little about the trip you have in mind. Even if it is just an idea, we'd love to hear it.</p><div class="plan-contact"><span>Prefer to write?</span><a href="mailto:${content.contact.email}">${content.contact.email}</a><span>${content.contact.location}</span></div></div><div class="plan-form-card"><h3>Plan with Mervis</h3><p>Start with the basics. We can figure out the rest together.</p><div class="form-field"><label for="name">Your name</label><input id="name" class="form-input" type="text" autocomplete="name" placeholder="What should we call you?"></div><fieldset class="trip-fieldset"><legend>What are you drawn to?</legend><div class="trip-options">${content.places.map((place) => `<label class="trip-option"><input type="radio" name="trip" value="${place.label}"><span>${place.label}</span></label>`).join('')}<label class="trip-option"><input type="radio" name="trip" value="${content.plan.notSure}"><span>Still dreaming</span></label></div></fieldset><div class="form-row"><div class="form-field"><label for="dates">When?</label><input id="dates" class="form-input" type="text" placeholder="Flexible / dates"></div><div class="form-field"><label for="group">Travellers</label><input id="group" class="form-input" type="number" min="1" inputmode="numeric" placeholder="2"></div></div><a class="button button-green button-full" id="send" href="#plan">Start a conversation <span>→</span></a><p id="status" class="form-status" role="status" aria-live="polite"></p><p class="form-privacy">No pressure, no obligation. Just the start of a good conversation.</p></div></div></section>
  `;

  // Replace the top-level navigation with a responsive, accessible menu.
  const nav = document.getElementById('nav');
  if (nav) {
    nav.className = 'site-nav';
    nav.innerHTML = `<div class="nav-inner page-width"><a class="brand" href="#top" aria-label="Travel With Mervis home"><span class="brand-mark">T<span>W</span>M</span><span class="brand-name">Travel <em>with Mervis</em></span></a><button class="menu-toggle" type="button" aria-expanded="false" aria-controls="nav-links" aria-label="Open navigation"><span></span><span></span></button><div class="nav-links" id="nav-links"><a href="#destinations">Destinations</a><a href="#experiences">Experiences</a><a href="#map">3D Map</a><a href="#about">Our story</a><a href="#journal">Journal</a><a class="nav-cta" href="#plan">Plan your trip <span>→</span></a></div></div>`;
    const toggle = nav.querySelector<HTMLButtonElement>('.menu-toggle');
    const links = nav.querySelector<HTMLElement>('.nav-links');
    toggle?.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
      links?.classList.toggle('is-open', !open);
    });
    links?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
      links.classList.remove('is-open'); toggle?.setAttribute('aria-expanded', 'false'); toggle?.setAttribute('aria-label', 'Open navigation');
    }));
  }

  const footer = document.getElementById('footer');
  if (footer) {
    footer.className = 'site-footer';
    footer.innerHTML = `<div class="page-width footer-main"><div class="footer-brand"><a class="brand brand-footer" href="#top"><span class="brand-mark">T<span>W</span>M</span><span class="brand-name">Travel <em>with Mervis</em></span></a><p>Real places. Real people.<br>Unforgettable journeys.</p></div><div class="footer-column"><span class="footer-heading">EXPLORE</span><a href="#destinations">Destinations</a><a href="#experiences">Experiences</a><a href="#map">3D Malawi map</a></div><div class="footer-column"><span class="footer-heading">TRAVEL WITH US</span><a href="#about">Our story</a><a href="#journal">Travel journal</a><a href="#plan">Plan a trip</a></div><div class="footer-column footer-contact"><span class="footer-heading">SAY HELLO</span><a href="mailto:${content.contact.email}">${content.contact.email}</a><span>${content.contact.location}</span><a href="#plan">Start an enquiry ↗</a></div></div><div class="page-width footer-bottom"><span>© ${new Date().getFullYear()} Travel With Mervis</span><span>Made with love for Malawi.</span><a href="#top">Back to top ↑</a></div>`;
  }

  const map = root.querySelector<HTMLElement>('.map-visual');
  if (map) {
    const canvas = document.getElementById('scene');
    if (canvas && canvas.parentElement !== map) map.prepend(canvas);
  }

  // Scene progress follows the map section only; the rest of the site scrolls normally.
  const mapSection = root.querySelector<HTMLElement>('#map');
  const stages = mapSection ? [mapSection] : [];
  const form = root.querySelector<HTMLElement>('#plan');
  if (form) {
    const heading = form.querySelector('h2');
    if (heading) heading.id = 'plan-heading';
    form.setAttribute('aria-labelledby', 'plan-heading');
  }
  // Keep the existing scene beat model intact; it now lives in the map component.
  void flatBeats;
  return stages;
}
