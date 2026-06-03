"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  ClipboardList,
  Wand2,
  Library,
  Settings,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useAssignmentStore } from "@/stores/assignment.store";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/groups", label: "My Groups", icon: Users },
  {
    href: "/assignments",
    label: "Assignments",
    icon: ClipboardList,
    showCount: true,
  },
  { href: "/toolkit", label: "AI Teacher's Toolkit", icon: Wand2 },
  { href: "/library", label: "My Library", icon: Library },
];

export function Sidebar() {
  const pathname = usePathname();
  const { total } = useAssignmentStore();

  return (
    <aside className="sidebar hidden md:flex print:hidden">
      {/* ── Logo ──────────────────────────────────────────────── */}
      <nav className="z-10 w-full max-w-9xl mx-auto px-6 py-6 flex items-center ">
        <Link href="/" className="flex items-center">
          <div className="flex items-center justify-center">
            <Image
              src="/logo.svg"
              alt="VedaAI Logo"
              width={200}
              height={50}
              className="w-auto h-18"
              priority
            />
          </div>
          <div className="text-[28px] h-15 font-bold flex items-center tracking-tight text-[#1c1c1c] leading-none">
            VedaAI
          </div>
        </Link>
      </nav>

      {/* ── Create Assignment CTA ─────────────────────────────── */}
      <div className="px-3 pt-4 pb-2">
        <Link
          href="/assignments/create"
          className="btn btn-pill-dark w-full justify-center gap-2 text-sm py-2.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Create Assignment</span>
        </Link>
      </div>

      {/* ── Navigation ───────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, showCount }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={cn("sidebar-nav-item", isActive && "active")}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1 min-w-0 truncate">{label}</span>
              {showCount && total > 0 && (
                <Badge
                  variant="dark"
                  className="text-[10px] px-1.5 py-0 min-w-[18px] justify-center"
                >
                  {total > 99 ? "99+" : total}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom ───────────────────────────────────────────── */}
      <div className="px-3 pb-4 space-y-1 border-t border-[var(--border-default)] pt-3">
        <Link
          href="/settings"
          className={cn(
            "sidebar-nav-item",
            pathname.startsWith("/settings") && "active",
          )}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </Link>

        {/* School Profile Card */}
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[var(--bg-main)] mt-2">
          <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden relative">
            <Image
              src="/school.jpg"
              alt="Delhi Public School"
              fill
              className="object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
              Delhi Public School
            </p>
            <p className="text-[10px] text-[var(--text-muted)] truncate">
              Bokaro Steel City
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
