let windowIntervals = {};

function switchTabsForWindow(windowId) {
  chrome.tabs.query({ windowId: windowId }, (tabs) => {
    if (!tabs || tabs.length === 0) return;

    let activeTabIndex = tabs.findIndex(tab => tab.active);
    let nextIndex = (activeTabIndex + 1) % tabs.length;

    chrome.tabs.update(tabs[nextIndex].id, { active: true });
  });
}

function startRevolverForWindow(windowId, delay) {
  if (windowIntervals[windowId]) clearInterval(windowIntervals[windowId]);

  windowIntervals[windowId] = setInterval(() => {
    switchTabsForWindow(windowId);
  }, delay);

  chrome.storage.local.get(["windowSettings"], (data) => {
    let settings = data.windowSettings || {};
    settings[windowId] = { running: true, delay: delay };
    chrome.storage.local.set({ windowSettings: settings });
    updateBadgeBasedOnWindows();
  });
  
}

function stopRevolverForWindow(windowId) {
  if (windowIntervals[windowId]) clearInterval(windowIntervals[windowId]);
  delete windowIntervals[windowId];

  chrome.storage.local.get(["windowSettings"], (data) => {
    let settings = data.windowSettings || {};
    settings[windowId] = { running: false };
    chrome.storage.local.set({ windowSettings: settings });
    updateBadgeBasedOnWindows();
  });

}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startForWindow") {
    startRevolverForWindow(message.windowId, message.delay);
    sendResponse({ status: "started" });
  }

  if (message.action === "stopForWindow") {
    stopRevolverForWindow(message.windowId);
    sendResponse({ status: "stopped" });
  }

  if (message.action === "getWindowStatus") {
    chrome.storage.local.get(["windowSettings"], (data) => {
      let settings = data.windowSettings || {};
      let windowSetting = settings[message.windowId] || { running: false, delay: 5000 };
      sendResponse(windowSetting);
    });
    return true;
  }
});
function updateBadgeBasedOnWindows() {
  chrome.storage.local.get(["windowSettings"], (data) => {
    const settings = data.windowSettings || {};
    const activeWindows = Object.values(settings).filter(s => s.running).length;

    if (activeWindows === 0) {
      chrome.action.setBadgeText({ text: "0" });
      chrome.action.setBadgeBackgroundColor({ color: "red" });
    } else if (activeWindows === 1) {
      chrome.action.setBadgeText({ text: "1" });
      chrome.action.setBadgeBackgroundColor({ color: "green" });
    } else {
      chrome.action.setBadgeText({ text: activeWindows.toString() });
      chrome.action.setBadgeBackgroundColor({ color: "orange" });
    }
  });
}
