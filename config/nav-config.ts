import type { NavItem } from "@/types";

export const navItems: NavItem[] = [
  {
    title: "Dashboard",
    url: "/dashboard/overview",
    icon: "dashboard",
    isActive: true,
    shortcut: ["d", "d"],
    items: [],
  },
  {
    title: "Budget Management",
    icon: "logo",
    url: "/dashboard/budget",
    isActive: false,
    items: [],
  },
  {
    title: "Programs Analysis", // NEW PAGE
    url: "/dashboard/programs",
    icon: "billing",
    isActive: false,
    items: [],
  },
  {
    title: "Profile",
    url: "/dashboard/profile",
    icon: "profile",
    isActive: true,
    items: [],
  },
];
