import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GEMINI_KEY = "AQ.Ab8RN6LxkwfY0sLILX2e8hhmYZWtJeGtnMkwGLm8m6CDaqVdOQ";

const PROMPT = `Bạn là trợ lý bóc tách thời khoá biểu tại Hà Nội.
Đọc ảnh thời khoá biểu và trả về DUY NHẤT một mảng JSON, không kèm giải thích, không kèm markdown.
Mỗi phần tử: {"title":"tên môn/ca làm","room":"phòng hoặc null","place_name":"toà nhà/cơ sở hoặc null","day_of_week":số 1-7 (2=Thứ 2 ... 7=Thứ 7, 0=Chủ nhật),"start_time":"HH:MM","end_time":"HH:MM hoặc null"}`;

export const parseScheduleImage = createServerFn({ method: "POST" })
  .inputValidator((data) =>
    z.object({ imageDataUrl: z.string().min(20), mimeType: z.string() }).parse(data),
  )
  .handler(async ({ data }) => {
    const base64 = data.imageDataUrl.split(",")[1] ?? "";

    // 1) Thử Gemini với khoá cấu hình sẵn
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: PROMPT },
                  { inline_data: { mime_type: data.mimeType, data: base64 } },
                ],
              },
            ],
          }),
        },
      );
      if (res.ok) {
        const json = (await res.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        const items = extractJson(text);
        if (items.length) return { items, source: "gemini" as const };
      }
    } catch {
      // rơi xuống phương án dự phòng
    }

    // 2) Dự phòng: dùng AI tích hợp sẵn của nền tảng
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${process.env["LOVABLE_API_KEY"]}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3.8-flash",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: PROMPT },
              { type: "image_url", image_url: { url: data.imageDataUrl } },
            ],
          },
        ],
      }),
    });
    if (!res.ok) throw new Error("Không đọc được ảnh thời khoá biểu, hãy thử ảnh rõ nét hơn");
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const items = extractJson(json.choices?.[0]?.message?.content ?? "");
    if (!items.length) throw new Error("Không nhận diện được ca học nào trong ảnh");
    return { items, source: "fallback" as const };
  });

type ParsedItem = {
  title: string;
  room: string | null;
  place_name: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string | null;
};

function extractJson(text: string): ParsedItem[] {
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return [];
  try {
    const raw = JSON.parse(match[0]) as ParsedItem[];
    return raw
      .filter((r) => r && r.title && r.start_time)
      .map((r) => ({
        title: String(r.title),
        room: r.room ? String(r.room) : null,
        place_name: r.place_name ? String(r.place_name) : null,
        day_of_week: Number(r.day_of_week) >= 0 && Number(r.day_of_week) <= 7
          ? Number(r.day_of_week) % 7
          : 1,
        start_time: normalizeTime(String(r.start_time)),
        end_time: r.end_time ? normalizeTime(String(r.end_time)) : null,
      }));
  } catch {
    return [];
  }
}

function normalizeTime(value: string) {
  const m = value.match(/(\d{1,2})[:h.](\d{2})/);
  if (!m) return "07:00";
  return `${m[1].padStart(2, "0")}:${m[2]}`;
}
