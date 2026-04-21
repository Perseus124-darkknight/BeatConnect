import { useEffect } from 'react';

/**
 * useScrollReveal
 * Observes all [data-reveal] elements and adds `is-visible` when
 * they enter the viewport. Also makes already-visible elements
 * visible immediately via a short timeout fallback.
 */
const useScrollReveal = (containerRef = null, deps = []) => {
  useEffect(() => {
    const getRoot = () => containerRef?.current ?? document;

    const reveal = (el) => el.classList.add('is-visible');

    // Small delay so React finishes painting before we query the DOM
    const timer = setTimeout(() => {
      const root = getRoot();
      const targets = Array.from(root.querySelectorAll('[data-reveal]'));
      if (!targets.length) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
            } else {
              // Reset state when it leaves the viewport to allow re-triggering
              entry.target.classList.remove('is-visible');
            }
          });
        },
        {
          threshold: 0.1,      // trigger when 10% is visible
          rootMargin: '0px',
        }
      );

      targets.forEach((el) => observer.observe(el));

      // Hard fallback: anything still invisible after 1.2s becomes visible
      const fallback = setTimeout(() => {
        targets.forEach(reveal);
      }, 1200);

      return () => {
        observer.disconnect();
        clearTimeout(fallback);
      };
    }, 50); // Reduced delay since shutter is gone

    return () => clearTimeout(timer);
  }, [containerRef, ...deps]);
};

export default useScrollReveal;
