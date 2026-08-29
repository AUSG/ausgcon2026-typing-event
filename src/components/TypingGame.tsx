"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { LeaderboardEntry } from "@/lib/types";

type Phase = "ready" | "countdown" | "typing" | "saving" | "result";
type Result = { nickname: string; cpm: number; accuracy: number; durationMs: number };

const COUNTDOWN_SECONDS = 3;

function formatTime(milliseconds: number) {
  return `${(milliseconds / 1000).toFixed(1)}s`;
}

function PromptCharacters({ prompt, typed }: { prompt: string; typed: string }) {
  return (
    <div className="prompt-text" aria-hidden="true">
      {Array.from(prompt).map((character, index) => {
        const typedCharacter = typed[index];
        const className =
          typedCharacter === undefined
            ? index === typed.length
              ? "prompt-char prompt-char--cursor"
              : "prompt-char"
            : typedCharacter === character
              ? "prompt-char prompt-char--correct"
              : "prompt-char prompt-char--wrong";

        return (
          <span className={className} key={`${index}-${character}`}>
            {character === "\n" ? <br /> : character}
          </span>
        );
      })}
    </div>
  );
}

function Leaderboard({
  entries,
  loading,
  highlight,
}: {
  entries: LeaderboardEntry[];
  loading: boolean;
  highlight?: string;
}) {
  return (
    <section className="leaderboard" aria-labelledby="leaderboard-title">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">LIVE RANKING</span>
          <h2 id="leaderboard-title">오늘의 스피드</h2>
        </div>
        <span className="live-indicator"><i /> LIVE</span>
      </div>

      <div className="rank-table" aria-live="polite">
        <div className="rank-row rank-row--header">
          <span>RANK</span><span>PLAYER</span><span>ACCURACY</span><span>CPM</span>
        </div>
        {loading && entries.length === 0 ? (
          <div className="rank-empty">순위를 불러오는 중...</div>
        ) : entries.length === 0 ? (
          <div className="rank-empty">
            <strong>BE THE FIRST</strong>
            <span>첫 번째 기록의 주인공이 되어보세요.</span>
          </div>
        ) : (
          entries.slice(0, 8).map((entry) => (
            <div
              className={`rank-row${entry.nickname === highlight ? " rank-row--mine" : ""}`}
              key={`${entry.rank}-${entry.nickname}`}
            >
              <span className="rank-number">{String(entry.rank).padStart(2, "0")}</span>
              <strong>{entry.nickname}</strong>
              <span>{entry.accuracy.toFixed(1)}%</span>
              <b>{entry.cpm}</b>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export function TypingGame() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [nickname, setNickname] = useState("");
  const [attemptId, setAttemptId] = useState("");
  const [prompt, setPrompt] = useState("");
  const [typed, setTyped] = useState("");
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [rankingLoading, setRankingLoading] = useState(true);
  const [storageMode, setStorageMode] = useState<"supabase" | "memory" | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const startedAtRef = useRef(0);
  const submittedRef = useRef(false);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const response = await fetch("/api/leaderboard", { cache: "no-store" });
      if (!response.ok) throw new Error();
      const data = (await response.json()) as {
        entries: LeaderboardEntry[];
        storage: "supabase" | "memory";
      };
      setLeaderboard(data.entries);
      setStorageMode(data.storage);
    } catch {
      // Keep the last good ranking visible during a temporary network failure.
    } finally {
      setRankingLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialTimer = window.setTimeout(() => void fetchLeaderboard(), 0);
    const timer = window.setInterval(() => void fetchLeaderboard(), 5_000);
    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(timer);
    };
  }, [fetchLeaderboard]);

  useEffect(() => {
    if (phase !== "countdown") return;
    const timer = window.setTimeout(() => {
      if (countdown <= 1) {
        startedAtRef.current = performance.now();
        setCountdown(0);
        setPhase("typing");
        window.setTimeout(() => inputRef.current?.focus(), 0);
      } else {
        setCountdown((value) => value - 1);
      }
    }, 760);
    return () => window.clearTimeout(timer);
  }, [countdown, phase]);

  useEffect(() => {
    if (phase !== "typing") return;
    const timer = window.setInterval(() => {
      setElapsed(performance.now() - startedAtRef.current);
    }, 50);
    return () => window.clearInterval(timer);
  }, [phase]);

  const correctCount = useMemo(
    () => Array.from(typed).reduce((count, char, index) => count + (char === prompt[index] ? 1 : 0), 0),
    [prompt, typed],
  );
  const accuracy = typed.length === 0 ? 100 : Math.round((correctCount / typed.length) * 1000) / 10;
  const liveCpm = elapsed > 0 ? Math.round(correctCount / (elapsed / 60_000)) : 0;
  const progress = prompt.length > 0 ? Math.min((typed.length / prompt.length) * 100, 100) : 0;

  const submitResult = useCallback(
    async (finalText: string) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      const durationMs = performance.now() - startedAtRef.current;
      setElapsed(durationMs);
      setPhase("saving");

      try {
        const response = await fetch("/api/attempt", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attemptId, typedText: finalText, durationMs }),
        });
        const data = (await response.json()) as Result & { message?: string };
        if (!response.ok) throw new Error(data.message || "기록을 저장하지 못했어요.");
        setResult(data);
        setPhase("result");
        await fetchLeaderboard();
      } catch (submitError) {
        submittedRef.current = false;
        setError(submitError instanceof Error ? submitError.message : "기록을 저장하지 못했어요.");
        setPhase("typing");
        window.setTimeout(() => inputRef.current?.focus(), 0);
      }
    },
    [attemptId, fetchLeaderboard],
  );

  async function startChallenge(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (Array.from(nickname.trim()).length < 2) {
      setError("닉네임을 2자 이상 입력해주세요.");
      return;
    }

    try {
      const response = await fetch("/api/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname }),
      });
      const data = (await response.json()) as {
        attemptId?: string;
        prompt?: string;
        nickname?: string;
        storage?: "supabase" | "memory";
        message?: string;
      };
      if (!response.ok || !data.attemptId || !data.prompt) {
        throw new Error(data.message || "게임을 시작하지 못했어요.");
      }
      setAttemptId(data.attemptId);
      setPrompt(data.prompt);
      setNickname(data.nickname ?? nickname.trim());
      setStorageMode(data.storage ?? null);
      setTyped("");
      setElapsed(0);
      setCountdown(COUNTDOWN_SECONDS);
      submittedRef.current = false;
      setPhase("countdown");
    } catch (startError) {
      setError(startError instanceof Error ? startError.message : "게임을 시작하지 못했어요.");
    }
  }

  function handleTyping(event: React.ChangeEvent<HTMLTextAreaElement>) {
    if (phase !== "typing") return;
    const value = event.target.value.slice(0, prompt.length);
    setTyped(value);
    setError("");
    if (value === prompt) void submitResult(value);
  }

  return (
    <main className="event-shell">
      <header className="topbar">
        <a className="brand" href="https://2026.ausg.me/" target="_blank" rel="noreferrer">
          <span className="brand-mark">A</span>
          <span>AUSGCON <b>2026</b></span>
        </a>
        <div className="topbar-center">SIDE EVENT · TYPING CHALLENGE</div>
        <div className="event-date"><i /> 2026. 09. 05</div>
      </header>

      <div className="decor-cloud decor-cloud--one" aria-hidden="true" />
      <div className="decor-cloud decor-cloud--two" aria-hidden="true" />
      <div className="decor-orbit" aria-hidden="true"><span>TYPE</span><span>SHIP</span><span>LEARN</span></div>

      <section className="hero-copy">
        <span className="eyebrow">DIVE INTO TECH, TYPE INTO FUTURE</span>
        <h1>TYPE INTO<br /><em>THE FUTURE</em></h1>
        <p>한 번의 도전, 가장 빠른 손끝.<br />개발 문장을 정확하게 입력하고 오늘의 기록을 완성하세요.</p>
      </section>

      <div className="content-grid">
        <section className="game-card" aria-live="polite">
          <div className="card-topline">
            <span>CHALLENGE_01</span>
            <span className="chance"><i /> ONE PERSON · ONE CHANCE</span>
          </div>

          {storageMode === "memory" && (
            <div className="dev-notice">DEV MODE · Supabase 연결 전이라 기록이 서버 재시작 시 초기화됩니다.</div>
          )}

          {phase === "ready" && (
            <div className="ready-panel">
              <div className="terminal-icon" aria-hidden="true"><span>&gt;_</span></div>
              <span className="step-label">READY TO CHALLENGE?</span>
              <h2>당신의 닉네임을<br />입력해주세요.</h2>
              <p>시작 버튼을 누르는 순간 도전권이 사용됩니다.<br />영문 대·소문자와 기호까지 정확하게 입력하세요.</p>
              <form onSubmit={startChallenge}>
                <label htmlFor="nickname">PLAYER NAME</label>
                <div className="nickname-control">
                  <input
                    autoComplete="off"
                    autoFocus
                    id="nickname"
                    maxLength={16}
                    onChange={(event) => setNickname(event.target.value)}
                    placeholder="닉네임 2~16자"
                    value={nickname}
                  />
                  <button type="submit">START <span>↗</span></button>
                </div>
                {error && <div className="error-message" role="alert">{error}</div>}
              </form>
            </div>
          )}

          {phase === "countdown" && (
            <div className="countdown-panel">
              <span className="step-label">GET READY, {nickname.toUpperCase()}</span>
              <strong key={countdown}>{countdown === 0 ? "GO" : countdown}</strong>
              <p>문장이 나타나면 바로 타이핑하세요.</p>
            </div>
          )}

          {(phase === "typing" || phase === "saving") && (
            <div className="typing-panel" onClick={() => inputRef.current?.focus()}>
              <div className="metrics">
                <div><span>TIME</span><strong>{formatTime(elapsed)}</strong></div>
                <div><span>ACCURACY</span><strong>{accuracy.toFixed(1)}<small>%</small></strong></div>
                <div><span>LIVE CPM</span><strong>{liveCpm}</strong></div>
              </div>
              <div className="prompt-wrap">
                <span className="prompt-label">TYPE THE FOLLOWING</span>
                <PromptCharacters prompt={prompt} typed={typed} />
                <textarea
                  aria-label="제시된 문장을 입력하세요"
                  autoCapitalize="off"
                  autoComplete="off"
                  autoCorrect="off"
                  disabled={phase === "saving"}
                  onChange={handleTyping}
                  onPaste={(event) => event.preventDefault()}
                  ref={inputRef}
                  spellCheck={false}
                  value={typed}
                />
              </div>
              <div className="progress-line"><span style={{ width: `${progress}%` }} /></div>
              <div className="typing-footer">
                <span>{typed.length} / {prompt.length} CHARACTERS</span>
                <span>{phase === "saving" ? "SAVING RESULT..." : "KEEP GOING →"}</span>
              </div>
              {error && <div className="error-message" role="alert">{error}</div>}
            </div>
          )}

          {phase === "result" && result && (
            <div className="result-panel">
              <span className="step-label">CHALLENGE COMPLETE</span>
              <div className="result-title"><span>{result.nickname}</span><strong>{result.cpm}</strong><b>CPM</b></div>
              <div className="result-stats">
                <div><span>ACCURACY</span><strong>{result.accuracy.toFixed(1)}%</strong></div>
                <div><span>TIME</span><strong>{formatTime(result.durationMs)}</strong></div>
              </div>
              <p>기록이 저장되었습니다. 오른쪽 실시간 순위에서 확인해보세요.</p>
              <div className="result-rule">한 사람당 도전은 한 번만 가능합니다.</div>
            </div>
          )}
        </section>

        <Leaderboard
          entries={leaderboard}
          highlight={result?.nickname}
          loading={rankingLoading}
        />
      </div>

      <footer className="footer-note">
        <span>AUSGCON 2026; CHALLENGE</span>
        <span>BUILD · CONNECT · CHALLENGE</span>
      </footer>
    </main>
  );
}
