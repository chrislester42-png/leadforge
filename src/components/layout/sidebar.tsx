"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Search, ClipboardList, Settings, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/scrape", icon: Search, label: "Scrape" },
  { href: "/orders", icon: ClipboardList, label: "Orders" },
  { href: "/config", icon: Settings, label: "Config" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="flex flex-col w-16 lg:w-56 min-h-screen bg-sidebar px-3 py-4 shrink-0">
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
          <span className="text-black font-bold text-sm">L</span>
        </div>
        <span className="hidden lg:block text-white font-semibold text-base">LeadForge</span>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors text-sm font-medium",
                active
                  ? "bg-accent text-black"
                  : "text-sidebar-foreground hover:bg-white/10"
              )}
            >
              <Icon size={18} className="shrink-0" />
              <span className="hidden lg:block">{label}</span>
            </Link>
          );
        })}
      </nav>
      <button
        onClick={handleSignOut}
        className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-sidebar-foreground hover:bg-white/10 transition-colors text-sm font-medium"
      >
        <LogOut size={18} className="shrink-0" />
        <span className="hidden lg:block">Sign out</span>
      </button>
    </aside>
  );
}
