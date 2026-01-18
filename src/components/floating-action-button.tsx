"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FloatingActionButtonProps {
  onClick: () => void;
}

export function FloatingActionButton({ onClick }: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      size="lg"
      title="Novo Agendamento"
      className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all hover:scale-110 hover:shadow-blue-500/50 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <Plus className="h-6 w-6" />
      <span className="sr-only">Novo Agendamento</span>
    </Button>
  );
}
