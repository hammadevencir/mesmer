import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/sidebar/DashboardSidebar";
import DashboardTopbar from "@/components/dashboard/DashboardTopbar";
import { verifyIdToken } from "@/lib/firebase/auth-server";

const SESSION_COOKIE_NAME = "mesmer_session";

const AdminDashboardLayout = async ({ children }) => {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const decoded = token ? await verifyIdToken(token) : null;
  if (!decoded) {
    redirect("/admin/sign-in");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <DashboardTopbar />
        <main className="flex-1 overflow-y-auto lg:border-l lg:border-gray-200">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboardLayout;
