"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, ArrowRight, Sparkles, Shield, Brain, ShieldCheck, Activity } from "lucide-react";
import { toast } from "sonner";
import { AuthClientService } from "@/services/auth/client.service";
import { ModeToggle } from "@/components/mode-toggle";

export function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const router = useRouter();
  const clinicName = process.env.NEXT_PUBLIC_CLINIC_NAME || "Dra Ingryd";
  const currentYear = new Date().getFullYear();

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
    <div className="relative h-[100dvh] overflow-hidden bg-[#07090f]">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(125, 211, 252, 0.2) 1px, transparent 0)",
          backgroundSize: "18px 18px",
        }}
      />
      <div className="absolute -top-36 left-1/4 h-80 w-80 rounded-full bg-cyan-400/20 blur-[140px]" />
      <div className="absolute -bottom-40 right-10 h-[26rem] w-[26rem] rounded-full bg-emerald-300/15 blur-[170px]" />

      <div className="absolute top-6 right-6 z-30">
        <ModeToggle />
      </div>

      <div className="relative z-10 flex h-full items-center justify-center p-2 md:p-4">
        <div className="h-full w-full max-w-[1440px] rounded-[30px] bg-gradient-to-br from-[#0c111f]/95 via-[#090d18]/95 to-[#0a101a]/95 shadow-[0_30px_120px_rgba(35,54,123,0.5)]">
          <div className="grid h-full rounded-[26px] border border-cyan-400/20 bg-[#080d17]/80 backdrop-blur-sm lg:grid-cols-[1.2fr_1fr]">
            <div className="relative hidden overflow-hidden rounded-l-[26px] border-r border-cyan-300/10 lg:block">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_35%_30%,rgba(125,211,252,0.28),transparent_45%),radial-gradient(circle_at_70%_60%,rgba(16,185,129,0.2),transparent_42%),linear-gradient(145deg,#0b1220,#070b13)]" />
              <div className="absolute inset-0 opacity-70" style={{ backgroundImage: "radial-gradient(circle at center, rgba(157,233,255,0.25) 0, rgba(157,233,255,0.02) 42%, transparent 68%)" }} />
              <div className="relative flex h-full flex-col justify-between p-10 xl:p-14">
                <div className="space-y-5">
                  <div className="inline-flex items-center gap-3 rounded-full border border-cyan-300/30 bg-cyan-200/5 px-4 py-2">
                    <Sparkles className="h-4 w-4 text-cyan-200" />
                    <span className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-100/90">Plataforma Profissional</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-emerald-300 text-[#09111c]">
                      <Activity className="h-6 w-6" />
                    </div>
                    <span className="text-xl font-semibold text-white/95">{clinicName}</span>
                  </div>
                </div>

                <div className="max-w-xl">
                  <h1 className="text-5xl font-semibold leading-tight text-white">
                    Gestão médica
                    <span className="block bg-gradient-to-r from-cyan-100 via-emerald-100 to-cyan-200 bg-clip-text text-transparent">
                      inteligente e eficiente
                    </span>
                  </h1>
                  <p className="mt-5 text-lg leading-relaxed text-cyan-50/70">
                    Tecnologia de ponta para transformar a gestão da sua clínica com automação e inteligência artificial.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Brain, label: "IA Clínica" },
                    { icon: ShieldCheck, label: "Proteção total" },
                    { icon: Activity, label: "Performance" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-xl border border-cyan-200/10 bg-cyan-100/5 px-4 py-3">
                      <item.icon className="h-4 w-4 text-cyan-100" />
                      <p className="mt-2 text-xs font-medium text-cyan-50/75">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative flex h-full items-center justify-center p-4 sm:p-6 lg:p-8">
              <div className="w-full max-w-[470px]">
                <div className="rounded-[22px] border border-cyan-200/20 bg-gradient-to-b from-cyan-100/10 via-cyan-100/5 to-transparent p-2 shadow-[0_20px_80px_rgba(17,34,57,0.55)]">
                  <div className="rounded-[18px] border border-cyan-200/10 bg-[#101823]/70 px-5 py-6 sm:px-6 sm:py-7 backdrop-blur-md">
                    <div className="mb-6 space-y-2">
                      <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">Bem-vindo de volta</h2>
                      <p className="text-sm text-cyan-50/65">Insira suas credenciais para acessar o sistema</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-xs uppercase tracking-wider text-cyan-100/70">
                          Email
                        </Label>
                        <div className="relative">
                          <Mail className={`pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 transition-colors ${emailFocused ? "text-cyan-200" : "text-cyan-100/40"}`} />
                          <Input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onFocus={() => setEmailFocused(true)}
                            onBlur={() => setEmailFocused(false)}
                            required
                            disabled={isLoading}
                            className="h-12 rounded-xl border-cyan-200/15 bg-cyan-50/5 pl-10 text-cyan-50 placeholder:text-cyan-50/30 focus-visible:border-cyan-300/70 focus-visible:ring-cyan-200/20"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-xs uppercase tracking-wider text-cyan-100/70">
                          Senha
                        </Label>
                        <div className="relative">
                          <Lock className={`pointer-events-none absolute left-3.5 top-1/2 h-4.5 w-4.5 -translate-y-1/2 transition-colors ${passwordFocused ? "text-cyan-200" : "text-cyan-100/40"}`} />
                          <Input
                            id="password"
                            type="password"
                            placeholder="••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                            required
                            disabled={isLoading}
                            className="h-12 rounded-xl border-cyan-200/15 bg-cyan-50/5 pl-10 text-cyan-50 placeholder:text-cyan-50/30 focus-visible:border-cyan-300/70 focus-visible:ring-cyan-200/20"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <label htmlFor="remember" className="flex items-center gap-2 text-xs text-cyan-50/65">
                          <input
                            type="checkbox"
                            id="remember"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 rounded border-cyan-200/25 bg-cyan-50/5 text-cyan-300 focus:ring-cyan-300/50"
                          />
                          Manter-me conectado por 30 dias
                        </label>
                        <a href="#" className="text-xs font-medium text-cyan-200/80 transition hover:text-cyan-100">
                          Esqueceu sua senha?
                        </a>
                      </div>

                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="mt-2 h-12 w-full rounded-xl bg-gradient-to-r from-emerald-300 via-cyan-300 to-emerald-300 text-[#0a141f] shadow-[0_8px_30px_rgba(110,231,183,0.25)] transition hover:brightness-105"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Autenticando...
                          </>
                        ) : (
                          <>
                            Acessar Plataforma
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </form>

                    <div className="mt-5 space-y-2 text-center">
                      <p className="text-xs text-cyan-50/40">
                        <a href="#" className="transition hover:text-cyan-100/80">Termos de Uso</a>
                        <span className="mx-2">•</span>
                        <a href="#" className="transition hover:text-cyan-100/80">Política de Privacidade</a>
                      </p>
                      <p className="inline-flex items-center gap-2 text-xs text-cyan-50/50">
                        <Shield className="h-3.5 w-3.5" />
                        Conexão segura e criptografada
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 block text-center text-xs text-cyan-100/50 lg:hidden">
                  © {currentYear} {clinicName}
                </div>
              </div>

              <div className="absolute bottom-7 left-10 hidden text-xs text-cyan-100/50 lg:block">
                © {currentYear} Excelência em gestão e automação
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
