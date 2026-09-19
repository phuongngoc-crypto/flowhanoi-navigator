import { Link, useNavigate } from "@tanstack/react-router";
import { CalendarDays, LogOut, MapPinned, Route as RouteIcon, User2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { to: "/", label: "Trang chủ", icon: MapPinned },
  { to: "/lich-trinh", label: "Lịch trình", icon: CalendarDays },
  { to: "/chuyen-di", label: "Chuyến đi", icon: RouteIcon },
  { to: "/ho-so", label: "Hồ sơ", icon: User2 },
] as const;

export function Navbar() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 hero-gradient text-primary-foreground shadow-soft">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 font-semibold">
          <span className="grid size-9 place-items-center rounded-2xl bg-primary-foreground/15 text-lg">
            🧭
          </span>
          <span className="leading-tight">
            <span className="block text-base">GoFlow</span>
            <span className="block text-[11px] opacity-80">Hà Nội</span>
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "bg-primary-foreground/20" }}
              className="rounded-2xl px-3 py-2 text-sm font-medium transition-colors hover:bg-primary-foreground/15"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {user ? (
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <Link
              to="/ho-so"
              className="hidden max-w-[10rem] truncate rounded-2xl bg-primary-foreground/15 px-3 py-2 text-xs font-medium sm:block"
            >
              {profile?.full_name ?? user.email}
            </Link>
            <button
              onClick={async () => {
                await signOut();
                void navigate({ to: "/" });
              }}
              className="flex items-center gap-1 rounded-2xl bg-primary-foreground/15 px-3 py-2 text-xs font-medium transition-colors hover:bg-primary-foreground/25"
            >
              <LogOut className="size-4" /> Đăng xuất
            </button>
          </div>
        ) : (
          <Link
            to="/auth"
            className="ml-auto rounded-2xl bg-primary-foreground px-4 py-2 text-sm font-semibold text-primary transition-transform hover:scale-[1.02] md:ml-0"
          >
            Đăng nhập / Đăng ký
          </Link>
        )}
      </div>

      <nav className="flex gap-1 overflow-x-auto px-3 pb-2 md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeProps={{ className: "bg-primary-foreground/25" }}
            className="flex shrink-0 items-center gap-1 rounded-2xl bg-primary-foreground/10 px-3 py-1.5 text-xs font-medium"
          >
            <item.icon className="size-3.5" />
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
