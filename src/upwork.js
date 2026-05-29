// Upwork freelancer-card detector.
// Selectors are based on the real talent-search markup: each freelancer is an
// <article data-test="FreelancerTile">. We keep a few fallbacks for older/variant
// layouts, but the confirmed ones come first.

(() => {
  const { text, observe } = window.SavantSearch;

  const CARD_SELECTORS = [
    'article[data-test="FreelancerTile"]',
    '[data-test="freelancer-tile"]',
    'div[data-ev-label="search_results_impression"]',
  ].join(",");

  const pick = (root, selectors) => {
    for (const sel of selectors) {
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  };

  const parseCard = (root) => {
    const nameEl = pick(root, [
      "h5.name a",
      '[data-test="freelancer-tile-name"] a',
      'a[href*="/freelancers/"][data-test="UpLink"]',
      'a[href*="/freelancers/"]',
    ]);

    const titleEl = pick(root, [
      "h4.title a",
      "h4.title",
      '[data-test="freelancer-tile-title"]',
    ]);

    // Skills live in their own section; the "+N" overflow chip is a <div>, the
    // real skills are <button class="air3-token"> — so we target buttons only.
    const skillsRoot =
      root.querySelector('[data-test="FreelancerTileSkills"]') || root;
    const skills = Array.from(skillsRoot.querySelectorAll("button.air3-token"))
      .map((el) => text(el))
      .filter(Boolean)
      .filter((s) => !/^\+\d+$/.test(s));

    // AI insight bullets, when Upwork renders them.
    const insights = Array.from(
      root.querySelectorAll(
        '[data-test="FreelancerAIInsightsList"] [data-test="ai-insight-row"]'
      )
    )
      .map((el) => text(el))
      .filter(Boolean);

    const href = nameEl?.getAttribute("href") || null;

    const card = {
      contractorUid:
        root.getAttribute("data-ev-contractor_uid") ||
        root.getAttribute("data-test-key") ||
        null,
      name: text(nameEl),
      title: text(titleEl),
      // The visible rate is "$30" + "/hr" in two spans inside the rate cell.
      rate: text(
        pick(root, [
          '[data-test~="FreelancerTileRate"]',
          '[data-test="rate-per-hour"]',
        ])
      ),
      // Narrow to the i18n span so we don't swallow the hidden tooltip copy.
      jobSuccess: text(
        pick(root, [
          '[data-test="freelancer-tile-job-success"] [data-test="UpI18n"]',
          '[data-test="freelancer-tile-job-success"]',
        ])
      ),
      // The visible "$9K+ earned" sits in a <strong>; the popover text is hidden.
      earnings: text(
        pick(root, ['[data-test="freelancer-tile-earnings"] strong'])
      ),
      location: text(pick(root, [".location", '[data-test="location"]'])),
      skills,
      insights,
      profileUrl: href ? new URL(href, location.origin).href : null,
    };

    return card.name ? card : null;
  };

  const scan = () =>
    Array.from(document.querySelectorAll(CARD_SELECTORS))
      .map(parseCard)
      .filter(Boolean);

  observe("Upwork", scan);
})();
