import React, { useEffect, useMemo, useRef } from 'react';
import { BedDouble, Bus, ExternalLink, Plane, ShieldCheck, Ticket, WalletCards } from 'lucide-react';
import './AffiliateWidget.css';

const tripBaseParams = 'Allianceid=3792657&SID=20934443&trip_sub1=';
const ENABLE_EXTERNAL_AFFILIATE_EMBEDS = import.meta.env.VITE_ENABLE_AFFILIATE_EMBEDS === 'true';

export const AFFILIATE_PLACEMENTS = [
  {
    key: 'trip-sea-flights',
    label: 'Southeast Asia Flights',
    partner: 'Trip.com',
    type: 'iframe',
    category: 'Flights',
    regions: ['Asia', 'Southeast Asia'],
    src: `https://www.trip.com/partners/ad/SB39354?${tripBaseParams}`,
    width: 728,
    height: 90,
    href: 'https://www.trip.com/?Allianceid=3792657&SID=20934443'
  },
  {
    key: 'trip-south-america-flights',
    label: 'South America Flights',
    partner: 'Trip.com',
    type: 'iframe',
    category: 'Flights',
    regions: ['South America'],
    src: `https://www.trip.com/partners/ad/SB39354?${tripBaseParams}`,
    width: 728,
    height: 90,
    href: 'https://www.trip.com/?Allianceid=3792657&SID=20934443'
  },
  {
    key: 'trip-europe-flights',
    label: 'Europe Flights',
    partner: 'Trip.com',
    type: 'iframe',
    category: 'Flights',
    regions: ['Europe'],
    src: `https://www.trip.com/partners/ad/SB18934001?${tripBaseParams}`,
    width: 728,
    height: 90,
    href: 'https://www.trip.com/?Allianceid=3792657&SID=20934443'
  },
  {
    key: 'trip-hotels',
    label: 'Hotels Worldwide',
    partner: 'Trip.com',
    type: 'iframe',
    category: 'Hotels',
    regions: ['Global'],
    src: 'https://www.trip.com/partners/ad/SB39358?Allianceid=3792657&SID=20934443&ouid=',
    width: 728,
    height: 90,
    href: 'https://www.trip.com/hotels/?Allianceid=3792657&SID=20934443'
  },
  {
    key: '12go-bangkok-phuket',
    label: 'Bangkok to Phuket',
    partner: '12Go Asia',
    type: 'link',
    category: 'Transport',
    regions: ['Asia', 'Thailand'],
    href: 'https://12go.asia/en/travel/Bangkok/Phuket/?z=3059202',
    text: 'From Bangkok to Phuket',
    image: '/assets/affiliate/12go-bangkok-phuket.jpg',
    imageAlt: 'Coastal Thailand transport route for Bangkok to Phuket',
    details: 'Compare bus, train, ferry, and flight options for the Bangkok to Phuket route.',
    meta: 'Thailand transport route',
    cta: 'Check schedules'
  },
  {
    key: '12go-bangkok-chiang-mai',
    label: 'Bangkok to Chiang Mai',
    partner: '12Go Asia',
    type: 'link',
    category: 'Transport',
    regions: ['Asia', 'Thailand'],
    href: 'https://12go.asia/en/travel/Bangkok/Chiang-Mai/?z=16354867',
    text: 'From Bangkok to Chiang Mai',
    image: '/assets/affiliate/12go-bangkok-chiang-mai.jpg',
    imageAlt: 'Northern Thailand train route for Bangkok to Chiang Mai',
    details: 'Find train, bus, and flight departures from Bangkok to Northern Thailand.',
    meta: 'Thailand transport route',
    cta: 'Check schedules'
  },
  {
    key: 'klook',
    label: 'Tours & Experiences',
    partner: 'Klook',
    type: 'script',
    category: 'Attractions',
    regions: ['Asia', 'Global'],
    src: 'https://tpwdg.com/content?currency=USD&trs=554583&shmarker=745909&locale=en&city_id=2&category=4&amount=3&powered_by=true&campaign_id=137&promo_id=4497',
    href: 'https://www.klook.com/?aid=745909'
  },
  {
    key: 'kiwi-flights',
    label: 'Flight Search',
    partner: 'Kiwi.com',
    type: 'script',
    category: 'Flights',
    regions: ['Global'],
    src: 'https://tpwdg.com/content?currency=usd&trs=554583&shmarker=745909&locale=en&stops=any&show_hotels=true&powered_by=true&border_radius=0&plain=true&color_button=%2300A991&color_button_text=%23ffffff&promo_id=3414&campaign_id=111',
    href: 'https://www.kiwi.com/?affilid=travelpayouts'
  },
  {
    key: 'getrentacar',
    label: 'Car Hire',
    partner: 'GetRentacar.com',
    type: 'script',
    category: 'Car Rental',
    regions: ['Global'],
    src: 'https://tpwdg.com/content?trs=554583&shmarker=745909&lang=en&powered_by=true&campaign_id=120&promo_id=8679',
    href: 'https://getrentacar.com/'
  },
  {
    key: 'compensair',
    label: 'Flight Compensation',
    partner: 'Compensair',
    type: 'script',
    category: 'Flight Claims',
    regions: ['Global', 'Europe'],
    src: 'https://tpwdg.com/content?trs=554583&shmarker=745909&locale=en&border_radius=5&plain=true&powered_by=true&promo_id=3408&campaign_id=86',
    href: 'https://www.compensair.com/'
  }
];

