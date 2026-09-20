import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { FileSpreadsheet, ImageIcon, Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useScheduleItems } from "@/hooks/useScheduleItems";
import { AddressPicker } from "@/components/AddressPicker";
import { DAY_LABELS, hhmm } from "@/lib/schedule";
import { rowsToItems, SAMPLE_ROWS, type ImportedItem } from "@/lib/importSchedule";
import { parseScheduleImage } from "@/lib/ocr.functions";
import type { LatLng } from "@/lib/tomtom";

export const Route = createFileRoute("/_authenticated/lich-trinh")({
  head: () => ({
    meta: [
      { title: "Thời khoá biểu của tôi — GoFlow Hà Nội" },
      {
        name: "description",
        content:
          "Nạp thời khoá biểu từ ảnh chụp, Excel hoặc CSV và xem lịch trực quan theo ngày, theo tuần.",
      },
      { property: "og:title", content: "Thời khoá biểu của tôi — GoFlow Hà Nội" },
      {
        property: "og:description",
        content: "Tải ảnh TKB, file Excel hoặc CSV để GoFlow tự bóc tách lịch học, lịch làm.",
      },
    ],
  }),
  component: SchedulePage,
});

const ORDER = [1, 2, 3, 4, 5, 6, 0];

function SchedulePage() {
  const { user } = useAuth();
  const { data: items = [], isLoading } = useScheduleItems(user?.id);
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [view, setView] = useState<"week" | "day">("week");
  const today = new Date().getDay();

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: ["schedule-items"] });
  }

  async function remove(id: string) {
    const { error } = await supabase.from("schedule_items").delete().eq("id", id);
    if (error) toast.error(error.message);
    else {
      toast.success("Đã xoá ca");
      refresh();
    }
  }

  const days = view === "week" ? ORDER : [today];

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-5">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-bold">Thời khoá biểu</h1>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1 rounded-2xl border border-primary px-3 py-2 text-sm font-semibold text-primary"
          >
            <Plus className="size-4" /> Thêm ca
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-1 rounded-2xl bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Upload className="size-4" /> Tải lên TKB
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        {(["week", "day"] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`rounded-2xl px-4 py-2 text-sm font-medium ${
              view === v ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            {v === "week" ? "Theo tuần" : "Hôm nay"}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Đang tải lịch…</p>}

      <div className="space-y-3">
        {days.map((d) => {
          const dayItems = items
            .filter((i) => i.day_of_week === d)
            .sort((a, b) => a.start_time.localeCompare(b.start_time));
          return (
            <section key={d} className="surface p-4">
              <h2 className="text-sm font-bold text-primary">{DAY_LABELS[d]}</h2>
              {dayItems.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">Trống</p>
              ) : (
                <ul className="mt-2 space-y-2">
                  {dayItems.map((i) => (
                    <li
                      key={i.id}
                      className="flex items-start gap-3 rounded-2xl bg-secondary px-4 py-3 text-sm"
                    >
                      <span className="font-bold text-primary">
                        {hhmm(i.start_time)}
                        {i.end_time ? `–${hhmm(i.end_time)}` : ""}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-medium">{i.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {[i.room, i.address ?? i.place_name].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                      <button
                        onClick={() => remove(i.id)}
                        className="ml-auto text-muted-foreground hover:text-destructive"
                        aria-label="Xoá ca"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onDone={refresh} />}
      {showAdd && <AddModal onClose={() => setShowAdd(false)} onDone={refresh} />}
    </main>
  );
}

function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card p-5 sm:rounded-2xl"
      >
        <div className="mb-4 flex items-center">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="ml-auto text-muted-foreground">
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function UploadModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const imageRef = useRef<HTMLInputElement>(null);
  const sheetRef = useRef<HTMLInputElement>(null);

  async function insertItems(parsed: ImportedItem[]) {
    if (!user) return;
    if (parsed.length === 0) {
      toast.error("Không tìm thấy ca học nào trong file");
      return;
    }
    const { error } = await supabase.from("schedule_items").insert(
      parsed.map((p) => ({
        user_id: user.id,
        title: p.title,
        room: p.room,
        place_name: p.place_name,
        address: p.address ?? null,
        day_of_week: p.day_of_week,
        start_time: p.start_time,
        end_time: p.end_time,
      })),
    );
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Đã thêm ${parsed.length} ca vào lịch của bạn`);
    onDone();
    onClose();
  }

  async function handleImage(file: File) {
    setBusy(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const res = await parseScheduleImage({
        data: { imageDataUrl: dataUrl, mimeType: file.type || "image/jpeg" },
      });
      await insertItems(
        res.items.map((i) => ({
          ...i,
          address: null,
        })),
      );
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleSheet(file: File) {
    setBusy(true);
    try {
      const XLSX = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array" });
      const firstName = wb.SheetNames[0];
      const sheet = firstName ? wb.Sheets[firstName] : undefined;
      if (!sheet) throw new Error("File không có dữ liệu");
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      await insertItems(rowsToItems(rows));
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function downloadSample() {
    const XLSX = await import("xlsx");
    const ws = XLSX.utils.json_to_sheet(SAMPLE_ROWS);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "TKB");
    XLSX.writeFile(wb, "GoFlow-mau-thoi-khoa-bieu.xlsx");
  }

  return (
    <Modal title="Tải lên thời khoá biểu" onClose={onClose}>
      {busy && (
        <p className="mb-3 flex items-center gap-2 text-sm text-primary">
          <Loader2 className="size-4 animate-spin" /> Đang xử lý dữ liệu…
        </p>
      )}
      <div className="space-y-3">
        <button
          onClick={() => imageRef.current?.click()}
          disabled={busy}
          className="flex w-full items-center gap-3 rounded-2xl border border-border p-4 text-left hover:border-primary disabled:opacity-60"
        >
          <ImageIcon className="size-6 text-accent" />
          <span>
            <span className="block text-sm font-semibold">📷 Tải ảnh chụp TKB</span>
            <span className="block text-xs text-muted-foreground">
              Tự động bóc tách chữ trong ảnh thành lịch cá nhân
            </span>
          </span>
        </button>
        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => e.target.files?.[0] && handleImage(e.target.files[0])}
        />

        <button
          onClick={() => sheetRef.current?.click()}
          disabled={busy}
          className="flex w-full items-center gap-3 rounded-2xl border border-border p-4 text-left hover:border-primary disabled:opacity-60"
        >
          <FileSpreadsheet className="size-6 text-accent" />
          <span>
            <span className="block text-sm font-semibold">📊 Tải file Excel hoặc CSV</span>
            <span className="block text-xs text-muted-foreground">
              Đọc cột môn học, thứ, giờ, phòng, địa chỉ
            </span>
          </span>
        </button>
        <input
          ref={sheetRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          hidden
          onChange={(e) => e.target.files?.[0] && handleSheet(e.target.files[0])}
        />

        <button
          onClick={downloadSample}
          className="w-full rounded-2xl bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground"
        >
          ⬇️ Tải file mẫu Excel
        </button>
      </div>
    </Modal>
  );
}

function AddModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [room, setRoom] = useState("");
  const [day, setDay] = useState(1);
  const [start, setStart] = useState("07:00");
  const [end, setEnd] = useState("09:00");
  const [address, setAddress] = useState("");
  const [point, setPoint] = useState<LatLng | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!user || !title.trim()) {
      toast.error("Hãy nhập tên môn học / ca làm");
      return;
    }
    setBusy(true);
    const { error } = await supabase.from("schedule_items").insert({
      user_id: user.id,
      title: title.trim(),
      room: room || null,
      address: address || null,
      lat: point?.lat ?? null,
      lng: point?.lng ?? null,
      day_of_week: day,
      start_time: start,
      end_time: end || null,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Đã thêm ca mới");
    onDone();
    onClose();
  }

  return (
    <Modal title="Thêm ca học / ca làm" onClose={onClose}>
      <div className="space-y-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Tên môn học / ca làm"
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
            className="rounded-2xl border border-border bg-card px-4 py-3 text-sm"
          >
            {ORDER.map((d) => (
              <option key={d} value={d}>
                {DAY_LABELS[d]}
              </option>
            ))}
          </select>
          <input
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="Phòng"
            className="rounded-2xl border border-border bg-card px-4 py-3 text-sm"
          />
          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            className="rounded-2xl border border-border bg-card px-4 py-3 text-sm"
          />
          <input
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            className="rounded-2xl border border-border bg-card px-4 py-3 text-sm"
          />
        </div>

        <AddressPicker
          label="Địa chỉ điểm đến (số nhà, ngõ, ngách)"
          address={address}
          onAddressChange={setAddress}
          point={point}
          onPointChange={setPoint}
        />

        <button
          onClick={save}
          disabled={busy}
          className="w-full rounded-2xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-60"
        >
          {busy ? "Đang lưu…" : "Lưu ca"}
        </button>
      </div>
    </Modal>
  );
}
