import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prontuários | OdontoVida",
  description: "Sistema de prontuários médicos",
};

export default function ProntuariosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
