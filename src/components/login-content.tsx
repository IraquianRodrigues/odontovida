"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  LogIn,
  Mail,
  Lock,
  Loader2,
  LayoutDashboard,
  CalendarCheck,
  Users
} from "lucide-react";
import { toast } from "sonner";
import { AuthClientService } from "@/services/auth/client.service";
import { ModeToggle } from "@/components/mode-toggle";

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
    <div className="min-h-screen w-full flex">
      {/* Left Panel - Branding & Value Prop */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-[#0B1120] text-white flex-col justify-between p-12 overflow-hidden">

        {/* Abstract Background Elements */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[100px] animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] animate-pulse delay-1000"></div>
        </div>

        {/* Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 text-2xl font-bold tracking-tight">
            <div className="p-2 bg-blue-600/20 rounded-lg border border-blue-500/30 backdrop-blur-sm">
              <LogIn className="w-6 h-6 text-blue-400" />
            </div>
            {clinicName}
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-2xl space-y-8 mt-12">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-[1.1]">
            Gerencie sua clínica de forma <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">profissional</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-lg leading-relaxed">
            Uma suíte completa de ferramentas para você controlar agendamentos,
            otimizar o atendimento e maximizar o desempenho da sua clínica.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="relative z-10 grid grid-cols-3 gap-4 mt-auto pt-12">
          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm hover:bg-slate-800/50 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <LayoutDashboard className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Gestão Completa</h3>
            <p className="text-xs text-slate-500">Controle total da operação</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm hover:bg-slate-800/50 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Agenda Inteligente</h3>
            <p className="text-xs text-slate-500">Organização eficiente</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm hover:bg-slate-800/50 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold text-sm mb-1">Pacientes</h3>
            <p className="text-xs text-slate-500">Histórico e prontuários</p>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 bg-white dark:bg-zinc-950 relative">
        <div className="absolute top-4 right-4 sm:top-8 sm:right-8">
          <ModeToggle />
        </div>
        <div className="w-full max-w-[400px] space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Bem-vindo de volta
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Insira suas credenciais para acessar o sistema
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10 h-12 bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-gray-100 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Senha
                  </Label>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="pl-10 h-12 bg-gray-50 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-900 dark:text-gray-100 focus-visible:ring-blue-500 focus-visible:border-blue-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold rounded-lg shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20 transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Acessando...</span>
                </div>
              ) : (
                "Entrar no Sistema"
              )}
            </Button>
          </form>

          <p className="px-8 text-center text-xs text-gray-400 dark:text-gray-600 mt-8">
            Sistema restrito. Apenas usuários autorizados da {clinicName}.
          </p>

          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400 font-medium">
              Desenvolvido com <span className="text-sm align-middle mx-0.5">💙</span> por AutomateAI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
