"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowRight, ShieldCheck, LayoutDashboard, Zap } from "lucide-react";
import { toast } from "sonner";
import { AuthClientService } from "@/services/auth/client.service";

export function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const clinicName = process.env.NEXT_PUBLIC_CLINIC_NAME || "OdontoVida";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await AuthClientService.login({ email, password });

      if (result.success) {
        toast.success("Login realizado com sucesso!");
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao realizar login");
      }
    } catch (error) {
      toast.error("Erro inesperado ao realizar login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#0b0f14] text-white">
      {/* Background arc decoration */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-[60%] -translate-y-1/2"
        style={{
          width: "min(900px, 70vw)",
          height: "min(900px, 70vw)",
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.04)",
          background:
            "radial-gradient(ellipse at 40% 40%, rgba(229,120,153,0.09) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex min-h-[100dvh] items-center justify-center px-6 py-12">
        <div className="grid w-full max-w-[1120px] lg:grid-cols-2 lg:gap-20">
          {/* ───────── Left — Branding (hidden on mobile) ───────── */}
          <div className="hidden flex-col justify-center lg:flex">
            {/* Status badge */}
            <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-rose-300/30 bg-rose-400/10 px-3.5 py-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-300 shadow-[0_0_6px_rgba(244,114,182,0.55)]" />
              <span className="text-xs font-medium tracking-wide text-rose-200">
                SISTEMA ONLINE
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl font-bold leading-[1.15] tracking-tight sm:text-[3rem]">
              Gerencie sua clínica
              <br />
              com{" "}
              <span className="text-rose-300">inteligência.</span>
            </h1>

            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/45">
              A plataforma definitiva para centralizar agendamentos,
              prontuários e finanças da sua clínica em um único lugar.
            </p>

            {/* Feature cards */}
            <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-5">
              <FeatureCard
                icon={<LayoutDashboard className="h-5 w-5" />}
                title="Dashboard Central"
                description="Visão 360° de toda sua operação de atendimento e gestão."
              />
              <FeatureCard
                icon={<Zap className="h-5 w-5" />}
                title="Automação Real"
                description="Agendamentos inteligentes que otimizam sua rotina."
              />
            </div>
          </div>

          {/* ───────── Right — Login Form ───────── */}
          <div className="flex items-center justify-center lg:justify-end">
            <div className="w-full max-w-[420px]">
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-8 backdrop-blur-sm sm:p-10">
                {/* Header */}
                <div className="mb-8">
                  <h2 className="text-[1.55rem] font-semibold tracking-tight">
                    Acesse sua conta
                  </h2>
                  <p className="mt-1.5 text-sm text-white/40">
                    Entre com suas credenciais para continuar
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                  {/* Email */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className="text-xs font-medium text-white/55"
                    >
                      Email Corporativo
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="nome@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-11 rounded-lg border-white/[0.08] bg-white/[0.05] text-sm text-white placeholder:text-white/25 focus-visible:border-rose-300/55 focus-visible:ring-1 focus-visible:ring-rose-300/30 transition-colors"
                    />
                  </div>

                  {/* Password */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="password"
                        className="text-xs font-medium text-white/55"
                      >
                        Senha
                      </Label>
                      <a
                        href="#"
                        className="text-xs font-medium text-rose-300 transition-colors hover:text-rose-200"
                      >
                        Esqueceu a senha?
                      </a>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="h-11 rounded-lg border-white/[0.08] bg-white/[0.05] text-sm text-white placeholder:text-white/25 focus-visible:border-rose-300/55 focus-visible:ring-1 focus-visible:ring-rose-300/30 transition-colors"
                    />
                  </div>

                  {/* Submit */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="mt-2 h-12 w-full rounded-lg bg-rose-500 text-sm font-semibold text-white shadow-none transition-all duration-200 hover:bg-rose-400 active:scale-[0.98] disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      <>
                        Acessar Plataforma
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Security footer */}
                <p className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-white/25">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Ambiente seguro e criptografado de ponta a ponta.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Feature Card sub-component ─── */
function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-400/15 text-rose-300">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-white/90">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-white/35">
          {description}
        </p>
      </div>
    </div>
  );
}
