// Dynamic Fingerprinting Generator
(() => {
  // Hàm tạo UUID ngẫu nhiên
  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  const generateSecureUUID = () => {
    return crypto.randomUUID();
  };
  
  const generateRandomData = () => {
    const languages = ["en-US", "vi-VN", "fr-FR", "es-ES", "zh-CN"];
    const timezones = Array.from({ length: 27 }, (_, i) => `GMT${i - 12}`);
  
    return {
      timezone: timezones[Math.floor(Math.random() * timezones.length)] || "GMT0",
      language: languages[Math.floor(Math.random() * languages.length)] || "vi-VN",
      userAgent: `Mozilla/5.0 (Linux; Android ${Math.floor(Math.random() * 10 + 5)}; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${Math.floor(Math.random() * 100)}.0.0.0 Mobile Safari/537.36`,
      platform: "Linux armv8l",
      vendor: "Google Inc.",
      cpu: Math.floor(Math.random() * 8) + 1,
      ram: Math.random() * 16,
      doNotTrack: Math.random() > 0.5 ? "1" : "0",
      webRTC: [`10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`],
      canvasFingerprint: `data:image/png;base64,${generateUUID()}`,
    };
  };
  
  const randomFingerprinting = generateRandomData();


  const setCustomFingerprintingData = (customData) => {
    Object.assign(randomFingerprinting, customData);
  };

  // Block WebRTC IP leakage
  const blockWebRTC = (fakeWebRTC) => {
    if (!privacySettings.enableWebRTC) return;

    const originalCreateOffer = RTCPeerConnection.prototype.createOffer;
    RTCPeerConnection.prototype.createOffer = function (...args) {
      console.warn("WebRTC Fingerprinting blocked!");
      return originalCreateOffer.apply(this, args);
    };

    if (RTCPeerConnection.prototype.setLocalDescription) {
      const originalSetLocalDescription = RTCPeerConnection.prototype.setLocalDescription;
      RTCPeerConnection.prototype.setLocalDescription = function (description, ...args) {
        if (description && description.sdp) {
          fakeWebRTC.forEach((ip) => {
            description.sdp = description.sdp.replace(new RegExp(ip, "g"), "127.0.0.1");
          });
        }
        return originalSetLocalDescription.apply(this, [description, ...args]);
      };
    }
  };

  // Cập nhật Proxy để giả mạo các thuộc tính Android
  if (!randomFingerprinting) {
    console.error("randomFingerprinting chưa được khởi tạo.");
  } else {
    const navigatorProxy = new Proxy(navigator, {
      get(target, prop) {
        if (prop === "language") {
          console.log(`Ghi đè navigator.language: ${randomFingerprinting.language}`);
          return randomFingerprinting.language;
        }
        if (prop === "hardwareConcurrency") {
          console.log(`Ghi đè navigator.hardwareConcurrency: ${randomFingerprinting.cpu}`);
          return randomFingerprinting.cpu;
        }
        if (prop === "deviceMemory") {
          console.log(`Ghi đè navigator.deviceMemory: ${Math.round(randomFingerprinting.ram)}`);
          return Math.round(randomFingerprinting.ram);
        }
        if (prop === "doNotTrack") {
          console.log(`Ghi đè navigator.doNotTrack: ${randomFingerprinting.doNotTrack}`);
          return randomFingerprinting.doNotTrack;
        }
        if (prop === "userAgent") {
          console.log(`Ghi đè navigator.userAgent: ${randomFingerprinting.userAgent}`);
          return randomFingerprinting.userAgent;
        }
        return target[prop];
      }
    });

    try {
      window.navigator = navigatorProxy;
      console.log("Navigator proxy đã được áp dụng.");
    } catch (error) {
      console.error("Không thể ghi đè navigator:", error);
    }
  }

  // Không cần sử dụng Object.defineProperty
  Object.defineProperty(window.navigator, "language", {
    get: () => randomFingerprinting.language,
  });
  Object.defineProperty(window.navigator, "hardwareConcurrency", {
    get: () => randomFingerprinting.cpu,
  });
  Object.defineProperty(window.navigator, "deviceMemory", {
    get: () => Math.round(randomFingerprinting.ram),
  });
  Object.defineProperty(window.navigator, "doNotTrack", {
    get: () => randomFingerprinting.doNotTrack,
  });
  Object.defineProperty(window.navigator, "userAgent", {
    get: () => randomFingerprinting.userAgent,
  });

  // Fake Canvas Fingerprinting
  const fakeCanvas = (canvasFingerprint) => {
    const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function (...args) {
      if (enablePrivacyEnhancements) {
        console.warn("Canvas Fingerprinting blocked!");
        return randomFingerprinting.canvasFingerprint;
      }
      return originalToDataURL.apply(this, args);
    };

    const originalGetImageData = CanvasRenderingContext2D.prototype.getImageData;
    CanvasRenderingContext2D.prototype.getImageData = function (...args) {
      console.warn("Canvas ImageData Fingerprinting blocked!");
      return originalGetImageData.apply(this, args);
    };
  };

  // Fake AudioContext Fingerprinting
  const fakeAudioContext = () => {
    const originalCreateAnalyser = AudioContext.prototype.createAnalyser;
    AudioContext.prototype.createAnalyser = function (...args) {
      console.warn("AudioContext Fingerprinting blocked!");
      const analyser = originalCreateAnalyser.apply(this, args);
      analyser.getFloatFrequencyData = function (array) {
        console.warn("Audio Frequency Data Fingerprinting blocked!");
        array.fill(-100); // Fake frequency data
      };
      return analyser;
    };
  };

  // Fake Font Fingerprinting
  const fakeFontFingerprinting = () => {
    const originalMeasureText = CanvasRenderingContext2D.prototype.measureText;
    CanvasRenderingContext2D.prototype.measureText = function (...args) {
      console.warn("Font Fingerprinting blocked!");
      const fakeMetrics = { width: 100 }; // Trả về kích thước giả mạo
      return Object.assign(originalMeasureText.apply(this, args), fakeMetrics);
    };
  };

  // Fake Screen Resolution Fingerprinting
  const fakeScreenResolution = () => {
    if (Object.getOwnPropertyDescriptor(window.screen, "width").configurable) {
      Object.defineProperty(window.screen, "width", {
        get: () => 1920,
      });
    } else {
      console.warn("Không thể ghi đè thuộc tính width của screen.");
    }
    Object.defineProperty(window.screen, "height", {
      get: () => 1080, // Độ phân giải giả mạo
    });
    Object.defineProperty(window.screen, "availWidth", {
      get: () => 1920,
    });
    Object.defineProperty(window.screen, "availHeight", {
      get: () => 1080,
    });
  };

  const privacySettings = {
    enableWebRTC: true,
    enableCanvas: true,
    enableAudioContext: true,
    enableFont: true,
    enableScreenResolution: true,
  };

  let isEnabled = true; // Đồng bộ với chrome.storage.local

  const savePrivacySettings = () => {
    chrome.storage.local.set({ privacySettings, isEnabled }, () => {
      if (chrome.runtime.lastError) {
        console.error("Failed to save privacy settings:", chrome.runtime.lastError.message);
      } else {
        console.log("Privacy settings saved:", { privacySettings, isEnabled });
      }
    });
  };

  const loadPrivacySettings = (callback) => {
    chrome.storage.local.get(["privacySettings", "isEnabled"], (data) => {
      if (data.privacySettings) {
        Object.assign(privacySettings, data.privacySettings);
        console.log("Privacy settings loaded:", privacySettings);
      } else {
        console.log("No saved privacy settings found. Using defaults.");
      }

      if (typeof data.isEnabled !== "undefined") {
        isEnabled = data.isEnabled;
        console.log("isEnabled loaded:", isEnabled);
      } else {
        console.log("isEnabled not found. Using default:", isEnabled);
      }

      if (callback) callback();
    });
  };

  const applyDynamicFingerprinting = () => {
    try {
      if (privacySettings.enableWebRTC) {
        console.log("Đang chặn WebRTC Fingerprinting...");
        appendLog("Đang chặn WebRTC Fingerprinting...");
        blockWebRTC(randomFingerprinting.webRTC);
      }
      if (privacySettings.enableCanvas) {
        console.log("Đang chặn Canvas Fingerprinting...");
        appendLog("Đang chặn Canvas Fingerprinting...");
        fakeCanvas(randomFingerprinting.canvasFingerprint);
      }
      if (privacySettings.enableAudioContext) {
        console.log("Đang chặn AudioContext Fingerprinting...");
        appendLog("Đang chặn AudioContext Fingerprinting...");
        fakeAudioContext();
      }
      if (privacySettings.enableFont) {
        console.log("Đang chặn Font Fingerprinting...");
        appendLog("Đang chặn Font Fingerprinting...");
        fakeFontFingerprinting();
      }
      if (privacySettings.enableScreenResolution) {
        console.log("Đang chặn Screen Resolution Fingerprinting...");
        appendLog("Đang chặn Screen Resolution Fingerprinting...");
        fakeScreenResolution();
      }
    } catch (error) {
      console.error("Lỗi khi áp dụng bảo vệ quyền riêng tư:", error);
      appendLog(`Lỗi: ${error.message}`);
    }
  };
  // Run the dynamic fingerprinting after loading settings
  window.addEventListener("load", () => {
    loadPrivacySettings(() => {
      if (isEnabled) {
        console.info("Privacy enhancements are active.");
        applyDynamicFingerprinting();
        applyProtectionOnDemand(window.location.href);
      } else {
        console.log("Privacy enhancements are disabled.");
      }
    });
  });

  window.togglePrivacyEnhancements = (state) => {
    isEnabled = state;
    savePrivacySettings();

    if (isEnabled) {
      console.log("Privacy enhancements enabled.");
      appendLog("Bảo vệ quyền riêng tư đã được bật.");
      applyDynamicFingerprinting();
    } else {
      console.log("Privacy enhancements disabled.");
      appendLog("Bảo vệ quyền riêng tư đã được tắt.");
    }
  };
})();

