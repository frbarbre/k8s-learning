import { redirect } from "react-router";
import type { Route } from "./+types/destroy-contact";
import { getSession } from "../lib/auth";

export async function action({ request, params }: Route.ActionArgs) {
  const session = await getSession(request);
  if (!session) {
    return redirect("/sign-in");
  }

  const response = await fetch(
    process.env.API_URL + "/api/contacts/" + params.contactId,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session?.token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Response("Failed to delete contact", { status: 500 });
  }
  return redirect("/");
}
