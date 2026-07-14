"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  LayoutDashboard,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { AuthClientService } from "@/services/auth/client.service";

export function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const clinicName = process.env.NEXT_PUBLIC_CLINIC_NAME || "OdontoVida";

  useEffect(() => {
    setMounted(true);
    emailRef.current?.focus();
  }, []);

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
    } catch {
      toast.error("Erro inesperado ao realizar login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background arc decoration */}
      <div className="login-page__arc" aria-hidden />

      <div
        className={`login-page__container ${mounted ? "login-page__container--visible" : ""}`}
      >
        {/* ───────── Left — Branding ───────── */}
        <div className="login-left">
          {/* Status badge */}
          <div className="login-badge">
            <span className="login-badge__dot" />
            <span className="login-badge__text">SISTEMA ONLINE</span>
          </div>

          {/* Headline */}
          <h1 className="login-headline">
            Gerencie sua clínica
            <br />
            com <span className="login-headline__accent">inteligência.</span>
          </h1>

          <p className="login-description">
            A plataforma definitiva para centralizar agendamentos, prontuários e
            finanças da sua clínica em um único lugar.
          </p>

          {/* Feature cards */}
          <div className="login-features">
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
        <div className="login-right">
          <div className="login-form-wrapper">
            {/* Header */}
            <div className="login-form-header">
              <h2 className="login-form-header__title">Acesse sua conta</h2>
              <p className="login-form-header__sub">
                Entre com suas credenciais para continuar
              </p>
            </div>

            <form onSubmit={handleLogin} className="login-form">
              {/* Email */}
              <div className="login-field">
                <Label htmlFor="login-email" className="login-field__label">
                  Email Corporativo
                </Label>
                <Input
                  ref={emailRef}
                  id="login-email"
                  type="email"
                  placeholder="nome@empresa.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                  className="login-field__input"
                />
              </div>

              {/* Password */}
              <div className="login-field">
                <div className="login-field__row">
                  <Label
                    htmlFor="login-password"
                    className="login-field__label"
                  >
                    Senha
                  </Label>
                  <a href="#" className="login-field__forgot" tabIndex={-1}>
                    Esqueceu a senha?
                  </a>
                </div>
                <div className="login-field__pw-wrap">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    autoComplete="current-password"
                    className="login-field__input"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="login-field__eye"
                    aria-label={
                      showPassword ? "Esconder senha" : "Mostrar senha"
                    }
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={isLoading}
                className="login-submit"
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
            <p className="login-trust">
              <ShieldCheck className="h-3.5 w-3.5" />
              Ambiente seguro e criptografado de ponta a ponta.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* ======== PAGE ======== */
        .login-page {
          position: relative;
          min-height: 100dvh;
          overflow: hidden;
          background: #0C1014;
          color: #F4EDDB;
        }

        /* ======== ARC DECORATION ======== */
        .login-page__arc {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-60%, -50%);
          width: min(850px, 65vw);
          height: min(850px, 65vw);
          border-radius: 50%;
          border: 1px solid rgba(244, 237, 219, 0.08);
          background: radial-gradient(
            ellipse at 40% 40%,
            rgba(76, 81, 59, 0.22) 0%,
            transparent 70%
          );
          pointer-events: none;
        }

        /* ======== CONTAINER ======== */
        .login-page__container {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100dvh;
          padding: 3rem 2.5rem;
          max-width: 1140px;
          margin: 0 auto;
          gap: 5rem;
          opacity: 0;
          transform: translateY(10px);
          transition:
            opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1),
            transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .login-page__container--visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* ======== LEFT SIDE — BRANDING ======== */
        .login-left {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        /* Badge */
        .login-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          width: fit-content;
          padding: 0.375rem 0.875rem;
          border-radius: 9999px;
          border: 1px solid rgba(244, 237, 219, 0.18);
          background: rgba(76, 81, 59, 0.24);
          margin-bottom: 2rem;
        }

        .login-badge__dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #F4EDDB;
          box-shadow: 0 0 8px rgba(244, 237, 219, 0.38);
        }

        .login-badge__text {
          font-size: 0.6875rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          color: #F4EDDB;
        }

        /* Headline */
        .login-headline {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: -0.025em;
          margin: 0;
        }

        .login-headline__accent {
          color: #F4EDDB;
        }

        /* Description */
        .login-description {
          margin-top: 1.25rem;
          max-width: 420px;
          font-size: 0.9375rem;
          line-height: 1.65;
          color: rgba(255, 255, 255, 0.4);
        }

        /* Feature cards grid */
        .login-features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-top: 3rem;
        }

        /* ======== RIGHT SIDE — FORM ======== */
        .login-right {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-shrink: 0;
          width: 100%;
          max-width: 420px;
        }

        .login-form-wrapper {
          width: 100%;
        }

        /* Form header */
        .login-form-header {
          margin-bottom: 1.75rem;
        }

        .login-form-header__title {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0;
        }

        .login-form-header__sub {
          margin-top: 0.375rem;
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.35);
        }

        /* ======== FORM ======== */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        /* Fields */
        .login-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        :global(.login-field__label) {
          font-size: 0.8125rem !important;
          font-weight: 500 !important;
          color: rgba(255, 255, 255, 0.5) !important;
        }

        .login-field__row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .login-field__forgot {
          font-size: 0.8125rem;
          font-weight: 500;
          color: #F4EDDB;
          text-decoration: none;
          transition: color 0.15s ease;
        }

        .login-field__forgot:hover {
          color: #B7AD93;
        }

        :global(.login-field__input) {
          height: 46px !important;
          border-radius: 8px !important;
          border-color: rgba(255, 255, 255, 0.08) !important;
          background: rgba(255, 255, 255, 0.05) !important;
          font-size: 0.9375rem !important;
          color: #ffffff !important;
          padding-left: 0.875rem !important;
          padding-right: 0.875rem !important;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease !important;
        }

        :global(.login-field__input::placeholder) {
          color: rgba(255, 255, 255, 0.2) !important;
        }

        :global(.login-field__input:focus-visible) {
          border-color: rgba(244, 237, 219, 0.42) !important;
          box-shadow: 0 0 0 3px rgba(76, 81, 59, 0.28) !important;
          background: rgba(255, 255, 255, 0.07) !important;
          outline: none !important;
        }

        /* Password */
        .login-field__pw-wrap {
          position: relative;
        }

        .login-field__pw-wrap :global(.login-field__input) {
          padding-right: 2.75rem !important;
        }

        .login-field__eye {
          position: absolute;
          right: 0;
          top: 0;
          height: 100%;
          width: 2.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: rgba(255, 255, 255, 0.35);
          cursor: pointer;
          transition: color 0.15s ease;
        }

        .login-field__eye:hover {
          color: rgba(255, 255, 255, 0.6);
        }

        /* Submit */
        :global(.login-submit) {
          margin-top: 0.375rem !important;
          height: 46px !important;
          width: 100% !important;
          border-radius: 8px !important;
          background: linear-gradient(135deg, #4C513B 0%, #6F7657 100%) !important;
          color: #F4EDDB !important;
          font-size: 0.9375rem !important;
          font-weight: 600 !important;
          border: none !important;
          cursor: pointer;
          transition:
            background 0.2s ease,
            transform 0.1s ease,
            opacity 0.2s ease !important;
        }

        :global(.login-submit:hover:not(:disabled)) {
          opacity: 0.9 !important;
        }

        :global(.login-submit:active:not(:disabled)) {
          transform: scale(0.985) !important;
        }

        :global(.login-submit:disabled) {
          opacity: 0.55 !important;
          cursor: not-allowed;
        }

        /* Trust */
        .login-trust {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.375rem;
          margin-top: 1.5rem;
          font-size: 0.6875rem;
          color: rgba(255, 255, 255, 0.2);
        }

        /* ======== RESPONSIVE ======== */
        @media (max-width: 860px) {
          .login-left {
            display: none;
          }

          .login-page__container {
            justify-content: center;
            padding: 2rem 1.5rem;
          }

          .login-right {
            max-width: 400px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .login-page__container {
            opacity: 1;
            transform: none;
            transition: none;
          }
        }
      `}</style>
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
    <div className="feature-card">
      <div className="feature-card__icon">{icon}</div>
      <div>
        <h3 className="feature-card__title">{title}</h3>
        <p className="feature-card__desc">{description}</p>
      </div>

      <style jsx>{`
        .feature-card {
          display: flex;
          flex-direction: column;
          gap: 0.875rem;
          padding: 1.25rem;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          background: rgba(255, 255, 255, 0.02);
          transition: border-color 0.2s ease, background 0.2s ease;
        }

        .feature-card:hover {
          border-color: rgba(244, 237, 219, 0.14);
          background: rgba(255, 255, 255, 0.035);
        }

        .feature-card__icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: rgba(76, 81, 59, 0.36);
          color: #F4EDDB;
        }

        .feature-card__title {
          font-size: 0.875rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
        }

        .feature-card__desc {
          margin-top: 0.25rem;
          font-size: 0.8125rem;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
}
