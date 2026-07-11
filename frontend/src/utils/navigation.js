/**
 * Reusable navigation helpers for ShopEase.
 *
 * Centralises the logic that decides whether a section-link should
 * scroll in-place (when already on the home page) or navigate to "/"
 * first and then scroll after the page mounts.
 *
 * Every component that needs to link to a home-page section should
 * import from this single source of truth.
 */

/* ------------------------------------------------------------------ */
/*  Public constants                                                   */
/* ------------------------------------------------------------------ */

/** Every section id that exists on the HomePage. */
export const HOME_SECTIONS = {
  HERO: 'hero',
  SHOP: 'products',
  CATEGORIES: 'categories',
  FEATURED: 'featured',
  DEALS: 'deals',
  NEW_ARRIVALS: 'new-arrivals',
  BRANDS: 'brands',
  ABOUT: 'about',
  CONTACT: 'contact',
};

/** All valid section ids as an array – used to validate hash targets. */
export const HOME_SECTION_IDS = Object.values(HOME_SECTIONS);

/* ------------------------------------------------------------------ */
/*  DOM helpers                                                        */
/* ------------------------------------------------------------------ */

/**
 * Scroll to a DOM element by id with smooth behaviour.
 * Falls back gracefully when the element is missing.
 */
export function scrollElementIntoView(sectionId) {
  const element = document.getElementById(sectionId);
  if (!element) return false;

  window.requestAnimationFrame(() => {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  return true;
}

/* ------------------------------------------------------------------ */
/*  React Router integration                                           */
/* ------------------------------------------------------------------ */

/**
 * Determine whether the current path is the home page.
 * Accepts both `"/"` and `"/"` with query params or hash.
 */
export function isHomePage(pathname) {
  return pathname === '/' || pathname === '';
}

/**
 * Whether a given section id is a recognised home-page section.
 */
export function isHomeSection(sectionId) {
  return HOME_SECTION_IDS.includes(sectionId);
}

/**
 * Navigate to a home-page section from anywhere in the app.
 *
 * - If already on the home page → scroll directly.
 * - If on another page → navigate to `"/"` with a hash, then let
 *   the `useScrollToSection` hook pick it up after mount.
 *
 * @param {object}  params
 * @param {string}  params.sectionId  - The DOM id to scroll to (e.g. "featured").
 * @param {function} params.navigate   - React Router `useNavigate` hook.
 * @param {string}  params.pathname   - Current `location.pathname`.
 * @param {function} [params.onBeforeNavigate] - Optional callback before navigating away.
 */
export function navigateToSection({ sectionId, navigate, pathname, onBeforeNavigate }) {
  if (!sectionId) return;

  /* Already on the home page – just scroll. */
  if (isHomePage(pathname)) {
    const scrolled = scrollElementIntoView(sectionId);
    /* If section not found (e.g. lazy content), fall back to top. */
    if (!scrolled) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return;
  }

  /* Navigating away from home – run optional cleanup (e.g. close menus). */
  if (onBeforeNavigate) {
    onBeforeNavigate();
  }

  /* Navigate to home with the section hash so useScrollToSection can scroll. */
  navigate(`/#${sectionId}`, { replace: false });
}

/* ------------------------------------------------------------------ */
/*  Navigation item definitions                                        */
/* ------------------------------------------------------------------ */

/**
 * The canonical nav items array consumed by TopNavBar (desktop + mobile).
 * Each item maps a label to a section id.
 */
export const NAV_ITEMS = [
  { label: 'Home', sectionId: HOME_SECTIONS.HERO },
  { label: 'Shop', sectionId: HOME_SECTIONS.SHOP },
  { label: 'Categories', sectionId: HOME_SECTIONS.CATEGORIES },
  { label: 'Featured', sectionId: HOME_SECTIONS.FEATURED },
  { label: 'Deals', sectionId: HOME_SECTIONS.DEALS },
  { label: 'New Arrivals', sectionId: HOME_SECTIONS.NEW_ARRIVALS },
  { label: 'Brands', sectionId: HOME_SECTIONS.BRANDS },
  { label: 'About', sectionId: HOME_SECTIONS.ABOUT },
  { label: 'Contact', sectionId: HOME_SECTIONS.CONTACT },
];
