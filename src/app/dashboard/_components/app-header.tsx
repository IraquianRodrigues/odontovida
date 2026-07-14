
"use client";

import { ModeToggle } from "@/components/mode-toggle";
import { NotificationBell } from "@/components/notification-bell";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4 pl-16 md:px-6">
        <div />

        <div className="flex items-center gap-1">
          <NotificationBell />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
