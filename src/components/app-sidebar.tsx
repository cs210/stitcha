"use client";

import * as React from "react";

import { NavHeader } from "@/components/nav-header";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  Brain,
  Kanban,
  Settings2,
  ShoppingCart,
  ShoppingBasket,
} from "lucide-react";

const data = [
  {
    name: "Stitcha Assistant",
    url: "/dashboard/stitcha-assistant",
    icon: Brain,
  },
  {
    name: "Products",
    url: "/dashboard/products",
    icon: ShoppingCart,
  },
  {
    name: "Orders",
    url: "/dashboard/orders",
    icon: ShoppingBasket,
  },
  {
    name: "Pipeline",
    url: "/dashboard/pipeline",
    icon: Kanban,
  },
  {
    name: "Settings",
    url: "/dashboard/settings",
    icon: Settings2,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <NavHeader />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
