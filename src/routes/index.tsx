import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Clock, Gauge, MapPin, Timer } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useScheduleItems } from "@/hooks/useScheduleItems";
import { ClientMap } from "@/components/ClientMap";
import { VehiclePicker } from "@/components/VehiclePicker";
import { calculateRoute, VEHICLES, type VehicleKey } from "@/lib/tomtom";
import { DAY_LABELS, formatClock, hhmm, nextItem, todayItems } from "@/lib/schedule";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GoFlow Hà Nội — Lịch trình thông minh & bản đồ kẹt xe thời gian thực" },
      {
        name: "description",
        content:
          "GoFlow Hà Nội gợi ý giờ xuất phát chính xác cho từng ca học, ca làm dựa trên dữ liệu kẹt xe thời gian thực của Hà Nội.",
      },
      { property: "og:title", content: "GoFlow Hà Nội — Đi đúng giờ mỗi ngày" },
      {
        property: "og:description",
        content:
          "Bản đồ kẹt xe trực tiếp, lộ trình A-B và đồng hồ đếm lùi giờ xuất phát cho riêng bạn.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { user, profile, loading } = useAuth();
  if (loading) return <div className="p-8 text-center text-muted-foreground">Đang tải…</div>;
  if (!user) return <Landing />;
  return <Dashboard key={profile?.id ?? "me"} />;
}

function Landing() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <section className="surface hero-gradient p-8 text-primary-foreground">
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
          Đi đúng giờ giữa lòng Hà Nội
        </h1>
        <p className="mt-3 max-w-xl text-sm opacity-90">
          GoFlow đọc thời khoá biểu của bạn, đo mức kẹt xe thời gian thực trên từng tuyến phố và
          nhắc bạn cần xuất phát lúc mấy giờ.
        </p>
        <Link
          to="/auth"
          className="mt-6 inline-block rounded-2xl bg-primary-foreground px-5 py-3 text-sm font-bold text-primary"
        >
          Bắt đầu miễn phí
        </Link>
      </section>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { t: "Bản đồ kẹt xe trực tiếp", d: "Vệt đỏ là đoạn tắc, vệt xanh là đường thoáng." },
          { t: "Đổi phương tiện tức thì", d: "Xe máy, ô tô, bus/tàu điện, đi bộ." },
          { t: "Nạp TKB đa định dạng", d: "Ảnh chụp, Excel hoặc CSV đều được." },
        ].map((f) => (
          <div key={f.t} className="surface p-5">
            <h3 className="font-semibold text-primary">{f.t}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl">
        <ClientMap height={300} />
      </div>
    </main>
  );
}

