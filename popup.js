// popup.js - popup-side logic

function showStatus(s) {
  const el = document.getElementById('status');
  if (el) el.textContent = s;
}

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

document.getElementById('scanBtn').addEventListener('click', async () => {
  showStatus('Preparing scan…');
  const tab = await getActiveTab();
  if (!tab || !tab.id) {
    showStatus('No active tab.');
    return;
  }

  // Ask the content script to run the scan
  chrome.tabs.sendMessage(tab.id, { type: 'RUN_SCAN' }, (resp) => {
    if (chrome.runtime.lastError) {
      showStatus('Scan failed: ' + chrome.runtime.lastError.message);
      return;
    }
    if (resp && resp.ok && resp.results) {
      const { url, title, snippet } = resp.results;
      showStatus(`Scanned: ${title || url}\n${snippet || '(no text found)'}`);
    } else if (resp && resp.reason === 'SENSITIVE_SITE') {
      showStatus('Scan blocked (sensitive site)');
    } else {
      showStatus('Scan failed: no results');
    }
  });
});
