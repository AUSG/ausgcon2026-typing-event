export function calculateScore(prompt: string, typed: string, durationMs: number) {
  const expected = Array.from(prompt);
  const actual = Array.from(typed);
  const correct = expected.reduce(
    (count, character, index) => count + (actual[index] === character ? 1 : 0),
    0,
  );
  const comparedLength = Math.max(expected.length, actual.length, 1);
  const accuracy = Math.round((correct / comparedLength) * 1000) / 10;
  const minutes = Math.max(durationMs, 1) / 60_000;
  const cpm = Math.round(correct / minutes);

  return { correct, accuracy, cpm };
}

export function normalizeNickname(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("ko-KR");
}

export function isValidNickname(value: string) {
  const length = Array.from(value.trim()).length;
  return length >= 2 && length <= 16;
}

