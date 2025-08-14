# Disleksi Dostu AI Okuma ve Özetleme Aracı

Bu proje, disleksi gibi okuma güçlüğü çeken bireylerin dijital metinleri daha kolay anlamalarını ve işlemelerini sağlamak amacıyla geliştirilmiş bir web uygulamasıdır. Kullanıcılar, .pdf, .docx veya .txt formatındaki belgeleri yükleyerek metin içeriğini, okumayı kolaylaştıran çeşitli görsel ayarlarla (yazı tipi, boyut, renkler vb.) görüntüleyebilirler.

Uygulamanın en güçlü özelliklerinden biri, yerel olarak **Ollama** üzerinde çalışan `qwen3:8b` dil modelini kullanarak yüklenen metinler için yapılandırılmış ve disleksi dostu özetler oluşturmasıdır. Bu sayede hem veri gizliliği korunur hem de uzun metinlerin ana fikirleri hızlıca öğrenilebilir.

## Temel Özellikler

- **Dosya Yükleme:** `.pdf`, `.docx` ve `.txt` formatındaki belgeleri destekler.
- **Yan Yana Görünüm:** Yüklenen belgenin orijinal metni ile yapay zeka tarafından oluşturulan özetini aynı ekranda karşılaştırmalı olarak gösterir.
- **Disleksi Dostu Görünüm Ayarları:**
  - Farklı yazı tipleri (Lexend, Open Sans vb.) seçimi.
  - Ayarlanabilir yazı boyutu ve satır aralığı.
  - Kişiselleştirilebilir yazı ve arka plan renkleri.
- **Paylaşımlı Kontroller:** Görünüm ayarları, hem orijinal metne hem de özet metnine anlık olarak etki eder.
- **Yerel Yapay Zeka ile Özetleme:**
  - Ollama ve `qwen2:7b` modeli ile tamamen yerelde çalışır, internet bağlantısına veya harici API'lere ihtiyaç duymaz.
  - Özetler, başlıklar, madde imleri ve **Biyonik Okuma** tekniği (kelimelerin ilk harflerinin kalınlaştırılması) ile zenginleştirilmiş, anlaşılması kolay bir formatta sunulur.
- **Modern ve Kullanıcı Dostu Arayüz:** Temiz, sezgisel ve etkileşimli bir web arayüzü.

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
  - **Vanilla JavaScript:** Harici bir framework olmadan arayüz mantığını yönetmek için.
  - **Marked.js:** Yapay zekadan gelen Markdown formatındaki özeti HTML'e çevirmek için.

## Kurulum ve Çalıştırma

Bu projeyi yerel makinenizde çalıştırmak için aşağıdaki adımları izleyin.

### Gereksinimler

- **Python 3.9 veya üstü:** [python.org](https://www.python.org/)
- **Ollama:** [ollama.com](https://ollama.com/)

### Adım 1: Proje Dosyalarını Oluşturma

Bu dökümandaki kodları kullanarak proje klasör yapısını ve dosyalarını oluşturun.

### Adım 2: Ollama Modelinin Kurulumu

Ollama'yı kurduktan sonra, terminali açın ve projede kullanılan dil modelini aşağıdaki komutla indirin:

```bash
ollama pull qwen3:8b
```
*(Not: Farklı bir model kullanmak isterseniz `backend/main.py` dosyasındaki model adını değiştirebilirsiniz.)*

### Adım 3: Backend Kurulumu

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

### Adım 4: Backend'i Çalıştırma

Ayrı bir terminal açın ve `backend` klasöründeyken aşağıdaki komutu çalıştırın:

```bash
uvicorn main:app --reload
```
Sunucu artık `http://127.0.0.1:8000` adresinde çalışıyor olacak.

### Adım 5: Frontend'i Çalıştırma

Başka bir terminal açın ve projenin `frontend` klasörüne gidin:

```bash
cd frontend
```
Python'un dahili web sunucusunu kullanarak frontend'i yayınlayın:

```bash
python -m http.server 8080
```
Şimdi web tarayıcınızı açın ve **`http://localhost:8080`** adresine gidin.