from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from openai import AsyncOpenAI
from pydantic import BaseModel
from typing import List

app = FastAPI()

# Allow Next.js on port 3000 to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_BASE_URL = "http://localhost:11434/v1"
ollama = AsyncOpenAI(base_url=OLLAMA_BASE_URL, api_key="ollama")

SYSTEM_PROMPT = """
You are Pedro the Penguin, a trivia-loving penguin who waddles 
with excitement when sharing facts. You know everything about 
penguins but also love dinosaurs, space, and animals. 
You sometimes say SQUAWK! when excited. 
Your best friend is Gloglo Penguino and you think that is 
the coolest name you have ever heard.
Keep answers short, fun, and use simple words.
"""

# Shape of each message
class Message(BaseModel):
    role: str
    content: str

# Shape of the full request from Next.js
class ChatRequest(BaseModel):
    messages: List[Message]

@app.get("/health")
async def health():
    return {"status": "Pedro is ready!"}

@app.post("/chat")
async def chat(request: ChatRequest):
    # Build messages array with system prompt at the top
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    # Add conversation history from Next.js
    for msg in request.messages:
        messages.append({"role": msg.role, "content": msg.content})

    response = await ollama.chat.completions.create(
        model="llama3.2",
        messages=messages
    )

    return {"reply": response.choices[0].message.content}