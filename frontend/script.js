document.addEventListener("DOMContentLoaded", () => {
  // ---- Element Referansları ----
  const mainContent = document.getElementById("main-content");
  const originalPanel = document.getElementById("original-text-panel");
  const summaryPanel = document.getElementById("summary-panel");
  const originalTextContent = document.getElementById("original-text-content");
  const summaryContent = document.getElementById("summary-content");
  const summaryLoader = document.getElementById("summary-loader");

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

  // ---- Fonksiyonlar ----

  // Ayarları her iki panele de uygula
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

  // Biyonik Okuma Fonksiyonu
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

  // Arayüzü başlangıç durumuna sıfırla
  function resetToInitialState() {
    uploadPrompt.style.display = "flex";
    originalTextContent.innerHTML = "";
    summaryPanel.style.display = "none";
    summaryContent.innerHTML = "";
    fileInput.value = "";
    summarizeButton.disabled = true;
  }

  // ---- Olay Dinleyicileri (Event Listeners) ----

  // Dosya seçildiğinde
  fileInput.addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    resetToInitialState();
    uploadPrompt.style.display = "none";
    originalTextContent.innerHTML = '<div class="loader"></div>'; // Yükleniyor animasyonu

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

  // Özetle Butonu
  summarizeButton.addEventListener("click", async () => {
    const textToSummarize = originalPanel.innerText;
    if (!textToSummarize.trim()) {
      alert("Özetlenecek metin bulunamadı. Lütfen bir dosya yükleyin.");
      return;
    }

    // Arayüzü güncelle: Özet panelini göster ve "Özetleniyor..." durumunu ayarla
    summaryPanel.style.display = "flex";
    summarizeButton.disabled = true;

    // YENİ: "Özetleniyor..." metnini ve animasyonunu doğrudan HTML olarak ekle
    summaryContent.innerHTML = `
        <div class="loader-container">
            <div class="loader"></div>
            <p class="loading-text">Özetleniyor...</p>
        </div>
    `;

    try {
      const response = await fetch("http://127.0.0.1:8000/summarize-text/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToSummarize }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || "Özetleme hatası.");
      }

      const result = await response.json();

      // Özet geldiğinde, "Özetleniyor..." HTML'i tamamen silinir ve yerine bu yeni HTML gelir.
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
      // Hata durumunda da "Özetleniyor..." HTML'i silinir ve yerine hata mesajı gelir.
      summaryContent.innerHTML = `<p style="color: red; text-align: center;">Hata: ${error.message}</p>`;
    } finally {
      // İşlem bittiğinde butonu tekrar aktif et
      summarizeButton.disabled = false;
    }
  });

  // Sıfırlama Butonu
  resetButton.addEventListener("click", resetToInitialState);

  // Kontrol paneli dinleyicileri
  Object.values(controls).forEach((control) => {
    control.addEventListener("input", applyStyles);
  });

  // Sayfa ilk yüklendiğinde başlangıç ayarlarını yap
  applyStyles();
  summarizeButton.disabled = true;
});
