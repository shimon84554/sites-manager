import { redirect } from "next/navigation";
import { ShieldCheck, Eye } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/page-header";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDateShort } from "@/lib/utils";
import { UserFormModal } from "@/components/users/user-form-modal";
import { DeleteButton } from "@/components/delete-button";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const session = await auth();
  const selfId = (session?.user as { id?: string } | undefined)?.id;
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";

  // הגנה — רק מנהל רשאי לנהל משתמשים
  if (!isAdmin) redirect("/");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return (
    <div>
      <PageHeader
        title="ניהול משתמשים"
        description="הוספה, עריכה ומחיקה של משתמשים והרשאות"
      >
        <UserFormModal />
      </PageHeader>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>שם</TableHead>
              <TableHead>אימייל</TableHead>
              <TableHead>תפקיד</TableHead>
              <TableHead className="hidden sm:table-cell">נוצר</TableHead>
              <TableHead className="text-left">פעולות</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium">
                  {u.name || "—"}
                  {u.id === selfId && (
                    <span className="mr-2 text-xs text-muted-foreground">(אתה)</span>
                  )}
                </TableCell>
                <TableCell dir="ltr" className="text-right text-muted-foreground">
                  {u.email}
                </TableCell>
                <TableCell>
                  {u.role === "admin" ? (
                    <Badge variant="ok">
                      <ShieldCheck className="ml-1 size-3" />
                      מנהל
                    </Badge>
                  ) : (
                    <Badge variant="muted">
                      <Eye className="ml-1 size-3" />
                      צפייה בלבד
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="hidden text-muted-foreground sm:table-cell">
                  {formatDateShort(u.createdAt)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-start">
                    <UserFormModal
                      user={{
                        id: u.id,
                        name: u.name,
                        email: u.email,
                        role: u.role,
                      }}
                    />
                    {u.id !== selfId && (
                      <DeleteButton
                        url={`/api/users/${u.id}`}
                        title={`למחוק את ${u.name || u.email}?`}
                        description="המשתמש יוסר לצמיתות. לא ניתן לבטל."
                      />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
