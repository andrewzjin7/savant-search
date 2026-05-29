// Shared helpers for the Savant Search developer-card detector.
// Loaded before the site-specific scripts on both Upwork and LinkedIn.

(() => {
  const NS = (window.SavantSearch = window.SavantSearch || {});

  // Tracks cards we've already logged so DOM mutations / infinite scroll
  // don't produce duplicate console output. Keyed by a stable card signature.
  const seen = new Set();

  const log = (platform, card) => {
    console.log(
      `%c[Savant Search] ${platform} developer card`,
      "color:#14a800;font-weight:bold",
      card
    );
  };

  // Trim, collapse whitespace, and return null for empty strings.
  const text = (el) => {
    if (!el) return null;
    const t = el.textContent.replace(/\s+/g, " ").trim();
    return t || null;
  };

  // Build a dedup key from the card's most identifying fields.
  const signature = (platform, card) =>
    [platform, card.profileUrl, card.name, card.title].join("|");

  // Run `scan` now and again whenever the page mutates (debounced).
  // `scan` should return an array of {key?, ...cardData}; we handle dedup + logging.
  const observe = (platform, scan) => {
    let pending = false;

    const run = () => {
      pending = false;
      let cards;
      try {
        cards = scan() || [];
      } catch (err) {
        console.warn("[Savant Search] scan failed:", err);
        return;
      }
      for (const card of cards) {
        const key = signature(platform, card);
        if (seen.has(key)) continue;
        seen.add(key);
        log(platform, card);
      }
    };

    const schedule = () => {
      if (pending) return;
      pending = true;
      // Coalesce bursts of mutations into a single scan.
      setTimeout(run, 400);
    };

    run();
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    console.log(`[Savant Search] watching for ${platform} developer cards…`);
  };

  Object.assign(NS, { text, observe });
})();
