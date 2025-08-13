import { getSession } from "../lib/auth";
import { Outlet, redirect } from "react-router";

export const loader = async ({ request }: { request: Request }) => {
  const session = await getSession(request);
  if (session) {
    return redirect("/");
  }
  return null;
};

export default function AuthLayout() {
  return <Outlet />;
}