function Dashboard() {
  const { user, profile } = useAuth();
  const { data: items = [] } = useScheduleItems(user?.id);
  const [vehicle, setVehicle] = useState<VehicleKey>(profile?.vehicle ?? "motorbike");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (profile?.vehicle) setVehicle(profile.vehicle);
  }, [profile?.vehicle]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const upcoming = useMemo(() => nextItem(items, now), [items, now]);
  const from =
    profile?.home_lat && profile?.home_lng
      ? { lat: profile.home_lat, lng: profile.home_lng }
      : null;
  const to =
    upcoming?.item.lat && upcoming?.item.lng
      ? { lat: upcoming.item.lat, lng: upcoming.item.lng }
      : null;

  const routeQuery = useQuery({
    queryKey: ["route", from?.lat, from?.lng, to?.lat, to?.lng, vehicle],
    enabled: !!from && !!to,
    staleTime: 60_000,
    refetchInterval: 120_000,
    queryFn: () => calculateRoute(from!, to!, vehicle),
  });

  const buffer = (profile?.buffer_minutes ?? 10) + VEHICLES[vehicle].buffer;
  const travel = routeQuery.data?.travelMinutes ?? null;
  const leaveInMinutes =
    upcoming && travel !== null ? upcoming.minutes - travel - buffer : null;
  const departureTime =
    upcoming && travel !== null
      ? new Date(upcoming.date.getTime() - (travel + buffer) * 60_000)
      : null;

  return (
    <main className="mx-auto max-w-5xl space-y-4 px-4 py-5">
      <section className="surface hero-gradient p-5 text-primary-foreground">
        <p className="text-xs uppercase tracking-wide opacity-80">Ca sắp tới của bạn</p>
        {upcoming ? (
          <>
            <h1 className="mt-1 text-2xl font-bold">{upcoming.item.title}</h1>
            <p className="mt-1 text-sm opacity-90">
              {DAY_LABELS[upcoming.item.day_of_week]} · {hhmm(upcoming.item.start_time)}
              {upcoming.item.room ? ` · Phòng ${upcoming.item.room}` : ""}
            </p>
            <p className="mt-1 text-sm opacity-90">
              <MapPin className="mr-1 inline size-4" />
              {upcoming.item.address ?? upcoming.item.place_name ?? "Chưa có địa chỉ điểm đến"}
            </p>

            <div className="mt-4 rounded-2xl bg-primary-foreground/15 p-4">
              {leaveInMinutes === null ? (
                <p className="text-sm">
                  {from && to
                    ? "Đang đo mức kẹt xe thời gian thực…"
                    : "Hãy cập nhật địa chỉ nhà trong Hồ sơ và địa chỉ điểm đến của ca này."}
                </p>
              ) : (
                <>
                  <p className="text-sm opacity-90">Bạn cần xuất phát sau</p>
                  <p className="text-4xl font-extrabold">
                    {Math.max(leaveInMinutes, 0)}{" "}
                    <span className="text-lg font-semibold">phút</span>
                  </p>
                  <p className="mt-1 text-sm opacity-90">
                    <Clock className="mr-1 inline size-4" />
                    Giờ cần đi: {departureTime ? formatClock(departureTime) : "--:--"}
                    {leaveInMinutes < 0 ? " · Bạn đang trễ giờ rồi!" : ""}
                  </p>
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <h1 className="mt-1 text-2xl font-bold">Chưa có ca nào</h1>
            <Link
              to="/lich-trinh"
              className="mt-4 inline-block rounded-2xl bg-primary-foreground px-4 py-2 text-sm font-bold text-primary"
            >
              Tải lên thời khoá biểu
            </Link>
          </>
        )}
      </section>

      <section className="surface p-4">
        <h2 className="mb-3 text-sm font-semibold">Phương tiện di chuyển</h2>
        <VehiclePicker value={vehicle} onChange={setVehicle} />
      </section>

      <section className="surface overflow-hidden p-4">
        <div className="mb-3 flex flex-wrap items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-6 rounded-full bg-clear" /> Đường thoáng
          </span>
          <span className="flex items-center gap-1">
            <span className="h-1.5 w-6 rounded-full bg-jam" /> Đoạn kẹt xe
          </span>
          <span className="ml-auto text-muted-foreground">A: Nhà · B: Điểm hẹn</span>
        </div>
        <ClientMap
          from={from}
          to={to}
          points={routeQuery.data?.points}
          jamSegments={routeQuery.data?.jamSegments}
          height={340}
        />
        {routeQuery.data && (
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <Stat
              icon={<Gauge className="size-4" />}
              label="Quãng đường"
              value={`${routeQuery.data.distanceKm.toFixed(1)} km`}
            />
            <Stat
              icon={<Timer className="size-4" />}
              label="Thời gian đi"
              value={`${routeQuery.data.travelMinutes} phút`}
            />
            <Stat
              icon={<AlertTriangle className="size-4" />}
              label="Do kẹt xe"
              value={`+${routeQuery.data.delayMinutes} phút`}
              danger={routeQuery.data.delayMinutes > 5}
            />
          </div>
        )}
        {routeQuery.isError && (
          <p className="mt-3 text-sm text-destructive">
            Không lấy được dữ liệu giao thông lúc này, thử lại sau ít phút.
          </p>
        )}
      </section>

      <section className="surface p-4">
        <h2 className="mb-3 text-sm font-semibold">Hôm nay ({DAY_LABELS[now.getDay()]})</h2>
        <div className="space-y-2">
          {todayItems(items, now).length === 0 && (
            <p className="text-sm text-muted-foreground">Hôm nay bạn không có ca nào.</p>
          )}
          {todayItems(items, now).map((i) => (
            <Link
              key={i.id}
              to="/chuyen-di"
              className="flex items-center gap-3 rounded-2xl border border-border px-4 py-3 text-sm hover:border-primary"
            >
              <span className="font-semibold text-primary">{hhmm(i.start_time)}</span>
              <span className="truncate">{i.title}</span>
              <span className="ml-auto truncate text-xs text-muted-foreground">
                {i.room ?? i.place_name ?? ""}
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function Stat({
  icon,
  label,
  value,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="rounded-2xl bg-secondary px-2 py-3">
      <span className="flex items-center justify-center gap-1 text-[11px] text-muted-foreground">
        {icon} {label}
      </span>
      <span className={`mt-1 block font-bold ${danger ? "text-destructive" : "text-primary"}`}>
        {value}
      </span>
    </div>
  );
}
