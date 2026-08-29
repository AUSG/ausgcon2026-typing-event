export type TypingPrompt = {
  id: number;
  lines: [string, string] | [string, string, string];
};

export const PROMPTS: TypingPrompt[] = [
  {
    id: 1,
    lines: [
      "어제까지 잘 되던 코드가 오늘 갑자기 안 된다면, 일단 침착하게 커피를 내리고 아무것도 안 바꿨다는 말을 준비한다.",
      "그리고 깃 기록에서 새벽 두 시의 나를 발견한다.",
    ],
  },
  {
    id: 2,
    lines: [
      "개발자는 버그를 만들지 않는다. 아직 문서화되지 않은 기능을 아주 창의적인 위치에 숨겨둘 뿐이다.",
      "물론 운영 서버에서 발견되기 전까지만 그렇다.",
    ],
  },
  {
    id: 3,
    lines: [
      "재현이 안 되는 버그는 고친 버그가 아니라 잠깐 외출한 버그다.",
      "로그를 더 심고 기다리면 꼭 가장 바쁜 금요일 오후에 건강한 모습으로 돌아온다.",
    ],
  },
  {
    id: 4,
    lines: [
      "캐시를 지웠더니 해결됐고 다시 켰더니 또 해결됐다. 원인은 모르겠지만 이제 모두가 나를 해결사라고 부른다.",
      "나는 조용히 브라우저를 닫았다.",
    ],
  },
  {
    id: 5,
    lines: [
      "기획자는 버튼 하나만 옮기면 된다고 했고, 디자이너는 색만 바꾸면 된다고 했다.",
      "개발자는 데이터베이스 마이그레이션 계획부터 다시 쓰기 시작했다.",
    ],
  },
  {
    id: 6,
    lines: [
      "커밋 메시지에 임시라고 적힌 코드는 높은 확률로 서비스의 핵심이 된다.",
      "건드리면 왜 되는지 설명해야 하므로 우리는 그것을 레거시가 아니라 전통이라고 부른다.",
    ],
  },
  {
    id: 7,
    lines: [
      "배포 버튼을 누른 사람은 아무 말이 없고, 슬랙 알림만 힘차게 울린다.",
      "모두가 모니터를 바라보는 십 초 동안 개발팀의 단합력은 어느 때보다 강해진다.",
    ],
  },
  {
    id: 8,
    lines: [
      "테스트 코드는 미래의 나에게 보내는 편지다. 편지를 쓰지 않은 과거의 나를 원망하며 오늘의 나는 디버거를 켠다.",
      "그리고 미래의 나도 같은 선택을 할 것이다.",
    ],
  },
  {
    id: 9,
    lines: [
      "회의에서 나온 간단한 아이디어는 티켓 세 장이 되고, 티켓 세 장은 스프린트 두 개가 된다.",
      "그래도 데모가 성공하면 우리는 처음부터 계획대로였다고 고개를 끄덕인다.",
    ],
  },
  {
    id: 10,
    lines: [
      "주석에는 절대 지우지 말라고 적혀 있었지만 이유는 없었다. 용감한 개발자가 지운 순간 빌드는 성공했고 결제 서버가 멈췄다.",
      "주석에는 이제 느낌표가 세 개 붙었다.",
    ],
  },
  {
    id: 11,
    lines: [
      "로컬에서는 완벽했고 스테이징에서도 완벽했다. 운영에서만 실패한다면 운영 서버가 요구사항을 제대로 이해하지 못한 것이다.",
      "잠깐만, 환경 변수는 누가 넣었지?",
    ],
  },
  {
    id: 12,
    lines: [
      "예상 작업 시간은 두 시간이었고 실제 작업 시간도 두 시간이었다.",
      "단, 원인을 찾는 데 이틀이 걸렸고 수정은 한 줄이었으며 코드 리뷰에는 사흘이 더 필요했다.",
    ],
  },
];

export function promptText(prompt: TypingPrompt) {
  // Lines are a content-authoring aid. Players should never have to guess where
  // an invisible newline belongs, so the playable prompt is one continuous line.
  return prompt.lines.join(" ");
}

export function getRandomPrompt() {
  return PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
}

export function getPrompt(id: number) {
  return PROMPTS.find((prompt) => prompt.id === id);
}
