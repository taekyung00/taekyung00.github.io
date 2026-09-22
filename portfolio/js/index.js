// ── 노드 원형 배치 ────────────────────────────────────────────────
// DOM 순서가 곧 시계방향 배치 순서이고, 첫 노드가 12시(-90deg)에 놓인다.
// 노드를 추가/제거하면 각도·전환 방향·back 버튼 위치가 모두 여기서 다시
// 계산되므로, 나머지 노드는 손댈 필요가 없다.

// 애니메이션 시간의 단일 출처는 css/tokens.css 의 --dur-* 토큰이다.
// 여기서는 그 값을 읽어 setTimeout 에 쓰고, 인라인 transition 에는 var() 를
// 그대로 넘긴다. 속도를 바꾸려면 tokens.css 만 고치면 JS 도 따라온다.
function cssMs(token) {
    return parseFloat(getComputedStyle(document.documentElement).getPropertyValue(token)) * 1000;
}

// 대각선이 아닌(축에 가까운) 성분은 0으로 눌러 가장자리 중앙에 붙게 한다.
const axisSign = (v) => (Math.abs(v) < 0.35 ? 0 : Math.sign(v));

// 링 반지름(px). @property 로 등록해 둔 덕에 계산된 값이 나온다.
function nodeRadiusPx() {
    const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--node-radius"));
    if (!Number.isFinite(v) || v === 0) {
        console.warn("[hub] --node-radius 를 읽지 못했습니다(@property 미지원?)");
        return 345;
    }
    return v;
}

// 기본은 루트에서 읽지만, 요소를 넘기면 그 요소 기준으로 읽는다.
// 커스텀 속성은 상속되므로, 특정 섹션에만 값을 덮어쓰면 그 카드에만 적용된다.
function cssNum(token, el = document.documentElement) {
    return parseFloat(getComputedStyle(el).getPropertyValue(token));
}

function nodeButtons() {
    return [...document.querySelectorAll(".node-btn")];
}

// data-target 에 해당하는 노드가 원 위에서 놓인 각도. 없으면 null.
function nodeAngle(target) {
    const btns = nodeButtons();
    const i = btns.findIndex((b) => b.dataset.target === target);
    return i < 0 ? null : -90 + (360 / btns.length) * i;
}

(() => {
    const nav = document.querySelector(".node-nav");
    const btns = nodeButtons();
    nav.style.setProperty("--n", btns.length);
    btns.forEach((btn, i) => btn.style.setProperty("--i", i));

})();

