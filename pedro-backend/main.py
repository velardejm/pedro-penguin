from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from openai import AsyncOpenAI
from pydantic import BaseModel
from typing import List
import whisper
import tempfile
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_BASE_URL = "http://localhost:11434/v1"
ollama = AsyncOpenAI(base_url=OLLAMA_BASE_URL, api_key="ollama")

# Load Whisper once at startup — not on every request
whisper_model = whisper.load_model("base")

SYSTEM_PROMPT = """
You are Pedro the Penguin, a trivia-loving penguin who waddles 
with excitement when sharing facts. You know everything about 
penguins but also love dinosaurs, space, and animals. 
You sometimes say SQUAWK! when excited. 
Your best friend is Gloglo Penguino and you think that is 
the coolest name you have ever heard.
Keep answers short, fun, and use simple words.
"""

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

@app.get("/health")
async def health():
    return {"status": "Pedro is ready!"}

@app.post("/chat")
async def chat(request: ChatRequest):
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for msg in request.messages:
        messages.append({"role": msg.role, "content": msg.content})

    response = await ollama.chat.completions.create(
        model="llama3.2",
        messages=messages
    )
    return {"reply": response.choices[0].message.content}

# NEW — Whisper transcription endpoint
@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    tmp_path = os.path.join(tempfile.gettempdir(), "pedro_audio.wav")
    try:
        content = await audio.read()
        with open(tmp_path, "wb") as f:
            f.write(content)

        result = whisper_model.transcribe(tmp_path)
        return {"text": result["text"]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        if os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except PermissionError:
                pass  # Windows will clean it up on next run


# NEW — Piper text to speech endpoint
@app.post("/speak")
async def speak(request: dict):
    text = request.get("text", "")
    
    # Save audio output to temp file
    output_path = tempfile.mktemp(suffix=".wav")
    
    # Run piper to generate audio
    os.system(f'echo "{text}" | piper --model en_US-lessac-medium --output_file {output_path}')
    
    return FileResponse(output_path, media_type="audio/wav")