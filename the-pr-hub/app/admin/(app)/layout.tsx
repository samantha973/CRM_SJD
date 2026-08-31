import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import AdminNav from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Auth guard for the whole authenticated admin area. Middleware already
  // redirects unauthenticated requests; this is defence in depth.
  const auth = await createSupabaseServerClient();
  const {
    data: { user },
  } = await auth.auth.getUser();
  if (!user) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <AdminNav email={user.email ?? ""} />
      {children}
    </div>
  );
}
