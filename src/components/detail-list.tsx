import { cn } from "@/lib/utils";

export interface DetailItem {
  label: string;
  value?: React.ReactNode;
  dir?: "ltr" | "rtl";
}

// רשימת מאפיינים key/value — מציגה רק ערכים קיימים אלא אם showEmpty.
export function DetailList({
  items,
  showEmpty = false,
}: {
  items: DetailItem[];
  showEmpty?: boolean;
}) {
  const visible = showEmpty
    ? items
    : items.filter((i) => i.value != null && i.value !== "");

  if (visible.length === 0) {
    return (
      <p className="py-2 text-sm text-muted-foreground">אין מידע להצגה.</p>
    );
  }

  return (
    <dl className="divide-y text-sm">
      {visible.map((item, i) => (
        <div
          key={i}
          className="flex items-start justify-between gap-4 py-2 first:pt-0 last:pb-0"
        >
          <dt className="shrink-0 text-muted-foreground">{item.label}</dt>
          <dd
            className={cn(
              "min-w-0 break-words text-left font-medium",
              item.dir === "ltr" && "text-left"
            )}
            dir={item.dir}
          >
            {item.value || "—"}
          </dd>
        </div>
      ))}
    </dl>
  );
}
