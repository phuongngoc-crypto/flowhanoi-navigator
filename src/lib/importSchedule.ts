export type ImportedItem = {
  title: string;
  room: string | null;
  place_name: string | null;
  address: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string | null;
};

export function parseDay(value: unknown): number {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw) return 1;
  if (raw.includes("cn") || raw.includes("chủ nhật") || raw.includes("chu nhat")) return 0;
  const num = raw.match(/\d+/)?.[0];
  if (num) {
    const n = Number(num);
    if (n >= 2 && n <= 7) return n - 1; // "Thứ 2" -> 1 ... "Thứ 7" -> 6
    if (n >= 0 && n <= 6) return n;
  }
  return 1;
}

export function parseTime(value: unknown): string {
  if (typeof value === "number") {
    // Excel lưu giờ dưới dạng phần thập phân của 1 ngày
    const totalMinutes = Math.round(value * 24 * 60);
    const h = Math.floor(totalMinutes / 60) % 24;
    const m = totalMinutes % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  }
  const m = String(value ?? "").match(/(\d{1,2})[:h.](\d{1,2})/);
  if (!m) return "07:00";
  return `${m[1].padStart(2, "0")}:${m[2].padStart(2, "0")}`;
}

const HEADERS: Record<keyof ImportedItem, string[]> = {
  title: ["môn học", "mon hoc", "tên môn", "ten mon", "title", "ca làm", "ca lam", "công việc"],
  room: ["phòng", "phong", "room", "lớp", "lop"],
  place_name: ["cơ sở", "co so", "toà nhà", "toa nha", "địa điểm", "dia diem", "place"],
  address: ["địa chỉ", "dia chi", "address"],
  day_of_week: ["thứ", "thu", "ngày", "ngay", "day"],
  start_time: ["giờ bắt đầu", "gio bat dau", "bắt đầu", "bat dau", "start", "giờ", "gio"],
  end_time: ["giờ kết thúc", "gio ket thuc", "kết thúc", "ket thuc", "end"],
};

function pick(row: Record<string, unknown>, keys: string[]) {
  const entry = Object.entries(row).find(([k]) =>
    keys.some((key) => k.trim().toLowerCase().includes(key)),
  );
  return entry?.[1];
}

export function rowsToItems(rows: Record<string, unknown>[]): ImportedItem[] {
  return rows
    .map((row) => {
      const title = pick(row, HEADERS.title);
      if (!title) return null;
      return {
        title: String(title).trim(),
        room: pick(row, HEADERS.room) ? String(pick(row, HEADERS.room)) : null,
        place_name: pick(row, HEADERS.place_name)
          ? String(pick(row, HEADERS.place_name))
          : null,
        address: pick(row, HEADERS.address) ? String(pick(row, HEADERS.address)) : null,
        day_of_week: parseDay(pick(row, HEADERS.day_of_week)),
        start_time: parseTime(pick(row, HEADERS.start_time)),
        end_time: pick(row, HEADERS.end_time) ? parseTime(pick(row, HEADERS.end_time)) : null,
      } satisfies ImportedItem;
    })
    .filter((x): x is ImportedItem => x !== null);
}

export const SAMPLE_ROWS = [
  {
    "Môn học": "Giải tích 1",
    Thứ: "Thứ 2",
    "Giờ bắt đầu": "07:00",
    "Giờ kết thúc": "09:30",
    Phòng: "D3-201",
    "Địa chỉ": "Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
  },
  {
    "Môn học": "Ca làm thêm",
    Thứ: "Thứ 4",
    "Giờ bắt đầu": "18:00",
    "Giờ kết thúc": "22:00",
    Phòng: "",
    "Địa chỉ": "Số 25 Chùa Láng, Đống Đa, Hà Nội",
  },
];