document.addEventListener("DOMContentLoaded", () => {
    const views = document.querySelectorAll(".view");
    const nodeBtns = document.querySelectorAll(".node-btn");
    const centerGroup = document.querySelector(".center-group");
    const centerPlate = document.querySelector(".center-plate");
    const plateHint = document.querySelector(".plate-hint");
    
    // --- i18n ---
    // 영문은 index.html 의 내용이 원본이다. 최초 로드 때 DOM 에서 읽어두므로
    // 여기에 영문을 또 적지 않는다(예전엔 두 벌이 따로 놀아 6군데가 어긋나 있었다).
    // 새 문구를 추가할 때는 HTML 에 data-i18n 을 달고, 아래에 한국어만 넣으면 된다.
    const ko = {
            "home-title": "허태경",
            "home-subname": "Jean",
            "home-subtitle": "소프트웨어 엔지니어 & 그래픽스 엔지니어",
            "node-skills": "기술",
            "node-projects": "그래픽스",
            "node-resume": "이력서",
            "node-sns": "SNS",
            "node-about": "내 소개",
            "node-games": "게임 프로젝트",
            "about-title": "About Me",
            "about-subtitle": "학생 프로그래머 허태경",
            "about-p1": "사람들의 삶을 더 편하고 생산적으로 만드는, 믿을 수 있는 소프트웨어와 도구를 만드는 데 집중하는 컴퓨터과학 전공 학생 허태경입니다.",
            "about-p2": "가장 탄탄한 기반은 C++, 시스템, 컴퓨터 그래픽스, 소프트웨어 아키텍처입니다. 팀 프로젝트를 통해 자체 C++ 엔진을 만들고 리팩터링했으며, OpenGL 렌더링 시스템을 개발하면서 기술적 아이디어를 유지보수 가능한 소프트웨어로 옮기는 실무 경험을 쌓았습니다.",
            "skills-title": "보유 기술",
            "skill1-title": "C++ Systems Programming",
            "skill1-desc": "C++의 기초 문법부터 Modern C++의 최신 기능까지 깊이 있게 이해하고 활용합니다. 하드웨어와 밀접한 low-level 시스템 최적화 및 직접적인 메모리 관리는 물론, TMP(Template Metaprogramming)와 Modules 같은 고수준 추상화 기법을 활용하여 하드웨어 제어와 소프트웨어 설계의 균형을 맞춘 효율적인 프로그램을 개발합니다.",
            "skill2-title": "Computer Graphics Development",
            "skill2-desc": "2D 그래픽스 프로그래밍으로 기본 렌더링 파이프라인을 구축한 뒤 <b>OpenGL</b> 기반 3D로 역량을 확장했습니다. 공간 변환의 바탕이 되는 <b>선형대수</b>를 토대로 <b>shadow mapping</b>, <b>procedural geometric modeling</b>, <b>value/gradient noise</b>를 <b>GLSL</b>로 직접 구현했으며(Graphics 데모 참고), <b>Post-processing</b>과 <b>MSAA</b>로 시각적 품질과 성능을 함께 확보합니다.",
            "skill3-title": "Architecture Programming & Engine Development",
            // 사실관계는 resume-proj1/2 와 같아야 한다: ECS 뼈대는 10..9..8.., raylib->OpenGL 은 Dragonic Tactics
            "skill3-desc": "<b>10..9..8..</b>에서 엔진 아키텍처의 뼈대를 세웠습니다 — <b>ECS(Entity Component System)</b>를 중심으로 Singleton 패턴을 적용하고, 재사용 가능한 엔진 시스템과 게임플레이 로직을 분리했습니다. 이어 <b>Dragonic Tactics</b>에서는 엔진의 raylib 의존성을 걷어내고 <b>OpenGL</b>을 직접 연동한 백엔드로 교체해, 텍스처 매핑·<b>배치/인스턴스 렌더링</b>·가상 해상도를 갖춘 커스텀 2D 파이프라인을 구축하고 시스템 간 통신을 위한 <b>EventBus</b>를 설계했습니다.",
            "skills-tags-label": "언어 · 도구",
            "projects-title": "그래픽스 데모",
            "projects-subtitle": "2026년 상반기에 만든 OpenGL 3D 데모 — 고급 렌더링 기법과 실시간 셰이더 구현",
            "proj-date-hello": "5월 21일",
            "proj-date-meshes": "5월 30일",
            "proj-date-shadow": "6월 2일",
            "proj-date-gradient": "6월 9일",
            "proj-date-value": "6월 15일",
            "resume-title": "이력서",
            "resume-download": " PDF 다운로드",
            // 이력서 카드 — 순서·내용은 docs/Resume/Taekyung_Ho_Resume.pdf 기준
            "resume-edu-title": "학력",
            "resume-edu1": "<b>B.S. in Computer Science in Real-Time Interactive Simulation, DigiPen Institute of Technology</b><br>2028년 5월 졸업 예정 · GPA 3.96 / 4.0<br><em>미국 워싱턴주 레드먼드</em><br>주요 수강 과목: 자료구조, 알고리즘 분석, 운영체제, 컴퓨터 그래픽스 I & II, 선형대수",
            "resume-proj-title": "프로젝트",
            "resume-proj1": "<b>Dragonic Tactics — Producer & Engine/Graphics Engineer</b><br>2025년 9월 – 2026년 6월<br><em>2D 턴제 전술 RPG · C++, OpenGL</em><br>raylib 의존성을 걷어내고 <b>OpenGL</b>을 직접 연동해, 텍스처 매핑·배치 렌더링·인스턴스 렌더링·가상 해상도를 갖춘 2D 렌더링 파이프라인을 직접 구축했습니다. 시스템 간 통신을 위한 <b>EventBus</b>를 설계했고, 5인 팀의 Producer를 맡았습니다.",
            "resume-proj2": "<b>10..9..8.. — Technical Lead</b><br>2025년 봄<br><em>2D 던전 탐험 퍼즐 게임 · C++, raylib</em><br>\"10걸음\" 이동 제한을 핵심 규칙으로 삼은 퍼즐 게임입니다. DigiPen의 Game Implementation Techniques 과정에서 만든 자체 C++ 엔진 위에 <b>ECS</b>와 싱글턴 패턴을 적용하고, 재사용 가능한 엔진 시스템과 게임플레이 로직을 분리해 개발했습니다.",
            "resume-exp-title": "경력",
            "resume-exp1": "<b>ROMAD 전문가, 대한민국 공군</b><br>2022년 8월 – 2024년 5월<br><em>제10전투비행단, 수원</em><br>부대의 일원으로서 동료들과 협력하며, 까다로운 여건 속에서도 맡은 임무를 안정적으로 수행했습니다.",
            "sns-title": "연락처 및 소셜 미디어",
            "sns-email": "taek020422@gmail.com",

            // ── Game Projects 카드 ──
            // 기술 용어(ECS, EventBus, batch/instanced, raylib, uniform …)와 고유명사는 영문 유지.
            "games-title": "게임 &amp; 엔진 프로젝트",
            "games-subtitle": "C++ 엔진 아키텍처, 게임플레이 시스템, 그래픽스 프로그래밍, 기술 리드를 맡았던 팀 프로젝트들입니다.",
            // 섹션 제목·기본정보 라벨 (두 프로젝트가 공유)
            "sec-info": "기본 정보",
            "sec-overview": "게임 개요",
            "sec-features": "게임 특징",
            "sec-role": "맡은 역할",
            "sec-arch": "기술 아키텍처",
            "sec-render": "렌더링 시스템",
            "sec-engine": "그 밖의 엔진 작업",
            "sec-media": "미디어",
            "sec-docs": "개발 문서",
            "sec-link": "프로젝트 링크",
            "sec-links": "프로젝트 링크",
            "fact-dev": "개발 기간",
            "fact-team": "팀",
            "fact-role": "역할",
            "fact-platform": "플랫폼",
            "fact-platforms": "플랫폼",
            "fact-tech": "기술",
            "doc-gdd-title": "게임 디자인 문서 (GDD)",
            "doc-tsd-title": "기술 명세 문서 (TSD)",
            "btn-download": " PDF 다운로드",
            // 10..9..8..
            "p1098-tagline": "2D 탑다운 던전 탐험 로그라이크 / 퍼즐 게임",
            "p1098-dev": "2025년 봄",
            "p1098-team": "Team Natural Disaster — 4명",
            "p1098-role": "Technical Lead",
            "p1098-media-video": "플레이 영상",
            "p1098-media-play": "인게임 — 체스판 스테이지",
            "p1098-ov1": "10..9..8..은 \"플레이어에게는 열 걸음뿐\"이라는 단순한 제약을 중심으로 만든 2D 탑다운 던전 탐험 게임입니다. 체스와 로그라이크 게임에서 영감을 받아, 플레이어는 던전을 탐험하며 제한된 걸음 자원을 이동·전투·진행 중 어디에 쓸지 결정합니다.",
            "p1098-ov2": "걸음은 단순한 이동 포인트가 아닙니다. 이동하면 소모되고, 적의 공격에 깎이며, 아이템을 살 때도 걸음이 듭니다. 회복 아이템은 걸음을 되돌려 주므로, 하나의 자원이 이동력이자 생존력이자 화폐로 기능합니다. 남은 걸음이 0이 되면 그 판은 끝납니다.",
            "p1098-ov3": "플레이어는 반(半)무작위로 선택되는 던전 배치를 헤쳐 나가며, 이동 패턴이 다른 적들과 싸우거나 피하고, 계단에 도달해 다음 층으로 내려가고, 상점 층에서 장비를 구입하며, 마지막에는 체스 킹과 맞섭니다.",
            "p1098-ft1": "게임에는 체스판·숲·성 세 가지 테마 스테이지가 있고, 스테이지 사이에 여러 던전 층과 상점 구역이 있습니다. 맵은 타일 배치, 적, 함정을 각각 따로 담은 텍스트 데이터로 조립되므로 실행 중에 스테이지 배치를 반무작위로 고를 수 있습니다.",
            "p1098-ft2": "적은 체스 말에서 영감을 받았지만 저마다 다른 이동·공격 방식을 가집니다. 플레이어는 근접 적, 원거리 공격, 함정, 그리고 마지막 체스 킹과의 대결에 대응하면서 제한된 걸음을 관리해야 합니다. 소모품은 걸음을 회복시키고, 도끼·창·방패·부츠 같은 장비는 희귀도, 내구도, 가격, 고유 효과를 통해 추가 선택지를 만듭니다.",
            "p1098-role1": "프로젝트의 Technical Lead로서 주요 기술 결정, 엔진 아키텍처, 게임 전반의 통합을 책임졌습니다.",
            "p1098-role2": "프로젝트는 DigiPen의 Game Implementation Techniques 과정에서 개발한 자체 C++ 엔진 위에 만들어졌습니다. 재사용 가능한 엔진 기능을 게임 고유의 게임플레이 로직과 분리해 정리했고, 팀이 사용하는 여러 시스템 사이의 통합을 조율했습니다.",
            "p1098-arch1": "엔진은 GameObjectManager와 컴포넌트 지향 아키텍처로 런타임 객체를 관리합니다. 게임 오브젝트는 한꺼번에 업데이트·그리기가 가능하며, 그리기 우선순위(draw priority)로 렌더링 순서를 정합니다.",
            "p1098-arch2": "게임 수준의 기능은 TurnManager, EnemyManager, ItemManager, UI 시스템, 오디오 래퍼 등 여러 시스템으로 나뉩니다. Timer, Sprite, Texture 같은 재사용 컴포넌트가 게임플레이 객체와 렌더링에 공통 기능을 제공합니다.",
            "p1098-gdd-desc": "10걸음 메커닉, 게임 흐름, 맵 생성, 적, 아이템, 스테이지, 조작, 비주얼 디자인, 오디오를 다룬 전체 게임 디자인 문서입니다.",
            "p1098-tsd-desc": "자체 엔진 아키텍처, 컴포넌트 구조, 매니저, 렌더링 컴포넌트, 충돌 처리, 적 이동 로직을 다룬 기술 문서입니다.",
            // Dragonic Tactics
            "dt-tagline": "2D 턴제 전술 RPG",
            "dt-dev": "2025년 9월 – 2026년 6월",
            "dt-team": "Team Code Pistols — 5명",
            "dt-role": "Producer &amp; Engine/Graphics Engineer",
            "dt-ov1": "Dragonic Tactics는 전통적인 판타지 RPG의 전제를 뒤집은 2D 턴제 전술 RPG입니다. 영웅 파티를 조종하는 대신, 플레이어는 자신의 영역을 지키는 드래곤이 되어 모험가 무리와 맞섭니다.",
            "dt-ov2": "전투는 격자 위에서 벌어지며 위치 선정, 자원 관리, 능력 사용, 그리고 각자 독립적으로 움직이는 모험가들과의 상호작용을 강조합니다.",
            "dt-ft1": "게임의 핵심 디자인은 전략적 위치 선정, 한정된 자원 관리, 비대칭 전투에 집중합니다. 드래곤은 모험가 한 명보다 훨씬 강하지만, 서로 보완하는 역할로 구성된 상대 파티와 싸우면서 행동력, 주문 슬롯, 이동, 위치를 관리해야 합니다.",
            "dt-ft2": "모험가는 Fighter, Wizard, Cleric, Rogue 같은 뚜렷한 유형으로 나뉘며, 각각 전선 압박, 원거리 피해, 치유와 지원, 기동과 측면 공격처럼 다른 행동을 중시합니다. 드래곤은 피해를 주고, 상태 이상을 걸고, 적의 위치를 조작하고, 장애물이나 위험 지형을 만들어 전장을 바꾸는 다양한 능력을 사용합니다.",
            "dt-ft3": "바라보는 방향, 공격 범위, 범위 기반 목표 지정, 상태 이상이 더해져 전투 내내 공간적 관계가 중요해집니다.",
            "dt-role1": "5인 팀에서 Producer와 Engine/Graphics Engineer를 겸했습니다.",
            "dt-role2": "엔지니어링 쪽에서는 자체 C++ 엔진에서 raylib 렌더링 의존성을 걷어내고 OpenGL을 직접 연동하는 리팩터링을 했습니다. immediate·batch·instanced 렌더링 방식, 텍스처 처리, 스프라이트 렌더링, 가상 해상도, 그래픽스 관련 엔진 통합을 포함한 엔진의 2D 렌더링 시스템을 설계하고 구현했습니다.",
            "dt-role3": "또한 EventBus를 이용한 시스템 간 통신을 설계해 엔진과 게임플레이 시스템 사이의 불필요한 의존성을 줄이되, 더 긴밀한 결합이 적절한 곳에서는 직접 접근을 유지했습니다.",
            "dt-role4": "프로듀싱 쪽에서는 프로젝트 마일스톤, 개발 일정, 우선순위, 팀 전체의 통합을 조율했습니다.",
            "dt-rd0": "단순함, CPU 부하, GPU 부하, 메모리 전송량, 드로우 콜 감소 사이의 서로 다른 트레이드오프를 살펴보기 위해 세 가지 렌더링 방식을 구현했습니다.",
            "dt-rd-imm-title": "Immediate Renderer",
            "dt-rd-imm1": "immediate 렌더러는 GPU에 단위 사각형(unit quad) 하나만 두고 모든 스프라이트에 재사용합니다. 요청마다 변환, 텍스처 영역, 깊이, 색조 정보를 uniform으로 올린 뒤 드로우 콜을 하나씩 발행합니다.",
            "dt-rd-imm2": "구조가 단순하고 배칭이나 flush가 필요 없어 최종 게임의 규모에는 이 방식이 적절했습니다. 그래서 Dragonic Tactics의 기본 렌더러로는 immediate 렌더러가 그대로 남았습니다.",
            "dt-rd-bat-title": "Batch Renderer",
            "dt-rd-bat1": "batch 렌더러는 여러 스프라이트를 CPU 쪽의 큰 정점 버퍼에 모았다가 한꺼번에 제출합니다.",
            "dt-rd-bat2": "스프라이트마다 모델 변환을 올리는 대신, CPU가 변환된 정점 위치를 미리 계산해 위치, 텍스처 좌표, 색조, 텍스처 슬롯, 깊이를 정점 데이터에 직접 저장합니다.",
            "dt-rd-bat3": "텍스처 슬롯 시스템 덕분에 여러 텍스처가 같은 배치에 참여할 수 있어, 많은 스프라이트를 그릴 때 필요한 드로우 콜 수가 줄어듭니다.",
            "dt-rd-ins-title": "Instanced Renderer",
            "dt-rd-ins1": "instanced 렌더러는 GPU에 단위 사각형 하나만 두고, 스프라이트별 렌더링 정보만 인스턴스 버퍼에 저장합니다.",
            "dt-rd-ins2": "batch 렌더러와 달리 CPU가 스프라이트마다 변환된 정점을 만들지 않습니다. 변환은 인스턴스별 데이터를 써서 GPU가 수행합니다.",
            "dt-rd-ins3": "이로써 스프라이트당 전송량이 batch 표현의 약 112바이트에서 instanced 표현의 52바이트로 줄어들면서도, 많은 스프라이트를 한꺼번에 그리는 능력은 유지됩니다.",
            "dt-rd-cmp-title": "렌더링 방식 비교",
            "dt-cmp-table": "<thead><tr><th></th><th>Immediate</th><th>Batch</th><th>Instanced</th></tr></thead><tbody><tr><th>객체별 데이터</th><td>Uniform</td><td>정점 속성</td><td>인스턴스 속성</td></tr><tr><th>GPU 지오메트리</th><td>단위 사각형 하나</td><td>동적 정점 스트림</td><td>단위 사각형 하나</td></tr><tr><th>모델 변환</th><td>GPU</td><td>CPU</td><td>GPU</td></tr><tr><th>사각형당 전송</th><td>Uniform + 상태 변경</td><td>112바이트</td><td>52바이트</td></tr><tr><th>드로우 콜</th><td>객체당 1회</td><td>배칭으로 감소</td><td>인스턴싱으로 감소</td></tr><tr><th>핵심 트레이드오프</th><td>단순함</td><td>드로우 콜을 줄이는 대신 CPU 작업 증가</td><td>전송량 감소, GPU 쪽 변환</td></tr></tbody>",
            "dt-rd-end": "개발이 진행될수록 엔진이 더 많은 스프라이트를 다루게 될 것으로 예상해 batch 렌더링과 인스턴싱을 선제적으로 구현했습니다. 렌더링 확장성이 문제가 될 때까지 기다리는 대신 대안 렌더링 아키텍처를 일찍 만들어 트레이드오프를 비교했고, 실제 게임에는 더 단순한 immediate 렌더러로 충분했기에 그것을 그대로 유지했습니다.",
            "dt-eb1": "직접적인 의존이 필요 없는 곳에서 엔진과 게임플레이 시스템을 분리하기 위해 EventBus 기반 통신 시스템을 설계했습니다.",
            "dt-eb2": "모든 상호작용을 이벤트 시스템으로 강제하는 대신, 서브시스템이 더 긴밀한 결합을 필요로 하는 곳에서는 직접 참조도 허용하는 구조입니다.",
            "dt-vr-title": "가상 해상도",
            "dt-vr1": "렌더링 파이프라인에는 가상 해상도 시스템이 있어, 게임 콘텐츠를 일정한 논리 해상도 기준으로 제작하면서도 다양한 화면 크기에서 올바르게 표시할 수 있습니다.",
            "dt-presskit-title": "프레스 킷 &amp; 미디어 &amp; 데모",
            "dt-presskit-desc": "플레이 가능한 WebAssembly 데모, 자세한 게임 설명, 조작법, 특징, 영상, 스크린샷, 캐릭터 에셋, 리뷰, 팀 정보와 추가 미디어가 담겨 있습니다."
    };

    // Jean 판의 호버 힌트. 언어뿐 아니라 허브 상태에 따라서도 달라지므로
    // data-i18n(요소 1개 = 문구 1개)으로는 표현되지 않아 여기서 관리한다.
    const PLATE_HINT = {
        en: { parked: "MENU", menu: "HOME" },
        ko: { parked: "메뉴", menu: "홈" },
    };

    const en = {};
    document.querySelectorAll("[data-i18n]").forEach(el => {
        en[el.getAttribute("data-i18n")] = el.innerHTML.trim();
    });
    const translations = { en, ko };

    let currentLang = "en";
    const langSwitch = document.getElementById("lang-toggle-btn");
    const enLabel = document.querySelector(".en-label");
    const koLabel = document.querySelector(".ko-label");

    function updateLanguage() {
        // 언어에 따라 조판이 달라져야 하는 곳이 있어 CSS 에서도 알 수 있게 표시한다
        // (예: 3글자뿐인 한글 이름은 이름판 안에서 더 크게).
        document.body.dataset.lang = currentLang;

        const elements = document.querySelectorAll("[data-i18n]");
        elements.forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (translations[currentLang][key]) {
                el.innerHTML = translations[currentLang][key]; // innerHTML allows formatting like <br>
            } else {
                console.warn(`[i18n] '${currentLang}' 번역 누락: ${key}`);
            }
        });
        
        updatePlateAffordance();
        // 목차는 섹션 제목을 복사해 만들므로 언어가 바뀌면 다시 만든다.
        document.querySelectorAll(".project").forEach(buildToc);

        // Update switch UI
        if (langSwitch && enLabel && koLabel) {
            if (currentLang === "ko") {
                langSwitch.classList.add("ko-active");
                enLabel.classList.remove("active");
                koLabel.classList.add("active");
            } else {
                langSwitch.classList.remove("ko-active");
                koLabel.classList.remove("active");
                enLabel.classList.add("active");
            }
        }
    }

    // ── 프로젝트 목차 ────────────────────────────────────────────
    // .project 안의 [data-toc] 를 같은 패널의 [data-toc-scroller] 에 있는
    // .project__section[id] > h4 로 채운다. 섹션을 추가하면 목차가 따라온다.
    // 항목을 누르면 스크롤러 안에서 그 섹션으로 이동하고, 스크롤 위치에 따라
    // 현재 섹션이 표시된다. .view 는 visibility:hidden 이라 레이아웃이 있어
    // 로드 시점에도 offsetTop 이 유효하다(스크롤러가 position:relative 라 그 기준).
    function buildToc(project) {
        const nav = project.querySelector("[data-toc]");
        const scroller = project.querySelector("[data-toc-scroller]");
        if (!nav || !scroller) return;
        const sections = [...scroller.querySelectorAll(".project__section[id]")];
        nav.replaceChildren(...sections.map((sec, i) => {
            const a = document.createElement("a");
            a.href = "#" + sec.id;
            const h = sec.querySelector("h4");
            a.textContent = h ? h.textContent : sec.id;
            a.addEventListener("click", (e) => {
                e.preventDefault();   // 해시 내비게이션은 페이지 전체를 움직이려 든다
                // 첫 항목은 맨 위로: 섹션 위에 있는 프로젝트 이름·장르가 잘려 나가지 않게
                scroller.scrollTo({ top: i === 0 ? 0 : sec.offsetTop, behavior: "smooth" });
            });
            return a;
        }));
        // 리스너는 한 번만 달고, 언어가 바뀌어 목차가 재생성되면 함수만 바꿔 끼운다.
        scroller._spy = () => {
            const y = scroller.scrollTop + 8;
            let cur = 0;
            sections.forEach((s, i) => { if (s.offsetTop <= y) cur = i; });
            // 마지막 섹션은 짧아서 상단까지 못 올라온다. 바닥에 닿았으면 마지막으로 친다.
            if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2) cur = sections.length - 1;
            [...nav.children].forEach((a, i) => a.classList.toggle("is-active", i === cur));
        };
        if (!scroller._spyBound) {
            scroller.addEventListener("scroll", () => requestAnimationFrame(() => scroller._spy()));
            scroller._spyBound = true;
        }
        scroller._spy();
    }

    if (langSwitch) {
        langSwitch.addEventListener("click", () => {
            currentLang = currentLang === "en" ? "ko" : "en";
            updateLanguage();
        });
    }

    // Initialize with default language
    updateLanguage();

    
    // 전환 애니메이션이 향하는 지점: 노드가 놓인 방향의 정반대 코너.
    function getTargetCornerTranslation(targetId) {
        const angle = nodeAngle(targetId);
        if (angle === null) return { x: 0, y: 0 };

        const halfW = window.innerWidth / 2;
        const halfH = window.innerHeight / 2;
        // The back button is 120x120, its center is 60px from the 40px margin = 100px from edge.
        const offset = 100;
        const rad = (angle * Math.PI) / 180;

        return {
            x: axisSign(-Math.cos(rad)) * (halfW - offset),
            y: axisSign(-Math.sin(rad)) * (halfH - offset),
        };
    }

    let isAnimating = false;

    const hub = document.querySelector(".hub");

    // 홈은 항상 활성 상태로 남아 상세 페이지 위의 내비게이션 레이어가 된다.
    function switchView(targetId) {
        views.forEach(view => {
            if (view.id === "home") return;
            view.classList.toggle("active", view.id === targetId);
        });
        document.body.dataset.view = targetId;
    }

    // ── 허브 상태 ────────────────────────────────────────────────
    // home   : Jean 판이 화면 중앙, 노드 링 원본 크기
    // parked : 페이지가 열려 있고 Jean 버튼만 코너에 축소되어 남음
    // menu   : parked + 노드 링이 Jean 주위로 다시 나옴

    // 허브를 화면 가장자리 쪽으로 얼마나 들여 놓을지 계산한다.
    // 들이는 양은 상태마다 다르다: parked 에서는 노드가 Jean 안으로 들어가
    // 보이지 않으므로 판만 피하면 되고, menu 에서는 링 전체가 화면 안에
    // 들어와야 한다. 예전에는 둘 다 링 기준이라 parked 일 때 Jean 이
    // 필요보다 한참 안쪽에 놓여 카드 위에 올라앉았다.
    function hubPark(target, state) {
        const angle = nodeAngle(target);
        if (angle === null) return { tx: 0, ty: 0, s: 1 };

        const R = nodeRadiusPx();
        // 계산된 width 는 레이아웃 값이라 허브의 transform 에 영향받지 않는다.
        // offsetWidth 는 border-box 이고 transform 의 영향도 받지 않는다.
        // getComputedStyle().width 는 box-sizing 과 무관하게 content-box 라
        // 패딩·테두리만큼 짧게 나온다(판은 약 19px 차이).
        const rNode = nodeBtns[0].offsetWidth / 2;
        const plateHalf = centerPlate.offsetWidth / 2;
        const M = cssNum("--hub-margin");
        const W = window.innerWidth, H = window.innerHeight;

        // 축척은 링 기준으로 한 번만 정한다. 상태마다 달라지면 메뉴를 여닫을
        // 때 Jean 판 크기까지 변해 버린다.
        const s = Math.min(cssNum("--hub-scale-parked"),
                           (Math.min(W, H) / 2 - M) / (R + rNode));
        const E = (state === "menu" ? R + rNode : plateHalf) * s;
        const rad = (angle * Math.PI) / 180;

        return {
            tx: axisSign(-Math.cos(rad)) * Math.max(0, W / 2 - E - M),
            ty: axisSign(-Math.sin(rad)) * Math.max(0, H / 2 - E - M),
            s,
        };
    }

    // 홈에서는 Jean 판이 버튼이 아니므로 버튼 의미도 붙이지 않는다.
    function updatePlateAffordance() {
        const state = document.body.dataset.hub;
        const clickable = state === "parked" || state === "menu";
        const word = clickable ? PLATE_HINT[currentLang][state] : "";
        plateHint.textContent = word;
        centerPlate.setAttribute("tabindex", clickable ? "0" : "-1");
        if (clickable) centerPlate.setAttribute("aria-label", word);
        else centerPlate.removeAttribute("aria-label");
    }


    // 주차된 Jean 판이 화면에서 실제로 차지하는 사각형.
    // offsetLeft/Top/Width/Height 는 레이아웃 값이라 transform 에 영향받지
    // 않고, .hub 이 inset:0 이라 허브 좌표계가 곧 뷰포트 좌표계다.
    // {tx,ty,s} 로 역산하면 안 된다 — .center-group 안에서 부제목이 자리를
    // 차지해 판 중심이 허브 중심보다 약 20px 위에 있기 때문이다.
    // 허브 좌표계에서의 위치. offsetParent 가 .hub 라고 단정하면 안 된다 —
    // 판의 offsetParent 는 .center-group 이고(부제목이 판보다 넓어 그만큼
    // 안쪽으로 들어가 있다), 그래서 .hub 에 닿을 때까지 누적해야 한다.
    function offsetWithinHub(el) {
        let x = 0, y = 0, n = el;
        while (n && n !== hub) {
            x += n.offsetLeft;
            y += n.offsetTop;
            n = n.offsetParent;
        }
        return { x, y };
    }

    function plateRectAt(park) {
        const W = window.innerWidth, H = window.innerHeight;
        const cx = W / 2, cy = H / 2;
        const o = offsetWithinHub(centerPlate);
        const map = (x, y) => [cx + (x - cx) * park.s + park.tx,
                               cy + (y - cy) * park.s + park.ty];
        const [left, top] = map(o.x, o.y);
        const [right, bottom] = map(o.x + centerPlate.offsetWidth,
                                    o.y + centerPlate.offsetHeight);
        return { left, top, right, bottom };
    }

    // 카드는 "범퍼 상자" 안에서 최대한 커진다. 범퍼 상자란 화면에서
    // 방향별 범퍼와 Jean 판이 차지한 띠를 뺀 나머지 사각형이다.
    // 비율(data-card-ratio)을 지정한 카드는 그 비율을 지키며 상자에 맞춘다.
    function layoutCard(view, park) {
        const content = view.querySelector(".view-content");
        const card = view.querySelector(".content-wrapper");
        if (!content || !card) return;

        // --- 읽기 (쓰기와 섞지 않는다) ---
        const W = window.innerWidth, H = window.innerHeight;
        // 범퍼는 view 기준으로 읽는다. 기본값은 :root 에서 상속되지만,
        // 특정 카드만 다르게 하고 싶으면 그 <section> 에 --bumper-* 를
        // 덮어쓰면 된다(내용이 다른 새 노드를 위해 열어둔 여지).
        const bT = cssNum("--bumper-t", view), bR = cssNum("--bumper-r", view);
        const bB = cssNum("--bumper-b", view), bL = cssNum("--bumper-l", view);
        const gap = cssNum("--card-gap");
        const minH = cssNum("--card-min-height");
        const ratio = view.dataset.cardRatio;
        // 카드가 상자 높이를 꽉 채운다. 스크롤이 카드 안쪽 영역(프로젝트 본문)에서
        // 일어나는 카드는 카드 높이가 먼저 정해져야 안쪽이 얼마를 쓸지 알 수 있다.
        const fill = "cardFill" in view.dataset;
        const p = plateRectAt(park);

        // 판은 늘 가장자리에 있으므로 그쪽 범퍼만 키우면 된다.
        const horiz = [], vert = [];
        if (p.left > W / 2) horiz.push({ t: bT, r: Math.max(bR, W - p.left + gap), b: bB, l: bL });
        if (p.right < W / 2) horiz.push({ t: bT, r: bR, b: bB, l: Math.max(bL, p.right + gap) });
        if (p.top > H / 2) vert.push({ t: bT, r: bR, b: Math.max(bB, H - p.top + gap), l: bL });
        if (p.bottom < H / 2) vert.push({ t: Math.max(bT, p.bottom + gap), r: bR, b: bB, l: bL });

        // 모서리 주차는 가로·세로 두 후보가 나온다. 면적으로 고르면 거의
        // 정사각형인 창에서 축이 홱 바뀌어 카드가 튀므로, 화면 방향으로
        // 정한다(가로가 길면 좌우 띠를 비우는 쪽이 늘 더 넓다).
        const prefer = W >= H ? horiz : vert;
        const pick = (prefer[0] || horiz[0] || vert[0]
                      || { t: bT, r: bR, b: bB, l: bL });

        const box = { w: W - pick.l - pick.r, h: H - pick.t - pick.b };

        let width = box.w, height = null;
        if (ratio) {
            const [rw, rh] = ratio.split("/").map(Number);
            if (rw > 0 && rh > 0) {
                const k = Math.min(box.w / rw, box.h / rh);   // contain 맞춤
                width = rw * k;
                height = rh * k;
            }
        } else if (fill) {
            height = Math.max(minH, box.h);
        }

        // --- 쓰기 ---
        content.style.setProperty("--pad-t", `${pick.t}px`);
        content.style.setProperty("--pad-r", `${pick.r}px`);
        content.style.setProperty("--pad-b", `${pick.b}px`);
        content.style.setProperty("--pad-l", `${pick.l}px`);
        card.style.setProperty("--card-width", `${width}px`);
        card.style.setProperty("--card-max-height", `${Math.max(minH, box.h)}px`);
        // 비율 카드만 높이가 고정된다. 나머지는 auto 로 되돌려 내용이 정한다.
        if (height !== null) card.style.setProperty("--card-height", `${height}px`);
        else card.style.removeProperty("--card-height");
    }

    function setHub(state, target) {
        document.body.dataset.hub = state;
        updatePlateAffordance();

        // 노드를 누른 순간에는 커서가 노드 위에 있어 mouseleave 가 오지
        // 않는다. 힌트 변형이 남아 있으면 판의 실제 위치가 계산과 어긋나므로
        // 홈을 떠날 때 직접 지운다.
        if (state !== "home") {
            centerGroup.style.setProperty("--tx", "0px");
            centerGroup.style.setProperty("--ty", "0px");
            centerGroup.style.setProperty("--scale", "1");
            nodeBtns.forEach(b => {
                b.style.setProperty("--tx", "0px");
                b.style.setProperty("--ty", "0px");
                b.style.setProperty("--scale", "1");
            });
        }
        if (state === "home") {
            hub.style.setProperty("--hub-tx", "0px");
            hub.style.setProperty("--hub-ty", "0px");
            hub.style.setProperty("--hub-scale", "1");
            return;
        }
        const p = hubPark(target, state);
        hub.style.setProperty("--hub-tx", `${p.tx}px`);
        hub.style.setProperty("--hub-ty", `${p.ty}px`);
        hub.style.setProperty("--hub-scale", `${p.s}`);

        // 카드 배치는 parked 기준으로만 잡는다. menu 에서 다시 계산하면
        // 링이 판보다 훨씬 커서 메뉴를 여닫을 때마다 카드 크기가 변한다.
        if (state === "parked") {
            const view = document.getElementById(target);
            if (view) layoutCard(view, p);
        }
    }

    // 열려 있는 페이지의 노드는 자리를 지킨 채 흐려진다(나머지 위치 고정).
    function markCurrent(target) {
        nodeBtns.forEach(b => b.classList.toggle("is-current", b.dataset.target === target));
    }

    // 노드가 페이지가 되는 연출: 카드를 노드 자리·크기에서 제자리로 키운다.
    // 화면을 덮는 풍선 대신 이 방식이라야 "노드 하나가 확대된" 느낌이 난다.
    function flipCardIn(view, fromRect) {
        const card = view.querySelector(".content-wrapper");
        if (!card) return;
        // .view 는 display:none 이 아니라 visibility:hidden 이라 활성화 전에도
        // 레이아웃이 잡혀 있어 최종 위치를 미리 잴 수 있다.
        const to = card.getBoundingClientRect();
        if (!to.width || !to.height) return;

        const scale = fromRect.width / to.width;   // 균일 배율 (글자가 찌그러지지 않게)
        const dx = fromRect.left - to.left;
        const dy = fromRect.top - to.top;

        card.style.transition = "none";
        card.style.transformOrigin = "0 0";        // 중앙 기준이면 절반 크기 보정이 더 필요하다
        card.style.transform = `translate(${dx}px, ${dy}px) scale(${scale})`;
        // 스크롤은 카드가 아니라 안쪽 .card-scroll 이 한다.
        const scroller = card.querySelector(".card-scroll");
        if (scroller) {
            scroller.style.overflow = "hidden";   // 확대 중 스크롤바가 같이 늘어나 보인다
            scroller.scrollTop = 0;
        }
        void card.offsetWidth;                     // 시작 상태를 확정시키는 강제 reflow

        requestAnimationFrame(() => {
            card.style.transition = "transform var(--dur-node-fly) var(--ease-emphasized)";
            card.style.transform = "";
        });

        // 정리는 rAF 밖에서 예약한다. 배경 탭처럼 rAF 가 늦게 도는 상황에서
        // 안쪽에 두면 카드가 축소된 시작 상태로 남아버린다.
        setTimeout(() => {
            card.style.transition = "";
            card.style.transform = "";
            card.style.transformOrigin = "";
            if (scroller) scroller.style.overflow = "";
        }, cssMs("--dur-node-fly") + 50);
    }

    function openNode(target, btn) {
        if (isAnimating) return;
        isAnimating = true;
        btn.blur();

        // 순서가 중요하다. setHub 이 주차 위치를 정하고 그에 맞춰 카드
        // 배치까지 끝낸 뒤라야, flipCardIn 이 카드의 *정정된* 최종 위치를
        // 잰다. 읽기(주차 계산) -> 쓰기(배치) -> 읽기(rect) 순이라
        // 강제 레이아웃은 2회로 끝난다.
        // 전제: .view.active 는 opacity/visibility/z-index 만 바꾼다.
        // 여기에 레이아웃에 영향 주는 속성을 넣으면 FLIP 이 조용히 깨진다.
        setHub("parked", target);

        const view = document.getElementById(target);
        if (view) flipCardIn(view, btn.getBoundingClientRect());
        switchView(target);
        markCurrent(target);

        setTimeout(() => { isAnimating = false; }, cssMs("--dur-node-fly"));
    }

    function goHome() {
        if (isAnimating) return;
        isAnimating = true;
        switchView("home");
        markCurrent(null);
        setHub("home");
        setTimeout(() => { isAnimating = false; }, cssMs("--dur-node-fly"));
    }

    // ── 노드 ────────────────────────────────────────────────────
    nodeBtns.forEach(btn => {
        // 호버 힌트는 홈에서만. 축소된 메뉴 상태에서 돌면 화면 절반 거리만큼
        // 날아가고, mouseleave 가 모든 노드의 --scale 을 되돌려 흐림도 풀린다.
        btn.addEventListener("mouseenter", () => {
            if (isAnimating || document.body.dataset.hub !== "home") return;
            const corner = getTargetCornerTranslation(btn.dataset.target);
            const hintTx = corner.x * 0.05;
            const hintTy = corner.y * 0.05;

            centerGroup.style.setProperty("--tx", `${hintTx}px`);
            centerGroup.style.setProperty("--ty", `${hintTy}px`);
            centerGroup.style.setProperty("--scale", "0.95");

            nodeBtns.forEach(other => {
                if (other === btn) return;
                other.style.setProperty("--tx", `${hintTx}px`);
                other.style.setProperty("--ty", `${hintTy}px`);
                other.style.setProperty("--scale", "0.95");
            });

            // 호버한 노드는 제자리에서만 커진다. 커서 쪽에서 밀려나면
            // mouseleave/mouseenter 가 번갈아 발동해 깜빡인다.
            btn.style.setProperty("--tx", "0px");
            btn.style.setProperty("--ty", "0px");
            btn.style.setProperty("--scale", "1.15");
        });

        btn.addEventListener("mouseleave", () => {
            if (isAnimating || document.body.dataset.hub !== "home") return;
            centerGroup.style.setProperty("--tx", "0px");
            centerGroup.style.setProperty("--ty", "0px");
            centerGroup.style.setProperty("--scale", "1");
            nodeBtns.forEach(other => {
                other.style.setProperty("--tx", "0px");
                other.style.setProperty("--ty", "0px");
                other.style.setProperty("--scale", "1");
            });
        });

        btn.addEventListener("click", () => openNode(btn.dataset.target, btn));
    });

    // ── Jean 판 ─────────────────────────────────────────────────
    // parked 에서 누르면 노드들이 나오고, menu 에서 누르면 홈으로 간다.
    centerPlate.addEventListener("click", () => {
        const state = document.body.dataset.hub;
        if (state === "parked") setHub("menu", document.body.dataset.view);
        else if (state === "menu") goHome();
    });

    centerPlate.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            centerPlate.click();
        }
    });

    // 빈곳 = Jean 과 노드를 제외한 전부(카드 본문 포함). 누르면 메뉴가 닫힌다.
    // .hub 는 화면 전체를 덮지만 pointer-events:none 이라, 실제로 클릭 대상이
    // 되는 것은 .center-plate 와 .node-btn 뿐이다.
    document.addEventListener("click", (e) => {
        if (document.body.dataset.hub !== "menu") return;
        if (e.target.closest(".hub")) return;
        setHub("parked", document.body.dataset.view);
    });

    // 창 크기가 바뀌면 주차 위치와 카드 배치를 다시 잡는다.
    // resize 는 드래그 중 초당 수십 번 오므로 프레임 단위로 합친다.
    let resizePending = false;
    window.addEventListener("resize", () => {
        if (resizePending) return;
        resizePending = true;
        requestAnimationFrame(() => {
            resizePending = false;
            const state = document.body.dataset.hub;
            const target = document.body.dataset.view;
            if (!state || state === "home") return;
            setHub(state, target);
            // menu 중에는 setHub 이 카드를 건드리지 않으므로 여기서 직접 맞춘다.
            if (state === "menu") {
                const view = document.getElementById(target);
                if (view) layoutCard(view, hubPark(target, "parked"));
            }
        });
    });

    // ── 카드 안 탭 UI ─────────────────────────────────────────────
    // [data-tabs] 안의 role=tab 버튼이 aria-controls 가 가리키는 패널을 켠다.
    // 카드마다 다시 쓰려고 마크업 규약만 맞추면 되게 했다(Skills 가 첫 사용처).
    // 탭 클릭은 문서 클릭 리스너(메뉴 닫기)와 겹치지만 그쪽은 preventDefault
    // 를 하지 않으므로 서로 방해하지 않는다.
    document.querySelectorAll("[data-tabs]").forEach(tabs => {
        const btns = [...tabs.querySelectorAll("[role=tab]")];
        const select = (btn) => btns.forEach(b => {
            const on = b === btn;
            b.setAttribute("aria-selected", on);
            b.tabIndex = on ? 0 : -1;
            const panel = document.getElementById(b.getAttribute("aria-controls"));
            if (panel) panel.classList.toggle("is-active", on);
        });
        btns.forEach((b, i) => {
            b.addEventListener("click", () => select(b));
            // 좌우 화살표로 이동 (WAI-ARIA tabs 관례). 끝에서는 반대편으로 감는다.
            b.addEventListener("keydown", (e) => {
                const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
                if (!d) return;
                e.preventDefault();
                const next = btns[(i + d + btns.length) % btns.length];
                next.focus();
                select(next);
            });
        });
    });

    setHub("home");
});