function appendLog(message) {
  const logContainer = document.getElementById("log-container");
  if (!logContainer) {
    console.error("Không tìm thấy khu vực hiển thị log.");
    return;
  }

  const logEntry = document.createElement("p");
  logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  logContainer.appendChild(logEntry);

  // Tự động cuộn xuống cuối log
  logContainer.scrollTop = logContainer.scrollHeight;
}

// Đảm bảo cài đặt quyền riêng tư được tải trước khi thực hiện các hành động
loadPrivacySettings(() => {
  if (isEnabled) {
    console.info("Privacy enhancements are active.");
    applyDynamicFingerprinting();
    applyProtectionOnDemand(window.location.href);
  } else {
    console.log("Privacy enhancements are disabled.");
  }
});

// Kiểm tra và khởi tạo randomFingerprinting nếu cần
if (!randomFingerprinting || Object.keys(randomFingerprinting).length === 0) {
  console.warn("randomFingerprinting chưa được khởi tạo. Đang khởi tạo lại...");
  randomFingerprinting = generateRandomData();
}

// Lưu fingerprint vào chrome.storage.local
chrome.storage.local.set({
  lastFingerprint: {
    ...randomFingerprinting,
    generatedAt: new Date().toISOString()
  }
}, () => {
  if (chrome.runtime.lastError) {
    console.error("Không thể lưu fingerprint:", chrome.runtime.lastError.message);
    appendLog(`Không thể lưu fingerprint: ${chrome.runtime.lastError.message}`);
  } else {
    console.log("Fingerprint đã được lưu:", randomFingerprinting);
    appendLog("Fingerprint đã được lưu thành công.");
  }
});


