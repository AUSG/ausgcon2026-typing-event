import { NextResponse } from "next/server";

import { getLeaderboard } from "@/lib/attempt-store";
import { hasDatabaseConfig } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const entries = await getLeaderboard();
    return NextResponse.json({
      entries: entries.map((entry, index) => ({
        rank: index + 1,
        nickname: entry.nickname,
        cpm: entry.cpm ?? 0,
        accuracy: entry.accuracy ?? 0,
        completedAt: entry.completed_at ?? "",
      })),
      storage: hasDatabaseConfig() ? "supabase" : "memory",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "순위를 불러오지 못했어요." }, { status: 500 });
  }
}

