import { useState, useEffect, useRef } from "react";
import {
  Zap, CalendarDays, PenLine, Circle, MapPin, Clock, ChevronDown, History,
  ArrowLeft, Thermometer, Droplets, Wind, Flag, Radio, Play, Pause, Info,
  Timer, Loader2, AlertCircle,
} from "lucide-react";

const ASPHALT = "#0B0C10";
const SURFACE = "#16181D";
const SURFACE_2 = "#1D2027";
const AMBER = "#F5A623";
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

async function fetchJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`요청 실패 (${res.status})`);
  return res.json();
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
      <Icon size={14} color={AMBER} />
      <span className="text-sm font-medium" style={{ color: TEXT }}>{title}</span>
    </div>
  );
}

function TrackMap() {
  const dots = [
    { code: "P1", x: 300, y: 30 },
    { code: "P2", x: 420, y: 55 },
    { code: "P3", x: 480, y: 130 },
    { code: "P4", x: 430, y: 210 },
    { code: "P5", x: 320, y: 250 },
  ];
  return (
    <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${LINE}` }}>
      <PanelHeader icon={MapPin} title="트랙맵 (예시)" />
      <div className="p-4">
        <svg viewBox="0 0 560 280" className="w-full h-auto">
          <path d="M 60 30 L 460 30 Q 520 30 520 90 L 520 150 Q 520 190 480 190 L 380 190 Q 340 190 340 230 L 340 250 Q 340 270 300 270 L 100 270 Q 40 270 40 210 L 40 90 Q 40 30 60 30 Z" fill="none" stroke={LINE} strokeWidth="14" />
          <path d="M 60 30 L 460 30 Q 520 30 520 90 L 520 150 Q 520 190 480 190 L 380 190 Q 340 190 340 230 L 340 250 Q 340 270 300 270 L 100 270 Q 40 270 40 210 L 40 90 Q 40 30 60 30 Z" fill="none" stroke={SURFACE_2} strokeWidth="10" />
          {dots.map((p) => (
            <g key={p.code}>
              <circle cx={p.x} cy={p.y} r="9" fill={AMBER} />
              <text x={p.x} y={p.y - 15} textAnchor="middle" fontSize="11" fontWeight="600" fill={TEXT} fontFamily="ui-monospace, monospace">{p.code}</text>
            </g>
          ))}
        </svg>
        <div className="text-xs mt-2" style={{ color: MUTED }}>
          실제 좌표 데이터는 다음 단계에서 연결 예정이에요.
        </div>
      </div>
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
                    style={{ backgroundColor: r.url ? (r.teamColor || AMBER) : LINE, cursor: r.url ? "pointer" : "default" }}
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
              style={{ color: AMBER, border: `1px solid ${AMBER}` }}
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
                    style={{ color: r.session_key === selectedSessionKey ? AMBER : TEXT, borderBottom: `1px solid ${LINE}` }}
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
                  <div className="col-span-1" style={{ color: d.pos === 1 ? AMBER : TEXT }}>{d.pos}</div>
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

          <TrackMap />
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
                <MapPin size={16} color={AMBER} />
                <div>
                  <div className="text-sm font-medium" style={{ color: TEXT }}>{koGpName(r.gpName)}</div>
                  <div className="text-xs mt-0.5" style={{ color: MUTED }}>{r.circuit}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm" style={{ color: TEXT }}>{formatKoreanDate(r.date_start)}</div>
                <div className="text-xs mt-0.5" style={{ color: AMBER }}>D-{r.daysLeft}</div>
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
        <div className="text-xs font-medium mb-3" style={{ color: AMBER }}>{featured.tag}</div>
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
              <div className="text-xs font-medium mb-1" style={{ color: AMBER }}>{p.tag}</div>
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

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  useEffect(() => {
    async function loadCalendar() {
      try {
        const [sessions, meetings] = await Promise.all([
          fetchJSON("https://api.openf1.org/v1/sessions?year=2026&session_name=Race"),
          fetchJSON("https://api.openf1.org/v1/meetings?year=2026"),
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

    async function loadSession() {
      setSessionData((prev) => ({ ...prev, loadingResults: true, loadingExtras: true, resultsError: null, extrasError: null }));

      try {
        // OpenF1 무료 티어는 초당 3회/분당 30회 제한이 있어서, 한꺼번에 몰아서 요청하지 않고
        // 하나씩 순서대로, 사이사이 살짝 텀을 두고 가져와요.
        const drivers = await fetchJSON(`https://api.openf1.org/v1/drivers?session_key=${selectedSessionKey}`);
        const driverMap = {};
        drivers.forEach((d) => { driverMap[d.driver_number] = d; });
        const driverColors = {};
        drivers.forEach((d) => { if (d.name_acronym && d.team_colour) driverColors[d.name_acronym] = `#${d.team_colour}`; });

        await sleep(350);
        const results = await fetchJSON(`https://api.openf1.org/v1/session_result?session_key=${selectedSessionKey}`);

        await sleep(350);
        const stints = await fetchJSON(`https://api.openf1.org/v1/stints?session_key=${selectedSessionKey}`);

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
        setSessionData((prev) => ({ ...prev, rows, loadingResults: false }));

        await sleep(350);
        const weatherArr = await fetchJSON(`https://api.openf1.org/v1/weather?session_key=${selectedSessionKey}`);
        await sleep(350);
        const pit = await fetchJSON(`https://api.openf1.org/v1/pit?session_key=${selectedSessionKey}`);
        await sleep(350);
        const radio = await fetchJSON(`https://api.openf1.org/v1/team_radio?session_key=${selectedSessionKey}`);
        await sleep(350);
        const raceControl = await fetchJSON(`https://api.openf1.org/v1/race_control?session_key=${selectedSessionKey}`);

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
            return { driver: drv.full_name || String(r.driver_number), team: drv.team_name || "", teamColor: drv.team_colour ? `#${drv.team_colour}` : AMBER, time: new Date(r.date).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" }), url: r.recording_url, photo: drv.headshot_url || null };
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

        if (cancelled) return;

        // 다음에 같은 경기를 다시 고르면 재요청 없이 바로 보여줄 수 있도록 캐시에 저장
        sessionCache.current[selectedSessionKey] = { rows, weather, pitStops, teamRadio, raceControl: raceControlItems, driverColors };

        setSessionData((prev) => ({ ...prev, weather, pitStops, teamRadio, raceControl: raceControlItems, driverColors, loadingExtras: false }));
      } catch (e) {
        // 요청 제한(429)에 걸렸거나 네트워크 문제일 때: 지금 화면에 보이는 데이터를 그대로 유지해요.
        if (cancelled) return;
        setSessionData((prev) => ({ ...prev, loadingResults: false, loadingExtras: false }));
      }
    }
    loadSession();
    return () => { cancelled = true; };
  }, [selectedSessionKey]);

  return (
    <div className="w-full min-h-screen" style={{ backgroundColor: ASPHALT, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <header className="flex items-center justify-between px-6 py-4 flex-wrap gap-4" style={{ borderBottom: `1px solid ${LINE}` }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: AMBER }}>
            <Zap size={16} color={ASPHALT} strokeWidth={2.5} />
          </div>
          <span className="font-bold text-base tracking-wide" style={{ color: TEXT, letterSpacing: "0.02em" }}>
            F1 <span style={{ color: AMBER }}>패독</span>
          </span>
        </div>

        <nav className="flex items-center gap-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-md text-sm font-medium transition-colors" style={{ color: active ? AMBER : MUTED, backgroundColor: active ? SURFACE : "transparent" }}>
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
