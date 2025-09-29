// scan.js - content script (auto-injected)
const BLOCKLIST = [
  /(^|\.)chase\.com/i,
  /(^|\.)wellsfargo\.com/i,
  /(^|\.)bankofamerica\.com/i,
  /paypal\.com/i,
  /stripe\.com/i,
  /(^|\.)irs\.gov/i,
  /webmd\.com/i,
  /healthline\.com/i,
  /medlineplus\.gov/i,
  /mychart\./i,
  /^file:\/\//i
];

function isSensitiveUrl(url) {
  try {
    const u = new URL(url);
    return BLOCKLIST.some(re => re.test(u.hostname) || re.test(u.href));
  } catch (e) {
    return true; // be conservative if parsing fails
  }
}

function scanPage() {
  const title = document.title || "";
  const bodyText = document.body ? (document.body.innerText || "") : "";
  const snippet = bodyText.replace(/\s+/g, " ").trim().slice(0, 400);
  const results = { url: location.href, title, snippet };

  console.log('[Poliwatch] Scan result preview:', results);
  return results;
}

// Listen for RUN_SCAN messages from the popup
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'RUN_SCAN') {
    if (isSensitiveUrl(location.href)) {
      sendResponse({ ok: false, reason: "SENSITIVE_SITE" });
      return true;
    }

    const results = scanPage();
    // Send results back directly in the response
    sendResponse({ ok: true, results });
    return true;
  }
});
