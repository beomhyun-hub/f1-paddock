import Anthropic from "@anthropic-ai/sdk";

const ALLOWED_HOST = "livetiming.formula1.com";
const MAX_AUDIO_BYTES = 5 * 1024 * 1024; // 5MB safety cap — radio clips are a few seconds long

const client = new Anthropic();

async function transcribeAudio(audioUrl) {
  const audioRes = await fetch(audioUrl);
  if (!audioRes.ok) throw new Error(`오디오 파일을 가져오지 못했습니다 (${audioRes.status})`);

  const contentLength = Number(audioRes.headers.get("content-length") || 0);
  if (contentLength > MAX_AUDIO_BYTES) throw new Error("오디오 파일이 너무 큽니다");

  const buffer = await audioRes.arrayBuffer();
  if (buffer.byteLength > MAX_AUDIO_BYTES) throw new Error("오디오 파일이 너무 큽니다");

  const form = new FormData();
  form.append("file", new Blob([buffer], { type: "audio/mpeg" }), "radio.mp3");
  form.append("model", "whisper-1");

  const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: form,
  });

  if (!whisperRes.ok) {
    const detail = await whisperRes.text().catch(() => "");
    throw new Error(`STT 요청 실패 (${whisperRes.status}): ${detail.slice(0, 200)}`);
  }

  const data = await whisperRes.json();
  return (data.text || "").trim();
}

async function translateTranscript(transcript) {
  if (!transcript) return [];

  const response = await client.messages.create({
    model: "claude-haiku-4-5",
    max_tokens: 1024,
    output_config: {
      format: {
        type: "json_schema",
        schema: {
          type: "object",
          properties: {
            turns: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  speaker: { type: "string", enum: ["driver", "team"] },
                  text: { type: "string" },
                },
                required: ["speaker", "text"],
                additionalProperties: false,
              },
            },
          },
          required: ["turns"],
          additionalProperties: false,
        },
      },
    },
    system: `당신은 F1 팀 라디오 무전 내용을 한국어로 번역하는 전문가입니다.
아래 영어 무전 대화를 발화 턴(turn) 단위로 나누세요.
각 턴이 드라이버(driver)가 말한 것인지, 팀 레이스 엔지니어(team)가 말한 것인지 문맥으로 추론해서 구분하세요.
F1 무전은 보통 엔지니어가 정보를 전달하거나 지시하면 드라이버가 반응하거나 질문하는 패턴이 반복됩니다.

번역은 절대 단어 대 단어로 옮기지 마세요. 영어 문장 구조를 그대로 따라가지 말고, 한국어 화자가 무전으로 실제 말할 법한 어순과 표현으로 완전히 다시 구성하세요.
짧고 툭툭 끊어지는 실제 무전 말투를 살리세요 (완전한 문어체 문장으로 늘어지지 않게).

예시 (실제 대화 아님, 스타일 참고용):
영어: "Yeah copy that, box this lap, box box."
나쁜 번역(직역): "네, 그것을 이해했습니다, 이번 랩에 박스로 들어오세요, 박스 박스."
좋은 번역(의역): "그래 알겠어, 이번 랩 박스, 박스 박스."

영어: "I think we might have a problem with the front left, it feels a bit strange."
나쁜 번역(직역): "저는 우리가 프론트 레프트에 문제가 있을 수도 있다고 생각합니다, 그것은 조금 이상하게 느껴집니다."
좋은 번역(의역): "프론트 레프트 좀 이상한데, 문제 있는 것 같아."

드라이버 이름, 팀명, 숫자(랩, 순위, 타이어 등)는 원문 의미를 그대로 유지하세요.
원문 순서를 그대로 유지해서 turns 배열로 반환하세요.`,
    messages: [{ role: "user", content: transcript }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock) return [];
  try {
    const parsed = JSON.parse(textBlock.text);
    return Array.isArray(parsed.turns) ? parsed.turns : [];
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "POST 요청만 지원합니다." });
  }

  const { url } = req.body || {};
  if (typeof url !== "string" || !url) {
    return res.status(400).json({ error: "url이 필요합니다." });
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return res.status(400).json({ error: "유효하지 않은 URL입니다." });
  }
  if (parsed.protocol !== "https:" || parsed.hostname !== ALLOWED_HOST) {
    return res.status(400).json({ error: "허용되지 않은 오디오 출처입니다." });
  }

  try {
    const transcript = await transcribeAudio(parsed.toString());
    const turns = await translateTranscript(transcript);
    return res.status(200).json({ transcript, turns });
  } catch (err) {
    console.error("caption-radio error:", err);
    return res.status(500).json({ error: "자막 생성 중 오류가 발생했습니다." });
  }
}
