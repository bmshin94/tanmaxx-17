# TanMaxx 전수조사 & 활용 전략 정리

> 작성일: 2026-09-28
> 분석 대상 저장소: <https://github.com/bmshin94/tanmaxx-17>
> 원본(업스트림) 저장소: <https://github.com/jherr/tanmaxx> (by Jack Herrington)
> 시드 데이터 출처: <https://github.com/yuhonas/free-exercise-db> (Public Domain)

---

## 목차

1. [프로젝트 정체 분석](#1-프로젝트-정체-분석)
2. [쉬운 비유 설명](#2-쉬운-비유-설명)
3. [Q&A 7문](#3-qa-7문)
4. [수익화 아이디어](#4-수익화-아이디어)
5. [참고 링크](#5-참고-링크)

---

## 1. 프로젝트 정체 분석

### 1.1 한 줄 요약

**TanMaxx는 "헬스 운동 기록 앱"의 형태를 빌린, TanStack 생태계 17개 라이브러리 전체를 한 앱에 담은 기술 데모 쇼케이스다.**

`packages/skill/package.json`의 `repository.url`이 `git+https://github.com/jherr/tanmaxx.git`로 되어 있어 원본 제작자가 Jack Herrington(유튜브 "Blue Collar Coder")임을 확인했다. README 첫 줄에 *"Built as the demo app for the 'tanmaxx' video — a tour of TanStack in a silly format"* 라고 명시되어 있다.

### 1.2 실측 정보

| 항목 | 값 |
|---|---|
| 패키지 매니저 | pnpm 9.0.0 (모노레포) |
| 워크스페이스 | `apps/*`, `packages/*` |
| TypeScript 코드량 | 약 3,814줄 (시드 JSON 제외) |
| 시드 데이터 | `free-exercise-db.json` 980KB → 5,238행으로 팬아웃 |
| DB | SQLite + Drizzle ORM (테이블 4개) |
| 런타임 요구사항 | Node 24+ (`--experimental-strip-types`) |
| 인증 | **없음** (단일 사용자 전용) |
| AI 제공자 | Anthropic (`@tanstack/ai-anthropic`) |

### 1.3 폴더 구조 (실제 확인)

```
tanmaxx-17/
├── apps/web/                          # TanStack Start 앱
│   ├── src/
│   │   ├── routes/                    # 파일 기반 라우트
│   │   │   ├── index.tsx              # 대시보드
│   │   │   ├── exercises.tsx          # 5,238행 가상 스크롤
│   │   │   ├── history.tsx            # 정렬 테이블
│   │   │   ├── programs.tsx / $id     # 프로그램
│   │   │   ├── session.$id.tsx        # 단축키 기반 세트 로거
│   │   │   ├── agent.tsx              # AI 채팅
│   │   │   └── api/
│   │   │       ├── chat.ts            # SSE 스트리밍 챗
│   │   │       └── parse-set.ts       # 자연어 → 세트 파싱
│   │   ├── server/
│   │   │   ├── db/{client,schema}.ts  # Drizzle 스키마
│   │   │   ├── ai/{anthropic,tools}.ts
│   │   │   ├── functions/             # 서버 함수 9개
│   │   │   │   └── _metadata.ts       # ★ 단일 진실 공급원
│   │   │   ├── workflows/
│   │   │   │   └── generate-program.ts # 4단계 워크플로우
│   │   │   └── seed/
│   │   ├── db/collections.ts          # @tanstack/db 컬렉션
│   │   ├── state/{maxx,session,sync}-store.ts
│   │   ├── components/Maxx/           # 슬라이더 + 티어 정의
│   │   ├── hooks/{use-app-hotkeys,use-maxx-style}.ts
│   │   └── lib/{lib-registry,route-libraries,...}.ts
│   ├── scripts/generate-skill.ts      # ★ SKILL.md 자동 생성기
│   └── public/fonts/anton.woff2       # GIGAMAXX 전용 폰트
├── packages/
│   ├── shared/                        # Zod 스키마 공유
│   └── skill/
│       └── skills/tanmaxx-core/SKILL.md  # ★ 에이전트용 명함
├── AGENTS.md                          # intent-skills 블록 포함
└── CLAUDE.md
```

### 1.4 라이브러리 매트릭스 17종

| # | 라이브러리 | 앱에서의 역할 |
|---|---|---|
| 1 | CLI (`create-tanstack`) | 초기 스캐폴딩 |
| 2 | Config (`@tanstack/config`) | 빌드/린트 프리셋 (opt-in) |
| 3 | Start | 앱 셸, SSR, 서버 함수, API 라우트 |
| 4 | Router | 파일 기반 라우팅, 타입 안전 내비게이션 |
| 5 | Store | Maxx 값 / 세션 / 싱크 카운터 |
| 6 | Query | 서버 데이터 캐싱 + SSR 통합 |
| 7 | Virtual | `/exercises` 5,238행 가상화 |
| 8 | Table | `/history` 정렬 뷰 |
| 9 | Form | `/session/$id` 실시간 세트 입력 |
| 10 | DB | 낙관적 업데이트 리액티브 컬렉션 |
| 11 | Pacer | 검색 250ms 디바운스 |
| 12 | Hotkeys | 키보드 로깅 + vim 연속키(`gg`/`gh`/`gs`) |
| 13 | AI (`@tanstack/ai`) | 자연어 파싱, 챗, 프로그램 생성 |
| 14 | Ranger | The Maxx 두 손잡이 슬라이더 |
| 15 | **Intent** | `packages/skill`을 에이전트에 노출 |
| 16 | Devtools | 스택형 패널 |
| 17 | **Workflow** | `generateProgram` 4단계 durable workflow |

> 참고: 커밋 히스토리(`31dec41 feat(ai): swap Vercel AI SDK for @tanstack/ai`)를 보면 원래 Vercel AI SDK를 쓰다가 `@tanstack/ai`로 교체했다. README 표는 아직 옛 정보(Vercel `ai` + `@ai-sdk/anthropic`)를 담고 있어 `package.json`과 불일치한다.

### 1.5 The Maxx — 테마 엔진

0~110 범위의 두 손잡이 슬라이더 하나가 **AI 프롬프트의 강도(%1RM)와 앱 전체의 시각 스타일을 동시에** 조종한다.

| 범위 | 티어 | 분위기 |
|---|---|---|
| 0–20 | `deload` | apologetic |
| 20–40 | `Volume` | calm |
| 40–60 | `Hypertrophy` | normal |
| 60–75 | `Strength` | bolder |
| 75–90 | `Peaking` | heavier, redder |
| 90–100 | `SENDMODE` | condensed |
| 100–105 | `GIGAMAXX` | display font, 3x |
| 105–110 | `INJURY ZONE` | red pulse, shake |

**구현 방식**: `use-maxx-style.ts`가 HSL 삼중항과 스칼라 값을 앵커 기반 선형보간(`lerpAtAnchors` / `lerpHslAtAnchors`)으로 계산해 `document.documentElement`의 CSS 변수에 직접 주입한다.

```
--maxx-accent      HSL 보간 (200,80,55) → (0,95,50) → (300,100,60)
--maxx-font-scale  1 → 1.4 → 2.2
--maxx-tracking    0 → -0.02em → 0.08em
--maxx-weight      400 → 900
--maxx-shake       0 → 0 → 3px
--maxx-italic      0 → 0 → -8deg
--maxx-glow        upper >= 90부터 발광
--maxx-stroke      upper >= 100부터 외곽선
```

React 리렌더 없이 CSS 변수만 갱신하므로 슬라이더 조작이 매끄럽다. 상태는 `localStorage['tanmaxx.maxx']`에 저장되고, React 부팅 전 인라인 스크립트로 복원해 FOUC를 막는다.

### 1.6 핵심 아키텍처 — 메타데이터 단일 소스

```
apps/web/src/server/functions/_metadata.ts
         │  (Zod 스키마 + 설명 + method/url + 예시)
         │
         ├──→ apps/web/src/server/ai/tools.ts      (AI 툴 정의)
         ├──→ packages/skill/.../SKILL.md          (pnpm gen:skill로 자동 생성)
         ├──→ 런타임 입력 검증                       (Zod 그대로 재사용)
         └──→ TypeScript 타입                       (z.infer)
```

`scripts/generate-skill.ts`가 `toJSONSchema(meta.inputSchema, { target: 'draft-07' })`로 Zod를 JSON Schema로 변환해 SKILL.md를 렌더링한다. 문서 하단에 *"This file is auto-generated ... Do not edit by hand."* 가 박혀 있다.

### 1.7 에이전트 노출 API 3종

| 함수 | Method | URL | 입력 |
|---|---|---|---|
| `logSet` | POST | `/api/serverFn/log-set` | `{sessionId, exerciseId, weight, reps, rpe}` |
| `queryPRs` | GET | `/api/serverFn/list-prs` | `{}` |
| `generateProgram` | POST | `/api/serverFn/generate-program` | `{weeks: 1-16, focus: string}` |

### 1.8 워크플로우 관측성

`generate-program.ts`의 4단계:

```
fetchHistory    → PR 상위 10개 + 최근 기록 10개 병렬 조회
proposeStructure→ Claude Sonnet으로 구조화 출력 (maxTokens: 8192)
validate        → 엄격한 programSchema.parse()
persist         → SQLite insert
```

`runWorkflow()`의 이벤트 스트림(`STEP_STARTED` / `STEP_FINISHED` / `STEP_FAILED` / `RUN_FINISHED` / `RUN_ERRORED`)을 소비해 단계별 `durationMs`와 에러를 `WorkflowStepReport[]`로 수집, 클라이언트까지 전달한다.

### 1.9 코드에 남은 실전 지식 (주석에서 발췌)

- **Anthropic 구조화 출력은 JSON Schema의 `minimum`/`maximum`/`multipleOf`를 거부한다.** → 느슨한 `programAiSchema`로 형태만 맞추고, 워크플로우 `validate` 단계에서 엄격한 `programSchema`로 재검증.
- **다주차 프로그램은 어댑터 기본 1024토큰 상한을 훌쩍 넘는다.** → `maxTokens: 8192` 미지정 시 `stop_reason: max_tokens`로 잘려서 결과가 안 나옴.
- **낙관적 업데이트 시 클라이언트 생성 id와 timestamp를 서버로 넘겨야 한다.** → 안 그러면 쿼리 리페치 때 유령 중복 행이 생김.
- **모델 티어링**: 단순 파싱은 `claude-haiku-4-5`, 복잡한 추론은 `claude-sonnet-4-6`.

### 1.10 나에게 주는 가치

1. 살아있는 최신 TanStack 레퍼런스 (문서에 없는 0.0.x 라이브러리 실사용 예)
2. 메타데이터 1곳 → 툴/문서/검증/타입 4곳 자동 파생 패턴 (어디든 이식 가능)
3. 키보드 우선 UX(연속키 포함) 구현 레퍼런스
4. AI 호출을 관측 가능한 단계로 쪼개는 워크플로우 패턴
5. "기술 데모를 재미있게 만드는 법" 자체가 교재

---

## 2. 쉬운 비유 설명

### 2.1 전체 비유 — "17개 재료를 다 넣은 요리"

TanStack이라는 식자재 회사가 재료를 17종 판다. 손님들이 "다 같이 쓰면 어떻게 되냐"고 묻자 셰프가 17개를 한 접시에 다 넣은 요리를 만들었다. 요리 이름은 "헬스 기록 앱"이지만 진짜 목적은 재료 자랑이다.

### 2.2 부품별 비유

| 부품 | 비유 | 설명 |
|---|---|---|
| SQLite | 📦 창고 | 컴퓨터의 파일 하나가 DB. 서버 설치 불필요 |
| 서버 함수 | 🧑‍💼 창고 직원 | React에서 함수처럼 부르지만 실제론 서버 실행 |
| Query | 🧊 냉장고 | 한 번 가져온 데이터 보관, 재요청 시 즉시 반환 |
| Virtual | 🪟 창문 | 5,238개 중 보이는 20개만 실제로 그림 |
| Pacer | ⏳ 참을성 | 타이핑 멈추고 250ms 후 한 번만 검색 |
| DB 컬렉션 | 🏃 눈치 빠른 웨이터 | 화면 먼저 갱신, 서버 저장은 뒤에서 (낙관적 업데이트) |
| Store | 📝 포스트잇 | 타이머·현재 운동 같은 임시 메모 |
| Hotkeys | ⌨️ 단축키 비서 | 장갑 낀 손으로도 Space 한 번에 기록 |
| AI | 🗣️ 통역사 | "삼세트 다섯개 이백이십오" → `{weight:225, reps:5}` |
| Workflow | 🏭 조립 라인 | 4칸으로 쪼개서 어디서 몇 초 걸렸는지 추적 |
| SKILL.md | 💳 명함 | "저희 앱은 이렇게 호출하세요" 설명서 |

### 2.3 워크플로우를 조립 라인으로 보면

```
[1] 기록 가져오기 → [2] AI 초안 작성 → [3] 검증 → [4] 저장
    ~0.2초             ~8초              ~0.01초    ~0.05초
```

각 칸마다 소요 시간과 성공/실패가 기록되므로, 터졌을 때 몇 번 칸에서 터졌는지 즉시 알 수 있다.

### 2.4 실사용 시나리오

```
헬스장에서:
 1. /session/abc 를 띄워둔다
 2. 스쿼트 수행 → Space → 즉시 기록 (화면 바로 반영)
 3. 무거우면 ↑↑ → +10lb
 4. r → 90초 휴식 타이머
 5. Maxx 슬라이더 105 → 화면이 빨개지고 흔들린다
 6. /agent 에서 "6주 하이퍼트로피 프로그램 짜줘"
    → AI가 PR 기록을 읽고 Maxx 강도 범위로 프로그램 생성
```

---

## 3. Q&A 7문

### Q1. 설치 및 사용법

**준비물**: Node.js 24+, pnpm, Anthropic API 키

```bash
pnpm install
echo "ANTHROPIC_API_KEY=sk-ant-..." > apps/web/.env.local
pnpm --filter @tanmaxx/web exec drizzle-kit push   # SQLite 스키마 생성
pnpm --filter @tanmaxx/web seed                    # 5,238 운동 + 데모 데이터
pnpm dev                                           # http://localhost:3000
```

**스크립트 목록**

| 명령어 | 용도 |
|---|---|
| `pnpm dev` | 개발 서버 (:3000) |
| `pnpm build` | Nitro 프로덕션 빌드 |
| `pnpm typecheck` | 전 워크스페이스 타입 체크 |
| `pnpm test` | vitest |
| `pnpm gen:skill` | SKILL.md 재생성 |
| `pnpm skill:list` | `intent list` — 스킬 탐색 |
| `pnpm skill:validate` | 스킬 front-matter 검증 |
| `pnpm skill:publish` | npm 배포 |

**함정**

- `skill:*` 스크립트는 반드시 **레포 루트**에서 실행 (워크스페이스 전체 스캔 필요)
- Node 22 이하에서는 `seed` 스크립트가 실패
- `.gitignore`에 `.env`, `*.local` 모두 포함 → 키 커밋 위험 없음
- `nitro: "npm:nitro-nightly@latest"` — 나이틀리 의존성, 언제든 깨질 수 있음

### Q2. 플러그인 / 스킬 / MCP 중 무엇인가?

**정답: 셋 다 아님. "Agent Skill을 품은 독립 웹 애플리케이션"이다.**

| 구분 | 해당 여부 | 근거 |
|---|---|---|
| 플러그인 | ❌ | 호스트 프로그램에 끼우는 구조가 아님 |
| MCP 서버 | ❌ | `@modelcontextprotocol` 의존성 0개, JSON-RPC 코드 없음 |
| Agent Skill | ⭕ 일부 | `packages/skill`이 `@tanstack/intent` 규격 스킬 패키지 |
| 웹 애플리케이션 | ✅ 본체 | TanStack Start 풀스택 앱 |

**MCP vs Intent Skill 비교**

| | MCP | Intent Skill |
|---|---|---|
| 전달 방식 | 서버 프로세스 + JSON-RPC | 마크다운 문서 |
| 실행 | 별도 프로세스 필요 | 불필요 |
| 배포 | MCP 설정 파일 등록 | npm 패키지 |
| 토큰 | 툴 정의가 항상 컨텍스트에 상주 | 필요할 때만 로드 |
| 호출 | 프로토콜 경유 | 평범한 HTTP POST |

**에이전트에 연결하는 법**

```bash
pnpm dlx @tanstack/intent@latest install --dry-run  # 미리보기
pnpm dlx @tanstack/intent@latest install            # AGENTS.md에 기록
pnpm dlx @tanstack/intent@latest load @tanmaxx/skill#tanmaxx-core
```

Cursor는 `AGENTS.md`를, Claude Code는 `CLAUDE.md`를 읽는다. `<!-- intent-skills:start -->…<!-- intent-skills:end -->` 블록을 복사해 넣으면 된다. (이 레포의 `AGENTS.md`에 이미 존재)

### Q3. API 토큰이 필요한가?

**AI 기능 3개에만 필요하다.**

| 기능 | 경로 | 모델 |
|---|---|---|
| 자연어 세트 입력 | `/api/parse-set` | `claude-haiku-4-5` |
| AI 코치 채팅 | `/api/chat` | `claude-sonnet-4-6` |
| 프로그램 자동 생성 | `generate-program` 워크플로우 | `claude-sonnet-4-6` (maxTokens 8192) |

**키 없이도 동작하는 것**: 운동 카탈로그, 수동 세트 기록, 히스토리/PR 조회, The Maxx 테마 엔진 전체, 모든 단축키, Devtools.

**보안**

- 키는 `apps/web/.env.local` → `.gitignore` 처리됨
- 모든 AI 호출이 서버 사이드에서만 발생, 브라우저 노출 없음
- **인증이 전혀 없으므로 공개 인터넷에 그대로 배포하면 안 된다**

**제공자 교체**: `apps/web/src/server/ai/anthropic.ts`는 상수 2줄뿐이고 `@tanstack/ai`가 어댑터 패턴이라 교체는 가능하다. 다만 Anthropic 구조화 출력 제약(숫자 키워드 거부)에 맞춰 스키마를 느슨하게 짜둔 부분은 손봐야 한다.

### Q4. 왜 GitHub에서 유명한가?

1. **제작자 네임밸류** — Jack Herrington, 유튜브 수십만 구독 React 교육자
2. **"17개 전부"의 희소성** — 보통 데모는 1~2개만 다룸. 생태계 전체를 한 앱에 담은 유일한 자료
3. **미공개·초기 라이브러리 선점** — `react-ranger@0.0.5`, `workflow-core@0.0.3`, `intent@0.0.41`. 실사용 예제가 인터넷에 사실상 없음
4. **유머로 인한 공유력** — GIGAMAXX / INJURY ZONE / `vibe: 'apologetic'`. GIF 한 장으로 바이럴되기 좋은 구조
5. **코드 품질** — 주석에 실제 삽질 기록(토큰 상한, 스키마 제약, 유령 중복 행)이 남아 있어 실무 지식으로서 가치가 큼
6. **타이밍** — "AI 에이전트가 앱을 조종하는" 패턴이 부상하는 시기에 Skill/Intent를 실제로 구현한 몇 안 되는 예제

### Q5. 로컬 에이전트 구축에 도움이 되는가?

**통째로 쓰는 게 아니라 패턴을 이식하는 방식으로 매우 유용하다.**

| 가져올 패턴 | 가치 | 내용 |
|---|---|---|
| 메타데이터 단일 소스 | ★★★★★ | `_metadata.ts` 한 곳 → 툴/문서/검증/타입 4곳 자동 파생 |
| 워크플로우 관측성 | ★★★★★ | 단계별 `durationMs`/실패 추적 + UI 스트리밍 |
| 느슨한 스키마 → 엄격 검증 | ★★★★☆ | 제공자별 JSON Schema 지원 차이를 우회 |
| 모델 티어링 | ★★★★☆ | 단순 작업 Haiku / 복잡 작업 Sonnet |

**주의점**

- MCP가 아니므로 Claude Desktop에 바로 꽂을 수 없다 (별도 래핑 필요)
- 인증 없음 → 로컬 전용
- 나이틀리 의존성이 많아 프로덕션 직행은 위험
- Intent는 0.0.x라 API가 바뀔 수 있음

**추천 진행 루트**

```
1단계: 클론 → 실행 → /agent 에서 툴 호출 관찰
2단계: _metadata.ts 패턴만 떼서 내 프로젝트에 이식
3단계: generate-skill.ts 방식으로 나만의 SKILL.md 생성기 제작
4단계: 그것을 MCP 서버로도 래핑 → 양쪽 모두 지원
```

### Q6. 수익화 아이디어가 있는가?

앱 자체는 수익화가 어렵다(인증 없음, 단일 유저, 레드오션 시장). **패턴과 인프라를 파는 방향**이 현실적이다. → [4장](#4-수익화-아이디어) 참고

### Q7. React나 PHP로 만들 수 있는가?

**React — 이미 React 19로 만들어져 있다.** "TanStack 없이 평범한 React로 재구현" 기준 대체표:

| TanStack | 대체재 | 난이도 |
|---|---|---|
| Start | Next.js / Remix | 쉬움 |
| Router | React Router | 쉬움 |
| Query | SWR / RTK Query | 쉬움 |
| Store | Zustand / Jotai | 쉬움 |
| Table | 직접 구현 | 보통 |
| Virtual | react-window | 쉬움 |
| Form | react-hook-form | 쉬움 |
| Pacer | lodash.debounce | 쉬움 |
| Hotkeys | react-hotkeys-hook | 보통 (연속키가 까다로움) |
| DB | 직접 구현 | **어려움** |
| Ranger | rc-slider | 쉬움 |
| Workflow | 직접 구현 | 보통 |
| AI | Vercel AI SDK | 쉬움 |

결론: 90%는 1:1 대체 가능. 낙관적 업데이트 컬렉션(DB)만 난이도가 높다. Next.js 재구현 시 약 2~3주.

**PHP — 가능하되 영역을 나눠야 한다.**

- 잘 되는 부분: SQLite CRUD(PDO), REST 엔드포인트, Anthropic cURL 호출, SKILL.md 생성 스크립트, **인증/결제(Laravel이 오히려 유리)**
- 힘든 부분: 가상 스크롤(프론트는 어차피 JS), SSE 스트리밍(PHP-FPM과 궁합 나쁨 — Swoole/ReactPHP 필요), 실시간 테마 엔진(100% 클라이언트 JS), 낙관적 업데이트

**추천 조합**

```
프론트엔드 : React (Vite) — Maxx 슬라이더, 가상 스크롤, 단축키
백엔드     : Laravel — DB, 인증, 결제, 스킬 생성기
AI 스트리밍: 소형 Node 서비스 or Laravel Octane
```

`Laravel + Inertia.js + React` 조합이 가장 현실적이다.

---

## 4. 수익화 아이디어

### 4.0 전제

레포를 그대로 상품화하면 안 되는 이유: 인증 없음, 멀티테넌시 없음, 나이틀리 의존성, 원본 라이선스 확인 필요, 헬스 앱 시장 레드오션(Hevy/Strong/JEFIT).

→ **"앱"이 아니라 "여기서 배운 패턴"을 판다.**

### 4.1 티어 1 — 즉시 시작 가능

#### 아이디어 1. Agent-Ready SaaS 스타터킷

> "당신의 SaaS를 AI 에이전트가 조종할 수 있게 만드는 보일러플레이트"

포함: 메타데이터 → 툴 + SKILL.md + MCP 서버 3중 자동 생성 / Zod 단일 소스 / 워크플로우 관측 대시보드 / **인증 + 멀티테넌시(원본에 없는 것)** / 토큰·비용 추적 / 영상 강의 10편

| 항목 | 값 |
|---|---|
| 가격 | $149(개인) / $499(팀) |
| 채널 | Gumroad, Lemon Squeezy |
| 목표 | 월 30개 = **$4,500/월** |
| 개발 | 4~6주 |
| 경쟁 | Intent 패턴 스타터킷 사실상 전무 |

근거: ShipFast($199)가 수만 개 팔린 시장. 그러나 "AI 에이전트 연동"을 제대로 다룬 스타터킷은 아직 공백이다.

#### 아이디어 2. Skill/MCP 자동 생성 도구 (오픈코어)

```bash
npx skillgen scan ./src/api
# → SKILL.md / MCP 서버 코드 / OpenAPI 스펙 생성
```

| 플랜 | 가격 | 내용 |
|---|---|---|
| Free | $0 | CLI 오픈소스, 로컬 생성 |
| Pro | $19/월 | 스킬 호스팅, 버전 관리, 팀 공유 |
| Team | $99/월 | SSO, 감사 로그, 프라이빗 레지스트리 |
| Enterprise | 협의 | 온프레미스 |

목표: 유료 100명 = **$1,900/월**, 1년 내 $10K MRR 가능. 무료 CLI가 마케팅 채널이 되는 Prisma/Supabase형 전략.

#### 아이디어 3. 교육 콘텐츠

| 상품 | 가격 | 비고 |
|---|---|---|
| 유튜브 시리즈 | 광고 + 스폰서 | "TanStack 17개 정복" 한국어 |
| 인프런/유데미 강의 | ₩88,000 | 6시간 분량 |
| 유료 뉴스레터 | $9/월 | 주 1회 에이전트 패턴 |
| 전자책 | $39 | "Agent-Ready Architecture" |

**한국어 TanStack Start + AI 에이전트 강의가 사실상 없다** → 블루오션. 강의 하나로 월 ₩200~500만 가능.

### 4.2 티어 2 — 중기 (3~6개월)

#### 아이디어 4. 버티컬 SaaS 전환

| 업종 | 제품 | 타겟 | 가격 |
|---|---|---|---|
| 피트니스 | PT 회원 관리 + AI 프로그램 | PT샵 | ₩49,000/월 |
| 요식업 | 레시피/원가 + AI 메뉴 제안 | 소규모 식당 | ₩39,000/월 |
| 재활 | 운동 처방 + 경과 추적 | 물리치료 병원 | ₩150,000/월 |
| 교육 | 학습 진도 + AI 커리큘럼 | 학원 | ₩79,000/월 |

차별점: *"AI 에이전트가 직접 조종 가능한 SaaS"*. 원장이 Claude에게 "이번 달 회원 진도 정리해줘"라고 하면 실제로 동작한다.

**추천: 재활/물리치료** — 객단가 높고 B2B라 이탈률 낮으며 경쟁이 적다. 병원 20곳 = 월 300만원.

#### 아이디어 5. 컨설팅 / 수주

| 서비스 | 가격 | 기간 |
|---|---|---|
| SaaS 에이전트 연동 컨설팅 | ₩500만 | 2주 |
| MCP 서버 구축 대행 | ₩300~800만 | 3~4주 |
| TanStack 마이그레이션 | ₩1,000만~ | 6주 |
| 사내 교육 (1일) | ₩200만 | 1일 |

월 1건만 수주해도 500만원. 실전 경험이 티어1 상품 품질로 환원되는 선순환.

### 4.3 티어 3 — 장기 (1년+)

#### 아이디어 6. Agent Skill 마켓플레이스

"에이전트 스킬의 npm" — 검색/발견, 버전·호환성 관리, 유료 스킬 판매(수수료 20%), 사용량 분석, 보안 감사. 리스크는 높지만 Intent/MCP 생태계 확장기가 타이밍.

#### 아이디어 7. 에이전트 관측성 SaaS

"AI 에이전트용 Datadog" — 단계별 소요시간/실패율, 토큰 비용 추적 + 예산 알림, 프롬프트 A/B 테스트, 툴 호출 성공률. 가격 $49~$499/월. 경쟁(LangSmith, Helicone) 대비 Anthropic 특화로 차별화.

### 4.4 종합 비교

| # | 아이디어 | 초기투자 | 회수속도 | 잠재수익 | 리스크 | 추천도 |
|---|---|---|---|---|---|---|
| 1 | 스타터킷 | 중 | 빠름 | $5K/월 | 낮음 | ★★★★★ |
| 2 | 생성 도구 | 중 | 보통 | $10K/월 | 중 | ★★★★★ |
| 3 | 교육 | 낮음 | 빠름 | ₩500만/월 | 낮음 | ★★★★★ |
| 4 | 버티컬 SaaS | 높음 | 느림 | ₩1,000만/월 | 중 | ★★★★ |
| 5 | 컨설팅 | 낮음 | 즉시 | ₩500만/월 | 낮음 | ★★★★ |
| 6 | 마켓플레이스 | 매우높음 | 매우느림 | 무제한 | 높음 | ★★ |
| 7 | 관측성 | 높음 | 느림 | $20K/월 | 중 | ★★★ |

### 4.5 권장 실행 순서

```
[0~1개월] 교육 콘텐츠 (#3)   → 비용 0원, 신뢰도 + 잠재고객 확보
[1~3개월] 스타터킷 (#1)      → 시청자 대상 판매, 첫 매출
[2~4개월] 컨설팅 (#5)        → 콘텐츠 유입 문의, 고액 수주
[4~12개월] 생성 도구 SaaS (#2) → 반복 수익(MRR) 확보
```

핵심 전략: **콘텐츠로 신뢰 → 제품으로 수익 → SaaS로 확장**

---

## 5. 참고 링크

| 대상 | URL |
|---|---|
| 이 저장소 | <https://github.com/bmshin94/tanmaxx-17> |
| 원본(업스트림) | <https://github.com/jherr/tanmaxx> |
| 시드 데이터 (Public Domain) | <https://github.com/yuhonas/free-exercise-db> |
| TanStack 공식 | <https://tanstack.com> |
| TanStack Start | <https://tanstack.com/start> |
| TanStack Router | <https://tanstack.com/router> |
| TanStack Query | <https://tanstack.com/query> |
| TanStack Table | <https://tanstack.com/table> |
| TanStack Virtual | <https://tanstack.com/virtual> |
| TanStack Form | <https://tanstack.com/form> |
| TanStack Store | <https://tanstack.com/store> |
| TanStack DB | <https://tanstack.com/db> |
| TanStack Pacer | <https://tanstack.com/pacer> |
| TanStack Ranger | <https://tanstack.com/ranger> |
| Anthropic API 문서 | <https://docs.anthropic.com> |
| Model Context Protocol | <https://modelcontextprotocol.io> |
| Anton 폰트 (SIL OFL) | <https://fonts.google.com/specimen/Anton> |

---

*이 문서는 저장소 전체를 파일 단위로 열람한 뒤 작성되었습니다. 수익 추정치는 시장 벤치마크에 기반한 가정치이며 보장된 수치가 아닙니다.*
