import { NextResponse } from "next/server";

import { getLeaderboard, getPlayerRank } from "@/lib/attempt-store";
import { normalizeNickname } from "@/lib/scoring";
import { hasDatabaseConfig } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const nickname = new URL(request.url).searchParams.get("nickname")?.trim();
    const [entries, player] = await Promise.all([
      getLeaderboard(),
      nickname ? getPlayerRank(normalizeNickname(nickname)) : Promise.resolve(null),
    ]);
    return NextResponse.json({
      entries: entries.map((entry, index) => ({
        rank: index + 1,
        nickname: entry.nickname,
        cpm: entry.cpm ?? 0,
        accuracy: entry.accuracy ?? 0,
        completedAt: entry.completed_at ?? "",
      })),
      mine: player ? {
        rank: player.rank,
        nickname: player.nickname,
        cpm: player.cpm,
        accuracy: player.accuracy,
        completedAt: player.completed_at,
      } : null,
      storage: hasDatabaseConfig() ? "supabase" : "memory",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "순위를 불러오지 못했어요." }, { status: 500 });
  }
}
