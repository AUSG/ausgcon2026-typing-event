import type { AttemptRecord } from "@/lib/types";
import { getSupabaseAdmin } from "@/lib/supabase";

const globalStore = globalThis as typeof globalThis & {
  __ausgTypingAttempts?: Map<string, AttemptRecord>;
};

const memoryAttempts =
  globalStore.__ausgTypingAttempts ??
  (globalStore.__ausgTypingAttempts = new Map<string, AttemptRecord>());

export class DuplicateNicknameError extends Error {}

export async function createAttempt(
  attempt: Pick<AttemptRecord, "id" | "nickname" | "nickname_key" | "prompt_id" | "prompt">,
) {
  const now = new Date().toISOString();
  const record: AttemptRecord = {
    ...attempt,
    typed_text: null,
    duration_ms: null,
    cpm: null,
    accuracy: null,
    status: "active",
    created_at: now,
    completed_at: null,
  };
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { error } = await supabase.from("typing_attempts").insert(record);
    if (error?.code === "23505") throw new DuplicateNicknameError();
    if (error) throw error;
    return record;
  }

  if ([...memoryAttempts.values()].some((item) => item.nickname_key === record.nickname_key)) {
    throw new DuplicateNicknameError();
  }
  memoryAttempts.set(record.id, record);
  return record;
}

export async function findAttempt(id: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return memoryAttempts.get(id) ?? null;

  const { data, error } = await supabase
    .from("typing_attempts")
    .select("*")
    .eq("id", id)
    .maybeSingle<AttemptRecord>();
  if (error) throw error;
  return data;
}

export async function completeAttempt(
  id: string,
  result: Pick<AttemptRecord, "typed_text" | "duration_ms" | "cpm" | "accuracy">,
) {
  const completedAt = new Date().toISOString();
  const supabase = getSupabaseAdmin();

  if (supabase) {
    const { data, error } = await supabase
      .from("typing_attempts")
      .update({ ...result, status: "completed", completed_at: completedAt })
      .eq("id", id)
      .eq("status", "active")
      .select("*")
      .maybeSingle<AttemptRecord>();
    if (error) throw error;
    return data;
  }

  const current = memoryAttempts.get(id);
  if (!current || current.status !== "active") return null;
  const updated: AttemptRecord = {
    ...current,
    ...result,
    status: "completed",
    completed_at: completedAt,
  };
  memoryAttempts.set(id, updated);
  return updated;
}

export async function getLeaderboard(limit = 20) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("typing_attempts")
      .select("nickname,cpm,accuracy,completed_at")
      .eq("status", "completed")
      .order("cpm", { ascending: false })
      .order("accuracy", { ascending: false })
      .order("completed_at", { ascending: true })
      .limit(limit);
    if (error) throw error;
    return data;
  }

  return [...memoryAttempts.values()]
    .filter((attempt) => attempt.status === "completed")
    .sort((a, b) =>
      (b.cpm ?? 0) - (a.cpm ?? 0) ||
      (b.accuracy ?? 0) - (a.accuracy ?? 0) ||
      (a.completed_at ?? "").localeCompare(b.completed_at ?? ""),
    )
    .slice(0, limit)
    .map(({ nickname, cpm, accuracy, completed_at }) => ({
      nickname,
      cpm,
      accuracy,
      completed_at,
    }));
}
