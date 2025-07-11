let interval = null;
let currentIndex = 0;

function switchTabs() {
  chrome.tabs.query({currentWindow: true}, function(tabs) {
    if (tabs.length === 0) return;

    currentIndex = (currentIndex + 1) % tabs.length;
    chrome.tabs.update(tabs[currentIndex].id, {active: true});
  });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "start") {
    if (!interval) {
      interval = setInterval(switchTabs, message.delay || 5000);
    }
  } else if (message.action === "stop") {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
  }
});
