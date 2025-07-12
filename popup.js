const startBtn = document.getElementById("start");
const stopBtn = document.getElementById("stop");
const intervalInput = document.getElementById("interval");
const statusText = document.getElementById("status");
const countdownDisplay = document.getElementById("countdown");

function updateUI(status, delay, countdown) {
  if (status === "running") {
    statusText.textContent = `Status: Running (every ${delay}s)`;
    intervalInput.value = delay;
    countdownDisplay.textContent = `Next tab in: ${countdown}s`;
  } else {
    statusText.textContent = "Status: Stopped";
    countdownDisplay.textContent = `Next tab in: --s`;
  }
}

startBtn.addEventListener("click", () => {
  const delay = parseInt(intervalInput.value);
  if (isNaN(delay) || delay <= 0) {
    alert("Enter a valid time (seconds)");
    return;
  }

  chrome.runtime.sendMessage({ action: "start", delay: delay * 1000 }, () => {
    updateUI("running", delay, delay);
  });
});

stopBtn.addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "stop" }, () => {
    updateUI("stopped", 0, 0);
  });
});

// Load current status on popup open
function loadStatus() {
  chrome.runtime.sendMessage({ action: "getStatus" }, (res) => {
    if (!res) return;
    updateUI(res.status, res.delay, res.countdown);
  });
}

loadStatus();
setInterval(loadStatus, 1000); // Keep countdown in sync
