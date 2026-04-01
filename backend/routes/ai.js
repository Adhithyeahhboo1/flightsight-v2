import express from 'express'
import fetch from 'node-fetch'

const router = express.Router()

router.post('/chat', async (req, res) => {
  try {
    const { message, flight } = req.body

    const systemPrompt = `
You are FlightSight AI — an expert flight assistant.

Use this flight data to answer:
${flight ? JSON.stringify(flight) : 'No flight data'}

Be clear, helpful, and concise.
`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ]
      })
    })

    const data = await response.json()

    res.json({
      reply: data.choices?.[0]?.message?.content || "No response"
    })

  } catch (err) {
    res.status(500).json({ error: 'AI error' })
  }
})

export default router