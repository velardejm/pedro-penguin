import { NextResponse } from 'next/server';

export async function POST(request) {
    const { messages } = await request.json()

    const respone = await fetch("http://localhost:8000/chat", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages })
    })

    const data = await respone.json()

    return NextResponse.json({ reply: data.reply })

}