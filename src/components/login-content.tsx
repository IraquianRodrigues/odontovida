"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Loader2, ArrowRight, Sparkles, Shield, Zap, TrendingUp } from "lucide-react";
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
    <div className="min-h-screen w-full flex relative overflow-hidden bg-black">
      {/* Animated Background Pattern - Left Side */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#84CC16] rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#84CC16] rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      {/* Left Panel - Asymmetric 40% - Brand & Features */}
      <div className="hidden lg:flex lg:w-[40%] bg-gradient-to-br from-[#0A0A0A] via-[#111111] to-[#0A0A0A] relative border-r border-[#1A1A1A] overflow-hidden">
        {/* Geometric Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, #84CC16 2px, #84CC16 4px),
                           repeating-linear-gradient(90deg, transparent, transparent 2px, #84CC16 2px, #84CC16 4px)`,
          backgroundSize: '80px 80px'
        }} />

        {/* Accent Line */}
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-[#84CC16] to-transparent opacity-50" />

        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo Section */}
          <div className="space-y-2 animate-in fade-in slide-in-from-left duration-700">
            <div className="flex items-center gap-3 group">
              <div className="w-11 h-11 bg-[#84CC16] flex items-center justify-center relative overflow-hidden transition-transform duration-300 group-hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-[#9EE516] to-[#84CC16]" />
                <Sparkles className="w-6 h-6 text-black relative z-10" />
              </div>
              <div>
                <span className="text-xl font-bold text-white tracking-tight">{clinicName}</span>
                <div className="h-0.5 w-0 group-hover:w-full bg-[#84CC16] transition-all duration-300" />
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="max-w-md space-y-10 animate-in fade-in slide-in-from-left duration-700 delay-200">
            <div className="space-y-6">
              <div className="inline-block">
                <div className="px-3 py-1 bg-[#84CC16]/10 border border-[#84CC16]/20 text-[#84CC16] text-xs font-semibold tracking-wider uppercase mb-6">
                  Plataforma Profissional
                </div>
              </div>
              
              <h1 className="text-5xl font-bold leading-[1.1] text-white tracking-tight">
                Gestão médica
                <span className="block text-[#84CC16] mt-2">inteligente e eficiente</span>
              </h1>
              
              <p className="text-[#A1A1AA] text-lg leading-relaxed">
                Tecnologia de ponta para transformar a gestão da sua clínica com automação e inteligência artificial.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Zap, label: "IA Integrada", desc: "Agendamentos automáticos" },
                { icon: Shield, label: "Segurança", desc: "Dados protegidos" },
                { icon: TrendingUp, label: "Analytics", desc: "Relatórios avançados" },
                { icon: Sparkles, label: "CRM Pro", desc: "Gestão completa" }
              ].map((feature, idx) => (
                <div 
                  key={idx}
                  className="group p-4 bg-[#111111] border border-[#1A1A1A] hover:border-[#84CC16]/30 transition-all duration-300 hover:bg-[#151515]"
                  style={{ animationDelay: `${300 + idx * 100}ms` }}
                >
                  <feature.icon className="w-5 h-5 text-[#84CC16] mb-2 group-hover:scale-110 transition-transform duration-300" />
                  <div className="text-white text-sm font-semibold">{feature.label}</div>
                  <div className="text-[#71717A] text-xs mt-1">{feature.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-sm text-[#52525B] animate-in fade-in duration-700 delay-500">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-px w-8 bg-[#27272A]" />
              <span>AutomateAI</span>
            </div>
            <div>© {currentYear} Excelência em gestão e automação</div>
          </div>
        </div>
      </div>

      {/* Right Panel - Asymmetric 60% - Login Form */}
      <div className="w-full lg:w-[60%] flex items-center justify-center p-8 relative">
        {/* Theme Toggle */}
        <div className="absolute top-6 right-6 z-20 animate-in fade-in duration-500 delay-300">
          <ModeToggle />
        </div>

        {/* Mobile Logo */}
        <div className="lg:hidden absolute top-6 left-6 flex items-center gap-2 z-20">
          <div className="w-9 h-9 bg-[#84CC16] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <span className="text-lg font-bold text-white">{clinicName}</span>
        </div>

        {/* Login Card - Elevated with Shadow */}
        <div className="w-full max-w-[480px] mt-16 lg:mt-0 animate-in fade-in slide-in-from-bottom duration-700">
          {/* Card Container with Depth */}
          <div className="relative">
            {/* Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#84CC16]/20 via-[#84CC16]/5 to-transparent blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Main Card */}
            <div className="relative bg-[#0A0A0A] border border-[#1A1A1A] p-10 shadow-2xl">
              {/* Accent Corner */}
              <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-[#84CC16]/20" />
              
              {/* Header */}
              <div className="space-y-3 mb-10">
                <div className="flex items-center gap-2">
                  <div className="h-1 w-12 bg-[#84CC16]" />
                  <span className="text-xs font-semibold text-[#84CC16] tracking-widest uppercase">Acesso Seguro</span>
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  Bem-vindo de volta
                </h2>
                <p className="text-[#71717A] text-sm">
                  Insira suas credenciais para acessar o sistema
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-3 group">
                  <Label 
                    htmlFor="email" 
                    className="text-sm font-semibold text-[#E4E4E7] tracking-wide uppercase text-xs"
                  >
                    Email
                  </Label>
                  <div className="relative">
                    <div className={`absolute left-0 top-0 h-full w-1 transition-all duration-300 ${emailFocused ? 'bg-[#84CC16]' : 'bg-transparent'}`} />
                    <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${emailFocused ? 'text-[#84CC16]' : 'text-[#52525B]'}`} />
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
                      className="pl-12 h-14 bg-[#111111] border-[#1A1A1A] text-white placeholder:text-[#52525B] focus-visible:border-[#84CC16] focus-visible:ring-1 focus-visible:ring-[#84CC16] text-base transition-all duration-300 hover:border-[#27272A]"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-3 group">
                  <Label 
                    htmlFor="password" 
                    className="text-sm font-semibold text-[#E4E4E7] tracking-wide uppercase text-xs"
                  >
                    Senha
                  </Label>
                  <div className="relative">
                    <div className={`absolute left-0 top-0 h-full w-1 transition-all duration-300 ${passwordFocused ? 'bg-[#84CC16]' : 'bg-transparent'}`} />
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${passwordFocused ? 'text-[#84CC16]' : 'text-[#52525B]'}`} />
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
                      className="pl-12 h-14 bg-[#111111] border-[#1A1A1A] text-white placeholder:text-[#52525B] focus-visible:border-[#84CC16] focus-visible:ring-1 focus-visible:ring-[#84CC16] text-base transition-all duration-300 hover:border-[#27272A]"
                    />
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-5 h-5 border-[#1A1A1A] bg-[#111111] text-[#84CC16] focus:ring-[#84CC16] focus:ring-offset-0 cursor-pointer transition-all duration-200"
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm text-[#A1A1AA] cursor-pointer select-none hover:text-white transition-colors duration-200"
                  >
                    Manter-me conectado por 30 dias
                  </label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-[#84CC16] hover:bg-[#9EE516] text-black font-bold text-base transition-all duration-300 flex items-center justify-center gap-3 group shadow-lg shadow-[#84CC16]/20 hover:shadow-xl hover:shadow-[#84CC16]/30 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Autenticando...</span>
                    </>
                  ) : (
                    <>
                      <span>Acessar Plataforma</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </Button>
              </form>

              {/* Footer Links */}
              <div className="mt-8 pt-6 border-t border-[#1A1A1A]">
                <p className="text-center text-xs text-[#52525B] leading-relaxed">
                  Ao acessar, você concorda com nossos{" "}
                  <a href="#" className="text-[#84CC16] hover:text-[#9EE516] underline underline-offset-2 transition-colors duration-200">
                    Termos de Uso
                  </a>
                  {" "}e{" "}
                  <a href="#" className="text-[#84CC16] hover:text-[#9EE516] underline underline-offset-2 transition-colors duration-200">
                    Política de Privacidade
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-[#52525B] text-xs">
            <Shield className="w-4 h-4" />
            <span>Conexão segura e criptografada</span>
          </div>
        </div>
      </div>
    </div>
  );
}