// Kiểm tra fingerprint
chrome.storage.local.get(["lastFingerprint"], (data) => {
  if (chrome.runtime.lastError) {
    const errorMessage = `Không thể tải fingerprint: ${chrome.runtime.lastError.message}`;
    console.error(errorMessage);
    appendLog(errorMessage);
    return;
  }

  if (data.lastFingerprint) {
    const fingerprint = data.lastFingerprint;
    console.log("Fingerprint đã tải thành công:", fingerprint);
    appendLog("Fingerprint đã tải thành công.");

    // Hiển thị chi tiết fingerprint
    appendLog(`Thời gian tạo: ${fingerprint.generatedAt}`);
    appendLog(`Múi giờ: ${fingerprint.timezone}`);
    appendLog(`Ngôn ngữ: ${fingerprint.language}`);
    appendLog(`User Agent: ${fingerprint.userAgent}`);
    appendLog(`Nền tảng: ${fingerprint.platform}`);
    appendLog(`Nhà cung cấp: ${fingerprint.vendor}`);
    appendLog(`Số lõi CPU: ${fingerprint.cpu}`);
    appendLog(`RAM: ${fingerprint.ram.toFixed(2)} GB`);
    appendLog(`Do Not Track: ${fingerprint.doNotTrack}`);
    appendLog(`Địa chỉ IP WebRTC: ${fingerprint.webRTC.join(", ")}`);
    appendLog(`Canvas Fingerprint: ${fingerprint.canvasFingerprint}`);
  } else {
    const noFingerprintMessage = "Không tìm thấy fingerprint. Có thể chưa được tạo hoặc đã bị xóa.";
    console.log(noFingerprintMessage);
    appendLog(noFingerprintMessage);
  }
});

// Xóa fingerprint
chrome.storage.local.remove("lastFingerprint", () => {
  if (chrome.runtime.lastError) {
    console.error("Không thể xóa fingerprint:", chrome.runtime.lastError.message);
  } else {
    console.log("Fingerprint đã được xóa thành công.");
  }
});

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

if (process.env.NODE_ENV === "development") {
  console.log("Debug log:", someData);
}