import { Suspense, lazy, useEffect, useState, type ComponentProps } from "react";

const TrafficMap = lazy(() => import("./TrafficMap"));

type Props = ComponentProps<typeof TrafficMap>;

export function ClientMap(props: Props) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const placeholder = (
    <div
      style={{ height: props.height ?? 320 }}
      className="grid w-full place-items-center rounded-2xl bg-muted text-sm text-muted-foreground"
    >
      Đang tải bản đồ Hà Nội…
    </div>
  );

  if (!mounted) return placeholder;
  return (
    <Suspense fallback={placeholder}>
      <TrafficMap {...props} />
    </Suspense>
  );
}
