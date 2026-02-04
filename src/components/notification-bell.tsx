"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationDropdown } from "./notification-dropdown";
import { useNotificationContext } from "@/providers/notification-provider";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const { unreadCount } = useNotificationContext();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-xl h-9 w-9 transition-all duration-300 hover:bg-accent"
        >
          <Bell className="h-[1.2rem] w-[1.2rem] text-muted-foreground transition-colors" />
          
          {/* Badge contador */}
          {unreadCount > 0 && (
            <span
              className={cn(
                "absolute -top-1 -right-1 flex items-center justify-center",
                "min-w-[18px] h-[18px] px-1",
                "bg-lime-500 text-white text-[10px] font-bold rounded-full",
                "animate-in zoom-in-50 duration-200",
                "ring-2 ring-background"
              )}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
          
          <span className="sr-only">
            Notificações {unreadCount > 0 && `(${unreadCount} não lidas)`}
          </span>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-[420px] p-0">
        <NotificationDropdown />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
