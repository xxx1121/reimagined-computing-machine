// content.js (as a module)
import { shouldInjectScript } from "./url-filter.js";

if (shouldInjectScript(window.location.href)) {
  // Inject privacy-enhancement.js nếu cần
  const script = document.createElement("script");
  script.src = chrome.runtime.getURL("privacy-enhancement.js");
  script.type = "text/javascript";
  script.onload = () => script.remove();
  document.documentElement.appendChild(script);

  console.log("Privacy enhancements injected into the page.");

  // Optional: block ads
  window.addEventListener("load", () => {
    document.querySelectorAll(".ad-banner, .ad-popup").forEach(ad => ad.remove());
    console.log("Ads removed.");
  });
} else {
  console.log("Trang hiện tại được miễn áp dụng bảo vệ.");
}
