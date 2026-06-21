import {
  LayoutDashboard,
  Users,
  Globe,
  CreditCard,
  CalendarClock,
  PieChart,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  // אם true — מוצג רק למנהלים
  adminOnly?: boolean;
}

// תפריט הניווט הראשי — מקור אמת יחיד ל-sidebar ול-drawer במובייל
export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "דשבורד", icon: LayoutDashboard },
  { href: "/renewals", label: "חידושים", icon: CalendarClock },
  { href: "/sites", label: "אתרים", icon: Globe },
  { href: "/clients", label: "לקוחות", icon: Users },
  { href: "/subscriptions", label: "מנויים", icon: CreditCard },
  { href: "/reports", label: "עלויות ורווחיות", icon: PieChart },
  { href: "/users", label: "ניהול משתמשים", icon: ShieldCheck, adminOnly: true },
  { href: "/settings", label: "הגדרות", icon: Settings },
];
