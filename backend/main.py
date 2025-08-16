import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ollama
import io
from pypdf import PdfReader
from docx import Document

# GÜNCELLENDİ: İstek modeline 'model' alanı eklendi
class TextRequest(BaseModel):
    text: str
    ratio: float = 0.5
    model: str # Hangi modelin kullanılacağı bilgisi

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

# YENİ ENDPOINT: Yüklü Ollama modellerini listeler
@app.get("/models/")
async def get_installed_models():
    try:
        models_data = ollama.list()
        model_names = []
        if 'models' in models_data and models_data['models']:
            for model_info in models_data['models']:
                # Hem 'name' hem de 'model' anahtarını kontrol et
                if 'name' in model_info:
                    model_names.append(model_info['name'])
                elif 'model' in model_info:
                    model_names.append(model_info['model'])
        return {"models": model_names}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Ollama servisine bağlanılamadı veya modeller listelenemedi: {repr(e)}")


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

# GÜNCELLENDİ: Özetleme fonksiyonu artık model adını da alıyor
@app.post("/summarize-text/")
async def summarize_text(request: TextRequest):
    text_content = request.text
    ratio = request.ratio
    model_name = request.model # Frontend'den gelen model adını al
    
    if not text_content.strip():
        raise HTTPException(status_code=400, detail="Özetlenecek metin boş olamaz.")
    
    if ratio <= 0.25:
        length_instruction = "Çok kısa ve öz bir özet yap. Sadece metnin ana fikrini 1-2 cümleyle ver."
    elif ratio <= 0.50:
        length_instruction = "Orta uzunlukta bir özet yap. Ana fikri ve en önemli birkaç kilit noktayı içersin."
    else:
        length_instruction = "Oldukça detaylı ve daha uzun bir özet hazırla. Önemli alt başlıkları ve detayları kaçırma."

    try:
        prompt = f"""
        Aşağıdaki metni, disleksi olan bir bireyin kolayca okuyabilmesi için özel olarak biçimlendirerek özetle.
        Kurallar:
        1.  **Özet Uzunluğu:** {length_instruction}
        2.  **Giriş Yapma:** Cevabına doğrudan '### Ana Fikir' başlığıyla başla.
        3.  **Markdown Kullan:** `### Başlık`, `- Madde İmi`, `**Kalın Yazı**` gibi markdown formatlarını kullan.
        4.  **Basit Dil:** Cümleler kısa, net ve anlaşılır olsun.
        
        Özetlenecek Metin:
        ---
        {text_content}
        ---
        """
        # GÜNCELLENDİ: Model adı artık sabit değil, dinamik
        response = ollama.chat(
            model=model_name,
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