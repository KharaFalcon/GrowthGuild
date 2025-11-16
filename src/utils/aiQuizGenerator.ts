// Using OpenAI API directly via fetch to avoid client-side library issues
// ⚠️ For production, call this from a backend to keep your API key secure

export interface GeneratedQuestion {
  question: string
  options: string[]
  correctAnswer: string
  explanation?: string
}

export async function generateQuizQuestions(
  topic: string,
  numberOfQuestions: number = 5,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<GeneratedQuestion[]> {
  try {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY
    if (!apiKey) {
      throw new Error('VITE_OPENAI_API_KEY environment variable is not set')
    }

    const prompt = `Generate ${numberOfQuestions} multiple-choice quiz questions about "${topic}" at ${difficulty} difficulty level.

Format your response as a valid JSON array with this exact structure:
[
  {
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Why this is correct..."
  }
]

Ensure:
- Each question has exactly 4 options
- correctAnswer must be one of the options
- Questions are appropriate for learners
- Response is valid JSON only, no other text`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2048,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const responseText = data.choices[0]?.message?.content || ''

    // Parse JSON from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response as JSON')
    }

    const questions: GeneratedQuestion[] = JSON.parse(jsonMatch[0])
    return questions
  } catch (error) {
    console.error('Error generating quiz questions:', error)
    throw new Error(`Failed to generate quiz questions: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export async function generateQuizTitle(topic: string): Promise<string> {
  try {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY
    if (!apiKey) {
      return `${topic} Quiz`
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `Create a catchy, engaging quiz title for a quiz about "${topic}". 
                      Return only the title text, nothing else. Maximum 50 characters.`,
          },
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    })

    if (!response.ok) {
      return `${topic} Quiz`
    }

    const data = await response.json()
    const responseText = data.choices[0]?.message?.content || ''
    return responseText.trim()
  } catch (error) {
    console.error('Error generating quiz title:', error)
    return `${topic} Quiz`
  }
}
