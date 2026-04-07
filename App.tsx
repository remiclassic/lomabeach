import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import { GALLERY_IMAGES, IMG } from './constants/images';
import { NIGHTLY_RATE_MAJOR, ROOM_MAX_GUESTS } from './constants/pricing';
import { getContactEmail, getCurrencySymbol, resolveApiUrl } from './lib/siteConfig';
import { BookingDateField, BookingRoomSelect, parseISODateLocal, toISODateLocal } from './components/BookingPickers';
import { useBodyScrollLock } from './hooks/useBodyScrollLock';
import { useFocusTrap } from './hooks/useFocusTrap';
import { Room } from './types';
import {
  Menu,
  X,
  Calendar,
  MapPin,
  Phone,
  Instagram,
  Facebook,
  ArrowRight,
  ArrowLeft,
  Wind,
  Waves,
  ShieldCheck,
  Navigation,
  Mail,
  MessageCircle,
  CheckCircle2,
  Maximize2,
  BedDouble,
  Info,
  Sparkles,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Sun,
  Coffee,
  Wine,
  Moon,
  Wifi,
  Camera,
  Plane,
  Ship,
  CarTaxiFront,
  Clock,
  Receipt,
} from 'lucide-react';

function formatMajorAmount(amount: number): string {
  return `${getCurrencySymbol()}${amount}`;
}

// Consolidated Mock Data with sun-washed, tropical imagery
const ROOMS: Room[] = [
  {
    id: 'beachfront-double',
    name: 'Beachfront Double',
    description: 'A sun-drenched sanctuary right on the sand. Perfect for couples who want to roll out of bed and into the surf. Features high ceilings and a private balcony overlooking the Gulf. Only two of these exclusive units exist.',
    price: NIGHTLY_RATE_MAJOR['beachfront-double'],
    maxGuests: ROOM_MAX_GUESTS['beachfront-double'],
    size: '35 m²',
    beds: '1 King Bed',
    image: IMG.roomBeachfrontDouble,
    gallery: [
      IMG.roomBeachfrontDouble,
      IMG.roomBeachfrontDoubleG2,
      IMG.roomBeachfrontDoubleG3,
    ],
    amenities: ['Direct Beach Access', 'Air conditioning', 'Free WiFi', 'Private Balcony', 'Mini Bar', 'Premium Toiletries', 'Rain Shower'],
    view: 'Beach',
    availability: 'few-left'
  },
  {
    id: 'beachfront-family',
    name: 'Beachfront Family Suite',
    description: 'Our most exclusive flagship offering. This singular suite provides expansive sea views and direct beach access for the whole family. Features separate sleeping quarters and a large terrace for sunset dinners.',
    price: NIGHTLY_RATE_MAJOR['beachfront-family'],
    maxGuests: ROOM_MAX_GUESTS['beachfront-family'],
    size: '75 m²',
    beds: '1 King & 2 Double Beds',
    image: IMG.roomBeachfrontFamily,
    gallery: [
      IMG.roomBeachfrontFamily,
      IMG.roomBeachfrontFamilyG2,
      IMG.roomBeachfrontFamilyG3,
      IMG.roomBeachfrontFamilyG4,
    ],
    amenities: ['Panoramic View', 'Large Private Terrace', 'Living Area', 'Mini Fridge', 'Free WiFi', 'Double Vanities', 'Safe'],
    view: 'Beach',
    availability: 'few-left'
  },
  {
    id: 'triple-garden',
    name: 'Triple Garden Retreat',
    description: 'Tucked away in our lush tropical gardens, these six retreats offer a quiet, cool escape for a small group. Features a lovely terrace perfect for morning coffee while listening to the jungle birds.',
    price: NIGHTLY_RATE_MAJOR['triple-garden'],
    maxGuests: ROOM_MAX_GUESTS['triple-garden'],
    size: '40 m²',
    beds: '1 Queen & 1 Single Bed',
    image: IMG.roomTripleGarden,
    gallery: [
      IMG.roomTripleGarden,
      IMG.roomTripleGardenG2,
      IMG.roomTripleGardenG3,
    ],
    amenities: ['Garden View', 'Air conditioning', 'Terrace', 'Free WiFi', 'Electric Kettle', 'Private Bathroom', 'Daily Housekeeping'],
    view: 'Garden',
    availability: 'available'
  },
  {
    id: 'double-garden',
    name: 'Double Garden Sanctuary',
    description: 'Our core sanctuary experience. Ten units are nested throughout the property, offering simple, elegant comfort surrounded by bougainvillea and palms. The perfect base for your island exploration.',
    price: NIGHTLY_RATE_MAJOR['double-garden'],
    maxGuests: ROOM_MAX_GUESTS['double-garden'],
    size: '30 m²',
    beds: '1 Queen Bed',
    image: IMG.roomDoubleGarden,
    gallery: [
      IMG.roomDoubleGarden,
      IMG.roomDoubleGardenG2,
      IMG.roomDoubleGardenG3,
    ],
    amenities: ['Garden View', 'Air conditioning', 'Compact Balcony', 'Free WiFi', 'Desk Space', 'Tiled Floors', 'Hot Water'],
    view: 'Garden',
    availability: 'available'
  }
];

const AVAILABILITY_BADGE_CONFIG: Record<
  NonNullable<Room['availability']>,
  { text: string; color: string }
