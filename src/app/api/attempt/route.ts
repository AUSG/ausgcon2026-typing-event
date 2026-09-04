import { NextResponse } from "next/server";

import { completeAttempt, findAttempt } from "@/lib/attempt-store";
import { calculateScore } from "@/lib/scoring";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      attemptId?: unknown;
      typedText?: unknown;
      durationMs?: unknown;
    };
    if (
      typeof body.attemptId !== "string" ||
      typeof body.typedText !== "string" ||
      typeof body.durationMs !== "number"
    ) {
      return NextResponse.json({ message: "잘못된 결과 데이터예요." }, { status: 400 });
    }

    const attempt = await findAttempt(body.attemptId);
    if (!attempt) {
      return NextResponse.json({ message: "도전 기록을 찾을 수 없어요." }, { status: 404 });
    }
    if (attempt.status === "completed") {
      return NextResponse.json({ message: "이미 완료된 도전이에요." }, { status: 409 });
    }

    const durationMs = Math.round(body.durationMs);
    if (durationMs < 1_500 || durationMs > 10 * 60_000) {
      return NextResponse.json({ message: "측정 시간이 올바르지 않아요." }, { status: 400 });
    }

    const score = calculateScore(attempt.prompt, body.typedText, durationMs);
    if (Array.from(body.typedText).length !== Array.from(attempt.prompt).length) {
      return NextResponse.json(
        { message: "문장을 끝까지 입력한 뒤 제출해주세요." },
        { status: 400 },
      );
    }
    if (score.cpm > 1_500) {
      return NextResponse.json({ message: "측정된 타수를 확인할 수 없어요." }, { status: 400 });
    }

    const completed = await completeAttempt(attempt.id, {
      typed_text: body.typedText,
      duration_ms: durationMs,
      cpm: score.cpm,
      accuracy: score.accuracy,
    });
    if (!completed) {
      return NextResponse.json({ message: "이미 제출된 도전이에요." }, { status: 409 });
    }

    return NextResponse.json({
      nickname: completed.nickname,
      cpm: completed.cpm,
      accuracy: completed.accuracy,
      durationMs: completed.duration_ms,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "결과를 저장하지 못했어요. 운영 스태프에게 알려주세요." },
      { status: 500 },
    );
  }
}
