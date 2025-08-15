# Disleksi Dostu AI Okuma ve Özetleme Aracı

Bu proje, disleksi gibi okuma güçlüğü çeken bireylerin dijital metinleri daha kolay anlamalarını ve işlemelerini sağlamak amacıyla geliştirilmiş, zengin özelliklere sahip bir web uygulamasıdır. Kullanıcılar, .pdf, .docx veya .txt formatındaki belgeleri yükleyerek metin içeriğini, okumayı kolaylaştıran çeşitli görsel ve işitsel ayarlarla kişiselleştirebilirler.

Uygulamanın en güçlü özelliklerinden biri, yerel olarak **Ollama** üzerinde çalışan `cogito:8b` dil modelini kullanarak yüklenen metinler için yapılandırılmış ve disleksi dostu özetler oluşturmasıdır. Bu sayede hem veri gizliliği korunur hem de uzun metinlerin ana fikirleri hızlıca ve kolayca öğrenilebilir.

## Temel Özellikler

- **Dosya Yükleme:** `.pdf`, `.docx` ve `.txt` formatındaki belgeleri destekler.
- **Sesli Okuma (Text-to-Speech):** Orijinal metni ve özeti, tarayıcının dahili ses motoruyla dinleme imkanı sunar. Oynatma, duraklatma ve durdurma kontrolleri mevcuttur.
- **Genişletilmiş Font Desteği:** Okumayı kolaylaştıran, özel olarak eklenmiş **OpenDyslexic** fontu dahil olmak üzere çeşitli font seçenekleri sunar.
- **Yan Yana Görünüm:** Yüklenen belgenin orijinal metni ile yapay zeka tarafından oluşturulan özetini aynı ekranda karşılaştırmalı olarak gösterir.
- **Gelişmiş Görünüm Ayarları:**
  - Ayarlanabilir yazı boyutu ve satır aralığı.
  - Kişiselleştirilebilir yazı ve arka plan renkleri.
  - Tüm ayarlar hem orijinal metne hem de özete anlık olarak etki eder.
- **Ayarlanabilir Özet Uzunluğu:**
  - Kullanıcının ihtiyacına göre Kısa (%25), Orta (%50) ve Detaylı (%75) olmak üzere üç farklı özet uzunluğu seçebilme imkanı.
- **Yerel ve Akıllı Özetleme:**
  - Ollama ile tamamen yerelde çalışır, veri gizliliğini en üst düzeyde tutar.
  - Özetler; başlıklar, madde imleri, **Biyonik Okuma** tekniği ve **gereksiz giriş cümlelerinden arındırılmış** net bir formatta sunulur.

## Kullanılan Teknolojiler

- **Backend:**
  - **Python 3.9+**
  - **FastAPI:** Yüksek performanslı web sunucusu ve API oluşturmak için.
  - **Ollama:** Dil modellerini yerel olarak çalıştırmak için.
  - **Uvicorn:** ASGI sunucusu.
  - **pypdf** & **python-docx:** Dosyalardan metin çıkarmak için.

- **Frontend:**
  - **HTML5**
  - **CSS3** (Flexbox ile modern layout).
  - **Vanilla JavaScript:** Arayüz mantığını yönetmek için.
  - **Web Speech API:** Sesli okuma işlevselliği için.
  - **Marked.js:** Markdown formatındaki özeti HTML'e çevirmek için.

## Kurulum ve Çalıştırma

Bu projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin.

### Gereksinimler

- **Python 3.9 veya üstü:** [python.org](https://www.python.org/)
- **Ollama:** [ollama.com](https://ollama.com/)

### Adım 1: Projeyi Klonlama (veya İndirme)

```bash
git clone https://github.com/ACRZeuss/dyslexia-summarizer.git
cd dyslexia-summarizer
```

### Adım 2: OpenDyslexic Fontunun İndirilmesi (Önemli)

1.  [OpenDyslexic'in resmi web sitesine](https://opendyslexic.org/) gidin ve font ailesini ("Download Now" butonu ile) indirin.
2.  Projenizin `frontend` klasörü içinde `fonts` adında yeni bir klasör oluşturun.
3.  İndirdiğiniz `.zip` dosyasını açın ve içindeki font dosyalarını (örn: `OpenDyslexic-Regular.otf`) oluşturduğunuz `frontend/fonts/` klasörünün içine kopyalayın.

### Adım 3: Ollama Modelinin Kurulumu

Ollama'yı kurduktan sonra, terminali açın ve projede kullanılan dil modelini aşağıdaki komutla indirin:

```bash
ollama pull cogito:8b
```

### Adım 4: Backend Kurulumu

1.  `backend` klasörüne gidin.
    ```bash
    cd backend
    ```
2.  Bir sanal ortam oluşturun ve aktive edin.
    ```bash
    # Sanal ortam oluşturma
    python -m venv venv
    # Aktive etme (macOS/Linux)
    source venv/bin/activate
    # Aktive etme (Windows)
    .\venv\Scripts\activate
    ```
3.  Gerekli Python paketlerini yükleyin.
    ```bash
    pip install -r requirements.txt
    ```

### Adım 5: Backend'i Çalıştırma

Ayrı bir terminal açın ve `backend` klasöründeyken aşağıdaki komutu çalıştırın:

```bash
uvicorn main:app --reload
```
Sunucu artık `http://127.0.0.1:8000` adresinde çalışıyor olacak.

### Adım 6: Frontend'i Çalıştırma

Başka bir terminal açın ve projenin `frontend` klasörüne gidin:

```bash
cd frontend
```
Python'un dahili web sunucusunu kullanarak frontend'i yayınlayın:

```bash
python -m http.server 8080
```
Şimdi web tarayıcınızı açın ve **`http://localhost:8080`** adresine gidin.

## Kullanım

1.  Uygulamayı tarayıcıda açtığınızda karşınıza bir dosya yükleme ekranı çıkacaktır.
2.  "Dosya Yükle" butonuna tıklayarak bir dosya seçin. Metin sol panelde görünecektir.
3.  Sağdaki "Görünüm Ayarları" panelini kullanarak metnin görünümünü kişiselleştirin.
4.  Metni dinlemek için sol panelin üstündeki ▶️ butonuna tıklayın.
5.  Özet oluşturmak için "Yapay Zeka ile Özetle" butonuna tıklayın. Özet sağ panelde belirecektir.
6.  Özeti dinlemek için sağ panelin üstündeki ▶️ butonunu kullanın.
7.  Arayüzü sıfırlamak için "Yeni Dosya Yükle" butonuna tıklayın.

## Proje Yapısı

```
dyslexia-summarizer/
├── backend/
│   ├── main.py           # FastAPI sunucusu ve API endpoint'leri
│   └── requirements.txt    # Python bağımlılıkları
├── frontend/
│   ├── fonts/            # OpenDyslexic gibi özel font dosyaları
│   │   └── OpenDyslexic-Regular.otf 
│   ├── index.html        # Ana web sayfası
│   ├── style.css         # Sayfa stilleri
│   └── script.js         # Arayüz mantığı ve backend iletişimi
└── README.md             # Bu dosya
```