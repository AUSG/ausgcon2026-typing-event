export type LeaderboardEntry = {
  rank: number;
  nickname: string;
  cpm: number;
  accuracy: number;
  completedAt: string;
};

export type AttemptRecord = {
  id: string;
  nickname: string;
  nickname_key: string;
  prompt_id: number;
  prompt: string;
  typed_text: string | null;
  duration_ms: number | null;
  cpm: number | null;
  accuracy: number | null;
  status: "active" | "completed";
  created_at: string;
  completed_at: string | null;
};

