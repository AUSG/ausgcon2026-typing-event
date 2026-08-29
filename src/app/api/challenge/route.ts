import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { createAttempt, DuplicateNicknameError } from "@/lib/attempt-store";
import { getRandomPrompt, promptText } from "@/lib/prompts";
import { isValidNickname, normalizeNickname } from "@/lib/scoring";
import { hasDatabaseConfig } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { nickname?: unknown };
    const nickname = typeof body.nickname === "string" ? body.nickname.trim() : "";

    if (!isValidNickname(nickname)) {
      return NextResponse.json(
        { message: "닉네임은 2~16자로 입력해주세요." },
        { status: 400 },
      );
    }

    const prompt = getRandomPrompt();
    const attempt = await createAttempt({
      id: randomUUID(),
      nickname,
      nickname_key: normalizeNickname(nickname),
      prompt_id: prompt.id,
      prompt: promptText(prompt),
    });

    return NextResponse.json({
      attemptId: attempt.id,
      prompt: attempt.prompt,
      nickname: attempt.nickname,
      storage: hasDatabaseConfig() ? "supabase" : "memory",
    });
  } catch (error) {
    if (error instanceof DuplicateNicknameError) {
      return NextResponse.json(
        { message: "이미 도전한 닉네임이에요. 한 사람당 한 번만 참여할 수 있어요." },
        { status: 409 },
      );
    }
    console.error(error);
    return NextResponse.json(
      { message: "도전권을 만들지 못했어요. 운영 스태프에게 알려주세요." },
      { status: 500 },
    );
  }
}

