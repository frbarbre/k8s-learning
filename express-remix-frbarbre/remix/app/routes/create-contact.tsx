import { getSession } from "../lib/auth";
import { Form, redirect } from "react-router";

export async function action({ request }: { request: Request }) {
  const session = await getSession(request);
  if (!session) {
    return redirect("/sign-in");
  }

  const formData = await request.formData();
  const contact = Object.fromEntries(formData);
  const response = await fetch(process.env.API_URL + "/api/contacts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.token}`,
    },
    body: JSON.stringify(contact),
  });
  if (!response.ok) {
    throw new Response("Failed to create contact", { status: 500 });
  }

  const newContact = await response.json();
  return redirect(`/contacts/${newContact.id}`);
}

export default function CreateContact() {
  return (
    <Form id="contact-form" method="post">
      <p>
        <span>Name</span>
        <input
          aria-label="First name"
          name="first"
          placeholder="First"
          type="text"
        />
        <input
          aria-label="Last name"
          name="last"
          placeholder="Last"
          type="text"
        />
      </p>
      <label>
        <span>Twitter</span>
        <input name="twitter" placeholder="@jack" type="text" />
      </label>
      <label>
        <span>Avatar URL</span>
        <input
          aria-label="Avatar URL"
          name="avatar"
          placeholder="https://example.com/avatar.jpg"
          type="text"
        />
      </label>

      <p>
        <button type="submit">Save</button>
        <button type="button">Cancel</button>
      </p>
    </Form>
  );
}
