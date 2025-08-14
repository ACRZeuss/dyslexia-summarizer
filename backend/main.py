import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ollama
import io
from pypdf import PdfReader
from docx import Document

# --- Pydantic Modelleri ---
class TextRequest(BaseModel):
    text: str

# --- FastAPI Uygulaması ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Metin Çıkarma Fonksiyonları ---
def extract_text_from_pdf(file_stream: io.BytesIO) -> str:
    try:
        reader = PdfReader(file_stream)
        text = "".join(page.extract_text() or "" for page in reader.pages)
        return text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF okuma hatası: {e}")

def extract_text_from_docx(file_stream: io.BytesIO) -> str:
    try:
        document = Document(file_stream)
        text = "\n".join(para.text for para in document.paragraphs)
        return text
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"DOCX okuma hatası: {e}")

def extract_text_from_txt(file_stream: io.BytesIO) -> str:
    try:
        return file_stream.read().decode('utf-8')
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TXT okuma hatası: {e}")

# --- API Endpoints ---

# Sadece metin çıkaran endpoint
@app.post("/extract-text/")
async def extract_text_from_file(file: UploadFile = File(...)):
    file_extension = file.filename.split('.')[-1].lower()
    contents = await file.read()
    file_stream = io.BytesIO(contents)
    
    text_content = ""
    if file_extension == "pdf":
        text_content = extract_text_from_pdf(file_stream)
    elif file_extension == "docx":
        text_content = extract_text_from_docx(file_stream)
    elif file_extension == "txt":
        text_content = extract_text_from_txt(file_stream)
    else:
        raise HTTPException(status_code=400, detail="Desteklenmeyen dosya formatı. Lütfen .txt, .pdf veya .docx seçin.")
    
    if not text_content.strip():
        raise HTTPException(status_code=400, detail="Dosya boş veya metin çıkarılamadı.")
        
    return {"text": text_content}

# Metni alıp özetleyen endpoint
@app.post("/summarize-text/")
async def summarize_text(request: TextRequest):
    text_content = request.text
    if not text_content.strip():
        raise HTTPException(status_code=400, detail="Özetlenecek metin boş olamaz.")
    
    try:
        prompt = f"""
        Aşağıdaki metni, disleksi olan bir bireyin kolayca okuyabilmesi için özel olarak biçimlendirerek özetle.
        Aşağıdaki kurallara harfiyen uy:
        1.  **Markdown Kullan:** Cevabını mutlaka Markdown formatında hazırla.
        2.  **Ana Fikir Başlığı:** Özete `### Ana Fikir` başlığıyla başla. Bu bölümde metnin ana fikrini 1-2 çok basit cümleyle açıkla.
        3.  **Önemli Noktalar Başlığı:** Ardından `### Önemli Noktalar` başlığı ekle. Bu başlığın altına metindeki en kritik bilgileri kısa maddeler halinde (`-` işareti kullanarak) sırala.
        4.  **Anahtar Kelimeleri Vurgula:** Özet içindeki en önemli anahtar kelimeleri `**kelime**` şeklinde Markdown ile **kalın** yap.
        5.  **Basit Dil:** Kesinlikle karmaşık ve uzun cümleler kurma. Her cümle kısa, net ve anlaşılır olsun.
        
        Özetlenecek Metin:
        {text_content}
        """
        response = ollama.chat(
            model='qwen3:8b',
            messages=[{'role': 'user', 'content': prompt}]
        )
        return {"summary": response['message']['content']}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Ollama modeline bağlanırken bir hata oluştu: {e}")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)