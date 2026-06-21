import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ProfileForm } from "@/components/account/profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="space-y-6">
      <PageHeader
        title="הפרופיל שלי"
        description="עדכון שם התצוגה והסיסמה האישית"
      />
      <Card>
        <CardContent className="p-5 sm:p-6">
          <ProfileForm
            initialName={session.user.name ?? ""}
            email={session.user.email ?? ""}
          />
        </CardContent>
      </Card>
    </div>
  );
}
