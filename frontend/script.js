document.addEventListener("DOMContentLoaded", () => {
  // ---- Element Referansları ----
  // ... diğer referanslar aynı ...
  const summarizeButton = document.getElementById("summarize-button");
  const resetButton = document.getElementById("reset-button");

  // YENİ: Oran Butonları Referansları
  const ratioControls = document.getElementById("summary-ratio-controls");
  const ratioButtons = document.querySelectorAll(".ratio-button");

  // ... diğer referanslar aynı ...
  const ttsPlayOriginalBtn = document.getElementById("tts-play-original");
  const ttsStopOriginalBtn = document.getElementById("tts-stop-original");
  // ... (kodun geri kalanı okunabilirlik için kısaltıldı, tam dosya aşağıda)

  // ---- Olay Dinleyicileri (Event Listeners) ----

  // YENİ: Oran Butonları için olay dinleyicisi
  ratioControls.addEventListener("click", (e) => {
    if (e.target.classList.contains("ratio-button")) {
      ratioButtons.forEach((btn) => btn.classList.remove("active"));
      e.target.classList.add("active");
    }
  });

  // GÜNCELLENDİ: Özetle Butonu olay dinleyicisi
  summarizeButton.addEventListener("click", async () => {
    const textToSummarize = originalPanel.innerText;
    if (!textToSummarize.trim()) {
      alert("Özetlenecek metin bulunamadı.");
      return;
    }

    // YENİ: Aktif oranı al
    const activeRatioButton = document.querySelector(".ratio-button.active");
    const ratio = parseFloat(activeRatioButton.dataset.ratio); // 0.25, 0.50, 0.75

    summaryPanel.style.display = "flex";
    summarizeButton.disabled = true;
    summaryContent.innerHTML = `<div class="loader-container"><div class="loader"></div><p class="loading-text">Özetleniyor...</p></div>`;
    try {
      const response = await fetch("http://127.0.0.1:8000/summarize-text/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // YENİ: Oranı isteğin body'sine ekle
        body: JSON.stringify({ text: textToSummarize, ratio: ratio }),
      });
      // ... (kodun geri kalanı aynı) ...
    } catch (error) {
      summaryContent.innerHTML = `<p style="color: red; text-align: center;">Hata: ${error.message}</p>`;
    } finally {
      summarizeButton.disabled = false;
    }
  });

  // ... (diğer tüm fonksiyonlar ve olay dinleyicileri burada) ...
  // Aşağıda tam ve güncel script.js dosyası bulunmaktadır.
});

