"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import {
  DashboardIcon,
  MoodExercisesIcon,
  BreathingExercisesIcon,
  RevenueIcon,
  DailyMesmerIcon,
  MesmerTipsIcon,
  LogoutIcon,
} from "@/components/icons/icons";
import LogoutDialog from "@/components/dashboard/LogoutDialog";

const menuItems = [
  {
    title: "Dashboard",
    icon: DashboardIcon,
    href: "/admin",
  },
  {
    title: "Exercises",
    icon: MoodExercisesIcon,
    href: "/admin/mood-exercises",
  },
  {
    title: "Breathing Exercises",
    icon: BreathingExercisesIcon,
    href: "/admin/breathing-exercises",
  },
  {
    title: "Paywall Offer",
    icon: RevenueIcon,
    href: "/admin/paywall-offer",
  },
  // {
  //   title: "Daily Mesmer",
  //   icon: DailyMesmerIcon,
  //   href: "/admin/daily-mesmer",
  // },
  // {
  //   title: "Mesmer Tips",
  //   icon: MesmerTipsIcon,
  //   href: "/admin/mesmer-tips",
  // },
];

// Reusable navigation component
const SidebarNav = ({ currentPath, onNavigate }) => {
  const router = useRouter();

  return (
    <div
      className="flex flex-col h-full justify-between"
      style={{ fontFamily: "'Inter Display', var(--font-inter), sans-serif" }}
    >
      <div className="flex flex-col w-full">
        <div className="mb-8 flex items-center justify-center">
          <Image
            src="/mesmer.png"
            alt="MESMER"
            width={300}
            height={60}
            className="object-contain"
            priority
          />
        </div>

        <nav className="flex flex-col gap-[4px] w-full">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/admin"
                ? currentPath === "/admin"
                : currentPath.startsWith(item.href);

            return (
              <Link
                key={item.title}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 w-full h-[48px] rounded-[12px] px-4 transition-all duration-200 ${
                  isActive
                    ? "bg-[#8F00FF] text-white"
                    : "text-[#757575] hover:bg-gray-50"
                }`}
              >
                <Icon
                  className={`w-[22px] h-[22px] ${
                    isActive ? "text-white" : "text-[#757575]"
                  }`}
                />
                <span className="font-medium  text-[15px]">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="w-full">
        <LogoutDialog>
          <button className="flex items-center justify-center gap-3 w-full h-[52px] text-[#757575] hover:text-[#8F00FF] hover:bg-gray-50 rounded-2xl transition-all duration-200">
            <LogoutIcon className="w-5 h-5" />
            <span className="font-medium text-[15px]">Logout</span>
          </button>
        </LogoutDialog>
      </div>
    </div>
  );
};

// Mobile Sidebar with Sheet
export function MobileSidebar() {
  const pathname = usePathname();

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Menu className="w-6 h-6 text-[#1A1A1A]" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[280px] p-6 bg-white">
        <VisuallyHidden.Root>
          <SheetTitle>Navigation Menu</SheetTitle>
        </VisuallyHidden.Root>
        <SidebarNav currentPath={pathname} onNavigate={() => {}} />
      </SheetContent>
    </Sheet>
  );
}

// Desktop Sidebar
export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-[340px] h-full bg-white p-6 justify-between shrink-0">
      <SidebarNav currentPath={pathname} />
    </aside>
  );
}
