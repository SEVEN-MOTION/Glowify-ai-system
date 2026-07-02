import React, {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  Bell,
  Bot,
  BarChart3,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  Shield,
  Store,
  User,
  Users,
  Zap,
  type LucideIcon,
  LogOut,
  Activity,
  Megaphone,
  Radio,
  WandSparkles,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { NotificationCenter } from "./NotificationCenter";

interface DashboardShellProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

type NavItem = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  hint?: string;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

type StoreOption = {
  id: string;
  name: string;
  domain: string;
  tier: string;
};

const MOCK_STORES: StoreOption[] = [
  {
    id: "store-1",
    name: "NEUROZEN LAB",
    domain: "neurozen-lab.myshopify.com",
    tier: "Growth",
  },
  {
    id: "store-2",
    name: "BrandAlpha",
    domain: "brand-alpha.myshopify.com",
    tier: "Scale",
  },
  {
    id: "store-3",
    name: "BrandBeta",
    domain: "brand-beta.myshopify.com",
    tier: "Enterprise",
  },
];

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Command",
    items: [
      {
        id: "executive",
        label: "Executive",
        description: "Briefing, priorities, and business pulse",
        icon: LayoutDashboard,
        badge: "Live",
      },
      {
        id: "growth",
        label: "Growth",
        description: "Conversion, retention, and expansion",
        icon: BarChart3,
      },
      {
        id: "ai",
        label: "AI",
        description: "Recommendations, agents, and execution",
        icon: Bot,
      },
    ],
  },
  {
    title: "Commercial",
    items: [
      {
        id: "commerce",
        label: "Commerce",
        description: "Catalog, fulfillment, and merchandising",
        icon: Store,
      },
      {
        id: "marketing",
        label: "Marketing",
        description: "Spend, campaigns, and attribution",
        icon: Megaphone,
      },
      {
        id: "customers",
        label: "Customers",
        description: "Segments, retention, and lifetime value",
        icon: Users,
      },
    ],
  },
  {
    title: "Operations",
    items: [
      {
        id: "operations",
        label: "Operations",
        description: "Fulfillment, alerts, and system activity",
        icon: Activity,
      },
      {
        id: "finance",
        label: "Finance",
        description: "Revenue, margin, and cash signals",
        icon: CreditCard,
      },
      {
        id: "intelligence",
        label: "Intelligence",
        description: "Signals, anomalies, and pattern detection",
        icon: Radio,
      },
      {
        id: "automation",
        label: "Automation",
        description: "Active workflows and revenue actions",
        icon: WandSparkles,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        id: "settings",
        label: "Settings",
        description: "Workspace, integrations, and account",
        icon: Settings,
      },
    ],
  },
];

const QUICK_ACTIONS = [
  {
    id: "executive",
    label: "Executive",
    icon: LayoutDashboard,
    hint: "Back to the briefing",
  },
  {
    id: "growth",
    label: "Growth",
    icon: TrendingUp,
    hint: "Open growth opportunities",
  },
  {
    id: "automation",
    label: "Automation",
    icon: WandSparkles,
    hint: "Review live workflows",
  },
];

const TAB_META: Record<string, { title: string; description: string }> = {
  executive: {
    title: "Executive",
    description: "Briefing, priorities, and live revenue pulse",
  },
  growth: {
    title: "Growth",
    description: "Conversion, retention, and expansion signals",
  },
  ai: {
    title: "AI",
    description: "Recommendations, automations, and execution",
  },
  commerce: {
    title: "Commerce",
    description: "Catalog, fulfillment, and merchandising health",
  },
  marketing: {
    title: "Marketing",
    description: "Spend, campaign performance, and attribution",
  },
  customers: {
    title: "Customers",
    description: "Segmentation, retention, and lifetime value",
  },
  operations: {
    title: "Operations",
    description: "Fulfillment, alerts, and system activity",
  },
  finance: {
    title: "Finance",
    description: "Revenue, margin, and cash signals",
  },
  intelligence: {
    title: "Intelligence",
    description: "Signals, anomalies, and pattern detection",
  },
  automation: {
    title: "Automation",
    description: "Active workflows and expected impact",
  },
  settings: {
    title: "Settings",
    description: "Workspace, integrations, and account controls",
  },
};

const HEADER_STYLE =
  "border-white/8 bg-[#080608]/80 backdrop-blur-2xl supports-[backdrop-filter]:bg-[#080608]/70";