// YUKARIDAKİ KISALTILMIŞ ÖRNEK YERİNE AŞAĞIDAKİ TAM KODU KULLANIN
// ---- TAM VE GÜNCEL script.js ----
document.addEventListener("DOMContentLoaded", () => {
  const originalPanel = document.getElementById("original-text-panel");
  const summaryPanel = document.getElementById("summary-panel");
  const originalTextContent = document.getElementById("original-text-content");
  const summaryContent = document.getElementById("summary-content");
  const fileInput = document.getElementById("file-input");
  const uploadPrompt = document.getElementById("upload-prompt");
  const controls = {
    fontFamily: document.getElementById("font-family"),
    fontSize: document.getElementById("font-size"),
    lineHeight: document.getElementById("line-height"),
    textColor: document.getElementById("text-color"),
    bgColor: document.getElementById("bg-color"),
  };
  const valueDisplays = {
    fontSize: document.getElementById("font-size-value"),
    lineHeight: document.getElementById("line-height-value"),
  };
  const summarizeButton = document.getElementById("summarize-button");
  const resetButton = document.getElementById("reset-button");
  const ttsPlayOriginalBtn = document.getElementById("tts-play-original");
  const ttsStopOriginalBtn = document.getElementById("tts-stop-original");
  const ttsPlaySummaryBtn = document.getElementById("tts-play-summary");
  const ttsStopSummaryBtn = document.getElementById("tts-stop-summary");
  const ratioControls = document.getElementById("summary-ratio-controls");
  const ratioButtons = document.querySelectorAll(".ratio-button");

  const synth = window.speechSynthesis;
  if (!synth) {
    console.log("Tarayıcınız sesli okuma özelliğini desteklemiyor.");
    document
      .querySelectorAll(".tts-controls")
      .forEach((el) => (el.style.display = "none"));
  }
  let currentUtterance = null;
  function handleTTS(textElement, playBtn) {
    if (!synth) return;
    if (synth.speaking) {
      if (synth.paused) {
        synth.resume();
        playBtn.textContent = "⏸️";
      } else {
        synth.pause();
        playBtn.textContent = "▶️";
      }
    } else {
      const textToSpeak = textElement.innerText;
      if (!textToSpeak.trim()) return;
      synth.cancel();
      currentUtterance = new SpeechSynthesisUtterance(textToSpeak);
      currentUtterance.lang = "tr-TR";
      currentUtterance.onend = () => {
        playBtn.textContent = "▶️";
        currentUtterance = null;
      };
      synth.speak(currentUtterance);
      playBtn.textContent = "⏸️";
    }
  }
  function stopTTS(playBtn) {
    if (synth) {
      synth.cancel();
      playBtn.textContent = "▶️";
    }
  }
  function applyStyles() {
    const styles = {
      fontFamily: controls.fontFamily.value,
      fontSize: `${controls.fontSize.value}px`,
      lineHeight: controls.lineHeight.value,
      color: controls.textColor.value,
      backgroundColor: controls.bgColor.value,
    };
    Object.assign(originalPanel.style, styles);
    Object.assign(summaryPanel.style, styles);
    valueDisplays.fontSize.textContent = controls.fontSize.value;
    valueDisplays.lineHeight.textContent = controls.lineHeight.value;
  }
  function applyBionicReading(text) {
    return text
      .split(/(\s+)/)
      .map((word) => {
        if (word.trim().length === 0) return word;
        const boldCount = Math.max(1, Math.ceil(word.length * 0.4));
        const boldPart = word.substring(0, boldCount);
        const normalPart = word.substring(boldCount);
        return `<strong>${boldPart}</strong>${normalPart}`;
      })
      .join("");
  }
  function resetToInitialState() {
    stopTTS(ttsPlayOriginalBtn);
    stopTTS(ttsPlaySummaryBtn);
    uploadPrompt.style.display = "flex";
    originalTextContent.innerHTML = "";
    summaryPanel.style.display = "none";
    summaryContent.innerHTML = "";
    fileInput.value = "";
    summarizeButton.disabled = true;
  }

  ratioControls.addEventListener("click", (e) => {
    if (e.target.classList.contains("ratio-button")) {
      ratioButtons.forEach((btn) => btn.classList.remove("active"));
      e.target.classList.add("active");
    }
  });
  ttsPlayOriginalBtn.addEventListener("click", () =>
    handleTTS(originalTextContent, ttsPlayOriginalBtn)
  );
  ttsStopOriginalBtn.addEventListener("click", () =>
    stopTTS(ttsPlayOriginalBtn)
  );
  ttsPlaySummaryBtn.addEventListener("click", () =>
    handleTTS(summaryContent, ttsPlaySummaryBtn)
  );
  ttsStopSummaryBtn.addEventListener("click", () => stopTTS(ttsPlaySummaryBtn));

  fileInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    resetToInitialState();
    uploadPrompt.style.display = "none";
    originalTextContent.innerHTML = '<div class="loader"></div>';
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await fetch("http://127.0.0.1:8000/extract-text/", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Dosya okunamadı.");
      }
      const result = await response.json();
      originalTextContent.innerHTML = result.text
        .split("\n")
        .map((p) => `<p>${p}</p>`)
        .join("");
      summarizeButton.disabled = false;
    } catch (error) {
      originalTextContent.innerHTML = `<p style="color: red; text-align: center;">Hata: ${error.message}</p>`;
    }
  });

  summarizeButton.addEventListener("click", async () => {
    const textToSummarize = originalPanel.innerText;
    if (!textToSummarize.trim()) {
      alert("Özetlenecek metin bulunamadı.");
      return;
    }
    const activeRatioButton = document.querySelector(".ratio-button.active");
    const ratio = parseFloat(activeRatioButton.dataset.ratio);
    summaryPanel.style.display = "flex";
    summarizeButton.disabled = true;
    summaryContent.innerHTML = `<div class="loader-container"><div class="loader"></div><p class="loading-text">Özetleniyor...</p></div>`;
    try {
      const response = await fetch("http://127.0.0.1:8000/summarize-text/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSummarize, ratio: ratio }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Özetleme hatası.");
      }
      const result = await response.json();
      const rawHtml = marked.parse(result.summary);
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = rawHtml;
      tempDiv.querySelectorAll("p, li").forEach((element) => {
        const textNodes = Array.from(element.childNodes).filter(
          (node) => node.nodeType === Node.TEXT_NODE
        );
        textNodes.forEach((node) => {
          const bionicText = applyBionicReading(node.textContent);
          const span = document.createElement("span");
          span.innerHTML = bionicText;
          node.replaceWith(span);
        });
      });
      summaryContent.innerHTML = tempDiv.innerHTML;
    } catch (error) {
      summaryContent.innerHTML = `<p style="color: red; text-align: center;">Hata: ${error.message}</p>`;
    } finally {
      summarizeButton.disabled = false;
    }
  });

  resetButton.addEventListener("click", resetToInitialState);
  Object.values(controls).forEach((control) => {
    control.addEventListener("input", applyStyles);
  });
  applyStyles();
  summarizeButton.disabled = true;
});
