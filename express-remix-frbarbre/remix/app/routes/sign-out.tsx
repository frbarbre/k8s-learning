import { redirect } from "react-router";
import { logout, getSession } from "../lib/auth";

export const action = async ({ request }: { request: Request }) => {
  const session = await getSession(request);
  if (!session) {
    return redirect("/sign-in");
  }

  const response = await fetch(process.env.API_URL + "/api/auth/signout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.token}`,
    },
  });

  if (response.status === 204) {
    return await logout();
  }

  return redirect("/");
};
