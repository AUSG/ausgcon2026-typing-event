# AUSGCON 2026 Typing Event

AUSGCON 2026 행사장 타건 부스용 영문 타이핑 게임입니다. 참가자는 무작위로 제시되는 2~3줄의 개발 관련 문장을 입력하고, 정확히 완성한 기록의 CPM(분당 타수)으로 순위를 겨룹니다.

## 주요 동작

- 12개의 개발 문장 중 서버가 무작위 출제
- 닉네임당 1회만 도전 가능
- 시작 시 도전권을 DB에 예약하여 새로고침 재도전 방지
- 영문 대소문자, 공백, 줄바꿈, 기호까지 일치해야 완료
- CPM 우선, 정확도, 완료 시각 순으로 순위 결정
- 여러 행사장 노트북이 하나의 Supabase 순위를 공유
- 리더보드 5초 자동 동기화

## 로컬 실행

```bash
npm install
cp .env.example .env.local
npm run dev
```

Supabase 환경변수가 없으면 개발 편의를 위해 인메모리 저장소를 사용합니다. 이 기록은 서버 재시작 시 사라지므로 행사 운영에는 사용할 수 없습니다.

## Supabase 연결

1. Supabase에서 새 프로젝트를 생성합니다.
2. SQL Editor에서 [`supabase/schema.sql`](./supabase/schema.sql)을 실행합니다.
3. Project Settings → API에서 Project URL과 `service_role` 키를 확인합니다.
4. `.env.local` 또는 Vercel 환경변수에 다음 값을 등록합니다.

```dotenv
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL=https://YOUR_DOMAIN
```

`SUPABASE_SERVICE_ROLE_KEY`는 절대로 `NEXT_PUBLIC_` 접두사를 붙이거나 브라우저 코드에 사용하면 안 됩니다. 현재 앱은 이 키를 서버 Route Handler에서만 읽습니다.

## Vercel 배포

1. 이 GitHub 저장소를 Vercel에 Import합니다.
2. Framework Preset은 Next.js를 사용합니다.
3. 위 환경변수 3개를 Production 환경에 등록합니다.
4. 배포 후 서로 다른 브라우저에서 동일 닉네임으로 시작해 두 번째 요청이 차단되는지 확인합니다.
5. 행사 전 여러 맥북에서 기록이 동일한 리더보드에 표시되는지 리허설합니다.

## 운영 체크리스트

- 행사장 Wi-Fi 및 Vercel/Supabase 접속 사전 확인
- 모든 맥북에서 영문 키보드 입력과 줄바꿈 동작 확인
- 운영 시작 전 테스트 레코드 삭제
- Supabase Table Editor에서 비정상/중단된 `active` 기록 처리
- `service_role` 키가 화면이나 Git 기록에 노출되지 않았는지 확인

