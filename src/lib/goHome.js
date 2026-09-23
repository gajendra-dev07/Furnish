const HOME_TOP_KEY = "furnish-go-home-top";

export function markGoHomeTop() {
  try {
    sessionStorage.setItem(HOME_TOP_KEY, "1");
  } catch {
    /* ignore */
  }
}

export function consumeGoHomeTop() {
  try {
    if (sessionStorage.getItem(HOME_TOP_KEY) !== "1") return false;
    sessionStorage.removeItem(HOME_TOP_KEY);
    return true;
  } catch {
    return false;
  }
}

/** Instantly jump to the absolute top of the document (never use scrollIntoView on fixed header). */
export function scrollPageToTop() {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
}
