// Background service worker for Savant Search.
//
// Content scripts can't POST to our backend directly: Upwork/LinkedIn page CSP
// and cross-origin rules block the request. Instead each newly-detected card is
// forwarded here via chrome.runtime.sendMessage, and this worker — which runs in
// the extension origin and has host_permissions for the backend — does the fetch.

const ENDPOINT = "https://search.globalstarxyz.com/api/cards";

// POST a single card. The payload is the parsed card fields plus the platform
// label ("Upwork" / "LinkedIn"); the backend keys off platform to pick the id
// (contractorUid for Upwork, profileUrl for LinkedIn).
const submitCard = async (platform, card) => {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ platform, ...card }),
  });

  // The API returns HTTP 200 even for logical failures, signalled by ok:false.
  const data = await res.json();
  if (!data.ok) {
    throw new Error(data.error || `submit failed (HTTP ${res.status})`);
  }
  return data;
};

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type !== "submitCard") return;

  submitCard(msg.platform, msg.card)
    .then((data) => sendResponse({ ok: true, data }))
    .catch((err) => {
      console.warn("[Savant Search] card submit failed:", err.message);
      sendResponse({ ok: false, error: err.message });
    });

  // Keep the message channel open for the async fetch above.
  return true;
});
