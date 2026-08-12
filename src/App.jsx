import { useState, useEffect, useRef } from "react";
import {
  Zap, CalendarDays, PenLine, Circle, MapPin, Clock, ChevronDown, ChevronLeft, ChevronRight, History,
  ArrowLeft, Thermometer, Droplets, Wind, Flag, Radio, Play, Pause, Info,
  Timer, Loader2, AlertCircle,
} from "lucide-react";

const ASPHALT = "#0B0C10";
const SURFACE = "#16181D";
const SURFACE_2 = "#1D2027";
const ACCENT = "#A78BFA";
const TEXT = "#E8E6E1";
const MUTED = "#8B8D92";
const LINE = "#2A2D34";

const TABS = [
  { id: "live", label: "라이브 타이밍", icon: Zap },
  { id: "cal", label: "캘린더", icon: CalendarDays },
  { id: "blog", label: "블로그", icon: PenLine },
];

const TIRE_COLORS = {
  SOFT: "#E24B4A",
  MEDIUM: "#F5C518",
  HARD: "#E8E6E1",
  INTERMEDIATE: "#3BA55D",
  WET: "#378ADD",
};

const TIRE_LETTERS = {
  SOFT: "S",
  MEDIUM: "M",
  HARD: "H",
  INTERMEDIATE: "I",
  WET: "W",
};

const GP_NAME_KO = {
  "Bahrain Grand Prix": "바레인 그랑프리",
  "Saudi Arabian Grand Prix": "사우디아라비아 그랑프리",
  "Australian Grand Prix": "호주 그랑프리",
  "Japanese Grand Prix": "일본 그랑프리",
  "Chinese Grand Prix": "중국 그랑프리",
  "Miami Grand Prix": "마이애미 그랑프리",
  "Emilia Romagna Grand Prix": "에밀리아로마냐 그랑프리",
  "Monaco Grand Prix": "모나코 그랑프리",
  "Canadian Grand Prix": "캐나다 그랑프리",
  "Spanish Grand Prix": "스페인 그랑프리",
  "Austrian Grand Prix": "오스트리아 그랑프리",
  "British Grand Prix": "영국 그랑프리",
  "Belgian Grand Prix": "벨기에 그랑프리",
  "Hungarian Grand Prix": "헝가리 그랑프리",
  "Dutch Grand Prix": "네덜란드 그랑프리",
  "Italian Grand Prix": "이탈리아 그랑프리",
  "Azerbaijan Grand Prix": "아제르바이잔 그랑프리",
  "Singapore Grand Prix": "싱가포르 그랑프리",
  "United States Grand Prix": "미국 그랑프리",
  "Mexico City Grand Prix": "멕시코시티 그랑프리",
  "São Paulo Grand Prix": "상파울루 그랑프리",
  "Las Vegas Grand Prix": "라스베이거스 그랑프리",
  "Qatar Grand Prix": "카타르 그랑프리",
  "Abu Dhabi Grand Prix": "아부다비 그랑프리",
};

const TEAM_ABBR = {
  "McLaren": "MCL",
  "Red Bull Racing": "RBR",
  "Ferrari": "FER",
  "Mercedes": "MER",
  "Aston Martin": "AMR",
  "Alpine": "ALP",
  "Williams": "WIL",
  "Racing Bulls": "RB",
  "Audi": "AUD",
  "Haas F1 Team": "HAAS",
  "Cadillac": "CAD",
  "Sauber": "SAU",
  "Kick Sauber": "SAU",
  "Visa Cash App RB": "RB",
};

function teamAbbr(teamName) {
  if (!teamName) return "";
  if (TEAM_ABBR[teamName]) return TEAM_ABBR[teamName];
  return teamName.split(" ").map((w) => w[0]).join("").slice(0, 4).toUpperCase();
}

// 아래는 미리보기 화면에서 쓰는 "실제 데이터 스냅샷"이에요.
// 이 미리보기 환경은 브라우저 보안 정책상 외부 API로 직접 접속할 수 없어서,
// Claude가 OpenF1에서 직접 확인한 2026 헝가리 그랑프리 실제 결과를 담아뒀어요.
// 실제 웹사이트로 배포되면 아래 useEffect의 fetch 코드가 정상적으로 매번 최신 데이터를 가져와요.
const FALLBACK_SESSION_KEY = "hun2026-race";

const FALLBACK_RACE_SESSIONS = [
  { session_key: FALLBACK_SESSION_KEY, gpName: "Hungarian Grand Prix", date_start: "2026-07-26T13:00:00+00:00" },
];

const FALLBACK_ROWS = [
  { pos: 1, code: "NOR", gap: "--", laps: 70, teamColor: "#F58020", tireColor: TIRE_COLORS.SOFT, tireCode: "S" },
  { pos: 2, code: "VER", gap: "+15.080s", laps: 70, teamColor: "#3671C6", tireColor: TIRE_COLORS.MEDIUM, tireCode: "M" },
  { pos: 3, code: "ANT", gap: "+3.648s", laps: 70, teamColor: "#27F4D2", tireColor: TIRE_COLORS.SOFT, tireCode: "S" },
  { pos: 4, code: "LEC", gap: "+5.112s", laps: 70, teamColor: "#E8002D", tireColor: TIRE_COLORS.SOFT, tireCode: "S" },
  { pos: 5, code: "HAM", gap: "+0.700s", laps: 70, teamColor: "#E8002D", tireColor: TIRE_COLORS.SOFT, tireCode: "S" },
  { pos: 6, code: "HAD", gap: "+30.948s", laps: 70, teamColor: "#6C98FF", tireColor: TIRE_COLORS.MEDIUM, tireCode: "M" },
  { pos: 7, code: "RUS", gap: "+2.015s", laps: 70, teamColor: "#27F4D2", tireColor: TIRE_COLORS.MEDIUM, tireCode: "M" },
  { pos: 8, code: "LAW", gap: "+54.289s", laps: 70, teamColor: "#6692FF", tireColor: TIRE_COLORS.SOFT, tireCode: "S" },
  { pos: 9, code: "HUL", gap: "+2.349s", laps: 70, teamColor: "#00E701", tireColor: TIRE_COLORS.SOFT, tireCode: "S" },
  { pos: 10, code: "LIN", gap: "+20.668s", laps: 70, teamColor: "#00E701", tireColor: TIRE_COLORS.MEDIUM, tireCode: "M" },
];

const FALLBACK_WEATHER = { air_temperature: 31.3, track_temperature: 47.0, humidity: 26.6, wind_speed: 1.9 };

const FALLBACK_RACE_CONTROL = [
  { time: "23:45", lap: 70, text: "모든 패스 소지자는 피트 레인 출입이 가능합니다" },
  { time: "23:43", lap: 70, text: "체커드 플래그" },
  { time: "23:42", lap: 69, text: "5번 차량(BOR) 블랙 앤 화이트 플래그(경고) - 트랙 리밋" },
];

const FALLBACK_PIT_STOPS = [
  { code: "COL", team: "Alpine", lap: 15, laneTime: "22.9s" },
  { code: "VER", team: "Red Bull Racing", lap: 14, laneTime: "21.6s" },
  { code: "HAM", team: "Ferrari", lap: 13, laneTime: "21.7s" },
  { code: "STR", team: "Aston Martin", lap: 8, laneTime: "21.7s" },
];

const FALLBACK_TEAM_RADIO = [
  { driver: "Kimi Antonelli", team: "Mercedes", time: "23:46", url: null, text: "나이스 워크, Kimi. P3야, 친구. 나쁘지 않은 하루였어." },
];

const FALLBACK_UPCOMING = [
  { session_key: "sgp2026", gpName: "Singapore Grand Prix", circuit: "Marina Bay", date_start: "2026-10-09T08:30:00+00:00", daysLeft: null },
];

function koGpName(name) {
  return GP_NAME_KO[name] || name || "그랑프리";
}

function contrastIconColor(hex) {
  if (!hex) return ASPHALT;
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return ASPHALT;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? ASPHALT : "#FFFFFF";
}

// 팀 컬러 중 일부는 어두운 배경(ASPHALT) 위에서 텍스트로 쓰기엔 너무 어두워서,
// 명도가 낮으면 흰색 쪽으로 살짝 섞어 최소 가독성을 확보해요.
function readableAccent(hex) {
  if (!hex) return TEXT;
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  if (luminance >= 0.4) return hex;
  const mix = 0.55;
  const nr = Math.round(r + (255 - r) * mix);
  const ng = Math.round(g + (255 - g) * mix);
  const nb = Math.round(b + (255 - b) * mix);
  const toHex = (v) => v.toString(16).padStart(2, "0");
  return `#${toHex(nr)}${toHex(ng)}${toHex(nb)}`;
}

// "(BOR)" 같은 3자리 드라이버 코드를 문장 속에서 찾아 해당 팀 컬러로 강조해요.
function renderRaceControlText(text, colorMap) {
  if (!colorMap) return text;
  const parts = text.split(/\(([A-Z]{3})\)/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) {
      const color = colorMap[part];
      return color ? (
        <span key={i}>(<span style={{ color: readableAccent(color), fontWeight: 700 }}>{part}</span>)</span>
      ) : (
        <span key={i}>({part})</span>
      );
    }
    return part;
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// OpenF1 무료 티어는 초당 3회/분당 30회 제한이 있어요. 개발 모드의 StrictMode처럼
// 요청이 몰리는 상황에선 429가 나기 쉬워서, 429일 때만 잠깐 쉬었다가 다시 시도해요.
async function fetchJSON(url, { retries = 3, emptyOn404 = false } = {}) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url);
    if (res.ok) return res.json();
    if (res.status === 404 && emptyOn404) return [];
    if (res.status !== 429 || attempt >= retries) throw new Error(`요청 실패 (${res.status})`);
    await sleep(1500 * (attempt + 1) ** 2);
  }
}