const defaultSlots = {
  homepage: ['trip-sea-flights', 'trip-hotels', 'kiwi-flights'],
  listingTop: ['trip-sea-flights'],
  listingMid: ['klook', 'kiwi-flights', 'getrentacar', 'compensair'],
  article: ['trip-hotels', 'compensair', 'getrentacar'],
  sidebar: ['12go-bangkok-phuket', '12go-bangkok-chiang-mai'],
  footer: []
};

const iconByCategory = {
  Flights: Plane,
  Hotels: BedDouble,
  Transport: Bus,
  Attractions: Ticket,
  'Car Rental': ShieldCheck,
  'Flight Claims': ShieldCheck
};

function ScriptPlacement({ placement }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return undefined;

    ref.current.innerHTML = '';
    const loading = document.createElement('div');
    loading.className = 'affiliate-loading-note';
    loading.textContent = 'Loading partner offer...';
    ref.current.appendChild(loading);

    const script = document.createElement('script');
    script.async = true;
    script.src = placement.src;
    script.charset = 'utf-8';
    script.dataset.affiliateKey = placement.key;
    script.onerror = () => {
      if (ref.current) {
        ref.current.innerHTML = '';
        const fallback = document.createElement('a');
        fallback.className = 'affiliate-link-card native-card';
        fallback.href = placement.href || placement.src;
        fallback.target = '_blank';
        fallback.rel = 'nofollow sponsored noopener noreferrer';
        fallback.innerHTML = `<span>${placement.partner}</span><strong>${placement.label}</strong><em>Open deal</em>`;
        ref.current.appendChild(fallback);
      }
    };

    const observer = new MutationObserver(() => {
      if (!ref.current) return;
      const hasPartnerContent = Array.from(ref.current.children).some((child) => child !== loading && child !== script);
      if (hasPartnerContent) {
        loading.remove();
        ref.current.classList.add('affiliate-script-loaded');
      }
    });

    observer.observe(ref.current, { childList: true, subtree: true });
    ref.current.appendChild(script);

    return () => {
      observer.disconnect();
      if (ref.current) ref.current.innerHTML = '';
    };
  }, [placement.href, placement.key, placement.label, placement.partner, placement.src]);

  return <div ref={ref} className="affiliate-script-slot" />;
}
function AffiliatePlacement({ placement }) {
  if (ENABLE_EXTERNAL_AFFILIATE_EMBEDS && placement.type === 'iframe') {
    return (
      <div className="affiliate-iframe-frame">
        <iframe
          title={`${placement.partner} ${placement.label}`}
          src={placement.src}
          width={placement.width}
          height={placement.height}
          frameBorder="0"
          scrolling="no"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    );
  }

  if (ENABLE_EXTERNAL_AFFILIATE_EMBEDS && placement.type === 'script') {
    return <ScriptPlacement placement={placement} />;
  }

  return (
    <a className={`affiliate-link-card native-card ${placement.details ? 'has-details' : ''}`} href={placement.href || placement.src} target="_blank" rel="nofollow sponsored noopener noreferrer">
      {placement.image && <img className="affiliate-link-image" src={placement.image} alt={placement.imageAlt || ''} loading="lazy" />}
      <span>{placement.partner}</span>
      <strong>{placement.text || placement.label}</strong>
      {placement.details && <p>{placement.details}</p>}
      {placement.meta && <small>{placement.meta}</small>}
      <em>{placement.cta || (placement.category === 'Flight Claims' ? 'Check eligibility' : placement.category === 'Car Rental' ? 'Compare options' : 'Open deal')}</em>
      <ExternalLink size={16} aria-hidden="true" />
    </a>
  );
}

function getPlacementKeys(slot, keys) {
  return keys && keys.length ? keys : defaultSlots[slot] || [];
}

export function AffiliateWidget({ slot = 'homepage', keys, title, compact = false }) {
  const isLeaderboard = slot === 'listingTop';
  const placements = useMemo(() => {
    const selected = getPlacementKeys(slot, keys);
    return selected
      .map((key) => AFFILIATE_PLACEMENTS.find((placement) => placement.key === key))
      .filter(Boolean);
  }, [keys, slot]);

  if (!placements.length) return null;

  return (
    <section className={`affiliate-widget affiliate-${slot} affiliate-count-${placements.length} ${compact ? 'compact' : ''} ${isLeaderboard ? 'leaderboard' : ''}`} aria-label="Sponsored travel deals">
      {isLeaderboard ? (
        <div className="affiliate-ad-label">
          <span>Advertisement</span>
          <strong>{title || 'Flight Deals for Travel Readers'}</strong>
        </div>
      ) : (
        <div className="affiliate-header">
          <div>
            <span className="affiliate-kicker">Sponsored Travel Deals</span>
            <h3>{title || 'Planning your next trip?'}</h3>
          </div>
          <p>Handpicked booking tools for TTN travel readers.</p>
        </div>
      )}

      <div className="affiliate-grid">
        {placements.map((placement) => {
          const Icon = iconByCategory[placement.category] || WalletCards;
          return (
            <div key={placement.key} className={`affiliate-card type-${placement.type} placement-${placement.key}`}>
              {!isLeaderboard && (
                <div className="affiliate-card-meta">
                  <div className="affiliate-icon-wrap"><Icon size={18} aria-hidden="true" /></div>
                  <div>
                    <span>{placement.partner}</span>
                    <strong>{placement.label}</strong>
                  </div>
                </div>
              )}
              <AffiliatePlacement placement={placement} />
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function AffiliateFooter() {
  return (
    <footer className="affiliate-footer" aria-label="Affiliate disclosure">
      <div className="affiliate-disclosure">
        <span className="affiliate-kicker">Affiliate Disclosure</span>
        <p>TTN may earn commission from qualifying bookings made through sponsored travel links on this website.</p>
      </div>
    </footer>
  );
}
