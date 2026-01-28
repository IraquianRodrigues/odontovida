"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, LogIn, Calendar, Users, TrendingUp, Shield, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { AuthClientService } from "@/services/auth/client.service";
import { ModeToggle } from "@/components/mode-toggle";

export function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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
    <div className="min-h-screen w-full flex">
      {/* Left Panel - Dark with Features */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#18181B] text-white p-12 flex-col justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#84CC16] flex items-center justify-center">
            <LogIn className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold">{clinicName}</span>
        </div>

        {/* Main Content */}
        <div className="max-w-md space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold leading-tight">
              Gestão inteligente para sua clínica médica.
            </h1>
          </div>

          {/* Features List */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <CheckCircle2 className="w-5 h-5 text-[#84CC16]" />
              </div>
              <span className="text-[#A1A1AA] text-base leading-relaxed">
                Gestão completa de agenda e agendamentos médicos.
              </span>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <CheckCircle2 className="w-5 h-5 text-[#84CC16]" />
              </div>
              <span className="text-[#A1A1AA] text-base leading-relaxed">
                Agendamentos automatizados com apoio de Inteligência Artificial, otimizando o fluxo de atendimentos.
              </span>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <CheckCircle2 className="w-5 h-5 text-[#84CC16]" />
              </div>
              <span className="text-[#A1A1AA] text-base leading-relaxed">
                Controle financeiro com relatórios analíticos e detalhados.
              </span>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <CheckCircle2 className="w-5 h-5 text-[#84CC16]" />
              </div>
              <span className="text-[#A1A1AA] text-base leading-relaxed">
                CRM integrado para acompanhamento e fidelização de pacientes.
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-sm text-[#71717A]">
          © {currentYear} AutomateAI - Excelência em gestão e automação.
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#09090B] relative">
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6">
          <ModeToggle />
        </div>

        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#84CC16] flex items-center justify-center">
            <LogIn className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">{clinicName}</span>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-[420px] space-y-8 mt-16 lg:mt-0">
          {/* Header */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white">
              Acesse sua conta
            </h2>
            <p className="text-sm text-[#71717A]">
              Bem-vindo de volta. Por favor, insira seus dados.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <Label 
                htmlFor="email" 
                className="text-sm font-medium text-[#A1A1AA]"
              >
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#71717A]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 h-12 bg-[#27272A] border-[#3F3F46] text-white placeholder:text-[#71717A] focus-visible:border-[#84CC16] focus-visible:ring-2 focus-visible:ring-[#84CC16]/20 text-base rounded-lg"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label 
                htmlFor="password" 
                className="text-sm font-medium text-[#A1A1AA]"
              >
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#71717A]" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pl-10 h-12 bg-[#27272A] border-[#3F3F46] text-white placeholder:text-[#71717A] focus-visible:border-[#84CC16] focus-visible:ring-2 focus-visible:ring-[#84CC16]/20 text-base rounded-lg"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#3F3F46] bg-[#27272A] text-[#84CC16] focus:ring-[#84CC16] focus:ring-offset-0 cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="text-sm text-[#A1A1AA] cursor-pointer select-none"
              >
                Lembrar-me por 30 dias
              </label>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-white hover:bg-[#F4F4F5] text-[#18181B] font-semibold text-base rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Entrando...</span>
                </>
              ) : (
                <>
                  <span>Entrar</span>
                  <LogIn className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="text-center text-xs text-[#71717A]">
            Ao clicar em entrar, você concorda com nossos{" "}
            <a href="#" className="text-[#84CC16] hover:text-[#65A30D] underline underline-offset-4">
              Termos de Uso
            </a>{" "}
            e{" "}
            <a href="#" className="text-[#84CC16] hover:text-[#65A30D] underline underline-offset-4">
              Política de Privacidade
            </a>
            .
          </div>
        </div>
      </div>
    </div>
  );
}
