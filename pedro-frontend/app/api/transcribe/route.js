export async function POST(request) {
  const formData = await request.formData()
  
  const response = await fetch("http://localhost:8000/transcribe", {
    method: "POST",
    body: formData
  })

  const data = await response.json()
  return Response.json({ text: data.text })
}