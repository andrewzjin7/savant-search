// LinkedIn people/developer-card detector.
// Targets entity result cards in people search results and the
// "People you may know" / recruiter-style lists.

(() => {
  const { text, observe } = window.SavantSearch;

  const CARD_SELECTORS = [
    "li.reusable-search__result-container",
    "div.entity-result",
    "li.org-people-profile-card__profile-card-spacing",
    "div.discover-entity-type-card",
  ].join(",");

  const pick = (root, selectors) => {
    for (const sel of selectors) {
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  };

  const parseCard = (root) => {
    const linkEl = pick(root, [
      "span.entity-result__title-text a",
      "a.app-aware-link[href*='/in/']",
      "a[href*='/in/']",
    ]);

    // LinkedIn duplicates the visible name inside an aria-hidden span;
    // prefer that to avoid screen-reader-only "View profile" noise.
    const nameEl =
      linkEl?.querySelector("span[aria-hidden='true']") || linkEl;

    const titleEl = pick(root, [
      "div.entity-result__primary-subtitle",
      "div.entity-result__summary",
      ".artdeco-entity-lockup__subtitle",
    ]);

    const profileUrl = linkEl?.getAttribute("href") || null;

    const card = {
      name: text(nameEl),
      title: text(titleEl),
      location: text(
        pick(root, [
          "div.entity-result__secondary-subtitle",
          ".artdeco-entity-lockup__caption",
        ])
      ),
      profileUrl: profileUrl ? profileUrl.split("?")[0] : null,
    };

    return card.name ? card : null;
  };

  const scan = () =>
    Array.from(document.querySelectorAll(CARD_SELECTORS))
      .map(parseCard)
      .filter(Boolean);

  observe("LinkedIn", scan);
})();
