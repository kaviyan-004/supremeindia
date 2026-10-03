'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

const SEEN_KEY = 'si_intro_seen';
const TOTAL_MS = 1850; // CSS exit finishes at ~1.8s; unmount just after

// Short brand intro shown once per browser session, only when the session starts on the homepage.
// It is safe by design: the overlay hides itself with pure CSS, and a timer removes it from the DOM.
export default function SplashIntro() {
  const pathname = usePathname();
  const [show, setShow] = useState(pathname === '/');
  const seenRef = useRef(null); // decided once, so React strict-mode effect re-runs don't hide the intro

  useEffect(() => {
    if (seenRef.current === null) {
      let seen = false;
      try {
        seen = sessionStorage.getItem(SEEN_KEY) === '1';
        sessionStorage.setItem(SEEN_KEY, '1');
      } catch (e) {
        // storage unavailable: still only plays for this page load
      }
      seenRef.current = seen;
    }
    const seen = seenRef.current;

    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (seen || reduced) {
      setShow(false);
      return;
    }

    const timer = setTimeout(() => setShow(false), TOTAL_MS);
    const onKey = (e) => {
      if (e.key === 'Escape') setShow(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  if (!show) return null;

  return (
    <div className="si-intro" role="presentation">
      <button type="button" className="si-intro__skip" onClick={() => setShow(false)}>
        Skip
      </button>

      <div className="si-intro__stack">
        <div className="si-intro__logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-circle.png" alt="Supreme India" width="132" height="132" />
        </div>
        <div className="si-intro__word" aria-label="Supreme India">
          SUPREME <span>INDIA</span>
        </div>
        <div className="si-intro__tag">Graphic Tees &amp; Hoodies</div>
      </div>

      <div className="si-intro__bar" />
    </div>
  );
}
