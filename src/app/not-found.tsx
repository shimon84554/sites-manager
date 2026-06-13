import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="text-xl font-semibold">העמוד לא נמצא</h1>
      <p className="text-muted-foreground">
        ייתכן שהפריט נמחק או שהקישור שגוי.
      </p>
      <Button asChild>
        <Link href="/">חזרה לדשבורד</Link>
      </Button>
    </div>
  );
}
