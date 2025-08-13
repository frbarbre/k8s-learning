import { Form, redirect, useNavigate } from "react-router";
import type { Route } from "./+types/edit-contact";
import { getSession } from "../lib/auth";

export async function loader({ params, request }: Route.LoaderArgs) {
  const session = await getSession(request);
  if (!session) {
    return redirect("/sign-in");
  }

  const response = await fetch(
    process.env.API_URL + "/api/contacts/" + params.contactId,
    {
      headers: {
        Authorization: `Bearer ${session?.token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Response("Not Found", { status: 404 });
  }
  const contact = await response.json();
  return { contact };
}

export async function action({ request }: { request: Request }) {
  const session = await getSession(request);
  if (!session) {
    return redirect("/sign-in");
  }

  const formData = await request.formData();
  const contact = Object.fromEntries(formData);

  const response = await fetch(
    process.env.API_URL + "/api/contacts/" + contact.id,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.token}`,
      },
      body: JSON.stringify(contact),
    }
  );
  if (!response.ok) {
    throw new Response("Failed to update contact", { status: 500 });
  }
  return redirect("/contacts/" + contact.id);
}

export default function EditContact({ loaderData }: Route.ComponentProps) {
  const { contact } = loaderData;
  const navigate = useNavigate();

  return (
    <Form key={contact.id} id="contact-form" method="post">
      <p>
        <span>Name</span>
        <input
          aria-label="First name"
          defaultValue={contact.first}
          name="first"
          placeholder="First"
          type="text"
        />
        <input
          aria-label="Last name"
          defaultValue={contact.last}
          name="last"
          placeholder="Last"
          type="text"
        />
      </p>
      <label>
        <span>Twitter</span>
        <input
          defaultValue={contact.twitter}
          name="twitter"
          placeholder="@jack"
          type="text"
        />
      </label>
      <label>
        <span>Avatar URL</span>
        <input
          aria-label="Avatar URL"
          defaultValue={contact.avatar}
          name="avatar"
          placeholder="https://example.com/avatar.jpg"
          type="text"
        />
      </label>

      <input type="text" name="id" defaultValue={contact.id} hidden />

      <p>
        <button type="submit">Save</button>
        <button onClick={() => navigate(-1)} type="button">
          Cancel
        </button>
      </p>
    </Form>
  );
}