const motionEase = [0.22, 1, 0.36, 1] as const;

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getDisplayName(userEmail?: string, fallback = "Operator") {
  if (!userEmail) return fallback;
  const prefix = userEmail.split("@")[0] || fallback;
  return prefix
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function useShellSearchTargets() {
  return useMemo(
    () =>
      NAV_GROUPS.flatMap((group) =>
        group.items.map((item) => ({
          ...item,
          group: group.title,
        })),
      ),
    [],
  );
}

const SidebarItem = React.memo(function SidebarItem({
  item,
  active,
  collapsed,
  onClick,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      aria-label={item.label}
      className={`group relative flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9747A]/70 focus-visible:ring-offset-0 ${
        active
          ? "border-[#C9747A]/30 bg-gradient-to-r from-[#C9747A]/14 to-transparent text-white shadow-[0_10px_30px_rgba(0,0,0,0.28)]"
          : "border-transparent text-[#8E7D84] hover:border-white/6 hover:bg-white/[0.03] hover:text-[#F5EEF0]"
      } ${collapsed ? "justify-center px-0" : ""}`}
    >
      {active && (
        <motion.span
          layoutId="sidebar-active-indicator"
          className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-[#C9747A] shadow-[0_0_16px_rgba(201,116,122,0.55)]"
          transition={{ duration: 0.22, ease: motionEase }}
        />
      )}
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors ${
        active
          ? "border-[#C9747A]/20 bg-[#C9747A]/12 text-[#F5EEF0]"
          : "border-white/5 bg-white/[0.02] text-inherit group-hover:border-white/10 group-hover:bg-white/[0.04]"
      }`}>
        <Icon size={18} strokeWidth={2} />
      </span>
      {!collapsed && (
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold tracking-tight text-inherit">
            {item.label}
          </span>
          <span className="mt-0.5 block truncate text-[11px] text-[#7A6A71]">
            {item.description}
          </span>
        </span>
      )}
      {!collapsed && item.badge && (
        <span className="rounded-full border border-[#C9747A]/20 bg-[#C9747A]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#E2B1B4]">
          {item.badge}
        </span>
      )}
      {collapsed && active && (
        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#C9747A] shadow-[0_0_10px_rgba(201,116,122,0.7)]" />
      )}
    </button>
  );
});

function WorkspaceSwitcher({
  stores,
  selectedStore,
  onSelect,
  collapsed,
}: {
  stores: StoreOption[];
  selectedStore: string;
  onSelect: (id: string) => void;
  collapsed: boolean;
}) {
  const [open, setOpen] = useState(false);
  const current = stores.find((store) => store.id === selectedStore) ?? stores[0];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`group flex w-full items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3 text-left transition-all duration-200 hover:border-[#C9747A]/25 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9747A]/70 ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#C9747A]/18 to-[#8B4A6B]/20 text-[#F5EEF0]">
          <Store size={18} strokeWidth={2} />
        </span>
        {!collapsed && (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-semibold text-[#F5EEF0]">
              {current.name}
            </span>
            <span className="block truncate text-[11px] text-[#8A7A81]">
              {current.domain}
            </span>
          </span>
        )}
        {!collapsed && (
          <span className="rounded-full border border-white/8 bg-white/[0.03] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#BCA8AE]">
            {current.tier}
          </span>
        )}
        <ChevronDown
          size={16}
          className={`shrink-0 text-[#7E6E75] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={collapsed ? { opacity: 0, y: -4, scale: 0.98 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: motionEase }}
            role="menu"
            aria-label="Workspace switcher"
            className="absolute left-0 top-full z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/8 bg-[#0D0D1A] shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
          >
            <div className="border-b border-white/6 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A7A81]">
                Switch Workspace
              </p>
            </div>
            <div className="p-2">
              {stores.map((store) => (
                <button
                  key={store.id}
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onSelect(store.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9747A]/70 ${
                    store.id === selectedStore ? "bg-white/[0.05]" : ""
                  }`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#C9747A]/16 to-[#8B4A6B]/18 text-[#F5EEF0]">
                    <Store size={18} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-[#F5EEF0]">
                      {store.name}
                    </span>
                    <span className="block truncate text-[11px] text-[#8A7A81]">
                      {store.domain}
                    </span>
                  </span>
                  <span className="rounded-full border border-white/8 bg-white/[0.03] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#BCA8AE]">
                    {store.tier}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarFooter({
  collapsed,
  user,
  profile,
  onSignOut,
}: {
  collapsed: boolean;
  user: ReturnType<typeof useAuth>["user"];
  profile: ReturnType<typeof useAuth>["profile"];
  onSignOut: () => void;
}) {
  const displayName = profile?.displayName || getDisplayName(user?.email);

  return (
    <div className="border-t border-white/8 p-4">
      <div className={`rounded-3xl border border-white/8 bg-white/[0.03] p-3 ${collapsed ? "" : ""}`}>
        <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#C9747A] to-[#8B4A6B] text-white shadow-[0_12px_30px_rgba(201,116,122,0.25)]">
            <User size={18} strokeWidth={2.2} />
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#F5EEF0]">{displayName}</p>
              <p className="truncate text-[11px] text-[#8A7A81]">{user?.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300">
                  Pro Workspace
                </span>
                <span className="rounded-full border border-white/8 bg-white/[0.03] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#BCA8AE]">
                  12 users
                </span>
              </div>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2 text-[11px] font-semibold text-[#E5D3D7] transition-colors hover:border-white/12 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9747A]/70"
            >
              <CreditCard size={14} />
              Billing
            </button>
            <button
              type="button"
              onClick={onSignOut}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#EF4444]/15 bg-[#EF4444]/8 px-3 py-2 text-[11px] font-semibold text-[#FCA5A5] transition-colors hover:bg-[#EF4444]/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444]/70"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        )}

        {collapsed && (
          <button
            type="button"
            onClick={onSignOut}
            aria-label="Sign out"
            className="mt-3 flex h-10 w-full items-center justify-center rounded-xl border border-[#EF4444]/15 bg-[#EF4444]/8 text-[#FCA5A5] transition-colors hover:bg-[#EF4444]/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444]/70"
          >
            <LogOut size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

function ShellSearch({
  onNavigate,
}: {
  onNavigate: (tab: string) => void;
}) {
  const targets = useShellSearchTargets();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const matches = useMemo(() => {
    const normalized = deferredQuery.trim().toLowerCase();
    const source = normalized ? targets : targets.slice(0, 5);

    return source.filter((item) => {
      if (!normalized) return true;
      return [item.label, item.description, item.group].some((value) =>
        value.toLowerCase().includes(normalized),
      );
    });
  }, [deferredQuery, targets]);

  const isOpen = isFocused || query.trim().length > 0;

  const selectTarget = useCallback(
    (id: string) => {
      onNavigate(id);
      setQuery("");
      setIsFocused(false);
      inputRef.current?.blur();
    },
    [onNavigate],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        setIsFocused(true);
      }

      if (!typing && event.key === "/") {
        event.preventDefault();
        inputRef.current?.focus();
        setIsFocused(true);
      }

      if (event.key === "Escape") {
        setIsFocused(false);
        setQuery("");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="relative w-full max-w-2xl">
      <label htmlFor="shell-search" className="sr-only">
        Search the dashboard
      </label>
      <div className="relative flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition-colors focus-within:border-[#C9747A]/35 focus-within:bg-white/[0.045]">
        <Search size={16} className="text-[#85757C]" />
        <input
          ref={inputRef}
          id="shell-search"
          type="search"
          value={query}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            window.setTimeout(() => setIsFocused(false), 120);
          }}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && matches[0]) {
              event.preventDefault();
              selectTarget(matches[0].id);
            }
          }}
          placeholder="Search pages, metrics, and workflows"
          aria-label="Search pages, metrics, and workflows"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="shell-search-results"
          className="min-w-0 flex-1 bg-transparent text-sm text-[#F5EEF0] placeholder:text-[#72656B] focus:outline-none"
        />
        <div className="hidden items-center gap-1 rounded-full border border-white/8 bg-white/[0.03] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#A99AA0] md:flex">
          <span>⌘K</span>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="shell-search-results"
            role="listbox"
            aria-label="Search results"
            initial={{ opacity: 0, y: -6, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.99 }}
            transition={{ duration: 0.16, ease: motionEase }}
            className="absolute left-0 top-[calc(100%+0.5rem)] z-50 w-full overflow-hidden rounded-2xl border border-white/8 bg-[#0D0D1A] shadow-[0_28px_80px_rgba(0,0,0,0.42)]"
          >
            <div className="border-b border-white/6 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8A7A81]">
                {query.trim() ? "Search results" : "Quick navigation"}
              </p>
            </div>
            <div className="max-h-72 overflow-y-auto p-2 custom-scrollbar">
              {matches.length > 0 ? (
                matches.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      role="option"
                      onMouseDown={(event) => {
                        event.preventDefault();
                        selectTarget(item.id);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9747A]/70"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-[#F5EEF0]">
                        <Icon size={16} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-[#F5EEF0]">
                          {item.label}
                        </span>
                        <span className="block truncate text-[11px] text-[#8A7A81]">
                          {item.description}
                        </span>
                      </span>
                      <span className="rounded-full border border-white/8 bg-white/[0.03] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#BCA8AE]">
                        {item.group}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
                  <Search size={28} className="text-[#6F6269]" />
                  <div>
                    <p className="text-sm font-semibold text-[#F5EEF0]">No matches found</p>
                    <p className="mt-1 text-xs text-[#8A7A81]">
                      Try searching for a tab, workflow, or metric.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HeaderAction({
  icon: Icon,
  label,
  onClick,
  active = false,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-2xl border px-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9747A]/70 ${
        active
          ? "border-[#C9747A]/25 bg-[#C9747A]/12 text-[#F5EEF0] shadow-[0_10px_24px_rgba(201,116,122,0.12)]"
          : "border-white/8 bg-white/[0.03] text-[#E8D9DD] hover:border-white/12 hover:bg-white/[0.05]"
      }`}
    >
      <Icon size={16} strokeWidth={2} />
    </button>
  );
}

function UserMenu({
  user,
  profile,
  onSignOut,
}: {
  user: ReturnType<typeof useAuth>["user"];
  profile: ReturnType<typeof useAuth>["profile"];
  onSignOut: () => void;
}) {
  const [open, setOpen] = useState(false);
  const displayName = profile?.displayName || getDisplayName(user?.email);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open profile menu"
        className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-2 transition-colors hover:border-white/12 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9747A]/70"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#C9747A] to-[#8B4A6B] text-white shadow-[0_10px_24px_rgba(201,116,122,0.2)]">
          <User size={18} strokeWidth={2.2} />
        </span>
        <span className="hidden min-w-0 text-left lg:block">
          <span className="block truncate text-[13px] font-semibold text-[#F5EEF0]">
            {displayName}
          </span>
          <span className="block truncate text-[11px] text-[#8A7A81]">
            {user?.email}
          </span>
        </span>
        <ChevronDown
          size={16}
          className={`text-[#7E6E75] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.16, ease: motionEase }}
            role="menu"
            aria-label="Profile menu"
            className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-white/8 bg-[#0D0D1A] shadow-[0_28px_80px_rgba(0,0,0,0.45)]"
          >
            <div className="border-b border-white/6 px-4 py-4">
              <p className="truncate text-sm font-semibold text-[#F5EEF0]">{displayName}</p>
              <p className="truncate text-[11px] text-[#8A7A81]">{user?.email}</p>
            </div>
            <div className="p-2">
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[#E8D9DD] transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9747A]/70"
              >
                <User size={16} />
                Profile
              </button>
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[#E8D9DD] transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9747A]/70"
              >
                <CreditCard size={16} />
                Billing
              </button>
              <button
                type="button"
                role="menuitem"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[#E8D9DD] transition-colors hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9747A]/70"
              >
                <Shield size={16} />
                Security
              </button>
            </div>
            <div className="border-t border-white/6 p-2">
              <button
                type="button"
                onClick={onSignOut}
                role="menuitem"
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-[#FCA5A5] transition-colors hover:bg-[#EF4444]/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444]/70"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SidebarContent({
  activeTab,
  setActiveTab,
  collapsed,
  onCollapseToggle,
  user,
  profile,
  selectedStore,
  setSelectedStore,
  onCloseMobile,
  onSignOut,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  onCollapseToggle?: () => void;
  user: ReturnType<typeof useAuth>["user"];
  profile: ReturnType<typeof useAuth>["profile"];
  selectedStore: string;
  setSelectedStore: (value: string) => void;
  onCloseMobile?: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="flex h-full w-full flex-col">
      <div className="border-b border-white/8 p-4">
        <div className={`flex items-start gap-3 ${collapsed ? "justify-center" : ""}`}>
          <button
            type="button"
            onClick={() => {
              setActiveTab("executive");
              onCloseMobile?.();
            }}
            aria-label="Go to command center"
            className="group inline-flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9747A]/70"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-gradient-to-br from-[#C9747A] to-[#8B4A6B] text-white shadow-[0_14px_30px_rgba(201,116,122,0.24)] transition-transform duration-200 group-hover:scale-[1.03]">
              <Zap size={22} strokeWidth={2.2} />
            </span>
            {!collapsed && (
              <span className="min-w-0">
                <span className="block text-[1.05rem] font-black tracking-[-0.04em] text-[#F5EEF0]">
                  GLOWIFY<span className="text-[#C9747A]">AI</span>
                </span>
                <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.25em] text-[#7E6E75]">
                  Business Operating System
                </span>
              </span>
            )}
          </button>
          {!collapsed && onCollapseToggle && (
            <button
              type="button"
              onClick={onCollapseToggle}
              aria-label="Collapse sidebar"
              className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-[#D8C7CB] transition-colors hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9747A]/70"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          {collapsed && onCollapseToggle && (
            <button
              type="button"
              onClick={onCollapseToggle}
              aria-label="Expand sidebar"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/8 bg-white/[0.03] text-[#D8C7CB] transition-colors hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9747A]/70"
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        <div className="mt-4">
          <WorkspaceSwitcher
            stores={MOCK_STORES}
            selectedStore={selectedStore}
            onSelect={setSelectedStore}
            collapsed={collapsed}
          />
        </div>
      </div>

      <nav className="custom-scrollbar flex-1 overflow-y-auto px-4 py-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className={collapsed ? "mb-4" : "mb-5"}>
            {!collapsed && (
              <div className="mb-3 px-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7E6E75]">
                  {group.title}
                </p>
              </div>
            )}
            <div className="space-y-1.5">
              {group.items.map((item) => (
                <SidebarItem
                  key={item.id}
                  item={item}
                  active={activeTab === item.id}
                  collapsed={collapsed}
                  onClick={() => {
                    setActiveTab(item.id);
                    onCloseMobile?.();
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/8 p-4">
        {!collapsed && (
          <div className="mb-3 rounded-3xl border border-white/8 bg-gradient-to-br from-white/[0.04] to-transparent p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10 text-emerald-300">
                <Radio size={16} />
              </span>
              <div>
                <p className="text-sm font-semibold text-[#F5EEF0]">AI systems online</p>
                <p className="text-[11px] text-[#8A7A81]">24 automations monitored today</p>
              </div>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
              <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-[#C9747A] to-[#8B4A6B]" />
            </div>
          </div>
        )}
        <SidebarFooter
          collapsed={collapsed}
          user={user}
          profile={profile}
          onSignOut={onSignOut}
        />
      </div>
    </div>
  );
}

function ShellHeader({
  user,
  profile,
  activeTab,
  onNavigate,
  onToggleSidebar,
  onToggleNotifications,
  onSignOut,
}: {
  user: ReturnType<typeof useAuth>["user"];
  profile: ReturnType<typeof useAuth>["profile"];
  activeTab: string;
  onNavigate: (tab: string) => void;
  onToggleSidebar: () => void;
  onToggleNotifications: () => void;
  onSignOut: () => void;
}) {
  const displayName = profile?.displayName || getDisplayName(user?.email);
  const greeting = getGreeting();

  return (
    <header className={`sticky top-0 z-20 border-b border-white/8 ${HEADER_STYLE}`}>
      <div className="mx-auto flex min-h-[80px] w-full max-w-[1800px] items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Toggle navigation"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] text-[#E7DADD] transition-colors hover:border-white/12 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9747A]/70 md:hidden"
          >
            <Menu size={18} />
          </button>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8A7A81]">
              {greeting}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <h1 className="truncate text-lg font-semibold tracking-[-0.03em] text-[#F5EEF0] sm:text-xl">
                {displayName}
              </h1>
              <span className="hidden rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-300 sm:inline-flex">
                AI ready
              </span>
            </div>
            <p className="mt-1 hidden text-xs text-[#8A7A81] lg:block">
              {TAB_META[activeTab]?.description || TAB_META.executive.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 rounded-2xl border border-emerald-400/15 bg-emerald-400/10 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-300 xl:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.65)]" />
            AI sync live
          </div>
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => onNavigate(action.id)}
              aria-label={action.label}
              title={action.hint}
              className={`hidden h-11 items-center gap-2 rounded-2xl border px-3 text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9747A]/70 lg:inline-flex ${
                activeTab === action.id
                  ? "border-[#C9747A]/25 bg-[#C9747A]/12 text-[#F5EEF0]"
                  : "border-white/8 bg-white/[0.03] text-[#E8D9DD] hover:border-white/12 hover:bg-white/[0.05]"
              }`}
            >
              <action.icon size={16} strokeWidth={2} />
              <span className="hidden xl:inline">{action.label}</span>
            </button>
          ))}
          <HeaderAction
            icon={Search}
            label="Search"
            onClick={() => {
              const element = document.getElementById("shell-search") as HTMLInputElement | null;
              element?.focus();
            }}
          />
          <button
            type="button"
            onClick={onToggleNotifications}
            aria-label="Open notifications"
            className="relative inline-flex h-11 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03] px-3 text-[#E8D9DD] transition-colors hover:border-white/12 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9747A]/70"
          >
            <Bell size={16} />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#C9747A] shadow-[0_0_10px_rgba(201,116,122,0.75)]" />
          </button>
          <UserMenu user={user} profile={profile} onSignOut={onSignOut} />
        </div>
      </div>

      <div className="border-t border-white/6 px-4 py-4 sm:px-6 lg:px-8">
        <ShellSearch onNavigate={onNavigate} />
      </div>
    </header>
  );
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  children,
  activeTab,
  setActiveTab,
}) => {
  const { user, profile, signOut } = useAuth();
  const [selectedStore, setSelectedStore] = useState(MOCK_STORES[0].id);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  const handleSignOut = useCallback(() => {
    void signOut();
  }, [signOut]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileSidebarOpen(false);
        setNotificationsOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const transition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: motionEase };

  return (
    <div className="relative flex h-screen overflow-hidden bg-[#080608] text-[#F5EEF0] antialiased selection:bg-[#C9747A]/30 selection:text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,116,122,0.09),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(139,74,107,0.1),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_18%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.024)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.024)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30" />
        <div className="absolute left-[-10rem] top-[-8rem] h-[26rem] w-[26rem] rounded-full bg-[#C9747A]/8 blur-[140px]" />
        <div className="absolute bottom-[-10rem] right-[-8rem] h-[24rem] w-[24rem] rounded-full bg-[#8B4A6B]/8 blur-[140px]" />
      </div>

      <AnimatePresence initial={false}>
        {mobileSidebarOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close navigation"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={transition}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm md:hidden"
            />
            <motion.aside
              initial={{ x: -24, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -24, opacity: 0 }}
              transition={transition}
              className="fixed inset-y-0 left-0 z-50 w-[min(88vw,20.5rem)] border-r border-white/8 bg-[#080608]/96 shadow-[0_28px_90px_rgba(0,0,0,0.5)] md:hidden"
            >
              <SidebarContent
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                collapsed={false}
                user={user}
                profile={profile}
                selectedStore={selectedStore}
                setSelectedStore={setSelectedStore}
                onCloseMobile={() => setMobileSidebarOpen(false)}
                onSignOut={handleSignOut}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside
        className={`relative z-30 hidden h-full shrink-0 border-r border-white/8 bg-[#080608]/90 backdrop-blur-2xl md:flex ${
          collapsed ? "w-[96px]" : "w-[286px]"
        }`}
        style={{ transition: reduceMotion ? undefined : "width 220ms cubic-bezier(0.22,1,0.36,1)" }}
      >
        <SidebarContent
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          collapsed={collapsed}
          onCollapseToggle={() => setCollapsed((value) => !value)}
          user={user}
          profile={profile}
          selectedStore={selectedStore}
          setSelectedStore={setSelectedStore}
          onSignOut={handleSignOut}
        />
      </aside>

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <ShellHeader
          user={user}
          profile={profile}
          activeTab={activeTab}
          onNavigate={setActiveTab}
          onToggleSidebar={() => setMobileSidebarOpen((value) => !value)}
          onToggleNotifications={() => setNotificationsOpen((value) => !value)}
          onSignOut={handleSignOut}
        />

        <main className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 custom-scrollbar">
          <div className="mx-auto w-full max-w-[1800px]">
            <div className="rounded-[2rem] border border-white/6 bg-white/[0.02] p-4 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-sm sm:p-6 lg:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>

      <NotificationCenter
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />
    </div>
  );
};

export default DashboardShell;