// OpenF1은 해당하는 데이터가 없을 때 빈 배열이 아니라 404를 돌려줘요.
// (예: 중국 GP는 팀 라디오가 없어서 team_radio 가 404입니다.)
// 이걸 오류로 두면 뒤따르는 요청이 통째로 취소돼서, 팀 라디오 하나 때문에
// 레이스 컨트롤·피트스탑까지 같이 사라집니다. 그래서 "데이터 없음"으로 바꿔 줘요.
function fetchOpenF1(url) {
  return fetchJSON(url, { emptyOn404: true });
}

async function translateBatch(texts) {
  if (!texts || texts.length === 0) return texts;
  try {
    const res = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texts }),
    });
    if (!res.ok) throw new Error("번역 요청 실패");
    const data = await res.json();
    return data.translations || texts;
  } catch (e) {
    // 번역 서버 함수가 없거나 실패하면 원문(영어)을 그대로 보여줘요.
    return texts;
  }
}

function formatRaceTime(sec) {
  if (typeof sec !== "number") return "--";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = (sec % 60).toFixed(3).padStart(6, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

function formatGap(row) {
  if (row.dsq) return "DSQ";
  if (row.dnf) return "DNF";
  if (row.dns) return "DNS";
  if (row.position === 1) return formatRaceTime(row.duration);
  const g = row.gap_to_leader;
  if (typeof g === "number") return `+${g.toFixed(3)}s`;
  if (typeof g === "string") return g;
  return "--";
}

function formatKoreanDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
}

function Eyebrow({ children }) {
  return (
    <div className="uppercase tracking-widest text-xs font-semibold mb-2" style={{ color: MUTED, letterSpacing: "0.12em" }}>
      {children}
    </div>
  );
}

function LoadingBlock({ label }) {
  return (
    <div className="flex items-center gap-2 py-8 justify-center text-sm" style={{ color: MUTED }}>
      <Loader2 size={16} className="animate-spin" />
      {label || "데이터를 불러오는 중..."}
    </div>
  );
}

function ErrorBlock({ message }) {
  return (
    <div className="flex items-center gap-2 py-8 justify-center text-sm" style={{ color: "#E24B4A" }}>
      <AlertCircle size={16} />
      {message || "데이터를 불러오지 못했어요."}
    </div>
  );
}

function WeatherBar({ weather }) {
  if (!weather) return null;
  const items = [
    { icon: Thermometer, label: "기온", value: `${weather.air_temperature}°C` },
    { icon: Thermometer, label: "노면", value: `${weather.track_temperature}°C` },
    { icon: Droplets, label: "습도", value: `${weather.humidity}%` },
    { icon: Wind, label: "풍속", value: `${weather.wind_speed}km/h` },
  ];
  return (
    <div className="flex items-center gap-4 flex-wrap text-xs" style={{ color: MUTED }}>
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <div key={it.label} className="flex items-center gap-1.5">
            <Icon size={13} />
            <span>{it.label}</span>
            <span style={{ color: TEXT }}>{it.value}</span>
          </div>
        );
      })}
    </div>
  );
}

function PanelHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3" style={{ borderBottom: `1px solid ${LINE}` }}>
      <Icon size={14} color={ACCENT} />
      <span className="text-sm font-medium" style={{ color: TEXT }}>{title}</span>
    </div>
  );
}

// --- 트랙맵 ------------------------------------------------------------------
// OpenF1 /v1/location 은 드라이버별 x, y 좌표를 초당 4회 정도 내려줘요.
// 전체 드라이버 × 1랩이 약 1MB라서 레이스 전체(약 57MB)를 한 번에 받는 건 무리예요.
// 그래서 "랩 하나"를 단위로 필요할 때만 받아오고, 한 번 받은 랩은 캐시에 남겨둡니다.

const PLAYBACK_SPEEDS = [0.5, 1, 2, 4];

// 드라이버 점 반지름과, 점 위쪽 테두리에서 코드 라벨까지 띄울 간격.
// 점 크기를 바꿔도 라벨이 같은 간격으로 따라오도록 반지름과 분리해 뒀어요.
const DOT_R = 5.6;
const DOT_LABEL_GAP = 4;

// 스타트/피니시 라인. LENGTH는 트랙을 가로지르는 길이(트랙 선 두께 14보다 조금 길게),
// DEPTH는 진행 방향 쪽 두께예요. 격자 두 줄이 나오도록 CELL의 2배로 둡니다.
const CHECKER_CELL = 1.6;
const CHECKER_LENGTH = 15;
const CHECKER_DEPTH = CHECKER_CELL * 2;

const SAFETY_YELLOW = "#F5C518";

// 실시간 순위표 한 줄 높이. 순위가 바뀌면 이 값만큼 위아래로 미끄러지며 자리를 바꿔요.
const ORDER_ROW_H = 18;
const ORDER_MOVE_MS = 900;

// 어느 시점의 순위는 "그 시각 이전에 마지막으로 기록된 순위"예요.
// /v1/position 은 순위가 바뀐 순간만 기록하는 이벤트 목록이라, 시각 기준으로 되감을 수 있습니다.
function orderAt(events, ms) {
  const latest = new Map();
  for (const e of events) {
    if (e.t > ms) break;
    latest.set(e.num, e.position);
  }
  return [...latest.entries()]
    .sort((a, b) => a[1] - b[1])
    .map(([num, position]) => ({ num, position }));
}

// 코너 번호를 트랙 바깥으로 밀어내는 거리(트랙 좌표 단위).
// 서킷 데이터가 코너마다 주는 angle 방향으로 밀면 번호가 트랙 안쪽으로 들어가지 않아요.
const CORNER_LABEL_OFFSET = 520;

const TRACK_MAX_W = 560;
const TRACK_MAX_H = 300;
const TRACK_PAD = 26;

