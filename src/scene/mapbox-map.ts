import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

type Destination = {
  name: string;
  category: string;
  description: string;
  coordinates: [number, number];
  zoom: number;
  pitch: number;
  bearing: number;
};

const destinations: Destination[] = [
  {
    name: 'Lake Malawi',
    category: 'LAKES & ISLANDS',
    description: 'Turquoise water, quiet beaches and island escapes.',
    coordinates: [34.65, -12.15],
    zoom: 8.2,
    pitch: 67,
    bearing: -20
  },
  {
    name: 'Mount Mulanje',
    category: 'HIGHLANDS & TRAILS',
    description: 'Mountain forests, dramatic peaks and unforgettable trails.',
    coordinates: [35.59, -16.03],
    zoom: 9.2,
    pitch: 66,
    bearing: 15
  },
  {
    name: 'Nyika Plateau',
    category: 'WILDERNESS',
    description: 'Open highland landscapes and remarkable natural scenery.',
    coordinates: [33.75, -10.75],
    zoom: 8.2,
    pitch: 65,
    bearing: -15
  },
  {
    name: 'Liwonde',
    category: 'WILDLIFE & SAFARI',
    description: 'River landscapes and wildlife-rich protected areas.',
    coordinates: [35.27, -15.05],
    zoom: 9.0,
    pitch: 65,
    bearing: -10
  },
  {
    name: 'Zomba Plateau',
    category: 'NATURE & CULTURE',
    description: 'Forest-covered heights and beautiful views over southern Malawi.',
    coordinates: [35.31, -15.38],
    zoom: 9.4,
    pitch: 65,
    bearing: 10
  }
];

let mapInstance: mapboxgl.Map | null = null;
let resizeObserver: ResizeObserver | null = null;
let activeMarker: HTMLElement | null = null;

function showDestination(destination: Destination, marker?: HTMLElement): void {
  if (!mapInstance) return;

  if (activeMarker) activeMarker.classList.remove('is-selected');
  activeMarker = marker ?? null;
  activeMarker?.classList.add('is-selected');

  const title = document.getElementById('mapbox-destination-title');
  const category = document.getElementById('mapbox-destination-category');
  const description = document.getElementById('mapbox-destination-description');

  if (title) title.textContent = destination.name;
  if (category) category.textContent = destination.category;
  if (description) description.textContent = destination.description;

  mapInstance.flyTo({
    center: destination.coordinates,
    zoom: destination.zoom,
    pitch: destination.pitch,
    bearing: destination.bearing,
    duration: 2400,
    curve: 1.35,
    speed: 0.72,
    essential: true
  });
}

export function startMalawiMap(): void {
  const container = document.getElementById('mapbox-map');
  if (!container || mapInstance) return;

  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string | undefined;

  if (!token) {
    container.innerHTML = `
      <div class="mapbox-token-message">
        <span>TRAVEL WITH MERVIS · MALAWI</span>
        <h3>Discover Malawi from a different perspective.</h3>
        <p>Add your Mapbox public access token to activate the interactive terrain.</p>
      </div>`;
    return;
  }

  mapboxgl.accessToken = token;

  mapInstance = new mapboxgl.Map({
    container,
    style: 'mapbox://styles/mapbox/satellite-streets-v12',
    center: [34.3, -13.25],
    zoom: 6.5,
    pitch: 64,
    bearing: -8,
    antialias: true,
    projection: 'mercator',
    attributionControl: false,
    maxPitch: 80
  });

  mapInstance.addControl(
    new mapboxgl.NavigationControl({ visualizePitch: true }),
    'top-right'
  );

  mapInstance.addControl(
    new mapboxgl.AttributionControl({ compact: true }),
    'bottom-right'
  );

  mapInstance.on('style.load', () => {
    if (!mapInstance) return;

    if (!mapInstance.getSource('malawi-dem')) {
      mapInstance.addSource('malawi-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxzoom: 14
      });
    }

    mapInstance.setTerrain({
      source: 'malawi-dem',
      exaggeration: 1.65
    });

    if (!mapInstance.getLayer('malawi-hillshade')) {
      mapInstance.addLayer({
        id: 'malawi-hillshade',
        source: 'malawi-dem',
        type: 'hillshade',
        paint: {
          'hillshade-exaggeration': 0.32,
          'hillshade-shadow-color': '#263c30',
          'hillshade-highlight-color': '#f4e9c9',
          'hillshade-accent-color': '#71846a'
        }
      });
    }

    mapInstance.setFog({
      color: 'rgb(218, 229, 218)',
      'high-color': 'rgb(145, 184, 199)',
      'horizon-blend': 0.09,
      'space-color': 'rgb(19, 43, 35)',
      'star-intensity': 0
    });
  });

  destinations.forEach((destination, index) => {
    const marker = document.createElement('button');
    marker.type = 'button';
    marker.className = 'mw-map-marker';
    marker.setAttribute('aria-label', `Explore ${destination.name}`);
    marker.innerHTML = `
      <span class="mw-marker-dot"><span></span></span>
      <span class="mw-marker-label">${destination.name}</span>
    `;

    marker.addEventListener('click', (event) => {
      event.stopPropagation();
      showDestination(destination, marker);
    });

    new mapboxgl.Marker({
      element: marker,
      anchor: 'bottom'
    })
      .setLngLat(destination.coordinates)
      .addTo(mapInstance!);

    if (index === 0) {
      // Initial selection is set after the map loads.
      marker.dataset.initial = 'true';
    }
  });

  const initial = destinations[0];
  const initialMarker = container.querySelector<HTMLElement>('[data-initial="true"]');

  mapInstance.once('load', () => {
    if (!mapInstance) return;

    showDestination(initial, initialMarker ?? undefined);

    // Set the terrain camera after the first frame to avoid an initial jump.
    window.setTimeout(() => mapInstance?.resize(), 100);
  });

  mapInstance.on('error', (event) => {
    console.error('Mapbox error:', event.error);
  });

  resizeObserver = new ResizeObserver(() => mapInstance?.resize());
  resizeObserver.observe(container);

  requestAnimationFrame(() => mapInstance?.resize());
}
