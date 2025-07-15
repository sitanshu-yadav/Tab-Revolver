const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const intervalInput = document.getElementById("interval");
const statusText = document.getElementById("status");

let currentWindowId = null;

function updateUI(status, delay) {
  if (status === "running") {
    statusText.textContent = `Status: Running (every ${delay / 1000}s)`;
    intervalInput.value = delay / 1000;
  } else {
    statusText.textContent = "Status: Stopped";
  }
}

function loadWindowStatus() {
  chrome.windows.getCurrent({}, (window) => {
    currentWindowId = window.id;

    chrome.runtime.sendMessage(
      { action: "getWindowStatus", windowId: currentWindowId },
      (res) => {
        updateUI(res.running ? "running" : "stopped", res.delay || 5000);
      }
    );
  });
}

startBtn.addEventListener("click", () => {
  const delay = parseInt(intervalInput.value);
  if (isNaN(delay) || delay <= 0) {
    alert("Enter a valid delay in seconds");
    return;
  }

  chrome.runtime.sendMessage({
    action: "startForWindow",
    windowId: currentWindowId,
    delay: delay * 1000
  }, () => {
    updateUI("running", delay * 1000);
  });
});

stopBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({
    action: "stopForWindow",
    windowId: currentWindowId
  }, () => {
    updateUI("stopped", 0);
  });
});

loadWindowStatus();
