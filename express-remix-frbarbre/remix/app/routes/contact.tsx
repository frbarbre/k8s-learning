import { Form, redirect, useLoaderData } from "react-router";

import type { ContactRecord } from "../data";
import type { Route } from "./+types/contact";
import { getSession } from "../lib/auth";

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  const session = await getSession(request);
  if (!session) {
    return redirect("/sign-in");
  }

  const { contactId } = params;
  const response = await fetch(
    process.env.API_URL + "/api/contacts/" + contactId,
    {
      headers: {
        Authorization: `Bearer ${session?.token}`,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Response("Not Found", { status: response.status });
  }
  return { server_contact: data };
};

export async function action({ params, request }: Route.ActionArgs) {
  const session = await getSession(request);
  if (!session) {
    return redirect("/sign-in");
  }

  const { contactId } = params;

  console.log("contactId", contactId);
  const response = await fetch(
    process.env.API_URL + "/api/contacts/" + contactId + "/favourite",
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${session?.token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Response("Failed to favorite contact", { status: 500 });
  }
  return null;
}
export default function Contact() {
  const { server_contact } = useLoaderData<typeof loader>();

  const contact = {
    first: server_contact.first,
    last: server_contact.last,
    avatar: server_contact.avatar,
    twitter: server_contact.twitter,
    favorite: server_contact.favorite,
  };

  return (
    <div id="contact">
      <div>
        <img
          alt={`${contact.first} ${contact.last} avatar`}
          key={contact.avatar}
          src={contact.avatar}
        />
      </div>
      <div>
        <h1>
          {contact.first || contact.last ? (
            <>
              {contact.first} {contact.last}
            </>
          ) : (
            <i>No Name</i>
          )}
          <Favorite contact={contact} />
        </h1>

        {contact.twitter ? (
          <p>
            <a href={`https://twitter.com/${contact.twitter}`}>
              {contact.twitter}
            </a>
          </p>
        ) : null}

        <div>
          <Form action="edit">
            <button type="submit">Edit</button>
          </Form>

          <Form
            action="destroy"
            method="post"
            onSubmit={(event) => {
              const response = confirm(
                "Please confirm you want to delete this record."
              );
              if (!response) {
                event.preventDefault();
              }
            }}
          >
            <button type="submit">Delete</button>
          </Form>
        </div>
      </div>
    </div>
  );
}

function Favorite({ contact }: { contact: Pick<ContactRecord, "favorite"> }) {
  const favorite = contact.favorite;

  return (
    <Form method="post">
      <button
        aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
        name="favorite"
        value={favorite ? "false" : "true"}
      >
        {favorite ? "★" : "☆"}
      </button>
    </Form>
  );
}