// 좌표는 위경도가 아니라 서킷마다 제각각인 임의 단위라, 받아온 점들의 경계 상자를
// 기준으로 viewBox에 맞춰 넣어요. 가로세로 비율은 그대로 두고(찌그러짐 방지),
// viewBox 자체를 트랙 비율에 맞게 잡아서 헝가로링처럼 세로로 긴 서킷도 양옆이 비지 않게 합니다.
// SVG는 y가 아래로 증가하니 y축은 뒤집습니다.
// rotationDeg는 서킷 데이터가 알려주는 표준 방향이에요. 중계 화면에서 보던 각도로 맞춰줍니다.
function makeProjection(points, rotationDeg = 0) {
  const rad = (rotationDeg * Math.PI) / 180;
  const cos = Math.cos(rad), sin = Math.sin(rad);
  const spin = (x, y) => [x * cos - y * sin, x * sin + y * cos];

  const spun = points.map(([x, y]) => spin(x, y));
  const xs = spun.map((p) => p[0]);
  const ys = spun.map((p) => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const spanX = maxX - minX || 1;
  const spanY = maxY - minY || 1;
  const scale = Math.min((TRACK_MAX_W - TRACK_PAD * 2) / spanX, (TRACK_MAX_H - TRACK_PAD * 2) / spanY);
  const width = spanX * scale + TRACK_PAD * 2;
  const height = spanY * scale + TRACK_PAD * 2;
  const project = (x, y) => {
    const [rx, ry] = spin(x, y);
    return [(rx - minX) * scale + TRACK_PAD, height - ((ry - minY) * scale + TRACK_PAD)];
  };

  // 차가 트랙 위에 없을 때(리타이어·개러지) 좌표 피드는 서킷에서 한참 떨어진 고정 좌표를
  // 계속 내보내요. 상하이는 (-8325, -7058)로, 트랙에서 서킷 크기의 46%만큼 떨어져 있습니다.
  // 값 자체는 서킷마다 다르니 하드코딩하지 않고, 트랙 경계 밖인지로 걸러요.
  const margin = Math.max(spanX, spanY) * 0.06;
  const onTrack = (x, y) => {
    const [rx, ry] = spin(x, y);
    return rx >= minX - margin && rx <= maxX + margin && ry >= minY - margin && ry <= maxY + margin;
  };

  return { project, width, height, onTrack };
}

// MultiViewer 서킷 데이터는 코너 번호와 촘촘한 트랙 윤곽선을 주고, 좌표계가 F1 포지션
// 피드와 같아서 OpenF1 차량 좌표와 그대로 겹칩니다(FastF1이 쓰는 것과 같은 출처예요).
// 공식 API가 아니라서 실패할 수 있고, 그때는 우리가 받은 주행 좌표로 윤곽선을 대신 그려요.
async function fetchCircuitGeometry(circuitKey, year) {
  const geo = await fetchJSON(`https://api.multiviewer.app/api/v1/circuits/${circuitKey}/${year}`);
  if (!Array.isArray(geo?.x) || geo.x.length < 50) throw new Error("서킷 윤곽선 없음");
  return {
    outline: geo.x.map((x, i) => [x, geo.y[i]]),
    corners: Array.isArray(geo.corners) ? geo.corners : [],
    rotation: typeof geo.rotation === "number" ? geo.rotation : 0,
  };
}

// 트랙을 가로지르는 체커드 라인을 그리려면 그 지점의 진행 방향이 필요해요.
// 앞뒤로 조금 떨어진 점을 이어서 접선을 구하면 한 점씩만 볼 때보다 방향이 안정적입니다.
function tangentAt(pts, index, span = 3) {
  const n = pts.length;
  const a = pts[(index - span + n) % n];
  const b = pts[(index + span) % n];
  return (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
}

// race_control 의 SafetyCar 메시지는 네 가지예요.
// SAFETY CAR DEPLOYED / SAFETY CAR IN THIS LAP / VSC DEPLOYED / VSC ENDING.
// "IN THIS LAP"은 그 랩이 끝날 때까지 세이프티카가 남아 있다는 뜻이라, 메시지 시각이 아니라
// 다음 랩이 시작되는 시각에 구간을 닫아야 실제 상황과 맞습니다.
// 끝 메시지 없이 레이스가 끝나는 경우도 있어서, 그때는 열린 채로 둡니다.
function buildSafetyCarPeriods(events, laps) {
  const periods = [];
  let open = null;
  [...events]
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .forEach((e) => {
      const msg = (e.message || "").toUpperCase();
      const at = new Date(e.date).getTime();

      if (msg.includes("DEPLOYED")) {
        if (!open) open = { type: msg.includes("VSC") || msg.includes("VIRTUAL") ? "VSC" : "SC", from: at };
        return;
      }
      if (!open) return;

      if (msg.includes("IN THIS LAP")) {
        const next = laps.find((l) => new Date(l.date_start).getTime() > at);
        open.to = next ? new Date(next.date_start).getTime() : at;
      } else if (msg.includes("ENDING")) {
        open.to = at;
      } else {
        return;
      }
      periods.push(open);
      open = null;
    });
  if (open) {
    open.to = Infinity;
    periods.push(open);
  }
  return periods;
}


// (0, 0)은 신호가 끊긴 구간에 들어오는 값이라 버려요.
function cleanLocations(raw) {
  return raw.filter((p) => typeof p.x === "number" && typeof p.y === "number" && !(p.x === 0 && p.y === 0));
}

// 좌표 피드는 서킷/세션에 따라 갱신 간격이 크게 달라요. 초당 4회로 내려오지만 같은 값이
// 반복되는 경우가 있어서(헝가로링은 한 랩에 실제로 26개 지점), 연속으로 같은 좌표는 하나로 합쳐요.
// 값이 바뀐 첫 시점을 남겨야 뒤에서 시간 보간이 맞습니다.
function dedupeConsecutive(points) {
  const out = [];
  points.forEach((p) => {
    const prev = out[out.length - 1];
    if (!prev || prev.x !== p.x || prev.y !== p.y) out.push(p);
  });
  return out;
}

// 너무 가까이 붙은 점은 빼요. 간격이 들쭉날쭉하면 곡선이 튀면서 트랙에 매듭이 생겨요.
function thinPoints(pts, minGap) {
  const out = [];
  pts.forEach((p) => {
    const prev = out[out.length - 1];
    if (!prev || Math.hypot(p[0] - prev[0], p[1] - prev[1]) >= minGap) out.push(p);
  });
  // 닫힌 곡선이라 마지막 점이 첫 점과 겹치면 이음매가 접혀요.
  while (out.length > 2 && Math.hypot(out[out.length - 1][0] - out[0][0], out[out.length - 1][1] - out[0][1]) < minGap) out.pop();
  return out;
}

// 성긴 점을 직선으로 이으면 트랙이 각진 다각형으로 보여요.
// 균등(uniform) Catmull-Rom은 점 간격이 고르지 않으면 곡선이 밖으로 튀어서,
// 간격을 반영하는 centripetal(alpha=0.5) 방식으로 3차 베지에 제어점을 만듭니다.
function closedSplinePath(rawPts) {
  const pts = thinPoints(rawPts, 3);
  if (pts.length < 4) return "";
  const at = (i) => pts[(i + pts.length) % pts.length];
  const fmt = (v) => v.toFixed(1);
  const dist = (a, b) => Math.max(Math.hypot(b[0] - a[0], b[1] - a[1]), 1e-4) ** 0.5;

  let d = `M ${fmt(pts[0][0])} ${fmt(pts[0][1])}`;
  for (let i = 0; i < pts.length; i++) {
    const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
    const d1 = dist(p0, p1), d2 = dist(p1, p2), d3 = dist(p2, p3);
    const c1 = [0, 1].map((k) =>
      (d1 * d1 * p2[k] - d2 * d2 * p0[k] + (2 * d1 * d1 + 3 * d1 * d2 + d2 * d2) * p1[k]) / (3 * d1 * (d1 + d2))
    );
    const c2 = [0, 1].map((k) =>
      (d3 * d3 * p1[k] - d2 * d2 * p3[k] + (2 * d3 * d3 + 3 * d3 * d2 + d2 * d2) * p2[k]) / (3 * d3 * (d3 + d2))
    );
    d += ` C ${fmt(c1[0])} ${fmt(c1[1])}, ${fmt(c2[0])} ${fmt(c2[1])}, ${fmt(p2[0])} ${fmt(p2[1])}`;
  }
  return `${d} Z`;
}

function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}

function toApiDate(d) {
  return d.toISOString().slice(0, -1);
}

function lapWindow(lap) {
  const start = new Date(lap.date_start);
  const end = new Date(start.getTime() + lap.lap_duration * 1000);
  return { start, end, durationMs: lap.lap_duration * 1000 };
}

// 좌표 피드는 보통 0.25초 간격으로 촘촘히 와요(상하이 12랩 기준 중앙값 240ms, 최대 940ms).
// 이보다 한참 벌어졌다면 그 구간은 차가 트랙에 없었다는 뜻이라, 억지로 이어 붙이면
// 점이 트랙을 가로질러 날아갔다 돌아오는 것처럼 보여요. 그럴 땐 아예 그리지 않습니다.
const MAX_GAP_MS = 3000;

// 샘플 사이를 스플라인으로 채워서, 성긴 좌표를 부드럽게 움직이는 점으로 만들어요.
function positionAt(track, ms) {
  if (track.length < 2) return null;
  if (ms < track[0].t - MAX_GAP_MS || ms > track[track.length - 1].t + MAX_GAP_MS) return null;
  if (track.length < 4) return track[0];
  if (ms <= track[0].t) return track[0];
  if (ms >= track[track.length - 1].t) return track[track.length - 1];

  let lo = 0, hi = track.length - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (track[mid].t <= ms) lo = mid; else hi = mid;
  }
  const at = (i) => track[Math.max(0, Math.min(track.length - 1, i))];
  const a = at(lo), b = at(lo + 1);
  if (b.t - a.t > MAX_GAP_MS) return null;
  const span = b.t - a.t;
  const f = span > 0 ? (ms - a.t) / span : 0;
  const p0 = at(lo - 1), p3 = at(lo + 2);
  return {
    x: catmullRom(p0.x, a.x, b.x, p3.x, f),
    y: catmullRom(p0.y, a.y, b.y, p3.y, f),
  };
}

