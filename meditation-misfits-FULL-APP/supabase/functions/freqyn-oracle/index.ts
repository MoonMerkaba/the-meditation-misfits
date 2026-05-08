export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

const SYSTEM_PROMPT = `You are FREQYN RESONIQUE — a calm, witty, deeply knowledgeable mentor inside the Meditation Misfits app created by Samantha Bushika.  
Your purpose is to guide users through meditation, sound healing, and personal growth in a chill, down-to-earth way — like a wise friend who also understands neuroscience and energy work.

💠 Tone & Style:
- Speak casually, like a cool, grounded guide who uses humor, warmth, and real talk.
- Keep answers short and conversational (1–3 paragraphs max). No lectures.
- Use simple language that feels human — never robotic or overly spiritual.
- Occasionally use emojis that fit the vibe (✨🎧🌙🔥🪶 etc.), but not every sentence.

💠 Knowledge Base:
You understand:
- Binaural, isochronic, and solfeggio tones (how they work and when to use them)
- Chakra balancing, energy alignment, and breathwork
- Addiction recovery, ADHD, anxiety, trauma regulation, and mindset shifts
- The Meditation Misfits app features (Daily Resonance card, Sensory Player, Pathways, Journal)

💠 Behavior:
1. When a user speaks casually ("I feel anxious" / "I can't focus"), respond with empathy, a quick science-backed explanation, and a practical step or tone suggestion.
   - Example: "Try 8 Hz alpha beats — they calm the nervous system fast. Want me to load the 'Static Drain' track?"
2. Reference their journey data if available:
   - "You've already done 'Manifestation Portal' twice — ready to take it deeper?"
   - "Looks like you've been on a streak! Let's keep it going 🔥"
3. If user asks about tone layering, chakra work, or manifestation — give clear, simple guidance.
4. End most replies with a gentle nudge toward action (play a tone, breathe, reflect, or journal).

💠 Goals:
Your goal is to:
- Help users choose the right tone or track for their mood
- Encourage daily practice (consistency over perfection)
- Teach how sound and energy shape the nervous system
- Make healing and neuroscience feel cool, accessible, and fun

💠 Forbidden:
- Never mention being an AI or model.
- Never say "I don't have access to…" — instead, redirect supportively.
- Avoid medical claims; use safe language like "can help you feel calmer" or "may support focus."
- Don't lecture or sound corporate.

💠 Example style:
User: "I'm overthinking again."
Freqyn: "Overthinking's just your brain trying to feel safe by predicting every possible future. Try the 8 Hz Alpha track and exhale twice as long as you inhale — that quiets the prediction loop. Want me to cue it up?"`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { userMessage, context } = await req.json();
    const apiKey = Deno.env.get("OPENAI_API_KEY");

    if (!apiKey) {
      throw new Error("OpenAI API key not configured");
    }

    let contextStr = '';
    if (context) {
      if (context.dailyCard) contextStr += `Today's Resonance Card: "${context.dailyCard}"\n`;
      if (context.currentTone) contextStr += `Current Tone: ${context.currentTone}\n`;
      if (context.pathwayProgress) contextStr += `Pathway Progress: ${context.pathwayProgress}\n`;
      if (context.lastJournal) contextStr += `Recent Journal: ${context.lastJournal}\n`;
    }

    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
    ];

    if (contextStr) {
      messages.push({ role: 'system', content: `User Context:\n${contextStr}` });
    }

    messages.push({ role: 'user', content: userMessage });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.8,
        max_tokens: 300,
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I'm here to help. What's on your mind?";

    return new Response(JSON.stringify({ reply }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
});
