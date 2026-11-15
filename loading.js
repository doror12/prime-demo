(() => {
  const navigation = performance.getEntriesByType('navigation')[0];
  const query = new URLSearchParams(location.search);
  let sameSite = false;

  try {
    sameSite = new URL(document.referrer).origin === location.origin;
  } catch {
    // A direct visit has no referrer.
  }

  // Selecting a tariff navigates to the booking section with its selection.
  const internalBooking = sameSite && navigation?.type !== 'reload'
    && location.hash === '#booking' && query.has('zone') && query.has('offer');
  if (internalBooking) return;

  document.documentElement.classList.add('prime-opening');
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const scrollToTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  scrollToTop();
  window.addEventListener('pageshow', scrollToTop, { once: true });
  window.addEventListener('load', scrollToTop, { once: true });
  window.setTimeout(() => document.documentElement.classList.remove('prime-opening'), 2700);
})();
