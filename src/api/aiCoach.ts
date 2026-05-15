/// <reference types="vite/client" />
import Anthropic from '@anthropic-ai/sdk';
import type { GameSession, Insight } from '../types';

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

function formatTime(ms: number): string {
  const s = Math.round(ms / 1000);
  return `${s}s`;
}

export async function analyzeGame(session: GameSession): Promise<Insight[]> {
  const elapsed = session.endTime
    ? formatTime(session.endTime - session.startTime)
    : 'unknown';

  const moveSummary = session.moves.map((m, i) => ({
    index: i,
    position: `(${m.cellX}, ${m.cellY})`,
    action: m.action,
    probabilityOfMine: `${m.probabilityAtTime}%`,
    outcome: m.action === 'reveal' ? (m.wasSafe ? 'safe' : 'hit mine') : 'flagged',
  }));

  const prompt = `You are an AI coach analyzing a Minesweeper game to help the player develop probabilistic thinking skills.

Game result: ${session.status}
Difficulty: ${session.difficulty}
Time: ${elapsed}
Total moves: ${session.moves.length}

Moves data (each move includes: cell position, action, probability of mine at that moment, whether it was safe):
${JSON.stringify(moveSummary, null, 2)}

Analyze the player's decision-making:
1. Find 2-3 most interesting moves — where they took unnecessary risk OR made an optimal choice
2. For each highlighted move explain: what the probability was, what the better option was (if any), why this matters for probabilistic thinking
3. Give an overall assessment: are they impulsive (opening high-probability cells) or calculated (always picking lowest risk)?
4. One actionable tip for next game

Respond ONLY with a valid JSON array of insights (no markdown, no extra text):
[
  {
    "moveIndex": <number or -1 for general>,
    "text": "<concise explanation>",
    "type": "<good|risky|impulsive|optimal>",
    "probability": <number 0-100>
  }
]

Keep each text under 120 characters. Be specific, use actual numbers. Respond in the same language the user's browser is set to.`;

  const message = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw = message.content[0].type === 'text' ? message.content[0].text : '[]';

  try {
    const parsed = JSON.parse(raw) as Insight[];
    return parsed.filter(
      i =>
        typeof i.moveIndex === 'number' &&
        typeof i.text === 'string' &&
        ['good', 'risky', 'impulsive', 'optimal'].includes(i.type) &&
        typeof i.probability === 'number'
    );
  } catch {
    return [
      {
        moveIndex: -1,
        text: 'Analysis complete. Keep practicing to sharpen your probabilistic thinking!',
        type: 'good',
        probability: 0,
      },
    ];
  }
}