> = {
  available: { text: 'Available', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  'few-left': { text: 'Few left', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  'sold-out': { text: 'Sold out', color: 'bg-rose-100 text-rose-700 border-rose-200' },
};

const AvailabilityBadge = ({ status }: { status?: Room['availability'] }) => {
  if (!status) return null;
  const { text, color } = AVAILABILITY_BADGE_CONFIG[status];
  return (
    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${color}`}>
      {text}
    </span>
  );
};

const ViewBadge = ({ view }: { view: Room['view'] }) => {
  return (
    <span className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest text-deep-sea-blue shadow-sm border border-white/20">
      {view} View
    </span>
  );
};

type Page = 'home' | 'rooms' | 'booking' | 'resort-life' | 'gallery' | 'location' | 'contact';

const ROOMS_STAY_INCLUDES = [
  { label: 'Free Wi‑Fi', caption: 'Stay connected', Icon: Wifi },
  { label: 'A/C', caption: 'Cool & calm', Icon: Wind },
  { label: 'Housekeeping', caption: 'Fresh dailies', Icon: Sparkles },
  { label: 'Quality linens', caption: 'Soft landings', Icon: BedDouble },
] as const;

const ROOMS_VIEW_FILTERS = [
  { id: 'all' as const, label: 'All rooms' },
  { id: 'Beach' as const, label: 'Beachfront' },
  { id: 'Garden' as const, label: 'Garden' },
] as const;

const RESORT_LIFE_MOMENTS = [
  {
    title: 'Pool Moments',
    subtitle: 'Turquoise water, palm shade, and nowhere to be.',
    img: IMG.resortPool,
    colSpan: 'md:col-span-2',
    timeLabel: 'Midday',
  },
  {
    title: 'Cocktails',
    subtitle: 'Cold drinks, warm light, zero itinerary.',
    img: IMG.resortCocktails,
    colSpan: '',
    timeLabel: 'Golden hour',
  },
  {
    title: 'Sun Loungers',
    subtitle: 'Lean back. Listen to the waves. Forget your inbox.',
    img: IMG.resortLoungers,
    colSpan: '',
    timeLabel: 'Afternoon',
  },
  {
    title: 'Slow Mornings',
    subtitle: 'Coffee first. Plans later. Maybe never.',
    img: IMG.resortMornings,
    colSpan: 'md:col-span-2',
    timeLabel: 'Morning',
  },
  {
    title: 'Golden Hour',
    subtitle: 'The whole property turns honey and rose — stroll, sip, stay.',
    img: IMG.resortGoldenHour,
    colSpan: 'md:col-span-3',
    timeLabel: 'Sunset',
  },
] as const;

const RESORT_DAY_RHYTHM = [
  { label: 'Morning', caption: 'Quiet & coffee', Icon: Coffee },
  { label: 'Midday', caption: 'Sun & pool', Icon: Sun },
  { label: 'Golden hour', caption: 'Drinks & light', Icon: Wine },
  { label: 'Night', caption: 'Soft & slow', Icon: Moon },
] as const;

/** Must stay in sync with `GALLERY_IMAGES` order in `constants/images`. */
const GALLERY_ITEMS = [
  {
    src: GALLERY_IMAGES[0],
    alt: 'Tropical beach shoreline',
    caption: 'First light on the water',
    mood: 'shore' as const,
  },
  {
    src: GALLERY_IMAGES[1],
    alt: 'Sandy beach and ocean',
    caption: 'Footprints and endless blue',
    mood: 'shore' as const,
  },
  {
    src: GALLERY_IMAGES[2],
    alt: 'Calm resort scene',
    caption: 'Where the property exhales',
    mood: 'spaces' as const,
  },
  {
    src: GALLERY_IMAGES[3],
    alt: 'Coastal relaxation',
    caption: 'Shade, breeze, stillness',
    mood: 'spaces' as const,
  },
  {
    src: GALLERY_IMAGES[4],
    alt: 'Poolside palms',
    caption: 'Palm shadows on the deck',
    mood: 'spaces' as const,
  },
  {
    src: GALLERY_IMAGES[5],
    alt: 'Island seascape',
    caption: 'Horizon lines and soft gold',
    mood: 'shore' as const,
  },
] as const;

const GALLERY_LENS_STRIP = [
  { label: 'Natural light', caption: 'Honest island tones', Icon: Sun },
  { label: 'Wide horizons', caption: 'Sea meets sky', Icon: Waves },
  { label: 'Six vignettes', caption: 'From sand to lobby calm', Icon: Camera },
] as const;

const GALLERY_MOOD_FILTERS = [
  { id: 'all' as const, label: 'All frames' },
  { id: 'shore' as const, label: 'Sea & sand' },
  { id: 'spaces' as const, label: 'Pool & stays' },
] as const;

const LOCATION_SPOTLIGHT = [
  { label: 'Haad Rin', caption: 'Koh Phangan, Thailand', Icon: MapPin },
  { label: 'Best of both', caption: 'Near the scene, off the buzz', Icon: Navigation },
  { label: 'Island rhythm', caption: 'Beach, green hills, slow evenings', Icon: Waves },
] as const;

const LOCATION_GETTING_HERE = [
  { label: 'Fly in', caption: 'Ko Samui (USM) is the nearest hub', Icon: Plane },
  { label: 'Ferry across', caption: 'Regular boats to Phangan', Icon: Ship },
  { label: 'Last leg', caption: 'Taxi or songthaew to Haad Rin', Icon: CarTaxiFront },
] as const;

const LOCATION_ADDRESS_LINE = 'Loma Beach Resort, Haad Rin, Koh Phangan, Surat Thani, Thailand';

const CONTACT_PHONE_HREF = 'tel:+66881234567';
const CONTACT_PHONE_DISPLAY = '+66 88 123 4567';
const CONTACT_WHATSAPP_HREF = 'https://wa.me/66881234567';

const CONTACT_REPLY_STRIP = [
  { label: 'Real humans', caption: 'Small team, thoughtful replies', Icon: MessageCircle },
  { label: 'Prioritized help', caption: 'Arrivals & date changes first', Icon: Clock },
  { label: 'No junk mail', caption: "We won't spam your inbox", Icon: ShieldCheck },
] as const;

const HOME_PROMISE_STRIP = [
  { label: 'No rush', caption: 'Arrive on island time', Icon: Clock },
  { label: 'Salt & shade', caption: 'The Gulf sets the rhythm', Icon: Waves },
  { label: 'Small & cared for', caption: 'Hands-on hosting, always', Icon: Sparkles },
] as const;

const BOOKING_TRUST_STRIP = [
  { label: 'Stripe secure', caption: 'Cards handled on Stripe — not stored here', Icon: ShieldCheck },
  { label: 'Price in plain sight', caption: 'Nights × rate before you commit', Icon: Receipt },
  { label: 'Email receipt', caption: "We'll confirm the finer details", Icon: Mail },
] as const;

const BOOKING_STEPS = [
  { step: 1 as const, label: 'Details' },
  { step: 2 as const, label: 'Checkout' },
  { step: 3 as const, label: 'Done' },
] as const;

const FOOTER_EXPLORE_LINKS = [
  { label: 'Home', page: 'home' as const },
  { label: 'Rooms & suites', page: 'rooms' as const },
  { label: 'Book your escape', page: 'booking' as const },
  { label: 'Resort life', page: 'resort-life' as const },
  { label: 'Gallery', page: 'gallery' as const },
  { label: 'Location', page: 'location' as const },
  { label: 'Contact', page: 'contact' as const },
] as const;

const FOOTER_TRUST_ROW = [
  { label: 'Secure checkout', caption: 'Stripe when you pay', Icon: ShieldCheck },
  { label: 'Human replies', caption: 'No chatbots — promise', Icon: MessageCircle },
  { label: 'Island time', caption: 'Haad Rin, Koh Phangan', Icon: MapPin },
] as const;

const FOOTER_LINK_CLASS =
  'text-left w-full min-h-11 py-2 rounded-sm text-sand-tan/80 hover:text-sunset-pink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink focus-visible:ring-offset-2 focus-visible:ring-offset-deep-sea-blue';

type NavLinkProps = {
  page: Page;
  label: string;
  activePage: Page;
  onNavigate: (page: Page) => void;
  /** Desktop bar: bottom accent. Mobile drawer: pill highlight for the current page. */
  layout?: 'toolbar' | 'stack';
  className?: string;
};

function NavLink({
  page,
  label,
  activePage,
  onNavigate,
  layout = 'toolbar',
  className = '',
}: NavLinkProps) {
  const isActive = activePage === page;

  const toolbarClasses =
    layout === 'toolbar'
      ? [
          'text-sm tracking-widest uppercase',
          'min-h-11 px-2 -mx-1 inline-flex items-center justify-center',
          'border-b-2 border-transparent pb-0.5 rounded-sm',
          'transition-[color,border-color]',
          isActive ? 'text-sunset-pink font-semibold border-sunset-pink' : 'text-deep-sea-blue font-medium hover:text-sunset-pink',
        ].join(' ')
      : '';

  const stackClasses =
    layout === 'stack'
      ? [
          'text-base tracking-widest uppercase',
          'w-full max-w-xs min-h-12 px-5 inline-flex items-center justify-center rounded-2xl',
          'transition-[color,background-color,box-shadow]',
          isActive
            ? 'text-sunset-pink font-semibold bg-sunset-pink/15 shadow-[inset_0_0_0_1px_rgba(244,161,161,0.35)]'
            : 'text-deep-sea-blue font-medium hover:bg-deep-sea-blue/[0.05]',
        ].join(' ')
      : '';

  return (
    <button
      type="button"
      onClick={() => onNavigate(page)}
      aria-current={isActive ? 'page' : undefined}
      className={`focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink focus-visible:ring-offset-2 focus-visible:ring-offset-sand-tan ${
        layout === 'toolbar' ? toolbarClasses : stackClasses
      } ${className}`}
    >
      {label}
    </button>
  );
}

const MOBILE_MENU_ID = 'main-mobile-menu';

export default function App() {
  const [activePage, setActivePage] = useState<Page>('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);
  const [stripeBookingReturn, setStripeBookingReturn] = useState<'success' | 'cancel' | null>(null);

  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const consumeStripeBookingReturn = useCallback(() => {
    setStripeBookingReturn(null);
  }, []);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get('booking_success') === '1') {
      setStripeBookingReturn('success');
      setActivePage('booking');
      setIsMenuOpen(false);
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }
    if (p.get('booking_cancel') === '1') {
      setStripeBookingReturn('cancel');
      setActivePage('booking');
      setIsMenuOpen(false);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activePage]);

  const navigate = useCallback((page: Page) => {
    setActivePage(page);
    setIsMenuOpen(false);
  }, []);

  const goHome = useCallback(() => navigate('home'), [navigate]);
  const goRooms = useCallback(() => navigate('rooms'), [navigate]);
  const goBooking = useCallback(() => {
    setSelectedRoom(null);
    navigate('booking');
  }, [navigate]);

  const openViewRoom = useCallback((room: Room) => {
    setViewingRoom(room);
  }, []);

  const handleBookFromModal = useCallback(
    (room: Room) => {
      if (room.availability === 'sold-out') return;
      setSelectedRoom(room);
      setViewingRoom(null);
      navigate('booking');
    },
    [navigate],
  );

  const handleSelectRoomForBooking = useCallback(
    (room: Room) => {
      if (room.availability === 'sold-out') return;
      setSelectedRoom(room);
      navigate('booking');
    },
    [navigate],
  );

  const closeRoomModal = useCallback(() => setViewingRoom(null), []);

  const toggleMenu = useCallback(() => setIsMenuOpen((open) => !open), []);

  useBodyScrollLock(isMenuOpen);
  useFocusTrap(isMenuOpen, mobileMenuRef);

  useEffect(() => {
    if (!isMenuOpen) return;
    const restoreEl = menuButtonRef.current;
    const id = window.requestAnimationFrame(() => {
      mobileMenuRef.current?.querySelector<HTMLElement>('button')?.focus();
    });
    return () => {
      window.cancelAnimationFrame(id);
      restoreEl?.focus();
    };
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-x-hidden">
      <a href="#main-content" className="sr-only skip-link">
        Skip to main content
      </a>
      <nav className="fixed w-full z-50" aria-label="Primary">
        {/* Blur on inner bar only so the mobile panel stays viewport-fixed (backdrop-filter on an ancestor breaks that). */}
        <div className="relative z-10 bg-sand-tan/90 backdrop-blur-md shadow-sm w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
            <button
              type="button"
              onClick={goHome}
              className="flex items-center justify-start text-left rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink focus-visible:ring-offset-2 focus-visible:ring-offset-sand-tan min-h-11"
              aria-label="Loma Beach Resort — Home"
            >
              <div className="inline-flex flex-col items-start text-left border-l-2 border-sunset-pink/50 pl-4">
                <span className="font-serif text-4xl tracking-tighter text-deep-sea-blue leading-none text-left">
                  LOMA
                </span>
                <span className="text-[10px] tracking-[0.3em] uppercase mt-1 font-semibold text-deep-sea-blue/80 text-left">
                  Beach Resort
                </span>
              </div>
            </button>
            <div className="hidden lg:flex items-center gap-8">
              <NavLink page="home" label="Home" activePage={activePage} onNavigate={navigate} />
              <NavLink page="rooms" label="Rooms" activePage={activePage} onNavigate={navigate} />
              <NavLink page="resort-life" label="Resort Life" activePage={activePage} onNavigate={navigate} />
              <NavLink page="gallery" label="Gallery" activePage={activePage} onNavigate={navigate} />
              <NavLink page="location" label="Location" activePage={activePage} onNavigate={navigate} />
              <NavLink page="contact" label="Contact" activePage={activePage} onNavigate={navigate} />
              <button
                type="button"
                onClick={goBooking}
                className="bg-sunset-pink text-white px-6 py-2.5 min-h-10 rounded-full font-medium hover:bg-deep-sea-blue transition-all transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-sea-blue focus-visible:ring-offset-2 focus-visible:ring-offset-sand-tan"
              >
                Book Now
              </button>
            </div>
            <button
              ref={menuButtonRef}
              type="button"
              className="lg:hidden text-deep-sea-blue min-h-11 min-w-11 inline-flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink focus-visible:ring-offset-2 focus-visible:ring-offset-sand-tan"
              onClick={toggleMenu}
              aria-expanded={isMenuOpen}
              aria-controls={MOBILE_MENU_ID}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMenuOpen ? <X size={28} aria-hidden /> : <Menu size={28} aria-hidden />}
            </button>
          </div>
        </div>
        {isMenuOpen && (
          <div
            ref={mobileMenuRef}
            id={MOBILE_MENU_ID}
            role="dialog"
            aria-modal="true"
            aria-label="Site navigation"
            className="lg:hidden fixed inset-x-0 top-[4rem] bottom-0 bg-sand-tan flex flex-col items-center justify-start pt-12 pb-10 px-4 gap-6 overflow-y-auto overscroll-contain shadow-[0_-4px_24px_rgba(44,68,82,0.08)] animate-in slide-in-from-top duration-300"
          >
            <NavLink page="home" label="Home" activePage={activePage} onNavigate={navigate} layout="stack" />
            <NavLink page="rooms" label="Rooms" activePage={activePage} onNavigate={navigate} layout="stack" />
            <NavLink page="resort-life" label="Resort Life" activePage={activePage} onNavigate={navigate} layout="stack" />
            <NavLink page="gallery" label="Gallery" activePage={activePage} onNavigate={navigate} layout="stack" />
            <NavLink page="location" label="Location" activePage={activePage} onNavigate={navigate} layout="stack" />
            <NavLink page="contact" label="Contact" activePage={activePage} onNavigate={navigate} layout="stack" />
            <button
              type="button"
              onClick={goBooking}
              className="bg-sunset-pink text-white px-10 py-3.5 min-h-12 rounded-full font-medium w-full max-w-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-sea-blue focus-visible:ring-offset-2 focus-visible:ring-offset-sand-tan"
            >
              Book Now
            </button>
          </div>
        )}
      </nav>

      <main id="main-content" className="flex-grow pt-16" tabIndex={-1}>
        {activePage === 'home' && (
          <HomePage
            onBook={goBooking}
            onSeeRooms={goRooms}
            onViewRoom={openViewRoom}
            onBookRoom={handleSelectRoomForBooking}
            onViewResortLife={() => navigate('resort-life')}
            onViewGallery={() => navigate('gallery')}
            onViewLocation={() => navigate('location')}
          />
        )}
        {activePage === 'rooms' && (
          <RoomsPage onSelectRoom={openViewRoom} onBookRoom={handleSelectRoomForBooking} onFlexibleBook={goBooking} />
        )}
        {activePage === 'resort-life' && <ResortLifePage onViewGallery={() => navigate('gallery')} />}
        {activePage === 'gallery' && <GalleryPage onBook={goBooking} onViewRooms={goRooms} />}
        {activePage === 'location' && (
          <LocationPage onBook={goBooking} onContact={() => navigate('contact')} />
        )}
        {activePage === 'contact' && (
          <ContactPage onBook={goBooking} onViewLocation={() => navigate('location')} />
        )}
        {activePage === 'booking' && (
          <BookingPage
            initialRoom={selectedRoom}
            stripeReturn={stripeBookingReturn}
            onConsumedStripeReturn={consumeStripeBookingReturn}
            onGoHome={() => navigate('home')}
            onContact={() => navigate('contact')}
          />
        )}
      </main>

      {viewingRoom && <RoomModal room={viewingRoom} onClose={closeRoomModal} onBook={handleBookFromModal} />}

      <footer className="relative bg-deep-sea-blue text-sand-tan overflow-hidden pb-28 lg:pb-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_55%_40%_at_15%_0%,rgba(244,166,166,0.35),transparent),radial-gradient(ellipse_45%_50%_at_95%_75%,rgba(159,227,212,0.22),transparent)]"
          aria-hidden
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16">
          <div className="rounded-2xl border border-sand-tan/10 bg-white/5 backdrop-blur-sm px-4 py-5 sm:px-8 sm:py-6">
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.35em] text-sand-tan/50 mb-4 sm:mb-5">
              Why guests trust Loma
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {FOOTER_TRUST_ROW.map(({ label, caption, Icon }) => (
                <div key={label} className="flex items-start gap-3 sm:flex-col sm:items-center sm:text-center">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sand-tan/10 text-sunset-pink ring-1 ring-sand-tan/15">
                    <Icon size={18} strokeWidth={1.75} aria-hidden />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-sand-tan">{label}</p>
                    <p className="text-xs text-sand-tan/65 font-light mt-0.5 leading-relaxed">{caption}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pt-12 sm:pt-14">
            <div className="lg:col-span-4 space-y-6">
              <div className="inline-flex flex-col border-l-2 border-sunset-pink/50 pl-4">
                <span className="font-serif text-4xl tracking-tighter leading-none">LOMA</span>
                <span className="text-[10px] tracking-[0.3em] uppercase mt-1 font-semibold text-sand-tan/80">
                  Beach Resort
                </span>
              </div>
              <p className="text-sand-tan/70 font-light leading-relaxed max-w-sm text-sm sm:text-base">
                Where days slow down and the Gulf sets the pace. Come exhale — we&apos;ll keep the sunscreen stocked.
              </p>
              <div className="flex flex-wrap items-center gap-2" aria-label="Social links">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-full border border-sand-tan/15 bg-white/5 text-sand-tan hover:border-sunset-pink/50 hover:text-sunset-pink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink focus-visible:ring-offset-2 focus-visible:ring-offset-deep-sea-blue"
                  aria-label="Instagram"
                >
                  <Instagram size={20} aria-hidden />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-full border border-sand-tan/15 bg-white/5 text-sand-tan hover:border-sunset-pink/50 hover:text-sunset-pink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink focus-visible:ring-offset-2 focus-visible:ring-offset-deep-sea-blue"
                  aria-label="Facebook"
                >
                  <Facebook size={20} aria-hidden />
                </a>
                <a
                  href={CONTACT_WHATSAPP_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-11 min-w-11 inline-flex items-center justify-center rounded-full border border-sand-tan/15 bg-white/5 text-sand-tan hover:border-poolside-aqua/60 hover:text-poolside-aqua transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink focus-visible:ring-offset-2 focus-visible:ring-offset-deep-sea-blue"
                  aria-label="Message on WhatsApp"
                >
                  <MessageCircle size={20} aria-hidden />
                </a>
              </div>
            </div>

            <div className="lg:col-span-3">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.35em] text-sunset-pink/90 mb-4 sm:mb-5">
                Explore
              </h4>
              <nav aria-label="Footer">
                <ul className="space-y-1 font-light">
                  {FOOTER_EXPLORE_LINKS.map(({ label, page: dest }) => {
                    const here = activePage === dest;
                    return (
                      <li key={dest}>
                        <button
                          type="button"
                          onClick={() => navigate(dest)}
                          aria-current={here ? 'page' : undefined}
                          className={`${FOOTER_LINK_CLASS} ${here ? 'text-sunset-pink font-semibold' : ''}`}
                        >
                          {label}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>

            <div className="lg:col-span-3">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.35em] text-sunset-pink/90 mb-4 sm:mb-5">
                Reach us
              </h4>
              <ul className="space-y-4 text-sm text-sand-tan/75 font-light">
                <li className="flex items-start gap-3">
                  <MapPin size={18} className="flex-shrink-0 mt-0.5 text-sunset-pink/80" aria-hidden />
                  <span className="leading-relaxed">Haad Rin, Koh Phangan, Thailand</span>
                </li>
                <li className="flex items-center gap-3 min-w-0">
                  <Phone size={18} className="flex-shrink-0 text-sunset-pink/80" aria-hidden />
                  <a
                    href={CONTACT_PHONE_HREF}
                    className="underline-offset-2 hover:text-sunset-pink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink rounded-sm break-all"
                  >
                    {CONTACT_PHONE_DISPLAY}
                  </a>
                </li>
                <li className="flex items-center gap-3 min-w-0">
                  <Mail size={18} className="flex-shrink-0 text-sunset-pink/80" aria-hidden />
                  <a
                    href={`mailto:${getContactEmail()}`}
                    className="break-all underline-offset-2 hover:text-sunset-pink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink rounded-sm"
                  >
                    {getContactEmail()}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <MessageCircle size={18} className="flex-shrink-0 text-sunset-pink/80" aria-hidden />
                  <a
                    href={CONTACT_WHATSAPP_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline-offset-2 hover:text-poolside-aqua hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink rounded-sm"
                  >
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>

            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="rounded-2xl border border-sand-tan/15 bg-sand-tan/5 p-5 sm:p-6 flex-1">
                <p className="font-serif text-lg sm:text-xl italic text-sand-tan leading-snug">
                  &quot;Mentally I&apos;m at Loma Beach.&quot;
                </p>
                <p className="text-xs uppercase tracking-widest text-sand-tan/45 font-bold mt-3">— A return guest</p>
              </div>
              <button
                type="button"
                onClick={goBooking}
                className="w-full bg-sunset-pink text-white py-3.5 min-h-12 rounded-full font-bold uppercase tracking-widest text-xs sm:text-sm hover:bg-white hover:text-deep-sea-blue transition-all shadow-lg shadow-black/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-deep-sea-blue"
              >
                Book your stay
              </button>
              <button
                type="button"
                onClick={() => navigate('contact')}
                className="w-full min-h-11 rounded-full border border-sand-tan/30 py-2.5 text-xs font-bold uppercase tracking-widest text-sand-tan/90 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink focus-visible:ring-offset-2 focus-visible:ring-offset-deep-sea-blue"
              >
                Say hello
              </button>
            </div>
          </div>

          <div className="mt-12 sm:mt-16 pt-8 border-t border-sand-tan/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <p className="text-xs text-sand-tan/45 uppercase tracking-widest max-w-xl leading-relaxed">
              © 2026 Loma Beach Resort · Life&apos;s a beach · No work allowed
            </p>
            <button
              type="button"
              onClick={() => navigate('location')}
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-sand-tan/55 hover:text-sunset-pink transition-colors min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink rounded-sm px-2"
            >
              <Navigation size={14} aria-hidden />
              Getting here
            </button>
          </div>
        </div>
      </footer>

      <div className="lg:hidden fixed z-40 bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-[max(1.5rem,env(safe-area-inset-right))]">
        <button
          type="button"
          onClick={goBooking}
          aria-label="Book your stay"
          className="bg-sunset-pink text-white min-h-[3.25rem] min-w-[3.25rem] p-4 rounded-full shadow-2xl loma-fab-pulse hover:animate-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-sea-blue focus-visible:ring-offset-2 focus-visible:ring-offset-sand-tan"
        >
          <Calendar size={24} aria-hidden />
        </button>
      </div>
    </div>
  );
}

function RoomCarousel({ images, label }: { images: string[]; label: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  return (
    <div className="relative w-full h-full overflow-hidden group/carousel">
      {images.map((img, idx) => (
        <div
          key={idx}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === currentIndex ? 'opacity-100 z-[1]' : 'opacity-0 z-0 pointer-events-none'}`}
          aria-hidden={idx !== currentIndex}
        >
          <img
            src={img}
            alt={`${label} — photo ${idx + 1} of ${images.length}`}
            className="w-full h-full object-cover"
            loading={idx === 0 ? 'eager' : 'lazy'}
            decoding="async"
          />
        </div>
      ))}

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Previous photo"
            className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-10 min-h-11 min-w-11 p-2 rounded-full bg-white/25 backdrop-blur-md text-white opacity-100 lg:opacity-0 lg:group-hover/carousel:opacity-100 transition-opacity hover:bg-white hover:text-deep-sea-blue shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ChevronLeft size={24} aria-hidden />
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Next photo"
            className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-10 min-h-11 min-w-11 p-2 rounded-full bg-white/25 backdrop-blur-md text-white opacity-100 lg:opacity-0 lg:group-hover/carousel:opacity-100 transition-opacity hover:bg-white hover:text-deep-sea-blue shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <ChevronRight size={24} aria-hidden />
          </button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-current={idx === currentIndex ? true : undefined}
                aria-label={`Show photo ${idx + 1} of ${images.length}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(idx);
                }}
                className={`min-h-2 min-w-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${idx === currentIndex ? 'bg-white w-4' : 'bg-white/40'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function RoomModal({
  room,
  onClose,
  onBook,
}: {
  room: Room;
  onClose: () => void;
  onBook: (room: Room) => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useFocusTrap(true, panelRef);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const id = window.requestAnimationFrame(() => closeButtonRef.current?.focus());
    return () => {
      window.cancelAnimationFrame(id);
      previous?.focus?.();
    };
  }, [room.id]);

  const isSoldOut = room.availability === 'sold-out';
  const galleryImages = room.gallery || [room.image];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 lg:p-12 overflow-y-auto"
      role="presentation"
    >
      <div
        className="fixed inset-0 bg-deep-sea-blue/60 backdrop-blur-sm animate-in fade-in duration-300 cursor-pointer z-0"
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="room-modal-title"
        className="relative bg-sand-tan w-full max-w-5xl rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col lg:flex-row max-h-[min(90dvh,90vh)] z-[1]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="room-modal-title" className="sr-only">
          {room.name}
        </h2>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 min-h-11 min-w-11 p-3 bg-white/20 backdrop-blur-md rounded-full text-deep-sea-blue hover:bg-white transition-all shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink"
          aria-label="Close room details"
        >
          <X size={24} aria-hidden />
        </button>
        <div className="w-full lg:w-1/2 h-56 min-h-[14rem] sm:h-64 lg:h-auto lg:min-h-0 relative">
          <RoomCarousel images={galleryImages} label={room.name} />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-deep-sea-blue/40 to-transparent lg:hidden" />
          <div className="absolute bottom-6 left-6 lg:hidden pointer-events-none z-[2]">
            <p className="text-3xl font-serif text-white italic drop-shadow-md" aria-hidden="true">
              {room.name}
            </p>
          </div>
          <div className="absolute top-6 left-6 lg:hidden pointer-events-none z-[2]">
            <AvailabilityBadge status={room.availability} />
          </div>
        </div>
        <div className="w-full lg:w-1/2 p-6 sm:p-8 lg:p-12 overflow-y-auto bg-white flex flex-col justify-between min-h-0">
          <div className="space-y-8">
            <div className="hidden lg:block space-y-2">
              <div className="flex justify-between items-start gap-4">
                <ViewBadge view={room.view} />
                <AvailabilityBadge status={room.availability} />
              </div>
              <h2 className="text-5xl font-serif text-deep-sea-blue italic leading-tight">
                {room.name}
              </h2>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <span className="flex items-center gap-2 bg-sand-tan/50 px-4 py-2 rounded-xl text-xs font-bold border border-deep-sea-blue/5">
                <Maximize2 size={16} className="text-deep-sea-blue/60" /> {room.size}
              </span>
              <span className="flex items-center gap-2 bg-sand-tan/50 px-4 py-2 rounded-xl text-xs font-bold border border-deep-sea-blue/5">
                <BedDouble size={16} className="text-deep-sea-blue/60" /> {room.beds}
              </span>
            </div>

            <p className="text-lg text-deep-sea-brown leading-relaxed font-light italic">
              {room.description}
            </p>

            <div className="space-y-6">
              <h4 className="text-xs uppercase tracking-widest font-bold text-deep-sea-blue border-b border-sand-tan pb-2">Room Features</h4>
              <div className="grid grid-cols-2 gap-y-3 gap-x-6">
                {room.amenities.map(am => (
                  <div key={am} className="flex items-center gap-3 text-sm text-deep-sea-brown/80">
                    <CheckCircle2 size={16} className="text-poolside-aqua flex-shrink-0" />
                    <span>{am}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-sand-tan flex flex-col gap-6">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-widest text-deep-sea-brown/60">Starting from</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-serif text-deep-sea-blue">{formatMajorAmount(room.price)}</span>
                <span className="text-sm text-deep-sea-brown/60 italic">/ night</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onBook(room)}
              disabled={isSoldOut}
              className={`w-full py-5 min-h-[3.25rem] rounded-full font-bold text-xl transition-all transform hover:scale-[1.02] shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-sea-blue focus-visible:ring-offset-2 ${
                isSoldOut ? 'bg-sand-tan text-deep-sea-blue/30 cursor-not-allowed' : 'bg-sunset-pink text-white hover:bg-deep-sea-blue'
              }`}
            >
              {isSoldOut ? 'Sold Out' : 'Book This Room'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const HomePage = memo(function HomePage({
  onBook,
  onSeeRooms,
  onViewRoom,
  onBookRoom,
  onViewResortLife,
  onViewGallery,
  onViewLocation,
}: {
  onBook: () => void;
  onSeeRooms: () => void;
  onViewRoom: (room: Room) => void;
  onBookRoom: (room: Room) => void;
  onViewResortLife: () => void;
  onViewGallery: () => void;
  onViewLocation: () => void;
}) {
  return (
    <div className="relative animate-in fade-in duration-700 overflow-x-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(70vh,28rem)] bg-[radial-gradient(ellipse_55%_40%_at_70%_0%,rgba(244,166,166,0.12),transparent),radial-gradient(ellipse_45%_35%_at_15%_25%,rgba(167,214,214,0.1),transparent)] z-0 opacity-90"
        aria-hidden
      />

      <section className="relative z-[1] min-h-[85dvh] sm:min-h-[90vh] h-[90svh] sm:h-[90vh] overflow-hidden flex items-center justify-center text-center px-4 sm:px-6">
        <div className="absolute inset-0">
          <img
            src={IMG.hero}
            className="w-full h-full object-cover object-top md:object-center transition-all duration-700"
            alt="Tropical beach and ocean at Loma Beach Resort"
            fetchPriority="high"
            decoding="async"
          />
          {/* Readability: soft cool veils (no heavy black — image unchanged) */}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-deep-sea-blue/25 from-0% via-transparent via-45% to-transparent to-[58%]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_36%,rgba(44,68,82,0.11)_49%,rgba(44,68,82,0.14)_58%,transparent_76%)]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[min(52vh,28rem)] bg-gradient-to-t from-deep-sea-blue/30 via-deep-sea-blue/12 via-[48%] to-transparent"
            aria-hidden
          />
          <div className="pointer-events-none absolute inset-0 bg-deep-sea-blue/[0.04] mix-blend-multiply" aria-hidden />
        </div>
        <div className="relative z-10 text-white space-y-4 sm:space-y-6 max-w-4xl mx-auto w-full break-words [&_h1]:[text-shadow:0_2px_36px_rgba(44,68,82,0.22)] [&_p]:[text-shadow:0_1px_28px_rgba(44,68,82,0.18)]">
          <p className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-[0.28em] backdrop-blur-sm">
            <MapPin size={14} className="opacity-90 shrink-0" aria-hidden />
            Haad Rin · Koh Phangan
          </p>
          <h1 className="font-serif text-5xl sm:text-7xl md:text-[9rem] mb-2 drop-shadow-[0_16px_42px_rgba(44,68,82,0.15)] italic leading-[1.05] sm:leading-tight">
            Loma Beach
          </h1>
          <p className="text-base sm:text-lg md:text-2xl font-light tracking-wide mb-3 sm:mb-4 opacity-95 max-w-2xl mx-auto leading-relaxed px-1">
            You&apos;ve earned the slow life. Come do nothing—we&apos;ll handle the rest.
          </p>
          <p className="text-xs sm:text-sm md:text-lg font-light tracking-[0.2em] sm:tracking-[0.35em] uppercase mb-8 sm:mb-10 opacity-90 px-1">
            Relax. Swim. Eat. Nap. Repeat.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-stretch sm:items-center max-w-md sm:max-w-none mx-auto w-full">
            <button
              type="button"
              onClick={onBook}
              className="bg-sunset-pink text-white px-10 sm:px-12 py-4 sm:py-5 min-h-[3.25rem] rounded-full text-lg sm:text-xl font-bold hover:bg-white hover:text-deep-sea-blue transition-all motion-safe:transform motion-safe:hover:scale-105 shadow-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-deep-sea-blue/40"
            >
              Book Your Stay
            </button>
            <button
              type="button"
              onClick={onSeeRooms}
              className="bg-white/10 backdrop-blur-md border-2 border-white/40 text-white px-10 sm:px-12 py-4 sm:py-5 min-h-[3.25rem] rounded-full text-lg sm:text-xl font-bold hover:bg-white/30 transition-all motion-safe:transform motion-safe:hover:scale-105 shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              See the Rooms
            </button>
          </div>
          <div className="mx-auto flex max-w-fit flex-wrap justify-center gap-x-5 gap-y-2 rounded-full border border-white/25 bg-white/12 px-6 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-[0_8px_30px_rgba(44,68,82,0.12)] backdrop-blur-xl backdrop-saturate-150">
            <button
              type="button"
              onClick={onViewResortLife}
              className="min-h-10 rounded-sm px-1 underline-offset-4 decoration-white/40 hover:text-white hover:underline hover:decoration-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            >
              Resort life
            </button>
            <button
              type="button"
              onClick={onViewGallery}
              className="min-h-10 rounded-sm px-1 underline-offset-4 decoration-white/40 hover:text-white hover:underline hover:decoration-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            >
              Gallery
            </button>
            <button
              type="button"
              onClick={onViewLocation}
              className="min-h-10 rounded-sm px-1 underline-offset-4 decoration-white/40 hover:text-white hover:underline hover:decoration-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            >
              Location
            </button>
          </div>
          <div className="pt-6 sm:pt-10">
            <p className="inline-block max-w-full rounded-full border border-white/25 bg-white/12 px-8 py-3.5 text-xs sm:text-sm font-bold tracking-[0.35em] sm:tracking-[0.8em] text-white shadow-[0_8px_30px_rgba(44,68,82,0.12)] backdrop-blur-xl backdrop-saturate-150">
              Life&apos;s a Beach
            </p>
          </div>
        </div>
      </section>

      <section className="relative z-[1] py-12 sm:py-14 md:py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div
          className="rounded-2xl border border-deep-sea-blue/10 bg-white/70 backdrop-blur-md px-4 py-6 sm:px-8 sm:py-8 shadow-sm"
          aria-label="What stays the same when you arrive"
        >
          <p className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-[0.35em] text-deep-sea-blue/60 mb-6">
            The Loma pace
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {HOME_PROMISE_STRIP.map(({ label, caption, Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center gap-3 rounded-xl bg-sand-tan/45 px-3 py-4 sm:py-5 border border-deep-sea-blue/5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-deep-sea-blue shadow-sm ring-1 ring-deep-sea-blue/5">
                  <Icon size={22} strokeWidth={1.75} aria-hidden />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold uppercase tracking-widest text-deep-sea-blue">{label}</p>
                  <p className="text-xs text-deep-sea-brown/75 font-light">{caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-[1] py-16 sm:py-20 md:py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div
          className="pointer-events-none hidden md:block absolute left-[8%] top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-poolside-aqua/15 blur-3xl z-0"
          aria-hidden
        />
        <div className="relative z-[1] grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
        <div className="relative">
          <div className="absolute -top-4 -left-4 w-24 h-24 bg-poolside-aqua/30 rounded-full blur-2xl"></div>
          <img
            src={IMG.homePhilosophy}
            className="rounded-2xl shadow-xl relative z-10 w-full h-auto ring-1 ring-deep-sea-blue/5"
            alt="Thailand beach with longtail boats"
            sizes="(max-width: 768px) 100vw, 50vw"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute -bottom-8 -right-8 bg-sand-tan p-6 rounded-xl shadow-lg z-20 hidden lg:block border border-deep-sea-blue/5">
            <p className="font-serif text-deep-sea-blue italic text-lg leading-tight">
              &quot;The most relaxed I&apos;ve
              <br />
              been in a decade.&quot;
            </p>
            <span className="text-xs uppercase tracking-widest text-deep-sea-brown mt-2 block font-bold">— Sarah J.</span>
          </div>
        </div>
        <div className="space-y-8 relative z-[1]">
          <div className="space-y-2">
            <span className="text-sunset-pink uppercase tracking-widest font-bold text-sm">Our Philosophy</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif text-deep-sea-blue italic text-balance">
              Welcome to Loma Beach Resort
            </h2>
          </div>
          <p className="text-lg text-deep-sea-brown leading-relaxed font-light">
            The owner built this place after a lifetime of hard work—somewhere to finally exhale. Loma is for guests who want the same:
            no agenda, no performance, just the ocean setting the pace. Pure Southern Thai serenity.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 text-deep-sea-blue">
              <div className="p-2 bg-poolside-aqua/20 rounded-lg">
                <Waves size={20} aria-hidden />
              </div>
              <span className="text-sm font-bold uppercase tracking-wide">Beachfront</span>
            </div>
            <div className="flex items-center gap-3 text-deep-sea-blue">
              <div className="p-2 bg-poolside-aqua/20 rounded-lg">
                <Wind size={20} aria-hidden />
              </div>
              <span className="text-sm font-bold uppercase tracking-wide">Pool & Bar</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onViewLocation}
            className="inline-flex items-center gap-2 text-deep-sea-blue font-bold uppercase tracking-widest text-xs border-b-2 border-sunset-pink pb-2 hover:text-sunset-pink transition-colors min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink rounded-sm"
          >
            How to get here
            <MapPin size={16} aria-hidden />
          </button>
        </div>
        </div>
      </section>

      <section className="relative z-[1] py-16 sm:py-20 md:py-24 bg-white/55 backdrop-blur-sm border-y border-deep-sea-blue/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between md:items-end mb-12 sm:mb-16 gap-6">
            <div className="space-y-4">
              <span className="text-sunset-pink uppercase tracking-[0.3em] font-bold text-xs">Stay with us</span>
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif text-deep-sea-blue italic text-balance">
                Pick Your Sanctuary
              </h2>
              <p className="text-base sm:text-lg text-deep-sea-brown/70 font-light italic max-w-prose">
                Where will you do absolutely nothing today?
              </p>
              <p className="text-sm text-deep-sea-brown/65 font-light max-w-md">
                {ROOMS.length} hideaways on property — here are three to start dreaming in.
              </p>
            </div>
            <button
              type="button"
              onClick={onSeeRooms}
              className="flex items-center justify-center sm:justify-start gap-2 text-deep-sea-blue font-bold uppercase tracking-widest text-sm border-b-2 border-sunset-pink pb-2 hover:text-sunset-pink transition-all group min-h-11 self-start md:self-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink rounded-sm"
            >
              Explore all rooms{' '}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform shrink-0" aria-hidden />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {ROOMS.slice(0, 3).map((room) => (
              <FeaturedRoomCard key={room.id} room={room} onBook={onBookRoom} onView={onViewRoom} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-[1] bg-deep-sea-blue py-16 sm:py-20 md:py-24 px-4 sm:px-6 text-sand-tan overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_80%,rgba(244,166,166,0.35),transparent_50%),radial-gradient(circle_at_85%_15%,rgba(159,227,212,0.25),transparent_48%)]"
          aria-hidden
        />
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-12 sm:mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif italic text-balance px-2">
              Nothing fancy. Everything you need.
            </h2>
            <p className="text-sand-tan/60 uppercase tracking-[0.3em] text-xs font-bold">The Loma Experience</p>
            <p className="text-sm sm:text-base text-sand-tan/75 font-light max-w-2xl mx-auto leading-relaxed px-2">
              Slow days around the pool, shade when you want it, and sunsets that refuse to hurry.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="group overflow-hidden rounded-3xl relative h-72 sm:h-80 md:h-96 ring-1 ring-white/10">
              <img
                src={IMG.homeExpPool}
                className="w-full h-full object-cover motion-safe:transition-transform motion-safe:duration-1000 motion-safe:group-hover:scale-110"
                alt="Resort pool"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep-sea-blue/90 via-deep-sea-blue/25 to-transparent flex flex-col justify-end p-6 sm:p-8 md:p-10 text-left">
                <h3 className="text-2xl sm:text-3xl font-serif italic">Pool & Drinks</h3>
                <p className="mt-2 text-sm text-white/85 font-light leading-relaxed max-w-xs">
                  Cool water, warm light — stay until the bar cart finds you.
                </p>
              </div>
            </div>
            <div className="group overflow-hidden rounded-3xl relative h-72 sm:h-80 md:h-96 ring-1 ring-white/10">
              <img
                src={IMG.homeExpHammock}
                className="w-full h-full object-cover motion-safe:transition-transform motion-safe:duration-1000 motion-safe:group-hover:scale-110"
                alt="Hammock in the shade"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep-sea-blue/90 via-deep-sea-blue/25 to-transparent flex flex-col justify-end p-6 sm:p-8 md:p-10 text-left">
                <h3 className="text-2xl sm:text-3xl font-serif italic">Lazy Afternoons</h3>
                <p className="mt-2 text-sm text-white/85 font-light leading-relaxed max-w-xs">
                  One hammock, zero agenda — the official island uniform.
                </p>
              </div>
            </div>
            <div className="group overflow-hidden rounded-3xl relative h-72 sm:h-80 md:h-96 ring-1 ring-white/10">
              <img
                src={IMG.homeExpSunset}
                className="w-full h-full object-cover motion-safe:transition-transform motion-safe:duration-1000 motion-safe:group-hover:scale-110"
                alt="Beach at sunset"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-deep-sea-blue/75 via-deep-sea-blue/20 to-transparent flex flex-col justify-end p-6 sm:p-8 md:p-10 text-left">
                <h3 className="text-2xl sm:text-3xl font-serif italic">Sunset Views</h3>
                <p className="mt-2 text-sm text-white/85 font-light leading-relaxed max-w-xs">
                  Gold on the water — the day&apos;s gentle last act.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-12 flex justify-center">
            <button
              type="button"
              onClick={onViewResortLife}
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-sand-tan/40 bg-white/10 px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-sand-tan hover:bg-sunset-pink hover:border-sunset-pink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink focus-visible:ring-offset-2 focus-visible:ring-offset-deep-sea-blue"
            >
              See resort life
              <ArrowRight size={18} aria-hidden />
            </button>
          </div>
        </div>
      </section>

      <section className="relative z-[1] py-20 sm:py-24 md:py-32 px-4 sm:px-6 text-center bg-sand-tan overflow-hidden">
        <div
          className="pointer-events-none absolute -right-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-sunset-pink/15 blur-3xl"
          aria-hidden
        />
        <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8 relative">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-serif text-deep-sea-blue text-balance">
            You&apos;ve done enough. <br />
            <span className="italic text-sunset-pink">Come do nothing.</span>
          </h2>
          <p className="text-base sm:text-lg text-deep-sea-brown/80 font-light italic">
            See you soon at Loma Beach Resort
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4 pt-2">
            <button
              type="button"
              onClick={onBook}
              className="bg-sunset-pink text-white px-10 sm:px-12 py-4 sm:py-5 min-h-[3.25rem] rounded-full text-xl sm:text-2xl font-bold shadow-2xl hover:bg-deep-sea-blue transition-all motion-safe:transform motion-safe:hover:rotate-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-sea-blue focus-visible:ring-offset-2 focus-visible:ring-offset-sand-tan w-full sm:w-auto"
            >
              Book Your Break
            </button>
            <button
              type="button"
              onClick={onViewGallery}
              className="border-2 border-deep-sea-blue/20 bg-white/80 px-8 py-4 min-h-[3.25rem] rounded-full text-sm font-bold uppercase tracking-widest text-deep-sea-blue hover:border-sunset-pink hover:text-sunset-pink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink focus-visible:ring-offset-2 focus-visible:ring-offset-sand-tan w-full sm:w-auto"
            >
              Browse gallery
            </button>
          </div>
        </div>
      </section>
    </div>
  );
});

const FeaturedRoomCard = memo(function FeaturedRoomCard({
  room,
  onBook,
  onView,
}: {
  room: Room;
  onBook: (r: Room) => void;
  onView: (r: Room) => void;
}) {
  const isSoldOut = room.availability === 'sold-out';
  const handleBook = useCallback(() => onBook(room), [onBook, room]);
  const handleView = useCallback(() => onView(room), [onView, room]);
  return (
    <div className="group flex flex-col bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-deep-sea-blue/5">
      <div className="h-64 sm:h-72 relative overflow-hidden">
        <img src={room.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={room.name} sizes="(max-width: 768px) 100vw, 33vw" loading="lazy" />
        <div className="absolute top-6 left-6 flex flex-col gap-2">
          <ViewBadge view={room.view} />
          <AvailabilityBadge status={room.availability} />
        </div>
      </div>
      <div className="p-6 sm:p-8 flex-grow flex flex-col">
        <div className="flex justify-between items-start gap-3 mb-4">
          <h3 className="text-xl sm:text-2xl font-serif text-deep-sea-blue italic leading-tight group-hover:text-sunset-pink transition-colors">
            {room.name}
          </h3>
          <div className="text-right shrink-0">
            <span className="text-lg sm:text-xl font-serif text-deep-sea-blue/60 tabular-nums">
              {formatMajorAmount(room.price)}
            </span>
            <span className="block text-[10px] font-bold uppercase tracking-widest text-deep-sea-brown/50 pt-0.5">
              per night
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 sm:gap-4 text-[11px] font-bold text-deep-sea-brown/60 mb-6 uppercase tracking-wider">
          <span className="flex items-center gap-1.5">
            <Maximize2 size={14} aria-hidden /> {room.size}
          </span>
          <span className="flex items-center gap-1.5">
            <BedDouble size={14} aria-hidden /> {room.beds}
          </span>
        </div>
        <p className="text-sm text-deep-sea-brown/70 font-light leading-relaxed line-clamp-2 mb-8 italic">{room.description}</p>
        <div className="mt-auto space-y-4">
          <button
            type="button"
            onClick={handleBook}
            disabled={isSoldOut}
            className={`w-full py-4 min-h-12 rounded-full font-bold text-sm shadow-md transition-all transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink ${
              isSoldOut ? 'bg-sand-tan text-deep-sea-blue/30 cursor-not-allowed' : 'bg-sunset-pink text-white hover:bg-deep-sea-blue shadow-sunset-pink/20'
            }`}
          >
            {isSoldOut ? 'Sold Out' : 'Book This Room'}
          </button>
          <button
            type="button"
            onClick={handleView}
            className="w-full min-h-11 text-deep-sea-blue font-bold text-xs uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink rounded-sm"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
});

function RoomsPage({
  onSelectRoom,
  onBookRoom,
  onFlexibleBook,
}: {
  onSelectRoom: (room: Room) => void;
  onBookRoom: (room: Room) => void;
  onFlexibleBook: () => void;
}) {
  const [viewFilter, setViewFilter] = useState<(typeof ROOMS_VIEW_FILTERS)[number]['id']>('all');

  const filteredRooms = useMemo(() => {
    if (viewFilter === 'all') return ROOMS;
    return ROOMS.filter((r) => r.view === viewFilter);
  }, [viewFilter]);

  return (
    <div className="relative animate-in slide-in-from-bottom duration-500 overflow-x-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(50vh,24rem)] bg-[radial-gradient(ellipse_75%_55%_at_50%_-15%,rgba(167,214,214,0.2),transparent),radial-gradient(ellipse_45%_40%_at_0%_30%,rgba(244,166,166,0.14),transparent)]"
        aria-hidden
      />

      <div className="relative py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto space-y-12 sm:space-y-16">
        <header className="text-center space-y-5 max-w-3xl mx-auto px-1">
          <p className="text-sunset-pink uppercase tracking-[0.3em] font-bold text-xs sm:text-sm flex items-center justify-center gap-2">
            <BedDouble size={15} className="shrink-0 opacity-90" aria-hidden />
            Stay with us
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif text-deep-sea-blue italic text-balance leading-[1.05]">
            The Hideaways
          </h1>
          <p className="text-base sm:text-lg text-deep-sea-brown/70 font-light italic">
            Simple. Clean. Comfortable. Everything you need. Nothing you don&apos;t.
          </p>
          <p className="text-base sm:text-lg text-deep-sea-brown/80 font-light leading-relaxed">
            Pick a beachfront suite for sand-between-your-toes mornings, or tuck into the garden for extra quiet.
            Every room is a place to exhale — open a door, drop your bag, and let the island reset you.
          </p>
        </header>

        <section
          aria-label="Included with every stay"
          className="rounded-2xl border border-deep-sea-blue/10 bg-white/65 backdrop-blur-md px-4 py-6 sm:px-8 sm:py-8 shadow-sm"
        >
          <p className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-[0.35em] text-deep-sea-blue/60 mb-6">
            Included with every stay
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {ROOMS_STAY_INCLUDES.map(({ label, caption, Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center gap-3 rounded-xl bg-sand-tan/40 px-3 py-4 sm:py-5 border border-deep-sea-blue/5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-deep-sea-blue shadow-sm ring-1 ring-deep-sea-blue/5">
                  <Icon size={22} strokeWidth={1.75} aria-hidden />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold uppercase tracking-widest text-deep-sea-blue">{label}</p>
                  <p className="text-xs text-deep-sea-brown/75 font-light">{caption}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center sm:text-left text-sm text-deep-sea-brown/70 font-light">
            <span className="font-bold text-deep-sea-blue uppercase tracking-widest text-xs">{filteredRooms.length}</span>
            {filteredRooms.length === 1 ? ' room' : ' rooms'}
            {viewFilter !== 'all' ? ' match this vibe' : ' to choose from'}
          </p>
          <div
            className="flex flex-wrap justify-center sm:justify-end gap-2"
            role="group"
            aria-label="Filter by view"
          >
            {ROOMS_VIEW_FILTERS.map(({ id, label }) => {
              const isActive = viewFilter === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setViewFilter(id)}
                  aria-pressed={isActive}
                  className={`min-h-11 rounded-full px-5 text-xs font-bold uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink focus-visible:ring-offset-2 focus-visible:ring-offset-sand-tan ${
                    isActive
                      ? 'bg-deep-sea-blue text-sand-tan shadow-md'
                      : 'bg-white/80 text-deep-sea-blue border border-deep-sea-blue/15 hover:border-sunset-pink/50 hover:text-sunset-pink'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredRooms.map((room) => (
            <FeaturedRoomCard key={room.id} room={room} onBook={onBookRoom} onView={onSelectRoom} />
          ))}
        </div>

        <aside className="relative rounded-3xl overflow-hidden border border-deep-sea-blue/10 bg-gradient-to-br from-sand-tan via-white to-poolside-aqua/15 px-6 py-10 sm:px-12 sm:py-12 text-center">
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-sunset-pink/15 blur-3xl"
            aria-hidden
          />
          <p className="relative z-[1] text-[10px] sm:text-xs font-bold uppercase tracking-[0.35em] text-deep-sea-blue/55">
            Decide later
          </p>
          <h2 className="relative z-[1] mt-3 font-serif text-2xl sm:text-3xl md:text-4xl text-deep-sea-blue italic text-balance leading-tight">
            Not sure which hideaway fits?
          </h2>
          <p className="relative z-[1] mx-auto mt-4 max-w-lg text-sm sm:text-base text-deep-sea-brown/80 font-light leading-relaxed">
            Start a flexible booking — you can still browse photos and details for each room before you lock anything in.
          </p>
          <button
            type="button"
            onClick={onFlexibleBook}
            className="relative z-[1] mt-8 inline-flex items-center gap-2 rounded-full bg-deep-sea-blue px-8 py-3.5 min-h-12 text-sm font-bold uppercase tracking-widest text-sand-tan hover:bg-sunset-pink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Open booking
            <Calendar size={18} className="shrink-0" aria-hidden />
          </button>
        </aside>
      </div>
    </div>
  );
}

const ResortMomentCard = memo(function ResortMomentCard({
  title,
  subtitle,
  timeLabel,
  img,
  colSpan,
}: {
  title: string;
  subtitle: string;
  timeLabel: string;
  img: string;
  colSpan: string;
}) {
  return (
    <article
      className={`relative overflow-hidden rounded-3xl group shadow-lg shadow-deep-sea-blue/10 ring-1 ring-deep-sea-blue/5 ${colSpan} min-h-[280px] h-72 sm:h-80 md:min-h-[300px]`}
    >
      <img
        src={img}
        className="w-full h-full object-cover transition-transform duration-700 ease-out motion-safe:group-hover:scale-[1.05]"
        alt={title}
        sizes="(max-width: 768px) 100vw, 33vw"
        loading="lazy"
        decoding="async"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-deep-sea-blue/95 via-deep-sea-blue/45 to-deep-sea-blue/15 transition-opacity duration-500 motion-safe:group-hover:from-deep-sea-blue" />
      <div className="absolute inset-0 bg-sunset-pink/0 motion-safe:group-hover:bg-sunset-pink/10 transition-colors duration-500" />
      <div className="absolute left-5 right-5 bottom-5 sm:left-6 sm:right-6 sm:bottom-6 text-left space-y-2">
        <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.28em] text-sunset-pink drop-shadow-sm">
          {timeLabel}
        </p>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white italic leading-tight drop-shadow-md text-balance">
          {title}
        </h2>
        <p className="text-sm text-white/90 font-light leading-relaxed max-w-xl text-pretty">{subtitle}</p>
      </div>
      <div
        className="pointer-events-none absolute top-5 right-5 h-px w-10 bg-white/40 motion-safe:group-hover:w-20 motion-safe:group-hover:bg-sunset-pink transition-all duration-500"
        aria-hidden
      />
    </article>
  );
});

function ResortLifePage({ onViewGallery }: { onViewGallery: () => void }) {
  return (
    <div className="relative animate-in fade-in duration-500 overflow-x-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(55vh,28rem)] bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(244,166,166,0.18),transparent),radial-gradient(ellipse_50%_40%_at_100%_20%,rgba(167,214,214,0.12),transparent)]"
        aria-hidden
      />

      <div className="relative py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto space-y-12 sm:space-y-16">
        <header className="text-center space-y-5 max-w-3xl mx-auto">
          <p className="text-sunset-pink uppercase tracking-[0.3em] font-bold text-xs sm:text-sm flex items-center justify-center gap-2">
            <Sparkles size={14} className="shrink-0 opacity-90" aria-hidden />
            On property
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif text-deep-sea-blue italic text-balance leading-[1.05]">
            Resort Life
          </h1>
          <p className="text-base sm:text-lg text-deep-sea-brown/70 font-light italic uppercase tracking-widest font-bold px-2">
            No meetings. Just sunsets.
          </p>
          <p className="text-base sm:text-lg text-deep-sea-brown/80 font-light leading-relaxed px-1">
            This is what you came for — slow hours by the pool, barefoot walks, and evenings that stretch into
            starlight. No puzzle to solve: just wander from one good moment to the next.
          </p>
        </header>

        <section
          aria-label="A day at the resort"
          className="rounded-2xl border border-deep-sea-blue/10 bg-white/60 backdrop-blur-md px-4 py-6 sm:px-8 sm:py-8 shadow-sm"
        >
          <p className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-[0.35em] text-deep-sea-blue/60 mb-6">
            The rhythm of a day here
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {RESORT_DAY_RHYTHM.map(({ label, caption, Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center gap-3 rounded-xl bg-sand-tan/40 px-3 py-4 sm:py-5 border border-deep-sea-blue/5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-deep-sea-blue shadow-sm ring-1 ring-deep-sea-blue/5">
                  <Icon size={22} strokeWidth={1.75} aria-hidden />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold uppercase tracking-widest text-deep-sea-blue">{label}</p>
                  <p className="text-xs text-deep-sea-brown/75 font-light">{caption}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {RESORT_LIFE_MOMENTS.map((m) => (
            <ResortMomentCard
              key={m.title}
              title={m.title}
              subtitle={m.subtitle}
              timeLabel={m.timeLabel}
              img={m.img}
              colSpan={m.colSpan}
            />
          ))}
        </div>

        <aside className="relative rounded-3xl overflow-hidden bg-deep-sea-blue text-sand-tan px-6 py-10 sm:px-12 sm:py-12 text-center">
          <div
            className="pointer-events-none absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_80%,rgba(244,166,166,0.35),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(167,214,214,0.25),transparent_45%)]"
            aria-hidden
          />
          <blockquote className="relative z-[1] font-serif text-2xl sm:text-3xl md:text-4xl italic leading-snug text-balance max-w-2xl mx-auto">
            &quot;Do nothing brilliantly.&quot;
          </blockquote>
          <p className="relative z-[1] mt-4 text-sm text-sand-tan/75 font-light uppercase tracking-[0.25em]">
            Our unofficial house rule
          </p>
          <button
            type="button"
            onClick={onViewGallery}
            className="relative z-[1] mt-8 inline-flex items-center gap-2 rounded-full border border-sand-tan/40 bg-white/10 px-8 py-3.5 min-h-12 text-sm font-bold uppercase tracking-widest text-sand-tan hover:bg-sunset-pink hover:border-sunset-pink hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink focus-visible:ring-offset-2 focus-visible:ring-offset-deep-sea-blue"
          >
            See it in the gallery
            <ArrowRight size={18} className="shrink-0" aria-hidden />
          </button>
        </aside>
      </div>
    </div>
  );
}

const GalleryTile = memo(function GalleryTile({
  index,
  src,
  alt,
  caption,
  onOpen,
}: {
  index: number;
  src: string;
  alt: string;
  caption: string;
  onOpen: (index: number) => void;
}) {
  const handleClick = useCallback(() => onOpen(index), [onOpen, index]);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-haspopup="dialog"
      className="group relative mb-4 sm:mb-6 block w-full break-inside-avoid overflow-hidden rounded-2xl border border-deep-sea-blue/10 bg-deep-sea-blue/5 text-left shadow-lg shadow-deep-sea-blue/10 ring-0 transition-shadow duration-500 hover:shadow-2xl hover:shadow-deep-sea-blue/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink focus-visible:ring-offset-2 focus-visible:ring-offset-sand-tan"
    >
      <span className="relative block overflow-hidden bg-sand-tan/30">
        <img
          src={src}
          alt={alt}
          className="w-full h-auto object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
          decoding="async"
        />
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-deep-sea-blue/92 via-deep-sea-blue/35 to-transparent opacity-95 transition-opacity duration-500 motion-safe:group-hover:opacity-100" />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 p-4 sm:p-5">
          <span className="block font-serif text-lg sm:text-xl text-white italic leading-snug drop-shadow-md text-pretty">
            {caption}
          </span>
          <span className="mt-2 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.28em] text-sunset-pink/95">
            View larger
            <Maximize2 size={12} strokeWidth={2.25} className="opacity-90" aria-hidden />
          </span>
        </span>
      </span>
    </button>
  );
});

function GalleryPage({ onBook, onViewRooms }: { onBook: () => void; onViewRooms: () => void }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [moodFilter, setMoodFilter] = useState<(typeof GALLERY_MOOD_FILTERS)[number]['id']>('all');
  const lightboxPanelRef = useRef<HTMLDivElement>(null);
  const lightboxCloseRef = useRef<HTMLButtonElement>(null);

  useBodyScrollLock(lightboxIndex !== null);
  useFocusTrap(lightboxIndex !== null, lightboxPanelRef);

  const filteredEntries = useMemo(() => {
    const indexed = GALLERY_ITEMS.map((item, index) => ({ item, index }));
    if (moodFilter === 'all') return indexed;
    return indexed.filter(({ item }) => item.mood === moodFilter);
  }, [moodFilter]);

  const filteredGlobalIndices = useMemo(
    () => filteredEntries.map(({ index }) => index),
    [filteredEntries],
  );

  const openLightbox = useCallback((index: number) => setLightboxIndex(index), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  useEffect(() => {
    if (lightboxIndex === null) return;
    if (filteredGlobalIndices.length === 0) {
      setLightboxIndex(null);
      return;
    }
    if (!filteredGlobalIndices.includes(lightboxIndex)) {
      setLightboxIndex(filteredGlobalIndices[0]!);
    }
  }, [filteredGlobalIndices, lightboxIndex]);

  const goPrevLightbox = useCallback(() => {
    setLightboxIndex((cur) => {
      if (cur === null || filteredGlobalIndices.length === 0) return null;
      const pos = filteredGlobalIndices.indexOf(cur);
      const i = pos === -1 ? 0 : pos;
      const nextPos = (i - 1 + filteredGlobalIndices.length) % filteredGlobalIndices.length;
      return filteredGlobalIndices[nextPos]!;
    });
  }, [filteredGlobalIndices]);

  const goNextLightbox = useCallback(() => {
    setLightboxIndex((cur) => {
      if (cur === null || filteredGlobalIndices.length === 0) return null;
      const pos = filteredGlobalIndices.indexOf(cur);
      const i = pos === -1 ? 0 : pos;
      const nextPos = (i + 1) % filteredGlobalIndices.length;
      return filteredGlobalIndices[nextPos]!;
    });
  }, [filteredGlobalIndices]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goPrevLightbox();
      if (e.key === 'ArrowRight') goNextLightbox();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxIndex, closeLightbox, goPrevLightbox, goNextLightbox]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const id = window.requestAnimationFrame(() => lightboxCloseRef.current?.focus());
    return () => window.cancelAnimationFrame(id);
  }, [lightboxIndex]);

  const activeLightboxItem = lightboxIndex !== null ? GALLERY_ITEMS[lightboxIndex] : null;
  const lightboxPos =
    lightboxIndex !== null ? filteredGlobalIndices.indexOf(lightboxIndex) : -1;
  const lightboxSlideLabel =
    lightboxPos >= 0 ? `${lightboxPos + 1} / ${filteredGlobalIndices.length}` : '';
  const lightboxShowArrows = filteredGlobalIndices.length > 1;

  return (
    <div className="relative animate-in zoom-in-95 duration-500 overflow-x-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(48vh,22rem)] bg-[radial-gradient(ellipse_70%_50%_at_50%_-20%,rgba(244,166,166,0.16),transparent),radial-gradient(ellipse_40%_45%_at_90%_10%,rgba(159,227,212,0.14),transparent)]"
        aria-hidden
      />

      <div className="relative py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto space-y-12 sm:space-y-16">
        <header className="text-center space-y-5 max-w-3xl mx-auto px-1">
          <p className="text-sunset-pink uppercase tracking-[0.3em] font-bold text-xs sm:text-sm flex items-center justify-center gap-2">
            <Camera size={16} className="shrink-0 opacity-90" aria-hidden />
            Through the lens
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif text-deep-sea-blue italic text-balance leading-[1.05]">
            Gallery
          </h1>
          <p className="text-sunset-pink tracking-widest font-bold uppercase text-sm">Captures of calm</p>
          <p className="text-base sm:text-lg text-deep-sea-brown/80 font-light leading-relaxed">
            Real moments from around the property — hazy mornings, sparkling pools, and that late-afternoon glow
            that makes time feel optional. Tap any frame to linger.
          </p>
        </header>

        <section
          aria-label="What you will see here"
          className="rounded-2xl border border-deep-sea-blue/10 bg-white/65 backdrop-blur-md px-4 py-6 sm:px-8 sm:py-8 shadow-sm"
        >
          <p className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-[0.35em] text-deep-sea-blue/60 mb-6">
            Before you scroll
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {GALLERY_LENS_STRIP.map(({ label, caption, Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center gap-3 rounded-xl bg-sand-tan/40 px-3 py-4 sm:py-5 border border-deep-sea-blue/5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-deep-sea-blue shadow-sm ring-1 ring-deep-sea-blue/5">
                  <Icon size={22} strokeWidth={1.75} aria-hidden />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold uppercase tracking-widest text-deep-sea-blue">{label}</p>
                  <p className="text-xs text-deep-sea-brown/75 font-light">{caption}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center sm:text-left text-sm text-deep-sea-brown/70 font-light">
            <span className="font-bold text-deep-sea-blue uppercase tracking-widest text-xs">{filteredEntries.length}</span>
            {filteredEntries.length === 1 ? ' photo' : ' photos'}
            {moodFilter !== 'all' ? ' in this set' : ' in the tour'}
          </p>
          <div
            className="flex flex-wrap justify-center sm:justify-end gap-2"
            role="group"
            aria-label="Filter gallery by mood"
          >
            {GALLERY_MOOD_FILTERS.map(({ id, label }) => {
              const isActive = moodFilter === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMoodFilter(id)}
                  aria-pressed={isActive}
                  className={`min-h-11 rounded-full px-5 text-xs font-bold uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink focus-visible:ring-offset-2 focus-visible:ring-offset-sand-tan ${
                    isActive
                      ? 'bg-deep-sea-blue text-sand-tan shadow-md'
                      : 'bg-white/80 text-deep-sea-blue border border-deep-sea-blue/15 hover:border-sunset-pink/50 hover:text-sunset-pink'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="columns-1 md:columns-2 lg:columns-3 gap-4 sm:gap-6 [column-fill:_balance]">
          {filteredEntries.map(({ item, index }) => (
            <GalleryTile
              key={index}
              index={index}
              src={item.src}
              alt={item.alt}
              caption={item.caption}
              onOpen={openLightbox}
            />
          ))}
        </div>

        <aside className="relative rounded-3xl overflow-hidden border border-deep-sea-blue/10 bg-gradient-to-br from-white via-sand-tan/50 to-poolside-aqua/20 px-6 py-10 sm:px-12 sm:py-12 text-center">
          <div
            className="pointer-events-none absolute -left-20 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-sunset-pink/20 blur-3xl"
            aria-hidden
          />
          <p className="relative z-[1] text-[10px] sm:text-xs font-bold uppercase tracking-[0.35em] text-deep-sea-blue/55">
            Ready when you are
          </p>
          <h2 className="relative z-[1] mt-3 font-serif text-2xl sm:text-3xl md:text-4xl text-deep-sea-blue italic text-balance leading-tight">
            See these views in person
          </h2>
          <p className="relative z-[1] mx-auto mt-4 max-w-lg text-sm sm:text-base text-deep-sea-brown/80 font-light leading-relaxed">
            Pick a room that matches the pace you saw here — we&apos;ll save a spot on the sand for you.
          </p>
          <div className="relative z-[1] mt-8 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={onViewRooms}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-deep-sea-blue bg-white px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-deep-sea-blue hover:bg-deep-sea-blue hover:text-sand-tan transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink focus-visible:ring-offset-2 focus-visible:ring-offset-white w-full sm:w-auto"
            >
              Explore rooms
              <ArrowRight size={18} className="shrink-0" aria-hidden />
            </button>
            <button
              type="button"
              onClick={onBook}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sunset-pink px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-white hover:bg-deep-sea-blue transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-sea-blue focus-visible:ring-offset-2 focus-visible:ring-offset-white w-full sm:w-auto"
            >
              Book your stay
              <Calendar size={18} className="shrink-0" aria-hidden />
            </button>
          </div>
        </aside>
      </div>

      {activeLightboxItem !== null && lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center p-4 sm:p-6"
          role="presentation"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-deep-sea-blue/85 backdrop-blur-md animate-in fade-in duration-300"
            aria-label="Close gallery preview"
            onClick={closeLightbox}
          />
          <div
            ref={lightboxPanelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="gallery-lightbox-caption"
            className="relative z-[1] flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl sm:rounded-3xl bg-deep-sea-blue shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative flex max-h-[min(85dvh,85vh)] min-h-0 flex-1 items-center justify-center bg-black/40 p-3 sm:p-6">
              <img
                src={activeLightboxItem.src}
                alt={activeLightboxItem.alt}
                className="max-h-[min(78dvh,78vh)] w-full object-contain"
                loading="eager"
                decoding="async"
              />
              <button
                ref={lightboxCloseRef}
                type="button"
                onClick={closeLightbox}
                className="absolute right-3 top-3 sm:right-4 sm:top-4 z-10 flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink"
                aria-label="Close"
              >
                <X size={22} aria-hidden />
              </button>
              {lightboxShowArrows && (
                <>
                  <button
                    type="button"
                    onClick={goPrevLightbox}
                    className="absolute left-2 top-1/2 z-10 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-3"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={26} aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={goNextLightbox}
                    className="absolute right-2 top-1/2 z-10 flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-3"
                    aria-label="Next image"
                  >
                    <ChevronRight size={26} aria-hidden />
                  </button>
                </>
              )}
            </div>
            <div className="border-t border-white/10 bg-deep-sea-blue px-5 py-4 sm:px-8 sm:py-5">
              <p id="gallery-lightbox-caption" className="font-serif text-lg sm:text-xl text-white italic">
                {activeLightboxItem.caption}
              </p>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.25em] text-sand-tan/60">
                {lightboxSlideLabel}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LocationPage({ onBook, onContact }: { onBook: () => void; onContact: () => void }) {
  const mapsUrl =
    'https://www.google.com/maps/search/?api=1&query=Haad+Rin+Koh+Phangan+Thailand';
  const [addressCopied, setAddressCopied] = useState(false);

  const copyAddress = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(LOCATION_ADDRESS_LINE);
      setAddressCopied(true);
    } catch {
      setAddressCopied(false);
    }
  }, []);

  useEffect(() => {
    if (!addressCopied) return;
    const t = window.setTimeout(() => setAddressCopied(false), 2200);
    return () => window.clearTimeout(t);
  }, [addressCopied]);

  return (
    <div className="relative animate-in slide-in-from-right duration-500 overflow-x-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(46vh,21rem)] bg-[radial-gradient(ellipse_72%_52%_at_50%_-18%,rgba(167,214,214,0.22),transparent),radial-gradient(ellipse_42%_42%_at_8%_25%,rgba(244,166,166,0.12),transparent)]"
        aria-hidden
      />

      <div className="relative py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto space-y-12 sm:space-y-16">
        <header className="text-center space-y-5 max-w-3xl mx-auto px-1">
          <p className="text-sunset-pink uppercase tracking-[0.3em] font-bold text-xs sm:text-sm flex items-center justify-center gap-2">
            <Navigation size={16} className="shrink-0 opacity-90" aria-hidden />
            Getting here
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif text-deep-sea-blue italic text-balance leading-[1.05]">
            Location
          </h1>
          <p className="text-lg sm:text-xl italic text-deep-sea-brown/75">Haad Rin, Koh Phangan, Thailand</p>
          <p className="text-base sm:text-lg text-deep-sea-brown/80 font-light leading-relaxed">
            Tucked on the quieter side of Haad Rin — close enough for dinner and a wander, far enough that the sea
            still feels like yours. Use the map pin, copy our address for drivers, or message us if you&apos;re
            unsure on arrival day.
          </p>
        </header>

        <section
          aria-label="About this spot"
          className="rounded-2xl border border-deep-sea-blue/10 bg-white/65 backdrop-blur-md px-4 py-6 sm:px-8 sm:py-8 shadow-sm"
        >
          <p className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-[0.35em] text-deep-sea-blue/60 mb-6">
            Why this corner of the island
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {LOCATION_SPOTLIGHT.map(({ label, caption, Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center gap-3 rounded-xl bg-sand-tan/40 px-3 py-4 sm:py-5 border border-deep-sea-blue/5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-deep-sea-blue shadow-sm ring-1 ring-deep-sea-blue/5">
                  <Icon size={22} strokeWidth={1.75} aria-hidden />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold uppercase tracking-widest text-deep-sea-blue">{label}</p>
                  <p className="text-xs text-deep-sea-brown/75 font-light">{caption}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section
          aria-label="Typical journey"
          className="rounded-2xl border border-deep-sea-blue/10 bg-deep-sea-blue/[0.04] px-4 py-6 sm:px-8 sm:py-8"
        >
          <p className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-[0.35em] text-deep-sea-blue/60 mb-2 flex items-center justify-center gap-2">
            <Clock size={14} className="opacity-80" aria-hidden />
            A typical journey
          </p>
          <p className="text-center text-sm text-deep-sea-brown/75 font-light mb-6 max-w-xl mx-auto">
            Most guests connect through Samui, then hop a boat — we&apos;re happy to help you coordinate pickups.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {LOCATION_GETTING_HERE.map(({ label, caption, Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center gap-3 rounded-xl bg-white/70 px-3 py-4 sm:py-5 border border-deep-sea-blue/10 shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-poolside-aqua/25 text-deep-sea-blue ring-1 ring-deep-sea-blue/10">
                  <Icon size={22} strokeWidth={1.75} aria-hidden />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold uppercase tracking-widest text-deep-sea-blue">{label}</p>
                  <p className="text-xs text-deep-sea-brown/75 font-light">{caption}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-start">
          <div className="space-y-6 order-2 lg:order-1">
            <div className="p-6 sm:p-8 bg-sand-tan rounded-3xl border-2 border-poolside-aqua/30 shadow-sm">
              <h2 className="text-xl sm:text-2xl font-serif mb-4 flex items-center gap-2 italic text-deep-sea-blue">
                <Navigation className="text-sunset-pink shrink-0" aria-hidden />
                How to find us
              </h2>
              <p className="text-deep-sea-blue font-light leading-relaxed mb-6">
                We&apos;re at the calmer end of Haad Rin — just far enough from the busy strip that nights feel soft,
                but still easy to join the energy when you want it.
              </p>
              <ul className="space-y-3 text-sm text-deep-sea-brown/85 font-light mb-6">
                <li className="flex gap-3">
                  <CheckCircle2 className="text-poolside-aqua flex-shrink-0 mt-0.5" size={18} aria-hidden />
                  <span>Share our address with your driver or ferry meeting point.</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="text-poolside-aqua flex-shrink-0 mt-0.5" size={18} aria-hidden />
                  <span>Google Maps opens best for on-island navigation and pin drops.</span>
                </li>
                <li className="flex gap-3">
                  <CheckCircle2 className="text-poolside-aqua flex-shrink-0 mt-0.5" size={18} aria-hidden />
                  <span>Arriving late? Message us — we&apos;ll leave check-in notes.</span>
                </li>
              </ul>
              <div className="rounded-2xl bg-white/70 border border-deep-sea-blue/10 p-4 sm:p-5 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-deep-sea-blue/55">Copy for drivers</p>
                <p className="text-sm sm:text-base text-deep-sea-blue font-medium leading-snug">{LOCATION_ADDRESS_LINE}</p>
                <button
                  type="button"
                  onClick={copyAddress}
                  className="w-full sm:w-auto min-h-11 rounded-full border-2 border-deep-sea-blue/20 bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-deep-sea-blue hover:border-sunset-pink hover:text-sunset-pink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink"
                >
                  {addressCopied ? 'Copied!' : 'Copy address'}
                </button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap gap-3">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 min-w-[12rem] items-center justify-center gap-2 min-h-12 px-8 py-4 rounded-full bg-deep-sea-blue text-white hover:bg-sunset-pink transition-all font-bold uppercase tracking-widest text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink focus-visible:ring-offset-2 focus-visible:ring-offset-sand-tan"
              >
                Google Maps <MapPin size={20} aria-hidden />
              </a>
              <button
                type="button"
                onClick={onContact}
                className="inline-flex flex-1 min-w-[12rem] items-center justify-center gap-2 min-h-12 px-8 py-4 rounded-full border-2 border-deep-sea-blue text-deep-sea-blue bg-white hover:bg-sand-tan/50 transition-all font-bold uppercase tracking-widest text-xs sm:text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                Ask a question <Mail size={18} aria-hidden />
              </button>
            </div>
          </div>

          <div className="order-1 lg:order-2 space-y-4">
            <div className="group relative min-h-56 h-64 sm:h-80 lg:h-[min(32rem,70vh)] rounded-3xl overflow-hidden shadow-xl ring-1 ring-deep-sea-blue/10 bg-poolside-aqua/15">
              <img
                src={IMG.locationMap}
                className="h-full w-full object-cover transition-transform duration-[1.2s] motion-safe:lg:group-hover:scale-[1.03]"
                alt="Aerial coastal view near Haad Rin, Koh Phangan — location context"
                sizes="(max-width: 1024px) 100vw, 50vw"
                loading="lazy"
                decoding="async"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-deep-sea-blue/85 via-deep-sea-blue/20 to-transparent" />
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-sunset-pink/90 mb-2">You are here</p>
                <p className="font-serif text-2xl sm:text-3xl text-white italic leading-tight drop-shadow-md">
                  Salt air, palm shade, island time
                </p>
              </div>
            </div>
            <p className="text-center lg:text-right text-xs text-deep-sea-brown/55 font-light italic px-2">
              Illustrative view — open Maps for live directions to Haad Rin.
            </p>
          </div>
        </div>

        <aside className="relative rounded-3xl overflow-hidden bg-deep-sea-blue text-sand-tan px-6 py-10 sm:px-12 sm:py-12 text-center">
          <div
            className="pointer-events-none absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_30%_90%,rgba(244,166,166,0.4),transparent_55%),radial-gradient(circle_at_85%_15%,rgba(159,227,212,0.3),transparent_50%)]"
            aria-hidden
          />
          <p className="relative z-[1] text-[10px] sm:text-xs font-bold uppercase tracking-[0.35em] text-sand-tan/65">
            Bags almost packed?
          </p>
          <h2 className="relative z-[1] mt-3 font-serif text-2xl sm:text-3xl md:text-4xl italic leading-tight text-balance max-w-2xl mx-auto">
            Book the easy part — we&apos;ll save your dates.
          </h2>
          <button
            type="button"
            onClick={onBook}
            className="relative z-[1] mt-8 inline-flex items-center gap-2 rounded-full bg-sunset-pink px-8 py-3.5 min-h-12 text-sm font-bold uppercase tracking-widest text-white hover:bg-white hover:text-deep-sea-blue transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink focus-visible:ring-offset-2 focus-visible:ring-offset-deep-sea-blue"
          >
            Book your stay
            <Calendar size={18} aria-hidden />
          </button>
        </aside>
      </div>
    </div>
  );
}

function ContactPage({ onBook, onViewLocation }: { onBook: () => void; onViewLocation: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  }, []);

  const resetForm = useCallback(() => {
    setSubmitted(false);
    setName('');
    setEmail('');
    setMessage('');
  }, []);

  const contactEmail = getContactEmail();

  return (
    <div className="relative animate-in slide-in-from-top duration-500 overflow-x-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(44vh,20rem)] bg-[radial-gradient(ellipse_68%_50%_at_50%_-20%,rgba(244,166,166,0.18),transparent),radial-gradient(ellipse_40%_45%_at_95%_15%,rgba(167,214,214,0.16),transparent)]"
        aria-hidden
      />

      <div className="relative py-12 sm:py-16 px-4 sm:px-6 max-w-7xl mx-auto space-y-12 sm:space-y-16">
        <header className="text-center space-y-5 max-w-3xl mx-auto px-1">
          <p className="text-sunset-pink uppercase tracking-[0.3em] font-bold text-xs sm:text-sm flex items-center justify-center gap-2">
            <Mail size={16} className="shrink-0 opacity-90" aria-hidden />
            Reach the front desk
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif text-deep-sea-blue italic text-balance leading-[1.05]">
            Say hello
          </h1>
          <p className="text-base sm:text-lg text-deep-sea-brown/75 font-light italic">
            Questions? We&apos;ll reply as soon as we&apos;re back from the beach.
          </p>
          <p id="contact-intro" className="text-base sm:text-lg text-deep-sea-brown/80 font-light leading-relaxed">
            Ask about rooms, transfers, special occasions, or what to pack. For anything urgent on arrival day,
            WhatsApp or a call reaches us fastest.
          </p>
        </header>

        <section
          aria-label="What to expect when you write"
          className="rounded-2xl border border-deep-sea-blue/10 bg-white/65 backdrop-blur-md px-4 py-6 sm:px-8 sm:py-8 shadow-sm"
        >
          <p className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-[0.35em] text-deep-sea-blue/60 mb-6">
            When you reach out
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {CONTACT_REPLY_STRIP.map(({ label, caption, Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center gap-3 rounded-xl bg-sand-tan/40 px-3 py-4 sm:py-5 border border-deep-sea-blue/5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/85 text-deep-sea-blue shadow-sm ring-1 ring-deep-sea-blue/5">
                  <Icon size={22} strokeWidth={1.75} aria-hidden />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold uppercase tracking-widest text-deep-sea-blue">{label}</p>
                  <p className="text-xs text-deep-sea-brown/75 font-light">{caption}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12 items-start">
          <aside className="lg:col-span-4 space-y-4" aria-label="Other ways to reach us">
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-deep-sea-blue/55 px-1">
              Prefer something faster?
            </p>
            <a
              href={CONTACT_PHONE_HREF}
              className="group flex items-start gap-4 rounded-2xl border border-deep-sea-blue/10 bg-white p-5 shadow-sm transition-all hover:border-sunset-pink/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink focus-visible:ring-offset-2 focus-visible:ring-offset-sand-tan"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-poolside-aqua/25 text-deep-sea-blue">
                <Phone size={22} strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0 pt-0.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-deep-sea-brown/55">Call</p>
                <p className="font-serif text-lg text-deep-sea-blue italic group-hover:text-sunset-pink transition-colors">
                  {CONTACT_PHONE_DISPLAY}
                </p>
                <p className="text-xs text-deep-sea-brown/65 font-light mt-1">Best for same-day arrival help</p>
              </div>
            </a>
            <a
              href={`mailto:${contactEmail}`}
              className="group flex items-start gap-4 rounded-2xl border border-deep-sea-blue/10 bg-white p-5 shadow-sm transition-all hover:border-sunset-pink/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink focus-visible:ring-offset-2 focus-visible:ring-offset-sand-tan"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-poolside-aqua/25 text-deep-sea-blue">
                <Mail size={22} strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0 pt-0.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-deep-sea-brown/55">Email</p>
                <p className="text-sm font-medium text-deep-sea-blue break-all group-hover:text-sunset-pink transition-colors">
                  {contactEmail}
                </p>
                <p className="text-xs text-deep-sea-brown/65 font-light mt-1">We read everything — no bots</p>
              </div>
            </a>
            <a
              href={CONTACT_WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-4 rounded-2xl border border-deep-sea-blue/10 bg-white p-5 shadow-sm transition-all hover:border-poolside-aqua hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink focus-visible:ring-offset-2 focus-visible:ring-offset-sand-tan"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-700">
                <MessageCircle size={22} strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0 pt-0.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-deep-sea-brown/55">WhatsApp</p>
                <p className="font-serif text-lg text-deep-sea-blue italic group-hover:text-sunset-pink transition-colors">
                  Message us
                </p>
                <p className="text-xs text-deep-sea-brown/65 font-light mt-1">Opens chat in a new tab</p>
              </div>
            </a>
          </aside>

          <div className="lg:col-span-8">
            <div className="rounded-3xl border border-deep-sea-blue/10 bg-white p-6 sm:p-10 shadow-xl shadow-deep-sea-blue/5">
              {!submitted ? (
                <>
                  <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-deep-sea-blue/10 pb-6">
                    <div>
                      <h2 className="font-serif text-2xl sm:text-3xl text-deep-sea-blue italic">Write to us</h2>
                      <p className="text-sm text-deep-sea-brown/75 font-light mt-2 max-w-xl">
                        A few details help us answer in one go. We aim to reply within a day — sooner when your dates
                        are close.
                      </p>
                    </div>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-6" aria-describedby="contact-intro">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label
                          htmlFor="contact-name"
                          className="text-xs uppercase tracking-widest font-bold text-deep-sea-brown/60"
                        >
                          Name
                        </label>
                        <input
                          id="contact-name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full min-h-12 bg-sand-tan/25 border border-deep-sea-blue/10 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-sunset-pink"
                          placeholder="Your name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label
                          htmlFor="contact-email"
                          className="text-xs uppercase tracking-widest font-bold text-deep-sea-brown/60"
                        >
                          Email
                        </label>
                        <input
                          id="contact-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          inputMode="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full min-h-12 bg-sand-tan/25 border border-deep-sea-blue/10 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-sunset-pink"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="contact-message"
                        className="text-xs uppercase tracking-widest font-bold text-deep-sea-brown/60"
                      >
                        Message
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full bg-sand-tan/25 border border-deep-sea-blue/10 p-4 rounded-xl min-h-36 sm:min-h-40 focus:outline-none focus:ring-2 focus:ring-sunset-pink resize-y"
                        placeholder="Dates, room ideas, accessibility, or anything we should know…"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full sm:w-auto min-h-12 bg-sunset-pink text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs sm:text-sm hover:bg-deep-sea-blue transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-sea-blue focus-visible:ring-offset-2 inline-flex items-center justify-center gap-2"
                    >
                      Send message
                      <ArrowRight size={18} aria-hidden />
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-8 sm:py-12 space-y-6 max-w-lg mx-auto">
                  <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-poolside-aqua/30 text-emerald-700">
                      <CheckCircle2 size={36} strokeWidth={1.5} aria-hidden />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-3xl sm:text-4xl font-serif text-deep-sea-blue italic">Got it — thanks!</h2>
                    <p className="text-deep-sea-brown/80 font-light leading-relaxed">
                      Your note is in our inbox. If something&apos;s time-sensitive, you can still reach us on the phone or
                      WhatsApp — those ping us instantly.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row flex-wrap items-stretch justify-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onBook}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sunset-pink px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-white hover:bg-deep-sea-blue transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-sea-blue focus-visible:ring-offset-2"
                    >
                      Book your stay
                      <Calendar size={18} aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={onViewLocation}
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-deep-sea-blue bg-white px-6 py-3.5 text-sm font-bold uppercase tracking-widest text-deep-sea-blue hover:bg-sand-tan/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink focus-visible:ring-offset-2"
                    >
                      Location
                      <MapPin size={18} aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={resetForm}
                      className="inline-flex min-h-12 items-center justify-center rounded-full text-sunset-pink font-bold text-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink px-4"
                    >
                      Send another message
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="relative rounded-3xl overflow-hidden border border-deep-sea-blue/10 bg-gradient-to-br from-deep-sea-blue via-deep-sea-blue to-deep-sea-blue/95 text-sand-tan px-6 py-10 sm:px-12 sm:py-12 text-center">
          <div
            className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_15%_85%,rgba(244,166,166,0.45),transparent_50%),radial-gradient(circle_at_88%_12%,rgba(159,227,212,0.35),transparent_48%)]"
            aria-hidden
          />
          <p className="relative z-[1] text-[10px] sm:text-xs font-bold uppercase tracking-[0.35em] text-sand-tan/65">
            Planning the trip?
          </p>
          <p className="relative z-[1] mt-3 font-serif text-2xl sm:text-3xl md:text-4xl italic leading-tight text-balance max-w-2xl mx-auto">
            Locks, ferry times, room questions — we&apos;ve heard it all. Just ask.
          </p>
          <div className="relative z-[1] mt-8 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={onViewLocation}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-sand-tan/50 bg-white/10 px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-sand-tan hover:bg-white hover:text-deep-sea-blue transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink focus-visible:ring-offset-2 focus-visible:ring-offset-deep-sea-blue w-full sm:w-auto"
            >
              How to get here
              <Navigation size={18} aria-hidden />
            </button>
            <button
              type="button"
              onClick={onBook}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sunset-pink px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-white hover:bg-white hover:text-deep-sea-blue transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-deep-sea-blue w-full sm:w-auto"
            >
              Check dates
              <Calendar size={18} aria-hidden />
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

const BOOKING_SNAPSHOT_KEY = 'loma_booking_snapshot';

type BookingSnapshot = {
  roomId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalMajor: number;
  customerEmail: string;
  customerName?: string;
};

function BookingPage({
  initialRoom,
  stripeReturn,
  onConsumedStripeReturn,
  onGoHome,
  onContact,
}: {
  initialRoom: Room | null;
  stripeReturn: 'success' | 'cancel' | null;
  onConsumedStripeReturn: () => void;
  onGoHome: () => void;
  onContact: () => void;
}) {
  const [step, setStep] = useState(1);

  const dateFloor = useMemo(() => new Date().toISOString().split('T')[0], []);
  const dateTomorrow = useMemo(() => new Date(Date.now() + 86400000).toISOString().split('T')[0], []);

  const [bookingData, setBookingData] = useState(() => ({
    roomId: initialRoom?.id || '',
    checkIn: dateFloor,
    checkOut: dateTomorrow,
    guests: 2,
    customerEmail: '',
    customerName: '',
  }));

  const [payLoading, setPayLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [paidTotalMajor, setPaidTotalMajor] = useState<number | null>(null);

  useEffect(() => {
    if (!initialRoom) return;
    setBookingData((prev) => ({
      ...prev,
      roomId: initialRoom.id,
      guests: Math.min(prev.guests, initialRoom.maxGuests),
    }));
  }, [initialRoom]);

  useEffect(() => {
    const { checkIn, checkOut } = bookingData;
    if (!checkIn || !checkOut) return;
    if (checkOut <= checkIn) {
      const d = parseISODateLocal(checkIn);
      if (!d) return;
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      setBookingData((prev) => ({ ...prev, checkOut: toISODateLocal(next) }));
    }
  }, [bookingData.checkIn, bookingData.checkOut]);

  useEffect(() => {
    if (stripeReturn === 'success') {
      const raw = sessionStorage.getItem(BOOKING_SNAPSHOT_KEY);
      if (raw) {
        try {
          const snap = JSON.parse(raw) as BookingSnapshot;
          setBookingData((prev) => ({
            ...prev,
            roomId: snap.roomId,
            checkIn: snap.checkIn,
            checkOut: snap.checkOut,
            guests: snap.guests,
            customerEmail: snap.customerEmail,
            customerName: snap.customerName ?? '',
          }));
          setPaidTotalMajor(snap.totalMajor);
        } catch {
          /* keep existing state */
        }
      }
      setStep(3);
      onConsumedStripeReturn();
      sessionStorage.removeItem(BOOKING_SNAPSHOT_KEY);
      return;
    }
    if (stripeReturn === 'cancel') {
      setStep(2);
      setCheckoutError('Payment was cancelled. You can try again when you’re ready.');
      onConsumedStripeReturn();
    }
  }, [stripeReturn, onConsumedStripeReturn]);

  const selectedRoom = useMemo(() => ROOMS.find((r) => r.id === bookingData.roomId), [bookingData.roomId]);

  const nights = useMemo(() => {
    const start = new Date(bookingData.checkIn).getTime();
    const end = new Date(bookingData.checkOut).getTime();
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  }, [bookingData.checkIn, bookingData.checkOut]);

  const lineTotal = useMemo(
    () => (selectedRoom ? selectedRoom.price * nights : 0),
    [selectedRoom, nights],
  );

  const displayTotalMajor = paidTotalMajor ?? lineTotal;

  const updateGuests = (newCount: number) => {
    const max = selectedRoom?.maxGuests || 10;
    const count = Math.min(Math.max(1, newCount), max);
    setBookingData((prev) => ({ ...prev, guests: count }));
  };

  const startStripeCheckout = async () => {
    setCheckoutError(null);
    if (!selectedRoom || !bookingData.roomId) return;
    const email = bookingData.customerEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setCheckoutError('Please enter a valid email so we can send your receipt.');
      return;
    }

    setPayLoading(true);
    const totalMajor = lineTotal;
    const snap: BookingSnapshot = {
      roomId: bookingData.roomId,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      guests: bookingData.guests,
      totalMajor,
      customerEmail: email,
      customerName: bookingData.customerName.trim() || undefined,
    };
    sessionStorage.setItem(BOOKING_SNAPSHOT_KEY, JSON.stringify(snap));

    try {
      const res = await fetch(resolveApiUrl('/api/create-checkout-session'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: bookingData.roomId,
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          guests: bookingData.guests,
          customerEmail: email,
          customerName: snap.customerName,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Checkout could not start');
      }
      if (data.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error('No checkout URL returned');
    } catch (e) {
      sessionStorage.removeItem(BOOKING_SNAPSHOT_KEY);
      setCheckoutError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setPayLoading(false);
    }
  };

  return (
    <div className="relative animate-in fade-in duration-500 overflow-x-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[min(46vh,21rem)] bg-[radial-gradient(ellipse_70%_50%_at_50%_-18%,rgba(167,214,214,0.2),transparent),radial-gradient(ellipse_42%_40%_at_92%_12%,rgba(244,166,166,0.14),transparent)]"
        aria-hidden
      />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10 sm:space-y-12">
        <header className="text-center space-y-5 max-w-3xl mx-auto px-1">
          <p className="text-sunset-pink uppercase tracking-[0.3em] font-bold text-xs sm:text-sm flex items-center justify-center gap-2">
            <Calendar size={16} className="shrink-0 opacity-90" aria-hidden />
            Reserve your dates
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-deep-sea-blue italic text-balance leading-[1.05]">
            Book your escape
          </h1>
          <p className="text-sunset-pink tracking-widest font-bold uppercase text-sm px-2">Secure booking. No surprises.</p>
          <p className="text-base sm:text-lg text-deep-sea-brown/80 font-light leading-relaxed">
            Choose your hideaway, lock your nights, then finish payment on Stripe. Change your mind before paying — your
            cart isn&apos;t charged until checkout completes.
          </p>
        </header>

        <nav aria-label="Booking progress">
          <ol className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            {BOOKING_STEPS.map(({ step: stepNum, label }) => {
              const isActive = step === stepNum;
              const isComplete = step > stepNum;
              return (
                <li key={stepNum} className="flex items-center gap-2.5 sm:gap-3">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${
                      isComplete || isActive
                        ? 'border-sunset-pink bg-sunset-pink/15 text-deep-sea-blue'
                        : 'border-deep-sea-blue/15 text-deep-sea-brown/35 bg-white/50'
                    }`}
                    aria-current={isActive ? 'step' : undefined}
                  >
                    {isComplete ? <CheckCircle2 size={20} className="text-emerald-600" aria-hidden /> : stepNum}
                  </span>
                  <span
                    className={`text-xs font-bold uppercase tracking-widest ${isActive ? 'text-deep-sea-blue' : 'text-deep-sea-brown/45'}`}
                  >
                    {label}
                  </span>
                </li>
              );
            })}
          </ol>
        </nav>

        <section
          aria-label="How we handle payment"
          className="rounded-2xl border border-deep-sea-blue/10 bg-white/70 backdrop-blur-md px-4 py-6 sm:px-8 sm:py-8 shadow-sm"
        >
          <p className="text-center text-[10px] sm:text-xs font-bold uppercase tracking-[0.35em] text-deep-sea-blue/60 mb-6">
            Before you check out
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {BOOKING_TRUST_STRIP.map(({ label, caption, Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center text-center gap-3 rounded-xl bg-sand-tan/40 px-3 py-4 sm:py-5 border border-deep-sea-blue/5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-deep-sea-blue shadow-sm ring-1 ring-deep-sea-blue/5">
                  <Icon size={22} strokeWidth={1.75} aria-hidden />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold uppercase tracking-widest text-deep-sea-blue">{label}</p>
                  <p className="text-xs text-deep-sea-brown/75 font-light">{caption}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 bg-white p-6 sm:p-9 rounded-3xl shadow-xl shadow-deep-sea-blue/5 border border-deep-sea-blue/10 min-w-0">
          {step === 1 && (
            <div className="space-y-8">
              <div className="space-y-2">
                <label htmlFor="booking-room" className="text-xs uppercase tracking-widest font-bold text-deep-sea-brown/55">
                  Select Sanctuary
                </label>
                <BookingRoomSelect
                  id="booking-room"
                  rooms={ROOMS.filter((r) => r.availability !== 'sold-out')}
                  value={bookingData.roomId}
                  onChange={(roomId) => setBookingData((p) => ({ ...p, roomId }))}
                  emptyLabel="Select a room…"
                  formatRoomLabel={(r) =>
                    `${r.name} — ${formatMajorAmount(r.price)}/night${r.availability === 'few-left' ? ' · Limited' : ''}`
                  }
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="booking-checkin" className="text-xs uppercase tracking-widest font-bold text-deep-sea-brown/55">
                    Check-In
                  </label>
                  <BookingDateField
                    id="booking-checkin"
                    min={dateFloor}
                    value={bookingData.checkIn}
                    onChange={(checkIn) => setBookingData((p) => ({ ...p, checkIn }))}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="booking-checkout" className="text-xs uppercase tracking-widest font-bold text-deep-sea-brown/55">
                    Check-Out
                  </label>
                  <BookingDateField
                    id="booking-checkout"
                    min={bookingData.checkIn || dateFloor}
                    value={bookingData.checkOut}
                    onChange={(checkOut) => setBookingData((p) => ({ ...p, checkOut }))}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <p id="booking-guests-label" className="text-xs uppercase tracking-widest font-bold opacity-60">
                  Number of Guests
                </p>
                <div className="flex flex-wrap items-center gap-4 sm:gap-6" aria-labelledby="booking-guests-label">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => updateGuests(bookingData.guests - 1)}
                      className="min-h-11 min-w-11 rounded-full border border-deep-sea-blue/20 flex items-center justify-center hover:bg-sunset-pink hover:text-white transition-all font-bold disabled:opacity-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink"
                      disabled={bookingData.guests <= 1}
                      aria-label="Decrease guest count"
                    >
                      −
                    </button>
                    <span className="text-2xl font-serif min-w-[2ch] text-center tabular-nums" aria-live="polite">
                      {bookingData.guests}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateGuests(bookingData.guests + 1)}
                      className="min-h-11 min-w-11 rounded-full border border-deep-sea-blue/20 flex items-center justify-center hover:bg-sunset-pink hover:text-white transition-all font-bold disabled:opacity-20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink"
                      disabled={!!selectedRoom && bookingData.guests >= selectedRoom.maxGuests}
                      aria-label="Increase guest count"
                    >
                      +
                    </button>
                  </div>
                  {selectedRoom && (
                    <span className="text-xs text-deep-sea-brown/40 italic">Max {selectedRoom.maxGuests} for this room</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                disabled={!bookingData.roomId || !bookingData.checkIn || !bookingData.checkOut}
                onClick={() => setStep(2)}
                className="w-full min-h-14 bg-sunset-pink text-white py-5 rounded-full font-bold text-lg shadow-xl disabled:opacity-30 transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-sea-blue focus-visible:ring-offset-2"
              >
                Next Step
              </button>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
               <button type="button" onClick={() => setStep(1)} className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 text-deep-sea-blue/50 hover:text-sunset-pink transition-colors">
                 <ArrowLeft size={16} /> Back to Selection
               </button>
               <h2 className="text-2xl font-serif italic border-b border-sand-tan pb-4">Checkout Summary</h2>
               {checkoutError && (
                 <div className="flex items-start gap-2 p-4 rounded-xl bg-rose-50 text-rose-800 text-sm border border-rose-100">
                   <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                   <span>{checkoutError}</span>
                 </div>
               )}
               <div className="space-y-4 py-4">
                  <div className="p-6 bg-sand-tan/20 rounded-2xl border border-sand-tan space-y-3">
                    <p className="text-sm flex justify-between"><span>Check-in:</span> <span className="font-bold">{bookingData.checkIn}</span></p>
                    <p className="text-sm flex justify-between"><span>Check-out:</span> <span className="font-bold">{bookingData.checkOut}</span></p>
                    <p className="text-sm flex justify-between"><span>Guests:</span> <span className="font-bold">{bookingData.guests}</span></p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 md:col-span-2">
                      <label htmlFor="booking-email" className="text-xs uppercase tracking-widest font-bold opacity-60">
                        Email (for receipt)
                      </label>
                      <input
                        id="booking-email"
                        type="email"
                        autoComplete="email"
                        value={bookingData.customerEmail}
                        onChange={(e) => setBookingData((p) => ({ ...p, customerEmail: e.target.value }))}
                        className="w-full min-h-12 bg-sand-tan/30 border border-deep-sea-blue/10 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sunset-pink"
                        placeholder="you@example.com"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label htmlFor="booking-name" className="text-xs uppercase tracking-widest font-bold opacity-60">
                        Name (optional)
                      </label>
                      <input
                        id="booking-name"
                        type="text"
                        autoComplete="name"
                        value={bookingData.customerName}
                        onChange={(e) => setBookingData((p) => ({ ...p, customerName: e.target.value }))}
                        className="w-full min-h-12 bg-sand-tan/30 border border-deep-sea-blue/10 p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-sunset-pink"
                        placeholder="Guest name"
                      />
                    </div>
                  </div>
                  <div className="py-4 space-y-2 border-t border-sand-tan mt-4">
                    <div className="flex justify-between text-sm opacity-60">
                      <span>Rate per night</span>
                      <span>{selectedRoom ? formatMajorAmount(selectedRoom.price) : '—'}</span>
                    </div>
                    <div className="flex justify-between text-sm opacity-60">
                      <span>Number of nights</span>
                      <span>{nights}</span>
                    </div>
                    <div className="flex justify-between font-serif text-2xl pt-4 mt-2">
                      <span>Total</span>
                      <span className="text-sunset-pink">{formatMajorAmount(lineTotal)}</span>
                    </div>
                  </div>
               </div>
               <button
                 type="button"
                 disabled={payLoading || !selectedRoom}
                 onClick={() => void startStripeCheckout()}
                 className="w-full bg-poolside-aqua text-deep-sea-blue py-5 rounded-full font-bold text-lg shadow-xl transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
               >
                 {payLoading ? 'Redirecting to secure checkout…' : `Pay ${formatMajorAmount(lineTotal)} with Stripe`}
               </button>
               <p className="text-xs text-center text-deep-sea-brown/50">
                 You&apos;ll complete payment on Stripe&apos;s secure page. Card details never touch this site.
               </p>
            </div>
          )}
          {step === 3 && (
            <div className="text-center py-8 sm:py-12 space-y-6 animate-in slide-in-from-right duration-500">
              <div className="w-20 h-20 bg-poolside-aqua/25 rounded-full flex items-center justify-center mx-auto text-poolside-aqua ring-2 ring-poolside-aqua/30">
                <ShieldCheck size={40} aria-hidden />
              </div>
              <h2 className="text-3xl sm:text-4xl font-serif text-deep-sea-blue italic text-balance">Booking confirmed</h2>
              <p className="text-sm sm:text-base text-deep-sea-brown/75 max-w-md mx-auto leading-relaxed font-light">
                Thank you — your payment went through. We&apos;ll follow up by email if we need anything else.
              </p>
              <div className="max-w-sm mx-auto rounded-2xl border border-deep-sea-blue/10 bg-sand-tan/35 px-5 py-4 text-sm text-left space-y-2 text-deep-sea-brown/85">
                <p>
                  <span className="font-bold text-deep-sea-blue">Guests:</span> {bookingData.guests}
                </p>
                <p>
                  <span className="font-bold text-deep-sea-blue">Stay:</span> {bookingData.checkIn} — {bookingData.checkOut}
                </p>
                <p className="font-serif text-lg text-deep-sea-blue pt-2 border-t border-deep-sea-blue/10 mt-2">
                  Total paid: <span className="text-sunset-pink">{formatMajorAmount(displayTotalMajor)}</span>
                </p>
              </div>
              <p className="text-xs uppercase tracking-widest text-deep-sea-brown/50 font-bold">See you at Loma soon</p>
              <div className="flex flex-col sm:flex-row flex-wrap items-stretch justify-center gap-3 pt-2 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={onGoHome}
                  className="min-h-12 flex-1 rounded-full bg-sunset-pink text-white px-8 py-3.5 font-bold uppercase tracking-widest text-xs sm:text-sm shadow-lg hover:bg-deep-sea-blue transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-deep-sea-blue focus-visible:ring-offset-2"
                >
                  Back to home
                </button>
                <button
                  type="button"
                  onClick={onContact}
                  className="min-h-12 flex-1 rounded-full border-2 border-deep-sea-blue/20 bg-white px-8 py-3.5 font-bold uppercase tracking-widest text-xs sm:text-sm text-deep-sea-blue hover:border-sunset-pink hover:text-sunset-pink transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink focus-visible:ring-offset-2"
                >
                  Contact us
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="space-y-6">
          <div className="bg-deep-sea-blue text-sand-tan p-6 sm:p-8 rounded-3xl shadow-xl relative lg:sticky lg:top-24 overflow-hidden ring-1 ring-white/10">
            <div
              className="pointer-events-none absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_80%_20%,rgba(244,166,166,0.35),transparent_55%),radial-gradient(circle_at_15%_85%,rgba(159,227,212,0.3),transparent_50%)]"
              aria-hidden
            />
            <h3 className="relative z-[1] text-xl font-serif mb-6 italic underline underline-offset-8 decoration-sunset-pink/50">
              Your stay
            </h3>
            {selectedRoom ? (
              <div className="space-y-6 relative z-[1]">
                <div className="flex gap-4">
                  <img src={selectedRoom.image} className="w-20 h-20 rounded-xl object-cover" alt={selectedRoom.name} />
                  <div>
                    <h4 className="font-bold leading-tight">{selectedRoom.name}</h4>
                    <p className="text-xs opacity-60 mt-1">
                      {bookingData.guests} Guests • {nights} Night{nights > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-sand-tan/10 space-y-4">
                  <div className="space-y-2">
                    <h5 className="text-[10px] uppercase tracking-[0.2em] font-bold opacity-40 flex items-center gap-1">
                      <Sparkles size={10} /> Room Highlights
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {selectedRoom.amenities.slice(0, 4).map((am, i) => (
                        <span key={i} className="text-[10px] bg-white/10 px-2 py-1 rounded-md opacity-80 whitespace-nowrap">
                          {am}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-xs font-light tracking-wide opacity-80">
                      <span>
                        {formatMajorAmount(selectedRoom.price)} × {nights} night{nights > 1 ? 's' : ''}
                      </span>
                      <span>{formatMajorAmount(lineTotal)}</span>
                    </div>
                    {bookingData.guests > 2 && (
                      <div className="flex items-start gap-2 text-[10px] opacity-40 italic">
                        <Info size={12} className="flex-shrink-0" />
                        <span>Guest count within room capacity limit. No additional surcharges.</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between font-serif text-2xl pt-4 border-t border-sand-tan/10 mt-4 italic">
                  <span>Total</span>
                  <span className="text-sunset-pink">{formatMajorAmount(step === 3 ? displayTotalMajor : lineTotal)}</span>
                </div>
              </div>
            ) : (
              <div className="relative z-[1] py-12 text-center space-y-4 opacity-40">
                <Calendar size={48} className="mx-auto" aria-hidden />
                <p className="text-sm italic">Select a room and dates to see your price breakdown.</p>
              </div>
            )}
          </div>
        </div>
      </div>

        <aside className="rounded-3xl border border-deep-sea-blue/10 bg-gradient-to-br from-white via-sand-tan/40 to-poolside-aqua/15 px-6 py-8 sm:px-10 sm:py-10 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-deep-sea-blue/55">Need a hand?</p>
          <p className="mt-3 font-serif text-xl sm:text-2xl text-deep-sea-blue italic text-balance leading-snug">
            Special requests, ferry timing, or room questions — we&apos;re one message away.
          </p>
          <button
            type="button"
            onClick={onContact}
            className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-deep-sea-blue bg-white/90 px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-deep-sea-blue hover:bg-deep-sea-blue hover:text-sand-tan transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sunset-pink focus-visible:ring-offset-2"
          >
            <MessageCircle size={18} aria-hidden />
            Contact
          </button>
        </aside>
      </div>
    </div>
  );
}
