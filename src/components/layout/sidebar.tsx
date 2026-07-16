"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Search, ClipboardList, Megaphone, Settings, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/scrape", icon: Search, label: "Scrape" },
  { href: "/orders", icon: ClipboardList, label: "Orders" },
  { href: "/campaigns", icon: Megaphone, label: "Campaigns" },
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
    <aside className="flex flex-col w-16 lg:w-56 min-h-screen bg-sidebar border-r border-sidebar-border px-3 py-5 shrink-0">
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
          <span className="font-extrabold text-sm" style={{ color: "hsl(0 0% 5%)" }}>L</span>
        </div>
        <span className="hidden lg:block text-white font-semibold text-[15px] tracking-tight">LeadForge</span>
      </div>
      <nav className="flex flex-col gap-0.5 flex-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium",
                active
                  ? "bg-accent text-[#0a0a0a]"
                  : "text-sidebar-foreground hover:bg-white/10 hover:text-white"
              )}
            >
              <Icon size={16} className="shrink-0" />
              <span className="hidden lg:block">{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border mt-1 pt-2">
        <button
          onClick={handleSignOut}
          aria-label="Sign out"
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-white/8 hover:text-white transition-colors text-sm font-medium"
        >
          <LogOut size={15} className="shrink-0" />
          <span className="hidden lg:block">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
