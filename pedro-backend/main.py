from fastapi import FastAPI
from openai import AsyncOpenAI

app = FastAPI()


@app.get("/")
async def home():
    OLLAMA_BASE_URL = "http://localhost:11434/v1"
    ollama = AsyncOpenAI(base_url=OLLAMA_BASE_URL, api_key="ollama")

    system_prompt = "You are an assistant that generates an email subject based on the email body"
    user_prompt = """
    Hi Sarah,

    Hope you're having a good week! Just wanted to follow up on the proposal we discussed last Tuesday. Have you had a chance to review the updated figures?

    Let me know if you need anything else from our side before the meeting on Friday.

    Best,
    James
    """

    messages = [{"role":"system","content":system_prompt},{"role":"user","content":user_prompt}]

    response = await ollama.chat.completions.create(model="llama3.2",messages=messages)
    
    return{"reply":response.choices[0].message.content}