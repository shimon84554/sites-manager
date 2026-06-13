import {
  LayoutDashboard,
  Users,
  Globe,
  CreditCard,
  CalendarClock,
  KeyRound,
  Activity,
  PieChart,
  Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

// תפריט הניווט הראשי — מקור אמת יחיד ל-sidebar ול-drawer במובייל
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "דשבורד", icon: LayoutDashboard },
  { href: "/renewals", label: "חידושים", icon: CalendarClock },
  { href: "/sites", label: "אתרים", icon: Globe },
  { href: "/clients", label: "לקוחות", icon: Users },
  { href: "/subscriptions", label: "מנויים", icon: CreditCard },
  { href: "/vault", label: "כספת סיסמאות", icon: KeyRound },
  { href: "/monitoring", label: "ניטור SSL", icon: Activity },
  { href: "/reports", label: "עלויות ורווחיות", icon: PieChart },
  { href: "/settings", label: "הגדרות", icon: Settings },
];
