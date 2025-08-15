import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ollama
import io
from pypdf import PdfReader
from docx import Document

# GÜNCELLENDİ: Gelen isteğin yapısına 'ratio' alanı eklendi.
class TextRequest(BaseModel):
    text: str
    ratio: float = 0.5 # Varsayılan değer 0.5 (%50)

# ... (Uygulama tanımı ve metin çıkarma fonksiyonları aynı kalacak) ...
app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],)
def extract_text_from_pdf(file_stream: io.BytesIO) -> str:
    try: reader = PdfReader(file_stream); text = "".join(page.extract_text() or "" for page in reader.pages); return text
    except Exception as e: raise HTTPException(status_code=500, detail=f"PDF okuma hatası: {e}")
def extract_text_from_docx(file_stream: io.BytesIO) -> str:
    try: document = Document(file_stream); text = "\n".join(para.text for para in document.paragraphs); return text
    except Exception as e: raise HTTPException(status_code=500, detail=f"DOCX okuma hatası: {e}")
def extract_text_from_txt(file_stream: io.BytesIO) -> str:
    try: return file_stream.read().decode('utf-8')
    except Exception as e: raise HTTPException(status_code=500, detail=f"TXT okuma hatası: {e}")

@app.post("/extract-text/")
async def extract_text_from_file(file: UploadFile = File(...)):
    # ... (Bu fonksiyon aynı kalacak) ...
    file_extension = file.filename.split('.')[-1].lower()
    contents = await file.read()
    file_stream = io.BytesIO(contents)
    text_content = ""
    if file_extension == "pdf": text_content = extract_text_from_pdf(file_stream)
    elif file_extension == "docx": text_content = extract_text_from_docx(file_stream)
    elif file_extension == "txt": text_content = extract_text_from_txt(file_stream)
    else: raise HTTPException(status_code=400, detail="Desteklenmeyen dosya formatı. Lütfen .txt, .pdf veya .docx seçin.")
    if not text_content.strip(): raise HTTPException(status_code=400, detail="Dosya boş veya metin çıkarılamadı.")
    return {"text": text_content}


@app.post("/summarize-text/")
async def summarize_text(request: TextRequest):
    text_content = request.text
    ratio = request.ratio # Frontend'den gelen oranı al
    
    if not text_content.strip():
        raise HTTPException(status_code=400, detail="Özetlenecek metin boş olamaz.")
    
    # YENİ: Gelen orana göre modele verilecek talimatı belirle
    if ratio <= 0.25:
        length_instruction = "Çok kısa ve öz bir özet yap. Sadece metnin ana fikrini 1-2 cümleyle ver."
    elif ratio <= 0.50:
        length_instruction = "Orta uzunlukta bir özet yap. Ana fikri ve en önemli birkaç kilit noktayı içersin."
    else: # ratio >= 0.75
        length_instruction = "Oldukça detaylı ve daha uzun bir özet hazırla. Önemli alt başlıkları ve detayları kaçırma."

    try:
        # GÜNCELLENDİ: Prompt'a dinamik olarak uzunluk talimatı eklendi
        prompt = f"""
        Aşağıdaki metni, disleksi olan bir bireyin kolayca okuyabilmesi için özel olarak biçimlendirerek özetle.
        Aşağıdaki kurallara harfiyen uy:
        
        1.  **Özet Uzunluğu:** {length_instruction}
        2.  **Giriş Yapma:** Cevabına ASLA "İşte özetiniz" gibi bir giriş cümlesiyle başlama. Doğrudan '### Ana Fikir' başlığını yazarak başla.
        3.  **Markdown Kullan:** Cevabını mutlaka Markdown formatında hazırla.
        4.  **Ana Fikir Başlığı:** Özete `### Ana Fikir` başlığıyla başla. 
        5.  **Önemli Noktalar Başlığı:** Ardından `### Önemli Noktalar` başlığı ekle ve bilgileri kısa maddeler halinde (`-` işareti kullanarak) sırala.
        6.  **Anahtar Kelimeleri Vurgula:** Özet içindeki en önemli anahtar kelimeleri `**kelime**` şeklinde Markdown ile **kalın** yap.
        7.  **Basit Dil:** Kesinlikle karmaşık ve uzun cümleler kurma. Her cümle kısa, net ve anlaşılır olsun.
        
        Özetlenecek Metin:
        ---
        {text_content}
        ---
        """
        response = ollama.chat(
            model='cogito:8b',
            messages=[{'role': 'user', 'content': prompt}]
        )
        
        full_response_text = response['message']['content']
        summary_marker = "### Ana Fikir"
        marker_position = full_response_text.find(summary_marker)

        if marker_position != -1:
            clean_summary = full_response_text[marker_position:]
        else:
            clean_summary = full_response_text
            
        return {"summary": clean_summary}

    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Ollama modeline bağlanırken bir hata oluştu: {e}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)