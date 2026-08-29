export type TypingPrompt = {
  id: number;
  lines: [string, string] | [string, string, string];
};

export const PROMPTS: TypingPrompt[] = [
  {
    id: 1,
    lines: [
      "First, make it work. Then, make it right.",
      "Finally, make it fast without losing clarity.",
    ],
  },
  {
    id: 2,
    lines: [
      "const future = await build({ curiosity: true });",
      "ship(future, { confidence: 'high' });",
    ],
  },
  {
    id: 3,
    lines: [
      "Every bug is a question we have not answered yet.",
      "Read the signal, test the idea, and learn quickly.",
    ],
  },
  {
    id: 4,
    lines: [
      "while (curious) { explore(); build(); share(); }",
      "Great software grows from small, thoughtful steps.",
    ],
  },
  {
    id: 5,
    lines: [
      "Design the interface as if every detail matters.",
      "Write the code as if the next reader matters more.",
    ],
  },
  {
    id: 6,
    lines: [
      "git commit -m \"Turn a bold idea into reality\"",
      "git push origin future",
      "// Keep learning beyond the final deploy.",
    ],
  },
  {
    id: 7,
    lines: [
      "A good API makes the easy path feel obvious.",
      "A great team makes hard problems feel possible.",
    ],
  },
  {
    id: 8,
    lines: [
      "if (failure) return learn(failure);",
      "return challenge.next({ braver: true });",
    ],
  },
  {
    id: 9,
    lines: [
      "Clouds scale systems, but people scale ideas.",
      "Connect the dots and build what comes next.",
    ],
  },
  {
    id: 10,
    lines: [
      "The best refactor starts with a precise question.",
      "The best answer leaves the system simpler than before.",
    ],
  },
  {
    id: 11,
    lines: [
      "type Challenge = { depth: number; courage: boolean };",
      "const us: Challenge = { depth: Infinity, courage: true };",
    ],
  },
  {
    id: 12,
    lines: [
      "Observe the system before changing the system.",
      "Measure the result before trusting the result.",
      "Share the lesson before starting again.",
    ],
  },
];

export function promptText(prompt: TypingPrompt) {
  return prompt.lines.join("\n");
}

export function getRandomPrompt() {
  return PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
}

export function getPrompt(id: number) {
  return PROMPTS.find((prompt) => prompt.id === id);
}

