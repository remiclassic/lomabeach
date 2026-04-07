/**
 * Image sources: set `VITE_USE_LOCAL_IMAGES=true` in `.env` after adding files
 * under `public/images/` (see README for the filename map).
 */
const USE_LOCAL = import.meta.env.VITE_USE_LOCAL_IMAGES === 'true';

/** Public folder paths work on GitHub Pages when `base` is a subpath (e.g. /lomabeach/). */
function publicAsset(absoluteFromPublic: string): string {
  const rel = absoluteFromPublic.startsWith('/') ? absoluteFromPublic.slice(1) : absoluteFromPublic;
  return `${import.meta.env.BASE_URL}${rel}`;
}

function pick(local: string, remote: string): string {
  return USE_LOCAL ? publicAsset(local) : remote;
}

const R = (q: string) => `https://images.unsplash.com/${q}`;

export const IMG = {
  hero: pick(
    '/images/hero.jpg',
    R('photo-1473186578172-c141e6798cf4?auto=format&fit=crop&q=80&w=2400'),
  ),
  homePhilosophy: pick(
    '/images/home-philosophy.jpg',
    R('photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&q=80&w=1200'),
  ),
  homeExpPool: pick(
    '/images/home-experience-pool.jpg',
    R('photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=800'),
  ),
  homeExpHammock: pick(
    '/images/home-experience-hammock.jpg',
    R('photo-1520483601560-389dff434fdf?auto=format&fit=crop&q=80&w=800'),
  ),
  homeExpSunset: pick(
    '/images/home-experience-sunset.jpg',
    R('photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200'),
  ),
  gallery: [
    pick('/images/gallery-01.jpg', R('photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800')),
    pick('/images/gallery-02.jpg', R('photo-1519046904884-53103b34b206?auto=format&fit=crop&q=80&w=800')),
    pick('/images/gallery-03.jpg', R('photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800')),
    pick('/images/gallery-04.jpg', R('photo-1520483601560-389dff434fdf?auto=format&fit=crop&q=80&w=800')),
    pick('/images/gallery-05.jpg', R('photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=800')),
    pick('/images/gallery-06.jpg', R('photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=800')),
  ],
  resortPool: pick(
    '/images/resort-pool.jpg',
    R('photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80&w=800'),
  ),
  resortCocktails: pick(
    '/images/resort-cocktails.jpg',
    R('photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800'),
  ),
  resortLoungers: pick(
    '/images/resort-loungers.jpg',
    R('photo-1520483601560-389dff434fdf?auto=format&fit=crop&q=80&w=800'),
  ),
  resortMornings: pick(
    '/images/resort-mornings.jpg',
    R('photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800'),
  ),
  resortGoldenHour: pick(
    '/images/resort-golden-hour.jpg',
    R('photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800'),
  ),
  locationMap: pick(
    '/images/location.jpg',
    R('photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&q=80&w=1200'),
  ),
  roomBeachfrontDouble: pick(
    '/images/room-beachfront-double-main.jpg',
    R('photo-1590073242678-70ee3fc28e8e?auto=format&fit=crop&q=80&w=1200'),
  ),
  roomBeachfrontDoubleG2: pick(
    '/images/room-beachfront-double-2.jpg',
    R('photo-1544124499-58912cbddaad?auto=format&fit=crop&q=80&w=1200'),
  ),
  roomBeachfrontDoubleG3: pick(
    '/images/room-beachfront-double-3.jpg',
    R('photo-1571896349842-33c89424de2d?auto=format&fit=crop&q=80&w=1200'),
  ),
  roomBeachfrontFamily: pick(
    '/images/room-beachfront-family-main.jpg',
    R('photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=1200'),
  ),
  roomBeachfrontFamilyG2: pick(
    '/images/room-beachfront-family-2.jpg',
    R('photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1200'),
  ),
  roomBeachfrontFamilyG3: pick(
    '/images/room-beachfront-family-3.jpg',
    R('photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&q=80&w=1200'),
  ),
  roomBeachfrontFamilyG4: pick(
    '/images/room-beachfront-family-4.jpg',
    R('photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=1200'),
  ),
  roomTripleGarden: pick(
    '/images/room-triple-garden-main.jpg',
    R('photo-1566665797739-1674de7a421a?auto=format&fit=crop&q=80&w=1200'),
  ),
  roomTripleGardenG2: pick(
    '/images/room-triple-garden-2.jpg',
    R('photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=1200'),
  ),
  roomTripleGardenG3: pick(
    '/images/room-triple-garden-3.jpg',
    R('photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=1200'),
  ),
  roomDoubleGarden: pick(
    '/images/room-double-garden-main.jpg',
    R('photo-1618773928121-c32242e63f39?auto=format&fit=crop&q=80&w=1200'),
  ),
  roomDoubleGardenG2: pick(
    '/images/room-double-garden-2.jpg',
    R('photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200'),
  ),
  roomDoubleGardenG3: pick(
    '/images/room-double-garden-3.jpg',
    R('photo-1584132967334-10e028bd69f7?auto=format&fit=crop&q=80&w=1200'),
  ),
} as const;

export const GALLERY_IMAGES = IMG.gallery;
