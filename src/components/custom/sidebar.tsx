"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserButton } from "@clerk/nextjs";
import {
  BrainIcon,
  ClipboardIcon,
  KanbanIcon,
  SettingsIcon,
  ShirtIcon,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const navRoutes = [
  { href: "/dashboard/assistant", icon: BrainIcon, label: "Assistant" },
  { href: "/dashboard/kanban", icon: KanbanIcon, label: "Kanban" },
  { href: "/dashboard/products", icon: ShirtIcon, label: "Products" },
  { href: "/dashboard/orders", icon: ClipboardIcon, label: "Orders" },
  { href: "/dashboard/seamstresses", icon: Users, label: "Seamstresses" },
  { href: "/dashboard/settings", icon: SettingsIcon, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-[72px] flex-col items-center border-r px-3 py-5">
      {/* Main navigation */}
      <div className="flex flex-col gap-4">
        {navRoutes.map(({ href, icon: Icon, label }) => (
          <TooltipProvider key={href}>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-10 w-10",
                    pathname === href && "bg-primary text-white"
                  )}
                  asChild
                >
                  <Link href={href}>
                    <Icon className="h-5 w-5" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      {/* User button at bottom */}
      <div className="mt-auto">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <UserButton />
            </TooltipTrigger>
            <TooltipContent>
              <p>Sign out</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
