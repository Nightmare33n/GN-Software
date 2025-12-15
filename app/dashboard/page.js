import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/libs/next-auth";
import connectMongo from "@/libs/mongoose";
import User from "@/models/User";

export const dynamic = "force-dynamic";

// This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// It redirects users to their role-specific dashboard
export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/api/auth/signin");
  }

  // Fetch user to check role
  await connectMongo();
  const user = await User.findById(session.user.id);

  if (!user) {
    redirect("/api/auth/signin");
  }

  // Redirect based on role
  if (user.role === 'freelancer' || user.role === 'admin') {
    redirect("/dashboard/freelancer");
  } else {
    redirect("/dashboard/client");
  }
}
