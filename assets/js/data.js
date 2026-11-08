/* =========================================================
   사이트에 들어가는 모든 작품 · 사진 정보
   ---------------------------------------------------------
   작품이나 사진을 추가/수정할 때는 이 파일만 고치면 됩니다.
   이미지는 assets/images/ 폴더에 넣고 경로를 적어 주세요.
   ========================================================= */

window.ARCHIVE = {

    /* ---------- Works (회화) ----------
       id      : 주소에 쓰이는 영문 이름 (work.html?id=pantheon)
       year    : 정렬(Latest / Earliest)에 사용 — 모르면 null
       details : 작품 상세 페이지 아래에 보일 디테일 컷
       ※ 크기가 기획안 페이지마다 다르게 적힌 작품은 아래 "확인 필요" 주석을 봐 주세요. */
    works: [
        {
            id: "namun-1",
            title: "남은 장면 I",
            year: 2026,
            medium: "장지에 채색",
            size: "130.3 × 193.9 cm",          // 확인 필요: 기획안 5쪽에는 193.9 × 260.6 cm
            image: "assets/images/works/namun-1.jpg",
            details: ["assets/images/details/frag-01.jpg", "assets/images/details/frag-02.jpg"],
        },
        {
            id: "slash",
            title: "Slash",
            year: 2026,
            medium: "장지에 채색",
            size: "193.9 × 260.6 cm",
            image: "assets/images/works/slash.jpg",
            details: [],
        },
        {
            id: "sagrada",
            title: "Sagrada Familia",           // 기획안 18쪽에는 "Sagrada"
            year: 2025,
            medium: "장지에 채색",
            size: "113.4 × 193.9 cm",          // 확인 필요: 기획안 5쪽에는 193.9 × 112.1 cm
            image: "assets/images/works/sagrada.jpg",
            details: ["assets/images/details/sagrada-d1.jpg", "assets/images/details/frag-12.jpg"],
        },
        {
            id: "0888",
            title: "0. 08 .7 0888",            // 확인 필요: 기획안 19쪽에는 "0. 8. 1. 7. 08:2222", 97.0 × 162.2 cm
            year: 2024,
            medium: "장지에 채색",
            size: "86 × 113.4 cm",
            image: "assets/images/works/0888.jpg",
            details: ["assets/images/details/frag-09.jpg", "assets/images/details/frag-10.jpg"],
        },
        {
            id: "pantheon",
            title: "Pantheon",
            year: 2023,
            medium: "장지에 채색",
            size: "72.7 × 116.8 cm",           // 확인 필요: 기획안 18쪽에는 97 × 113.4 cm
            image: "assets/images/works/pantheon.jpg",
            details: ["assets/images/details/pantheon-d1.jpg", "assets/images/details/frag-04.jpg"],
        },
        // ↓ 기획안에 제목·연도가 없는 작품들 — 정보를 채워 주세요
        { id: "untitled-train", title: "Untitled", year: null, medium: "장지에 채색", size: "", image: "assets/images/works/untitled-train.jpg", details: ["assets/images/details/frag-07.jpg"] },
        { id: "untitled-water", title: "Untitled", year: null, medium: "장지에 채색", size: "", image: "assets/images/works/untitled-water.jpg", details: [] },
        { id: "untitled-walk",  title: "Untitled", year: null, medium: "장지에 채색", size: "", image: "assets/images/works/untitled-walk.jpg",  details: [] },
        { id: "untitled-hands", title: "Untitled", year: null, medium: "장지에 채색", size: "", image: "assets/images/works/untitled-hands.jpg", details: ["assets/images/details/frag-08.jpg"] },
    ],

    /* ---------- Drawings ----------
       Works와 같은 형식으로 채워 넣으면 됩니다. 비어 있으면 "준비 중" 문구가 보여요. */
    drawings: [],

    /* ---------- 메인 화면에 떠다니는 디테일 컷 ----------
       work : 클릭했을 때 넘어갈 작품 id
       x, y, w : 처음 놓이는 위치와 너비 (화면 대비 %) — 기획안 14쪽 배치를 그대로 옮김
       ※ 어느 작품의 디테일인지 제가 추측해서 연결한 것이 있어요. 틀리면 work 값을 바꿔 주세요. */
    fragments: [
        { src: "assets/images/details/frag-01.jpg", work: "namun-1",        x: 57.5, y: 53.3, w: 14.9 },
        { src: "assets/images/details/frag-02.jpg", work: "namun-1",        x: 36.9, y: 35.1, w: 6.3 },
        { src: "assets/images/details/frag-03.jpg", work: "pantheon",       x: 6.5,  y: 20.5, w: 15.0 },
        { src: "assets/images/details/frag-04.jpg", work: "pantheon",       x: 43.2, y: 24.0, w: 39.3 },
        { src: "assets/images/details/frag-05.jpg", work: "pantheon",       x: 32.5, y: 58.5, w: 14.2 },
        { src: "assets/images/details/frag-06.jpg", work: "sagrada",        x: 71.7, y: 18.5, w: 13.2 },
        { src: "assets/images/details/frag-07.jpg", work: "untitled-train", x: 50.8, y: 75.1, w: 7.9 },
        { src: "assets/images/details/frag-08.jpg", work: "untitled-hands", x: 92.5, y: 14.0, w: 6.0 },
        { src: "assets/images/details/frag-09.jpg", work: "0888",           x: 87.8, y: 38.8, w: 8.9 },
        { src: "assets/images/details/frag-10.jpg", work: "0888",           x: 24.3, y: 24.0, w: 9.0 },
        { src: "assets/images/details/frag-11.jpg", work: "0888",           x: 65.6, y: 53.3, w: 32.6 },
        { src: "assets/images/details/frag-12.jpg", work: "sagrada",        x: 21.9, y: 72.3, w: 15.0 },
        { src: "assets/images/details/frag-13.jpg", work: "sagrada",        x: 15.3, y: 45.4, w: 14.2 },
        { src: "assets/images/details/frag-14.jpg", work: "sagrada",        x: 3.5,  y: 55.1, w: 9.9 },
    ],

    /* ---------- Journal (잔상 사진 기록) ----------
       stars   : 1 = C컷, 2 = B컷, 3 = A컷
       date    : "MMDD HH:MM" 형식 (예: "0803 11:06")
       place   : 촬영 장소
       info    : 사진 정보 (카메라, 설정 등) — 자유롭게
       comment : 가벼운 일기 / 코멘트
       ※ j13 말고는 기획안에 정보가 없어서 비워 두었고, 별점은 임시로 넣어 둔 값이에요. */
    journal: [
        { id: "j13", src: "assets/images/journal/j13.jpg", stars: 1, date: "0803 11:06", place: "Prague", info: "", comment: "도이가 마쥬 원피스를 입고 체코를 활보한다..\n내 최애 착장이며 한 번도 도이를 선명하게 찍어본 적이 없다.." },
        { id: "j12", src: "assets/images/journal/j12.jpg", stars: 2, date: "", place: "", info: "", comment: "" },
        { id: "j01", src: "assets/images/journal/j01.jpg", stars: 1, date: "", place: "", info: "", comment: "" },
        { id: "j06", src: "assets/images/journal/j06.jpg", stars: 2, date: "", place: "", info: "", comment: "" },
        { id: "j05", src: "assets/images/journal/j05.jpg", stars: 1, date: "", place: "", info: "", comment: "" },
        { id: "j10", src: "assets/images/journal/j10.jpg", stars: 3, date: "", place: "", info: "", comment: "" },
        { id: "j11", src: "assets/images/journal/j11.jpg", stars: 3, date: "", place: "", info: "", comment: "" },
        { id: "j09", src: "assets/images/journal/j09.jpg", stars: 1, date: "", place: "", info: "", comment: "" },
        { id: "j07", src: "assets/images/journal/j07.jpg", stars: 2, date: "", place: "", info: "", comment: "" },
        { id: "j03", src: "assets/images/journal/j03.jpg", stars: 3, date: "", place: "", info: "", comment: "" },
        { id: "j02", src: "assets/images/journal/j02.jpg", stars: 1, date: "", place: "", info: "", comment: "" },
        { id: "j08", src: "assets/images/journal/j08.jpg", stars: 2, date: "", place: "", info: "", comment: "" },
        { id: "j04", src: "assets/images/journal/j04.jpg", stars: 1, date: "", place: "", info: "", comment: "" },
    ],
};
