let interval = null;
let currentIndex = 0;
let countdown = 0;

function switchTabs() {
  chrome.tabs.query({ currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return;
    currentIndex = (currentIndex + 1) % tabs.length;
    chrome.tabs.update(tabs[currentIndex].id, { active: true });
  });
}

function updateBadge(running) {
  chrome.action.setBadgeBackgroundColor({ color: running ? "green" : "red" });
  chrome.action.setBadgeText({ text: running ? "●" : "·" });  // smaller dot instead of emoji
}


function startRevolver(delay) {
  if (interval) clearInterval(interval);

  interval = setInterval(() => {
    switchTabs();
    countdown = delay / 1000;
  }, delay);

  countdown = delay / 1000;

  chrome.storage.local.set({
    revolverRunning: true,
    revolverDelay: delay
  });

  updateBadge(true);

  // Start countdown tick
  startCountdown();
}

function stopRevolver() {
  if (interval) clearInterval(interval);
  interval = null;
  countdown = 0;
  chrome.storage.local.set({ revolverRunning: false });
  updateBadge(false);
}

function startCountdown() {
  setInterval(() => {
    if (countdown > 0) {
      countdown--;
      chrome.storage.local.set({ countdown });
    }
  }, 1000);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "start") {
    startRevolver(message.delay);
    sendResponse({ status: "started" });
  }

  if (message.action === "stop") {
    stopRevolver();
    sendResponse({ status: "stopped" });
  }

  if (message.action === "getStatus") {
    chrome.storage.local.get(["revolverRunning", "revolverDelay", "countdown"], (data) => {
      sendResponse({
        status: data.revolverRunning ? "running" : "stopped",
        delay: (data.revolverDelay || 5000) / 1000,
        countdown: data.countdown || 0
      });
    });
    return true; // Async response
  }
});

// Auto-start if previously running
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(["revolverRunning", "revolverDelay"], (data) => {
    if (data.revolverRunning && data.revolverDelay) {
      startRevolver(data.revolverDelay);
    }
  });
});
