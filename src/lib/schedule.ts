export type ScheduleItem = {
  id: string;
  title: string;
  room: string | null;
  place_name: string | null;
  address: string | null;
  lat: number | null;
  lng: number | null;
  day_of_week: number;
  start_time: string;
  end_time: string | null;
  note: string | null;
};

export const DAY_LABELS = [
  "Chủ nhật",
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
];

export function hhmm(time: string) {
  return time.slice(0, 5);
}

/** Số phút từ bây giờ đến lần diễn ra kế tiếp của một ca (theo thứ trong tuần). */
export function minutesUntilNextOccurrence(item: ScheduleItem, now = new Date()) {
  const [h = 0, m = 0] = hhmm(item.start_time).split(":").map(Number);
  let dayDiff = (item.day_of_week - now.getDay() + 7) % 7;
  const target = new Date(now);
  target.setDate(now.getDate() + dayDiff);
  target.setHours(h, m, 0, 0);
  if (target.getTime() <= now.getTime()) {
    target.setDate(target.getDate() + 7);
  }
  return { minutes: Math.round((target.getTime() - now.getTime()) / 60000), date: target };
}

export function nextItem(items: ScheduleItem[], now = new Date()) {
  const sorted = [...items]
    .map((i) => ({ item: i, ...minutesUntilNextOccurrence(i, now) }))
    .sort((a, b) => a.minutes - b.minutes);
  return sorted[0] ?? null;
}

export function todayItems(items: ScheduleItem[], now = new Date()) {
  return items
    .filter((i) => i.day_of_week === now.getDay())
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
}

export function formatClock(date: Date) {
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}
