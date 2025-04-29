import { NextRequest, NextResponse } from 'next/server'
import { Ollama } from 'ollama'

const ollama = new Ollama({ host: 'http://localhost:11434' })

export async function GET() {
  return NextResponse.json({
    status: 'success',
    message: 'Send a POST request with `text` to parse command.',
    data: null,
  })
}

export async function POST(req: NextRequest) {
  const { text } = await req.json()

  const prompt = `
    You're a helpful assistant for a to-do app.
    
    Based on the user's voice command, extract:
    - action: one of "add", "delete", or "update"
    - content: the new todo content (for add/update) or the content to delete (for delete)
    - old: the previous todo content (for update and delete)
    
    Rules:
    - If it's an "add", return: { "action": "add", "content": "..." }
    - If it's a "delete", return: { "action": "delete", "old": "..." }
    - If it's an "update", return: { "action": "update", "old": "...", "content": "..." }
    - If no actionable command is found, return: { "action": "none", "content": null }
    - If the user's command does **not clearly** match the patterns above, **do not guess**. Just return: { "action": "none", "content": null }

    Examples:
    Command: "I want to read a book"
    → { "action": "add", "content": "read a book" }
    
    Command: "Remove buy groceries"
    → { "action": "delete", "old": "buy groceries" }

    Command: "Delete walk dog"
    → { "action": "delete", "old": "walk dog" }

    Command: "Instead of studying, I will go to the gym"
    → { "action": "update", "old": "studying", "content": "go to the gym" }
    
    Command: "Update walk dog to feed dog"
    → { "action": "update", "old": "walk dog", "content": "feed dog" }
    
    Command: "What's the weather like?"
    → { "action": "none", "content": null }
    
    Now parse:
    Command: "${text}"
  `;
    
  try {
    const response = await ollama.chat({
      model: 'mistral',
      // model: 'llama3.1',
      messages: [{ role: 'user', content: prompt }],
    })

    console.log("Agent response", response);
    

    const match = response.message.content.match(/\{[\s\S]*?\}/)
    if (!match) {
      return NextResponse.json({ status: 'error', message: 'Failed to parse JSON', data: null }, { status: 500 })
    }

    const result = JSON.parse(match[0])
    return NextResponse.json({ status: 'success', message: 'Parsed command', data: result })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ status: 'error', message: 'Ollama call failed', data: null }, { status: 500 })
  }
}
