let privacySettings = {
  enableWebRTC: true,
  enableCanvas: true,
  enableAudioContext: true,
  enableFont: true,
  enableScreenResolution: true,
};

let isEnabled = true;

document.addEventListener("DOMContentLoaded", () => {
  loadSettings();
  setupEventListeners();

  // Khôi phục chế độ tối khi popup được tải
  chrome.storage.local.get(["darkMode"], (data) => {
    if (chrome.runtime.lastError) {
      console.error("Không thể tải chế độ tối:", chrome.runtime.lastError.message);
      return;
    }
    if (data.darkMode) {
      document.body.classList.add("dark-mode");
      console.log("Chế độ tối đã được bật.");
    } else {
      console.log("Chế độ tối không được bật.");
    }
  });

  // Hiển thị fingerprint
  chrome.storage.local.get(["lastFingerprint"], (data) => {
    if (chrome.runtime.lastError) {
      console.error("Không thể tải fingerprint:", chrome.runtime.lastError.message);
      document.getElementById("fingerprint-data").textContent = "Lỗi khi tải fingerprint.";
      return;
    }
    if (data.lastFingerprint) {
      const fingerprint = data.lastFingerprint;
      document.getElementById("fingerprint-data").textContent = Object.entries(fingerprint)
        .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(", ") : val}`)
        .join("\n");
      console.log("Fingerprint đã được hiển thị:", fingerprint);
    } else {
      document.getElementById("fingerprint-data").textContent = "Không tìm thấy fingerprint.";
      console.log("Không tìm thấy fingerprint.");
    }
  });
});

function setupEventListeners() {
  // Gắn sự kiện cho các checkbox
  document.querySelectorAll("input[type='checkbox']").forEach((input) => {
    input.addEventListener("change", (e) => {
      const setting = e.target.id.replace("toggle", "enable");
      privacySettings[setting] = e.target.checked;
      saveSettings();
      updateAllTabs();
    });
  });

  // Nút bật/tắt bảo vệ
  document.getElementById("toggle-fingerprinting").addEventListener("click", () => {
    isEnabled = !isEnabled;
    saveSettings();
    updateStatus();
    showToast(isEnabled ? "Bảo vệ quyền riêng tư đã được bật." : "Bảo vệ quyền riêng tư đã được tắt.");
    updateAllTabs();
  });

  // Nút đặt lại cài đặt
  document.getElementById("reset-settings").addEventListener("click", resetSettings);

  // Nút chuyển đổi chế độ tối
  document.getElementById("toggle-dark-mode").addEventListener("click", toggleDarkMode);
}

function resetSettings() {
  privacySettings = {
    enableWebRTC: true,
    enableCanvas: true,
    enableAudioContext: true,
    enableFont: true,
    enableScreenResolution: true,
  };
  isEnabled = true;
  saveSettings();
  updateStatus();
  updateCheckboxes();
  updateAllTabs();
  showToast("Đã đặt lại cài đặt về mặc định.");
}

function toggleDarkMode() {
  const isDarkMode = document.body.classList.toggle("dark-mode");
  chrome.storage.local.set({ darkMode: isDarkMode }, () => {
    showToast(isDarkMode ? "Đã bật chế độ tối." : "Đã tắt chế độ tối.");
  });
}

function updateStatus() {
  const statusElement = document.getElementById("status");
  statusElement.innerText = `Trạng thái: ${isEnabled ? "Đã bật" : "Đã tắt"}`;
  statusElement.style.color = isEnabled ? "green" : "red";
}

function saveSettings() {
  chrome.storage.local.set({ privacySettings, isEnabled }, () => {
    if (chrome.runtime.lastError) {
      console.error("Không thể lưu cài đặt:", chrome.runtime.lastError.message);
    } else {
      console.log("Cài đặt đã được lưu:", { privacySettings, isEnabled });
    }
  });
}

function loadSettings() {
  chrome.storage.local.get(["privacySettings", "isEnabled"], (data) => {
    if (data.privacySettings) Object.assign(privacySettings, data.privacySettings);
    if (typeof data.isEnabled !== "undefined") isEnabled = data.isEnabled;
    updateStatus();
    updateCheckboxes();
  });
}

function updateCheckboxes() {
  document.getElementById("toggleWebRTC").checked = privacySettings.enableWebRTC;
  document.getElementById("toggleCanvas").checked = privacySettings.enableCanvas;
  document.getElementById("toggleAudio").checked = privacySettings.enableAudioContext;
  document.getElementById("toggleFont").checked = privacySettings.enableFont;
  document.getElementById("toggleScreen").checked = privacySettings.enableScreenResolution;
}

function updateAllTabs() {
  chrome.tabs.query({}, (tabs) => {
    if (tabs.length === 0) {
      showToast("Không tìm thấy tab đang hoạt động.");
      return;
    }
    tabs.forEach((tab) => {
      if (!tab.url || !tab.url.startsWith("http")) {
        console.warn(`Bỏ qua tab không hợp lệ: ${tab.url}`);
        return;
      }

      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["privacy-enhancement.js"],
      }, () => {
        if (chrome.runtime.lastError) {
          console.error(`Không thể inject script vào ${tab.url}:`, chrome.runtime.lastError.message);
        } else {
          console.log(`Script đã được inject vào ${tab.url}`);
        }
      });
    });
  });
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) {
    console.error("Toast element not found!");
    return;
  }
  clearTimeout(toast.timeout); // Hủy thông báo trước đó nếu có
  toast.innerText = message;
  toast.className = "show";
  toast.timeout = setTimeout(() => {
    toast.className = toast.className.replace("show", "");
  }, 3000);
}

function showError(message) {
  const errorMessage = document.getElementById("error-message");
  errorMessage.textContent = message;
  errorMessage.style.display = "block";

  // Ẩn thông báo sau 5 giây
  setTimeout(() => {
    errorMessage.style.display = "none";
  }, 5000);
}

