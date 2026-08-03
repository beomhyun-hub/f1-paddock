import Anthropic from "@anthropic-ai/sdk";

const MAX_ITEMS = 200;
const MAX_CHARS = 300;

const client = new Anthropic();

const SYSTEM_PROMPT = `당신은 F1(포뮬러 1) 레이스 컨트롤 메시지를 한국어로 번역하는 전문가입니다.
다음 규칙을 지켜주세요:
- 드라이버 3자 코드(예: VER, HAM), 차량 번호, 랩 번호, 시간(예: 1:23.616), 섹터 번호는 원문 그대로 유지하세요.
- FIA, DRS, VSC, SC 같은 F1 고유 약어는 관례적으로 쓰이는 그대로 두거나 자연스러운 한국어 표현을 붙이세요.
- 깃발(flag) 종류는 절대 단어 그대로 직역하지 마세요. 한국 F1 중계/커뮤니티에서 실제로 쓰는 표기를 그대로 쓰세요:
  "YELLOW FLAG" → "옐로우 플래그", "DOUBLE YELLOW FLAG" → "더블 옐로우 플래그", "RED FLAG" → "레드 플래그",
  "BLACK AND WHITE FLAG" → "블랙 앤 화이트 플래그", "CHEQUERED FLAG" → "체커드 플래그", "BLUE FLAG" → "블루 플래그",
  "GREEN FLAG"/"GREEN LIGHT" → "그린 라이트" 또는 "추월 허용", "SAFETY CAR" → "세이프티카", "VIRTUAL SAFETY CAR" → "가상 세이프티카(VSC)".
  "검은색과 흰색 깃발"처럼 색상을 풀어서 직역하는 표현은 절대 쓰지 마세요.
- 딱딱한 직역이 아니라 한국 F1 팬 커뮤니티에서 실제로 쓰는 자연스러운 표현으로 번역하세요.
- 입력 배열과 같은 개수, 같은 순서로 번역 결과를 반환하세요.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "POST 요청만 지원합니다." });
  }

  const { texts } = req.body || {};

  if (!Array.isArray(texts) || texts.length === 0) {
    return res.status(400).json({ error: "texts 배열이 필요합니다." });
  }
  if (texts.length > MAX_ITEMS) {
    return res.status(400).json({ error: `한 번에 최대 ${MAX_ITEMS}개까지만 번역할 수 있습니다.` });
  }
  if (!texts.every((t) => typeof t === "string" && t.length <= MAX_CHARS)) {
    return res.status(400).json({ error: `각 문장은 문자열이어야 하고 ${MAX_CHARS}자를 넘을 수 없습니다.` });
  }

  try {
    const response = await client.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              translations: {
                type: "array",
                items: { type: "string" },
              },
            },
            required: ["translations"],
            additionalProperties: false,
          },
        },
      },
      messages: [
        {
          role: "user",
          content: JSON.stringify(texts),
        },
      ],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock) throw new Error("번역 응답을 받지 못했습니다.");

    const parsed = JSON.parse(textBlock.text);
    const translations = Array.isArray(parsed.translations) ? parsed.translations : texts;

    return res.status(200).json({ translations });
  } catch (err) {
    console.error("translate error:", err);
    return res.status(500).json({ error: "번역 중 오류가 발생했습니다." });
  }
}
