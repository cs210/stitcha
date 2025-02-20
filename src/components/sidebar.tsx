"use client";

import {
  Users,
  LayoutGridIcon,
  Settings2Icon,
  LogOut,
  ClipboardIcon,
  ShoppingCart,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const pathname = usePathname();

  // const handleSignOut = async () => {
  // 	try {
  // 		await signOut()
  // 		// Let Clerk handle the redirect after sign out
  // 	} catch (error) {
  // 		console.error('Error signing out:', error)
  // 	}
  // }

  return (
    <div className="flex h-full w-[72px] flex-col items-center border-r px-3 py-4">
      <div className="flex flex-col gap-4">
        <Link href="/kanban">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10",
              pathname === "/kanban" && "bg-primary text-white"
            )}
          >
            <LayoutGridIcon className="h-5 w-5" />
          </Button>
        </Link>
        <Link href="/seamstresses">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10",
              pathname === "/seamstresses" && "bg-primary text-white"
            )}
          >
            <Users className="h-5 w-5" />
          </Button>
        </Link>
        <Link href="/dashboard/settings">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-10 w-10",
              pathname === "/dashboard/settings" && "bg-primary text-white"
            )}
          >
            <Settings2Icon className="h-5 w-5" />
          </Button>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={() => signOut({ redirectUrl: "/" })}
        >
          <LogOut className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-10 w-10",
            pathname === "/dashboard/orders" && "bg-primary text-white"
          )}
          asChild
        >
          <Link href="/dashboard/orders">
            <ShoppingCart className="h-5 w-5" />
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-10 w-10",
            pathname === "/dashboard/products" && "bg-primary text-white"
          )}
          asChild
        >
          <Link href="/dashboard/products">
            <ClipboardIcon className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
