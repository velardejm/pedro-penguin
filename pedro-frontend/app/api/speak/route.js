export async function POST(request) {
  const body = await request.json()

  const response = await fetch("http://localhost:8000/speak", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: body.text })
  })

  const audioBuffer = await response.arrayBuffer()
  return new Response(audioBuffer, {
    headers: { "Content-Type": "audio/wav" }
  })
}