function TrackMap({ sessionKey, leaderNumber, driversByNumber, circuitKey, year, safetyCarEvents, resultsLoading }) {
  const [laps, setLaps] = useState([]);
  const [lapNumber, setLapNumber] = useState(null);
  const [outline, setOutline] = useState(null);
  const [tracks, setTracks] = useState(null);
  const [durationMs, setDurationMs] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [speedOpen, setSpeedOpen] = useState(false);
  const [loadingLap, setLoadingLap] = useState(false);
  const [error, setError] = useState(null);
  const [lapOpen, setLapOpen] = useState(false);
  const [positionEvents, setPositionEvents] = useState([]);

  const lapCache = useRef({});
  const rafRef = useRef(null);

  // 세션이 바뀌면 랩 목록과 서킷 윤곽선을 새로 받아요.
  // 윤곽선은 리더의 가장 빠른 랩(피트 아웃 랩 제외)을 쓰면 트랙 모양이 가장 깨끗하게 나와요.
  useEffect(() => {
    if (!sessionKey || !leaderNumber) return;
    let cancelled = false;
    lapCache.current = {};
    setLaps([]); setLapNumber(null); setOutline(null); setTracks(null);
    setPositionEvents([]);
    setPlaying(false); setElapsed(0); setError(null);

    async function loadTrack() {
      try {
        // 순위표·날씨·라디오 요청이 먼저 끝나도록 잠깐 양보해요. 트랙맵은 조금 늦게 떠도 괜찮아요.
        await sleep(2500);
        if (cancelled) return;

        const all = await fetchOpenF1(`https://api.openf1.org/v1/laps?session_key=${sessionKey}&driver_number=${leaderNumber}`);
        const usable = all.filter((l) => l.date_start && typeof l.lap_duration === "number");
        if (cancelled || usable.length === 0) return;

        setLaps(usable);
        // 1랩부터 시작해요. 스타트 직후가 순위 변동이 가장 많아서 리플레이로 볼 값이 큽니다.
        setLapNumber(usable[0].lap_number);

        // 순위 변동은 바뀐 순간만 기록돼서 세션 전체를 받아도 60KB 남짓이에요(헝가리 536건).
        // 순위표가 없어도 트랙맵은 보여야 하니 실패해도 넘어갑니다.
        await sleep(400);
        try {
          const pos = await fetchOpenF1(`https://api.openf1.org/v1/position?session_key=${sessionKey}`);
          if (!cancelled) {
            setPositionEvents(
              pos
                .map((p) => ({ t: new Date(p.date).getTime(), num: p.driver_number, position: p.position }))
                .sort((a, b) => a.t - b.t)
            );
          }
        } catch (e) {
          // 순위표만 비어요.
        }
        if (cancelled) return;

        // 코너 번호가 트랙 위에 정확히 얹히려면 서킷 윤곽선도 같은 출처여야 해요.
        // 우리 주행 좌표는 헝가로링 기준 한 랩에 26점뿐이라 트랙 최외곽을 놓치는 구간이 있습니다.
        let geo = null;
        try {
          if (circuitKey) geo = await fetchCircuitGeometry(circuitKey, year);
        } catch (e) {
          geo = null;
        }
        if (cancelled) return;

        if (geo) {
          // 서킷 윤곽선의 첫 점이 곧 스타트/피니시 라인이에요.
          // 리더의 랩 시작 좌표와 맞춰 보면 헝가로링 0.1%, 상하이 0.3%(서킷 크기 대비) 안에 들어와요.
          // 덕분에 참조 랩 좌표를 따로 받지 않아도 되고, 모나코처럼 대부분의 랩에
          // location 데이터가 없는 세션에서도 트랙맵이 뜹니다.
          const { project, width, height, onTrack } = makeProjection(geo.outline, geo.rotation);
          const screen = thinPoints(geo.outline.map(([x, y]) => project(x, y)), 1.5);
          const d = `M ${screen.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(" L ")} Z`;
          setOutline({
            d,
            project,
            onTrack,
            width,
            height,
            corners: geo.corners,
            startLine: { at: screen[0], angle: tangentAt(screen, 0) },
            source: "circuit",
          });
          return;
        }

        // 서킷 데이터가 없는 경우(2026 기준 Madring·쿠알라룸푸르)에만 주행 좌표로 윤곽선을 그려요.
        // 코너 번호는 못 얹지만 트랙과 차량은 보입니다.
        const referencePool = usable.filter((l) => !l.is_pit_out_lap);
        const reference = (referencePool.length > 0 ? referencePool : usable)
          .slice()
          .sort((a, b) => a.lap_duration - b.lap_duration)[0];
        const { start, end } = lapWindow(reference);

        await sleep(400);
        const raw = await fetchOpenF1(
          `https://api.openf1.org/v1/location?session_key=${sessionKey}&driver_number=${leaderNumber}` +
          `&date%3E${toApiDate(start)}&date%3C${toApiDate(end)}`
        );
        if (cancelled) return;

        const pts = dedupeConsecutive(cleanLocations(raw)).map((p) => [p.x, p.y]);
        if (pts.length < 8) {
          setError("이 세션은 트랙 좌표 데이터가 없어요.");
          return;
        }

        const { project, width, height, onTrack } = makeProjection(pts);
        const screen = thinPoints(pts.map(([x, y]) => project(x, y)), 3);
        const d = closedSplinePath(screen);
        if (!d) return;
        setOutline({
          d,
          project,
          onTrack,
          width,
          height,
          corners: [],
          startLine: { at: screen[0], angle: tangentAt(screen, 0, 1) },
          source: "location",
        });
      } catch (e) {
        if (!cancelled) setError("트랙 좌표를 불러오지 못했어요.");
      }
    }
    loadTrack();
    return () => { cancelled = true; };
  }, [sessionKey, leaderNumber, circuitKey, year]);

  // 선택한 랩의 전체 드라이버 좌표(약 1MB, 요청 1번). 이미 본 랩은 캐시에서 꺼내 씁니다.
  useEffect(() => {
    if (!lapNumber || laps.length === 0) return;
    // 트랙 밖 좌표를 걸러내려면 서킷 경계가 필요해서 윤곽선이 준비된 뒤에 받아요.
    if (!outline) return;
    const lap = laps.find((l) => l.lap_number === lapNumber);
    if (!lap) return;

    let cancelled = false;
    setPlaying(false);
    setElapsed(0);

    const cached = lapCache.current[lapNumber];
    if (cached) {
      setTracks(cached.tracks);
      setDurationMs(cached.durationMs);
      return;
    }

    async function loadLap() {
      setLoadingLap(true);
      setError(null);
      try {
        const { start, end, durationMs: dur } = lapWindow(lap);
        const raw = await fetchOpenF1(
          `https://api.openf1.org/v1/location?session_key=${sessionKey}` +
          `&date%3E${toApiDate(start)}&date%3C${toApiDate(end)}`
        );
        if (cancelled) return;

        const base = start.getTime();
        const grouped = {};
        cleanLocations(raw)
          // 리타이어했거나 개러지에 있는 차의 고정 좌표를 여기서 빼요. 남겨두면 점이
          // 트랙 밖에 붙박이로 찍히고, 보간이 그 사이를 이으면서 날아갔다 돌아옵니다.
          .filter((p) => outline.onTrack(p.x, p.y))
          .forEach((p) => {
            (grouped[p.driver_number] ||= []).push({ t: new Date(p.date).getTime() - base, x: p.x, y: p.y });
          });
        Object.keys(grouped).forEach((num) => {
          grouped[num].sort((a, b) => a.t - b.t);
          grouped[num] = dedupeConsecutive(grouped[num]);
        });

        lapCache.current[lapNumber] = { tracks: grouped, durationMs: dur };
        setTracks(grouped);
        setDurationMs(dur);
      } catch (e) {
        if (!cancelled) setError("랩 데이터를 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요.");
      } finally {
        if (!cancelled) setLoadingLap(false);
      }
    }
    loadLap();
    return () => { cancelled = true; };
  }, [lapNumber, laps, sessionKey, outline]);

  // 1배속이 실제 주행 속도예요. 배속을 올리면 같은 시간에 더 많이 진행합니다.
  useEffect(() => {
    if (!playing || durationMs === 0) return;
    let last = performance.now();
    const step = (now) => {
      // 다른 탭에 가 있는 동안엔 rAF가 멈춰요. 돌아왔을 때 그 시간만큼 한 번에 건너뛰지 않도록
      // 실제 경과 시간에 먼저 상한을 두고, 그 뒤에 배속을 곱합니다.
      const delta = Math.min(now - last, 100) * speed;
      last = now;
      setElapsed((prev) => {
        const next = prev + delta;
        if (next >= durationMs) { setPlaying(false); return durationMs; }
        return next;
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, durationMs, speed]);

  const project = outline?.project;
  const dots = [];
  if (project && tracks) {
    Object.entries(tracks).forEach(([num, track]) => {
      const pos = positionAt(track, elapsed);
      if (!pos) return;
      const info = driversByNumber?.[num] || {};
      const [cx, cy] = project(pos.x, pos.y);
      dots.push({ num, cx, cy, code: info.code || num, color: info.color || ACCENT });
    });
  }

  const corners = [];
  if (project && outline?.corners?.length) {
    outline.corners.forEach((c) => {
      const pos = c.trackPosition;
      if (!pos || typeof c.angle !== "number") return;
      const rad = (c.angle * Math.PI) / 180;
      const [x, y] = project(
        pos.x + CORNER_LABEL_OFFSET * Math.cos(rad),
        pos.y + CORNER_LABEL_OFFSET * Math.sin(rad)
      );
      corners.push({ key: `${c.number}${c.letter || ""}`, x, y });
    });
  }

  const currentLap = laps.find((l) => l.lap_number === lapNumber);

  // 랩 목록은 랩 번호 순이라 앞뒤 항목이 곧 이전·다음 랩이에요.
  const lapIndex = laps.findIndex((l) => l.lap_number === lapNumber);
  const prevLap = lapIndex > 0 ? laps[lapIndex - 1] : null;
  const nextLap = lapIndex >= 0 && lapIndex < laps.length - 1 ? laps[lapIndex + 1] : null;
  const stepLap = (delta) => {
    const target = delta < 0 ? prevLap : nextLap;
    if (!target) return;
    setLapNumber(target.lap_number);
    setLapOpen(false);
    setSpeedOpen(false);
  };
  const lapHasNoData = !!tracks && Object.keys(tracks).length === 0;
  const ready = outline && tracks && !lapHasNoData;

  // 재생 위치의 절대 시각. 세이프티카 구간 판정과 순위표가 같은 기준을 씁니다.
  const nowMs = currentLap ? new Date(currentLap.date_start).getTime() + elapsed : null;

  const safetyCarPeriods = safetyCarEvents?.length && laps.length
    ? buildSafetyCarPeriods(safetyCarEvents, laps)
    : [];

  const activeSafetyCar = nowMs && safetyCarPeriods.length
    ? safetyCarPeriods.find((p) => nowMs >= p.from && nowMs < p.to) || null
    : null;

  const liveOrder = nowMs && positionEvents.length ? orderAt(positionEvents, nowMs) : [];

  // 렌더 순서는 드라이버 번호로 고정하고, 화면상의 자리는 slot 으로만 넘겨요.
  // (이유는 아래 순위표 렌더 부분 주석 참고)
  const orderRows = liveOrder
    .map((d, slot) => ({ ...d, slot }))
    .sort((a, b) => a.num - b.num);

  // 세이프티카는 보통 70랩 중 두어 랩뿐이라, 랩 목록에 표시해 두지 않으면 찾아 들어가기 어려워요.
  const safetyCarLaps = new Set();
  safetyCarPeriods.length && laps.forEach((l) => {
    const from = new Date(l.date_start).getTime();
    const to = from + l.lap_duration * 1000;
    if (safetyCarPeriods.some((p) => from < p.to && to > p.from)) safetyCarLaps.add(l.lap_number);
  });

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${LINE}` }}>
      <PanelHeader icon={MapPin} title="랩 리플레이" />

      <div className="flex items-center gap-2 px-4 py-2.5 flex-wrap" style={{ borderBottom: `1px solid ${LINE}` }}>
        <button
          onClick={() => stepLap(-1)}
          disabled={!prevLap}
          className="flex items-center justify-center rounded-md shrink-0"
          style={{ width: "32px", height: "32px", border: `1px solid ${LINE}`, backgroundColor: SURFACE_2, opacity: prevLap ? 1 : 0.35 }}
          aria-label="이전 랩"
          title={prevLap ? `${prevLap.lap_number}랩` : "첫 랩이에요"}
        >
          <ChevronLeft size={15} color={prevLap ? TEXT : MUTED} />
        </button>

        <div className="relative">
          <button
            onClick={() => { setLapOpen((v) => !v); setSpeedOpen(false); }}
            disabled={laps.length === 0}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md font-medium"
            style={{ color: laps.length === 0 ? MUTED : TEXT, border: `1px solid ${LINE}`, backgroundColor: SURFACE_2 }}
          >
            {lapNumber ? `${lapNumber}랩` : "랩 선택"}
            <ChevronDown size={14} />
          </button>
          {lapOpen && (
            <div className="absolute left-0 mt-1 w-40 rounded-md overflow-hidden z-10 max-h-64 overflow-y-auto" style={{ backgroundColor: SURFACE_2, border: `1px solid ${LINE}` }}>
              {laps.map((l) => (
                <button
                  key={l.lap_number}
                  onClick={() => { setLapNumber(l.lap_number); setLapOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm flex items-center justify-between"
                  style={{ color: l.lap_number === lapNumber ? ACCENT : TEXT, borderBottom: `1px solid ${LINE}` }}
                >
                  <span className="flex items-center gap-1.5">
                    {l.lap_number}랩
                    {safetyCarLaps.has(l.lap_number) && (
                      <span
                        className="rounded-sm px-1 text-[9px] font-bold"
                        style={{ backgroundColor: SAFETY_YELLOW, color: ASPHALT }}
                        title="세이프티카 구간"
                      >
                        SC
                      </span>
                    )}
                  </span>
                  <span className="text-xs" style={{ color: MUTED }}>
                    {lapCache.current[l.lap_number] ? "●" : ""} {l.lap_duration.toFixed(1)}s
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => stepLap(1)}
          disabled={!nextLap}
          className="flex items-center justify-center rounded-md shrink-0"
          style={{ width: "32px", height: "32px", border: `1px solid ${LINE}`, backgroundColor: SURFACE_2, opacity: nextLap ? 1 : 0.35 }}
          aria-label="다음 랩"
          title={nextLap ? `${nextLap.lap_number}랩` : "마지막 랩이에요"}
        >
          <ChevronRight size={15} color={nextLap ? TEXT : MUTED} />
        </button>

        <button
          onClick={() => {
            if (elapsed >= durationMs) setElapsed(0);
            setPlaying((v) => !v);
          }}
          disabled={!ready}
          className="flex items-center justify-center rounded-md shrink-0"
          style={{ width: "32px", height: "32px", border: `1px solid ${LINE}`, backgroundColor: SURFACE_2, opacity: ready ? 1 : 0.4 }}
          aria-label={playing ? "일시정지" : "재생"}
        >
          {playing
            ? <Pause size={13} color={ACCENT} fill={ACCENT} />
            : <Play size={13} color={ACCENT} fill={ACCENT} />}
        </button>

        <div className="relative shrink-0">
          <button
            onClick={() => { setSpeedOpen((v) => !v); setLapOpen(false); }}
            disabled={!ready}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md font-medium"
            style={{
              color: speed === 1 ? TEXT : ACCENT,
              border: `1px solid ${speed === 1 ? LINE : ACCENT}`,
              backgroundColor: SURFACE_2,
              opacity: ready ? 1 : 0.4,
            }}
            aria-label={`재생 속도 ${speed}배속`}
          >
            {speed}×
            <ChevronDown size={14} />
          </button>
          {speedOpen && (
            <div className="absolute left-0 mt-1 w-24 rounded-md overflow-hidden z-10" style={{ backgroundColor: SURFACE_2, border: `1px solid ${LINE}` }}>
              {PLAYBACK_SPEEDS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setSpeed(s); setSpeedOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm"
                  style={{ color: s === speed ? ACCENT : TEXT, borderBottom: `1px solid ${LINE}` }}
                >
                  {s}×
                </button>
              ))}
            </div>
          )}
        </div>

        {/*
          재생 중에 시점을 옮기면 그 자리에서 이어서 재생돼요. 멈추려면 일시정지를 쓰면 됩니다.
          재생 루프가 setElapsed 를 함수형으로 갱신해서, 여기서 값을 바꿔도 튀지 않아요.
        */}
        <input
          type="range"
          min={0}
          max={durationMs || 1}
          value={elapsed}
          disabled={!ready}
          onChange={(e) => setElapsed(Number(e.target.value))}
          className="flex-1"
          style={{ accentColor: ACCENT, minWidth: "120px" }}
        />

        <span className="text-xs shrink-0" style={{ color: MUTED, fontFamily: "ui-monospace, monospace" }}>
          {(elapsed / 1000).toFixed(1)}s / {currentLap ? currentLap.lap_duration.toFixed(1) : "--"}s
        </span>
      </div>

      {error && <ErrorBlock message={error} />}

      {!error && !sessionKey ? (
        <div className="px-4 py-8 text-sm text-center" style={{ color: MUTED }}>세션을 먼저 선택해 주세요.</div>
      ) : !error && !leaderNumber ? (
        // 순위표가 아직 안 왔을 뿐인데 "쓸 수 없다"고 하면 안 되니 로딩과 구분해요.
        resultsLoading
          ? <LoadingBlock label="트랙 좌표를 불러오는 중..." />
          : <div className="px-4 py-8 text-sm text-center" style={{ color: MUTED }}>이 세션은 좌표 데이터를 쓸 수 없어요.</div>
      ) : !error && !outline ? <LoadingBlock label="트랙 좌표를 불러오는 중..." /> : !error && (
        <div className="p-4 relative">
          {activeSafetyCar && (
            <div
              className="absolute left-4 top-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold"
              style={{ backgroundColor: SAFETY_YELLOW, color: ASPHALT }}
            >
              <AlertCircle size={12} />
              {activeSafetyCar.type === "VSC" ? "버추얼 세이프티카" : "세이프티카"}
            </div>
          )}
          {/* 좁은 화면에선 순위표가 맵을 눌러버려서, 접히면 아래로 내려가게 둡니다. */}
          <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", flexWrap: "wrap" }}>
          <svg viewBox={`0 0 ${outline.width.toFixed(0)} ${outline.height.toFixed(0)}`} className="h-auto" style={{ flex: "1 1 240px", minWidth: 0, maxHeight: "380px" }}>
            <defs>
              <pattern id="track-checker" width={CHECKER_CELL * 2} height={CHECKER_CELL * 2} patternUnits="userSpaceOnUse">
                <rect width={CHECKER_CELL * 2} height={CHECKER_CELL * 2} fill={TEXT} />
                <rect width={CHECKER_CELL} height={CHECKER_CELL} fill={ASPHALT} />
                <rect x={CHECKER_CELL} y={CHECKER_CELL} width={CHECKER_CELL} height={CHECKER_CELL} fill={ASPHALT} />
              </pattern>
            </defs>

            <path d={outline.d} fill="none" stroke={LINE} strokeWidth="14" strokeLinejoin="round" strokeLinecap="round" />
            <path d={outline.d} fill="none" stroke={SURFACE_2} strokeWidth="10" strokeLinejoin="round" strokeLinecap="round" />

            {/* 코너 번호는 차량 점보다 아래에 깔아서, 겹칠 때 차가 가려지지 않게 해요. */}
            {corners.map((c) => (
              <text
                key={c.key}
                x={c.x}
                y={c.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="7.5"
                fontWeight="600"
                fill={MUTED}
                fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
              >
                {c.key}
              </text>
            ))}

            {outline.startLine && (
              <rect
                x={-CHECKER_LENGTH / 2}
                y={-CHECKER_DEPTH / 2}
                width={CHECKER_LENGTH}
                height={CHECKER_DEPTH}
                fill="url(#track-checker)"
                transform={`translate(${outline.startLine.at[0].toFixed(1)} ${outline.startLine.at[1].toFixed(1)}) rotate(${(outline.startLine.angle + 90).toFixed(1)})`}
              />
            )}

            {dots.map((p) => (
              <g key={p.num}>
                <circle cx={p.cx} cy={p.cy} r={DOT_R} fill={p.color} stroke={ASPHALT} strokeWidth="1.5" />
                <text
                  x={p.cx}
                  y={p.cy - DOT_R - DOT_LABEL_GAP}
                  textAnchor="middle"
                  fontSize="10.5"
                  fontWeight="700"
                  fill={readableAccent(p.color) || TEXT}
                  fontFamily="system-ui, -apple-system, 'Segoe UI', sans-serif"
                  letterSpacing="0.3"
                >
                  {p.code}
                </text>
              </g>
            ))}
          </svg>

          {liveOrder.length > 0 && (
            // 각 행을 절대 배치하고 translateY 로만 자리를 잡아요.
            // 중요한 건 DOM 순서를 드라이버 번호로 고정하는 것: 화면 순위대로 렌더하면 순위가 바뀔 때
            // React 가 내려간 행을 insertBefore 로 옮기는데, 재삽입된 노드는 진행 중이던 트랜지션이
            // 끊겨서 그 행만 애니메이션 없이 튑니다. DOM 을 고정하면 transform 만 바뀌어서
            // 올라가는 행과 내려가는 행이 똑같이 미끄러지고, 둘이 서로 교차합니다.
            <div style={{ flex: "0 0 118px", position: "relative", height: `${liveOrder.length * ORDER_ROW_H}px` }}>
              {orderRows.map(({ num, position, slot }) => {
                const info = driversByNumber?.[num] || {};
                const color = info.color || ACCENT;
                return (
                  <div
                    key={num}
                    className="absolute left-0 right-0 flex items-center gap-1.5"
                    style={{
                      height: `${ORDER_ROW_H}px`,
                      transform: `translateY(${slot * ORDER_ROW_H}px)`,
                      transition: `transform ${ORDER_MOVE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
                    }}
                  >
                    <span
                      className="text-right shrink-0"
                      style={{ width: "14px", fontSize: "10px", color: MUTED, fontFamily: "ui-monospace, monospace" }}
                    >
                      {position}
                    </span>
                    <span className="shrink-0 rounded-sm" style={{ width: "3px", height: "11px", backgroundColor: color }} />
                    <span
                      className="font-bold"
                      style={{ fontSize: "11px", color: readableAccent(color) || TEXT, letterSpacing: "0.02em" }}
                    >
                      {info.code || num}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          </div>

          {loadingLap && (
            <div className="flex items-center gap-2 text-xs mt-2" style={{ color: MUTED }}>
              <Loader2 size={11} className="animate-spin" />
              {lapNumber}랩 좌표를 불러오는 중... (약 1MB)
            </div>
          )}
          {!loadingLap && lapHasNoData && (
            // 모나코처럼 일부 랩만 좌표가 있는 세션이 있어요. 빈 화면 대신 이유를 알려줍니다.
            <div className="text-xs mt-2" style={{ color: SAFETY_YELLOW }}>
              이 랩은 좌표 데이터가 없어요. 다른 랩을 골라 주세요.
            </div>
          )}
          {!loadingLap && !lapHasNoData && (
            <div className="text-xs mt-2" style={{ color: MUTED }}>
              랩을 고르면 그 랩 동안의 실제 주행 좌표가 재생돼요. 한 번 본 랩은 다시 받지 않아요.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RaceControlPanel({ items, loading, error, driverColors }) {
  return (
    <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${LINE}` }}>
      <PanelHeader icon={Flag} title="레이스 컨트롤" />
      {loading ? <LoadingBlock /> : error ? <ErrorBlock message={error} /> : (
        <div className="scroll-panel" style={{ maxHeight: "280px", overflowY: "auto" }}>
          {items.length === 0 && <div className="px-4 py-4 text-sm" style={{ color: MUTED }}>메시지가 없어요.</div>}
          {items.map((m, i) => (
            <div key={i} className="px-4 py-3 flex gap-2.5" style={{ borderBottom: i < items.length - 1 ? `1px solid ${LINE}` : "none" }}>
              <Info size={14} color={MUTED} className="mt-0.5 shrink-0" />
              <div>
                <div className="text-xs mb-1" style={{ color: MUTED }}>
                  {m.time}{m.lap ? ` · ${m.lap}랩` : ""}
                </div>
                <div className="text-sm" style={{ color: TEXT }}>{renderRaceControlText(m.text, driverColors)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PitStopsPanel({ items, loading, error }) {
  return (
    <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${LINE}` }}>
      <PanelHeader icon={Timer} title="피트 스탑" />
      {loading ? <LoadingBlock /> : error ? <ErrorBlock message={error} /> : (
        <div className="scroll-panel" style={{ maxHeight: "280px", overflowY: "auto" }}>
          {items.length === 0 && <div className="px-4 py-4 text-sm" style={{ color: MUTED }}>피트 스탑 기록이 없어요.</div>}
          {items.map((p, i) => (
            <div key={i} className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: i < items.length - 1 ? `1px solid ${LINE}` : "none" }}>
              <div className="flex items-center gap-2">
                {p.photo && (
                  <img
                    src={p.photo}
                    alt=""
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                    style={{ backgroundColor: SURFACE_2 }}
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                )}
                <div>
                  <div className="text-sm font-medium" style={{ color: TEXT }}>{p.code}</div>
                  <div className="text-xs mt-0.5" style={{ color: MUTED }}>{p.team}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm" style={{ color: TEXT, fontFamily: "ui-monospace, monospace" }}>{p.laneTime}</div>
                <div className="text-xs mt-0.5" style={{ color: MUTED }}>{p.lap}랩</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

async function fetchRadioCaption(url) {
  const res = await fetch("/api/caption-radio", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) throw new Error("자막 요청 실패");
  return res.json();
}

function TeamRadioPanel({ items, loading, error }) {
  const [playingIdx, setPlayingIdx] = useState(null);
  const [captions, setCaptions] = useState({});
  const audioRef = useRef(null);

  function loadCaption(i, url) {
    if (!url || captions[i]) return;
    setCaptions((prev) => ({ ...prev, [i]: { loading: true } }));
    fetchRadioCaption(url)
      .then((data) => setCaptions((prev) => ({ ...prev, [i]: { loading: false, turns: data.turns } })))
      .catch(() => setCaptions((prev) => ({ ...prev, [i]: { loading: false, error: true } })));
  }

  function toggle(i, url) {
    if (!url) return;
    if (playingIdx === i) {
      audioRef.current?.pause();
      setPlayingIdx(null);
      return;
    }
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(url);
    audio.onended = () => setPlayingIdx(null);
    audio.play().catch(() => setPlayingIdx(null));
    audioRef.current = audio;
    setPlayingIdx(i);
    loadCaption(i, url);
  }

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${LINE}` }}>
      <PanelHeader icon={Radio} title="팀 라디오" />
      {loading ? <LoadingBlock /> : error ? <ErrorBlock message={error} /> : (
        <div className="scroll-panel" style={{ maxHeight: "280px", overflowY: "auto" }}>
          {items.length === 0 && <div className="px-4 py-4 text-sm" style={{ color: MUTED }}>이 세션엔 공개된 팀 라디오가 없어요.</div>}
          {items.map((r, i) => {
            const caption = captions[i];
            const turns = caption?.turns;
            return (
              <div key={i} className="px-4 py-3" style={{ borderBottom: i < items.length - 1 ? `1px solid ${LINE}` : "none" }}>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggle(i, r.url)}
                    className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: r.url ? (r.teamColor || ACCENT) : LINE, cursor: r.url ? "pointer" : "default" }}
                    aria-label="재생"
                  >
                    {(() => {
                      const iconColor = r.url ? contrastIconColor(r.teamColor) : MUTED;
                      return playingIdx === i
                        ? <Pause size={12} color={iconColor} fill={iconColor} />
                        : <Play size={12} color={iconColor} fill={r.url ? iconColor : "none"} />;
                    })()}
                  </button>
                  {r.photo && (
                    <img
                      src={r.photo}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover shrink-0"
                      style={{ backgroundColor: SURFACE_2 }}
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  )}
                  <div>
                    <div className="text-sm font-medium" style={{ color: TEXT }}>{r.driver}</div>
                    <div className="text-xs" style={{ color: MUTED }}>{r.team} · {r.time}</div>
                  </div>
                </div>
                {caption?.loading && (
                  <div className="flex items-center gap-1.5 text-xs pl-8 mt-2" style={{ color: MUTED }}>
                    <Loader2 size={11} className="animate-spin" />
                    자막 만드는 중...
                  </div>
                )}
                {caption?.error && <div className="text-xs pl-8 mt-2" style={{ color: "#E24B4A" }}>자막을 불러오지 못했어요.</div>}
                {turns && turns.length > 0 && (
                  <div className="flex flex-col gap-1.5 pl-8 mt-2">
                    {turns.map((t, ti) => (
                      <div key={ti} className="flex items-start gap-2">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5"
                          style={{ backgroundColor: t.speaker === "driver" ? "#3BA9F5" : MUTED }}
                        />
                        <span className="text-sm" style={{ color: TEXT }}>{t.text}</span>
                      </div>
                    ))}
                  </div>
                )}
                {!turns && r.text && !caption?.loading && !caption?.error && (
                  <div className="text-sm pl-8 mt-2" style={{ color: TEXT }}>{r.text}</div>
                )}
              </div>
            );
          })}
          <div className="px-4 py-2 text-xs" style={{ color: MUTED }}>
            재생 버튼을 누르면 잠시 후 한글 자막이 표시돼요.
          </div>
        </div>
      )}
    </div>
  );
}

function LiveTab({ raceSessions, selectedSessionKey, setSelectedSessionKey, sessionData }) {
  const [pastOpen, setPastOpen] = useState(false);
  const latestSessionKey = raceSessions.length > 0 ? raceSessions[0].session_key : null;
  const isLatest = selectedSessionKey === latestSessionKey;
  const currentMeta = raceSessions.find((r) => r.session_key === selectedSessionKey);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <Eyebrow>{currentMeta ? koGpName(currentMeta.gpName) : "세션"}</Eyebrow>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color: TEXT }}>
              {isLatest ? "최신 세션 결과" : "지난 경기 결과"}
            </span>
            {currentMeta && <span className="text-xs" style={{ color: MUTED }}>{formatKoreanDate(currentMeta.date_start)}</span>}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!isLatest && (
            <button
              onClick={() => setSelectedSessionKey(latestSessionKey)}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md font-medium"
              style={{ color: ACCENT, border: `1px solid ${ACCENT}` }}
            >
              <ArrowLeft size={14} />
              최신 세션으로
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setPastOpen((v) => !v)}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md font-medium"
              style={{ color: MUTED, border: `1px solid ${LINE}`, backgroundColor: SURFACE_2 }}
            >
              <History size={14} />
              이전 경기들
              <ChevronDown size={14} />
            </button>

            {pastOpen && (
              <div className="absolute right-0 mt-1 w-56 rounded-md overflow-hidden z-10 max-h-72 overflow-y-auto" style={{ backgroundColor: SURFACE_2, border: `1px solid ${LINE}` }}>
                {raceSessions.map((r) => (
                  <button
                    key={r.session_key}
                    onClick={() => { setSelectedSessionKey(r.session_key); setPastOpen(false); }}
                    className="w-full text-left px-3.5 py-2.5 text-sm flex flex-col"
                    style={{ color: r.session_key === selectedSessionKey ? ACCENT : TEXT, borderBottom: `1px solid ${LINE}` }}
                  >
                    <span className="font-medium">{koGpName(r.gpName)}</span>
                    <span className="text-xs mt-0.5" style={{ color: MUTED }}>{formatKoreanDate(r.date_start)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6">
        <WeatherBar weather={sessionData.weather} />
      </div>

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-start" }}>
        <div style={{ flex: "2 1 420px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${LINE}` }}>
            <div className="grid grid-cols-12 px-4 py-2 text-xs font-medium" style={{ color: MUTED, borderBottom: `1px solid ${LINE}`, backgroundColor: SURFACE_2 }}>
              <div className="col-span-1">P</div>
              <div className="col-span-3">드라이버</div>
              <div className="col-span-3">간격</div>
              <div className="col-span-3">랩 수</div>
              <div className="col-span-2">타이어</div>
            </div>
            {sessionData.loadingResults ? <LoadingBlock /> : sessionData.resultsError ? <ErrorBlock message={sessionData.resultsError} /> : (
              sessionData.rows.map((d, i) => (
                <div key={d.code} className="grid grid-cols-12 px-4 py-3 items-center text-sm" style={{ borderBottom: i < sessionData.rows.length - 1 ? `1px solid ${LINE}` : "none", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                  <div className="col-span-1" style={{ color: d.pos === 1 ? ACCENT : TEXT }}>{d.pos}</div>
                  <div className="col-span-3 flex items-center gap-2 font-bold" style={{ color: readableAccent(d.teamColor) || TEXT, fontSize: "15px", fontFamily: "system-ui, -apple-system, sans-serif", letterSpacing: "0.01em" }}>
                    {d.team && (
                      <span
                        className="flex items-center justify-center rounded shrink-0"
                        style={{
                          minWidth: "34px",
                          height: "20px",
                          padding: "0 4px",
                          fontSize: "10px",
                          fontWeight: 800,
                          letterSpacing: "0",
                          backgroundColor: d.teamColor || LINE,
                          color: contrastIconColor(d.teamColor),
                        }}
                        title={d.team}
                      >
                        {teamAbbr(d.team)}
                      </span>
                    )}
                    {d.photo && (
                      <img
                        src={d.photo}
                        alt=""
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                        style={{ backgroundColor: SURFACE_2 }}
                        onError={(e) => { e.currentTarget.style.display = "none"; }}
                      />
                    )}
                    {d.code}
                  </div>
                  <div className="col-span-3" style={{ color: MUTED }}>{d.gap}</div>
                  <div className="col-span-3" style={{ color: TEXT }}>{d.laps}</div>
                  <div className="col-span-2">
                    <span
                      className="flex items-center justify-center rounded-full"
                      style={{
                        width: "22px",
                        height: "22px",
                        backgroundColor: d.tireColor,
                        color: contrastIconColor(d.tireColor),
                        fontSize: "11px",
                        fontWeight: 800,
                        fontFamily: "system-ui, -apple-system, sans-serif",
                        border: `1px solid ${LINE}`,
                      }}
                    >
                      {d.tireCode}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <TrackMap
            sessionKey={selectedSessionKey}
            leaderNumber={sessionData.rows.find((r) => r.pos === 1)?.num}
            driversByNumber={sessionData.driversByNumber}
            circuitKey={currentMeta?.circuit_key}
            year={currentMeta?.year}
            safetyCarEvents={sessionData.safetyCarEvents}
            resultsLoading={sessionData.loadingResults}
          />
        </div>

        <div style={{ flex: "1 1 260px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <RaceControlPanel items={sessionData.raceControl} loading={sessionData.loadingExtras} error={sessionData.extrasError} driverColors={sessionData.driverColors} />
          <PitStopsPanel items={sessionData.pitStops} loading={sessionData.loadingExtras} error={sessionData.extrasError} />
          <TeamRadioPanel items={sessionData.teamRadio} loading={sessionData.loadingExtras} error={sessionData.extrasError} />
        </div>
      </div>
    </div>
  );
}

function CalendarTab({ upcoming, loading, error }) {
  return (
    <div>
      <Eyebrow>2026 Season</Eyebrow>
      {loading ? <LoadingBlock /> : error ? <ErrorBlock message={error} /> : (
        <div className="flex flex-col gap-2">
          {upcoming.length === 0 && <div className="text-sm" style={{ color: MUTED }}>예정된 레이스 정보가 없어요.</div>}
          {upcoming.map((r) => (
            <div key={r.session_key} className="flex items-center justify-between px-4 py-4 rounded-lg" style={{ backgroundColor: SURFACE_2, border: `1px solid ${LINE}` }}>
              <div className="flex items-center gap-3">
                <MapPin size={16} color={ACCENT} />
                <div>
                  <div className="text-sm font-medium" style={{ color: TEXT }}>{koGpName(r.gpName)}</div>
                  <div className="text-xs mt-0.5" style={{ color: MUTED }}>{r.circuit}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm" style={{ color: TEXT }}>{formatKoreanDate(r.date_start)}</div>
                <div className="text-xs mt-0.5" style={{ color: ACCENT }}>D-{r.daysLeft}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const POSTS = [
  { tag: "레이스 리뷰", title: "헝가리 GP, 노리스가 지켜낸 홈 어드밴티지", date: "2026.07.28" },
  { tag: "칼럼", title: "2026 컨스트럭터 챔피언십, 지금까지의 판도", date: "2026.07.20" },
  { tag: "드라이버", title: "안토넬리의 첫 시즌, 기대 이상의 성장", date: "2026.07.15" },
  { tag: "테크", title: "새 공력 규정이 바꾼 추월 양상", date: "2026.07.10" },
];

function BlogTab() {
  const [featured, ...rest] = POSTS;
  return (
    <div>
      <Eyebrow>최근 글</Eyebrow>

      <div
        className="p-6 rounded-lg mb-3"
        style={{ backgroundColor: SURFACE_2, border: `1px solid ${LINE}` }}
      >
        <div className="text-xs font-medium mb-3" style={{ color: ACCENT }}>{featured.tag}</div>
        <div className="text-xl font-semibold leading-snug mb-3" style={{ color: TEXT, letterSpacing: "-0.01em" }}>
          {featured.title}
        </div>
        <div className="text-xs" style={{ color: MUTED }}>{featured.date}</div>
      </div>

      <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${LINE}` }}>
        {rest.map((p, i) => (
          <div
            key={p.title}
            className="p-4 flex items-center justify-between gap-4 cursor-pointer"
            style={{ borderBottom: i < rest.length - 1 ? `1px solid ${LINE}` : "none" }}
          >
            <div>
              <div className="text-xs font-medium mb-1" style={{ color: ACCENT }}>{p.tag}</div>
              <div className="text-sm font-medium" style={{ color: TEXT }}>{p.title}</div>
            </div>
            <div className="text-xs shrink-0" style={{ color: MUTED }}>{p.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function F1CosmosHome() {
  const [tab, setTab] = useState("live");

  const [raceSessions, setRaceSessions] = useState(FALLBACK_RACE_SESSIONS);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessionsError, setSessionsError] = useState(null);

  const [selectedSessionKey, setSelectedSessionKey] = useState(FALLBACK_SESSION_KEY);
  const [sessionData, setSessionData] = useState({
    rows: FALLBACK_ROWS, weather: FALLBACK_WEATHER, raceControl: FALLBACK_RACE_CONTROL,
    pitStops: FALLBACK_PIT_STOPS, teamRadio: FALLBACK_TEAM_RADIO, driverColors: {},
    loadingResults: false, resultsError: null, loadingExtras: false, extrasError: null,
  });

  const [upcoming, setUpcoming] = useState(FALLBACK_UPCOMING);
  const [loadingUpcoming, setLoadingUpcoming] = useState(false);
  const [upcomingError, setUpcomingError] = useState(null);

  const sessionCache = useRef({
    [FALLBACK_SESSION_KEY]: {
      rows: FALLBACK_ROWS, weather: FALLBACK_WEATHER, raceControl: FALLBACK_RACE_CONTROL,
      pitStops: FALLBACK_PIT_STOPS, teamRadio: FALLBACK_TEAM_RADIO,
    },
  });

  useEffect(() => {
    async function loadCalendar() {
      try {
        const [sessions, meetings] = await Promise.all([
          fetchOpenF1("https://api.openf1.org/v1/sessions?year=2026&session_name=Race"),
          fetchOpenF1("https://api.openf1.org/v1/meetings?year=2026"),
        ]);
        const meetingMap = {};
        meetings.forEach((m) => { meetingMap[m.meeting_key] = m; });

        const enriched = sessions.map((s) => ({
          ...s,
          gpName: meetingMap[s.meeting_key]?.meeting_name || `${s.country_name} Grand Prix`,
          circuit: s.circuit_short_name,
        }));

        const now = new Date();
        const past = enriched.filter((s) => new Date(s.date_start) < now).sort((a, b) => new Date(b.date_start) - new Date(a.date_start));
        const future = enriched.filter((s) => new Date(s.date_start) >= now).sort((a, b) => new Date(a.date_start) - new Date(b.date_start));

        setRaceSessions(past);
        setLoadingSessions(false);
        if (past.length > 0) setSelectedSessionKey(past[0].session_key);

        setUpcoming(future.slice(0, 5).map((r) => ({
          ...r,
          daysLeft: Math.max(0, Math.ceil((new Date(r.date_start) - now) / 86400000)),
        })));
        setLoadingUpcoming(false);
      } catch (e) {
        // 이 미리보기 환경에서는 외부 API 접속이 막혀 있어서 실패하는 게 정상이에요.
        // 실제 배포된 사이트에서는 이 catch 블록에 들어오지 않고 위의 실시간 데이터가 그대로 반영돼요.
        setLoadingSessions(false);
        setLoadingUpcoming(false);
      }
    }
    loadCalendar();
  }, []);

  useEffect(() => {
    if (!selectedSessionKey) return;

    // 이미 가져온 적 있는 경기라면 다시 요청하지 않고 캐시에서 바로 보여줘요.
    if (sessionCache.current[selectedSessionKey]) {
      setSessionData((prev) => ({ ...prev, ...sessionCache.current[selectedSessionKey], loadingResults: false, loadingExtras: false, resultsError: null, extrasError: null }));
      return;
    }

    let cancelled = false;

    // 결과 단계까지 성공했는지. 실패했을 때 어느 쪽에 오류를 표시할지 가릅니다.
    let resultsDone = false;

    async function loadSession() {
      // 다른 경기를 고른 거라 이전 경기 데이터는 여기서 모두 비워요.
      // 남겨두면 로딩에 실패했을 때 헤더는 새 경기인데 패널은 이전 경기를 보여주게 됩니다.
      setSessionData((prev) => ({
        ...prev,
        rows: [],
        weather: null,
        pitStops: [],
        teamRadio: [],
        raceControl: [],
        driverColors: null,
        driversByNumber: null,
        safetyCarEvents: null,
        loadingResults: true,
        loadingExtras: true,
        resultsError: null,
        extrasError: null,
      }));

      try {
        // OpenF1 무료 티어는 초당 3회/분당 30회 제한이 있어서, 한꺼번에 몰아서 요청하지 않고
        // 하나씩 순서대로, 사이사이 살짝 텀을 두고 가져와요.
        const drivers = await fetchOpenF1(`https://api.openf1.org/v1/drivers?session_key=${selectedSessionKey}`);
        const driverMap = {};
        drivers.forEach((d) => { driverMap[d.driver_number] = d; });
        const driverColors = {};
        drivers.forEach((d) => { if (d.name_acronym && d.team_colour) driverColors[d.name_acronym] = `#${d.team_colour}`; });

        // 트랙맵에서 좌표 데이터(driver_number 기준)를 드라이버 코드/팀 컬러로 이어주기 위한 표
        const driversByNumber = {};
        drivers.forEach((d) => {
          driversByNumber[d.driver_number] = {
            code: d.name_acronym || String(d.driver_number),
            color: d.team_colour ? `#${d.team_colour}` : ACCENT,
          };
        });

        await sleep(350);
        const results = await fetchOpenF1(`https://api.openf1.org/v1/session_result?session_key=${selectedSessionKey}`);

        await sleep(350);
        const stints = await fetchOpenF1(`https://api.openf1.org/v1/stints?session_key=${selectedSessionKey}`);

        const lastCompound = {};
        stints.forEach((s) => {
          const prevStint = lastCompound[s.driver_number];
          if (!prevStint || s.stint_number > prevStint.stint_number) lastCompound[s.driver_number] = s;
        });

        const rows = results
          .sort((a, b) => (a.position || 99) - (b.position || 99))
          .map((r) => {
            const drv = driverMap[r.driver_number] || {};
            const compound = lastCompound[r.driver_number]?.compound?.toUpperCase();
            return {
              pos: r.position,
              num: r.driver_number,
              code: drv.name_acronym || String(r.driver_number),
              gap: formatGap(r),
              laps: r.number_of_laps ?? "--",
              team: drv.team_name || "",
              teamColor: drv.team_colour ? `#${drv.team_colour}` : TEXT,
              tireColor: TIRE_COLORS[compound] || MUTED,
              tireCode: TIRE_LETTERS[compound] || "?",
              photo: drv.headshot_url || null,
            };
          });

        if (cancelled) return;
        setSessionData((prev) => ({ ...prev, rows, driversByNumber, loadingResults: false }));
        resultsDone = true;

        await sleep(350);
        const weatherArr = await fetchOpenF1(`https://api.openf1.org/v1/weather?session_key=${selectedSessionKey}`);
        await sleep(350);
        const pit = await fetchOpenF1(`https://api.openf1.org/v1/pit?session_key=${selectedSessionKey}`);
        await sleep(350);
        const radio = await fetchOpenF1(`https://api.openf1.org/v1/team_radio?session_key=${selectedSessionKey}`);
        await sleep(350);
        const raceControl = await fetchOpenF1(`https://api.openf1.org/v1/race_control?session_key=${selectedSessionKey}`);

        const weather = weatherArr.length > 0 ? weatherArr[weatherArr.length - 1] : null;

        const pitStops = pit
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map((p) => {
            const drv = driverMap[p.driver_number] || {};
            return { code: drv.name_acronym || String(p.driver_number), team: drv.team_name || "", lap: p.lap_number, laneTime: typeof p.pit_duration === "number" ? `${p.pit_duration.toFixed(1)}s` : "--", photo: drv.headshot_url || null };
          });

        const teamRadio = radio
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map((r) => {
            const drv = driverMap[r.driver_number] || {};
            return { driver: drv.full_name || String(r.driver_number), team: drv.team_name || "", teamColor: drv.team_colour ? `#${drv.team_colour}` : ACCENT, time: new Date(r.date).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }), url: r.recording_url, photo: drv.headshot_url || null };
          });

        const sortedRaceControl = raceControl
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        // 레이스 컨트롤 메시지는 매번 내용이 달라서 미리 사전을 만들 수 없어요.
        // 그래서 이 부분만 AI(Claude)에게 자연스러운 한국어 번역을 맡겨요.
        const translatedMessages = await translateBatch(sortedRaceControl.map((m) => m.message));

        const raceControlItems = sortedRaceControl.map((m, i) => ({
          time: new Date(m.date).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }),
          lap: m.lap_number,
          text: translatedMessages[i] || m.message,
        }));

        // 트랙맵에서 세이프티카 구간을 표시하려면 번역 전 원문과 정확한 시각이 필요해요.
        const safetyCarEvents = raceControl
          .filter((m) => m.category === "SafetyCar")
          .map((m) => ({ date: m.date, message: m.message, lap_number: m.lap_number }));

        if (cancelled) return;

        // 다음에 같은 경기를 다시 고르면 재요청 없이 바로 보여줄 수 있도록 캐시에 저장
        sessionCache.current[selectedSessionKey] = { rows, weather, pitStops, teamRadio, raceControl: raceControlItems, driverColors, driversByNumber, safetyCarEvents };

        setSessionData((prev) => ({ ...prev, weather, pitStops, teamRadio, raceControl: raceControlItems, driverColors, driversByNumber, safetyCarEvents, loadingExtras: false }));
      } catch (e) {
        // 요청 제한(429)에 걸렸거나 네트워크 문제일 때. 비운 채로 두고 오류를 알려요.
        // 이전 경기 데이터를 남겨두면 다른 경기 내용을 지금 경기인 것처럼 보여주게 됩니다.
        if (cancelled) return;
        const message = "데이터를 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요.";
        setSessionData((prev) => ({
          ...prev,
          loadingResults: false,
          loadingExtras: false,
          resultsError: resultsDone ? null : message,
          extrasError: message,
        }));
      }
    }
    loadSession();
    return () => { cancelled = true; };
  }, [selectedSessionKey]);

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: ASPHALT, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <header className="flex items-center justify-between px-6 py-4 flex-wrap gap-4" style={{ borderBottom: `1px solid ${LINE}` }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: ACCENT }}>
            <Zap size={16} color={ASPHALT} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-base tracking-wide" style={{ color: TEXT, letterSpacing: "0.02em" }}>
            F1 <span style={{ color: ACCENT }}>패독</span>
          </span>
        </div>

        <nav className="flex items-center gap-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-medium transition-colors" style={{ color: active ? ACCENT : MUTED, backgroundColor: active ? SURFACE : "transparent" }}>
                <Icon size={15} />
                {t.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className={`px-6 py-8 mx-auto ${tab === "live" ? "max-w-6xl" : "max-w-3xl"}`}>
        {tab === "live" && (
          loadingSessions ? <LoadingBlock label="경기 목록을 불러오는 중..." /> :
          sessionsError ? <ErrorBlock message={sessionsError} /> :
          <LiveTab raceSessions={raceSessions} selectedSessionKey={selectedSessionKey} setSelectedSessionKey={setSelectedSessionKey} sessionData={sessionData} />
        )}
        {tab === "cal" && <CalendarTab upcoming={upcoming} loading={loadingUpcoming} error={upcomingError} />}
        {tab === "blog" && <BlogTab />}
      </main>

      <footer className="px-6 py-4 text-xs text-center" style={{ color: MUTED, borderTop: `1px solid ${LINE}` }}>
        본 서비스는 비공식 프로젝트이며 포뮬러 1 관련 회사와 무관합니다. 데이터 제공: OpenF1 (비공식)
      </footer>
    </div>
  );
}
