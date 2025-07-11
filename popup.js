document.getElementById("start").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "start", delay: 5000 });
});

document.getElementById("stop").addEventListener("click", () => {
  chrome.runtime.sendMessage({ action: "stop" });
});
