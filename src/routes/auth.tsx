import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Đăng nhập GoFlow Hà Nội" },
      {
        name: "description",
        content:
          "Đăng nhập hoặc đăng ký GoFlow Hà Nội để quản lý lịch trình cá nhân và xem bản đồ kẹt xe thời gian thực.",
      },
      { property: "og:title", content: "Đăng nhập GoFlow Hà Nội" },
      {
        property: "og:description",
        content: "Tài khoản riêng cho lịch trình và lộ trình của bạn tại Hà Nội.",
      },
    ],
  }),
  component: AuthPage,
});

const DEMO = { email: "demo@goflow.vn", password: "goflow-demo-2026" };

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Tạo tài khoản thành công!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Chào mừng bạn quay lại!");
      }
      void navigate({ to: "/" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function demoLogin() {
    setBusy(true);
    try {
      let { error } = await supabase.auth.signInWithPassword(DEMO);
      if (error) {
        const signUp = await supabase.auth.signUp({
          ...DEMO,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: "Khách trải nghiệm GoFlow" },
          },
        });
        if (signUp.error) throw signUp.error;
        ({ error } = await supabase.auth.signInWithPassword(DEMO));
        if (error) throw error;
      }
      toast.success("Đã vào bản demo GoFlow");
      void navigate({ to: "/" });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <div className="surface p-6">
        <h1 className="text-2xl font-bold">
          {mode === "login" ? "Đăng nhập" : "Đăng ký tài khoản"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Lịch trình, hồ sơ và lộ trình của mỗi tài khoản là hoàn toàn riêng biệt.
        </p>

        <button
          onClick={demoLogin}
          disabled={busy}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3 text-sm font-bold text-accent-foreground disabled:opacity-60"
        >
          <Sparkles className="size-4" /> Đăng nhập nhanh bản Demo
        </button>

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> hoặc dùng email
          <span className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Họ và tên"
              className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mật khẩu (tối thiểu 6 ký tự)"
            className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {mode === "login" ? "Đăng nhập" : "Đăng ký"}
          </button>
        </form>

        <button
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
          className="mt-4 w-full text-sm font-medium text-primary"
        >
          {mode === "login" ? "Chưa có tài khoản? Đăng ký ngay" : "Đã có tài khoản? Đăng nhập"}
        </button>
      </div>
    </main>
  );
}
