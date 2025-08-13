import type { ContactRecord } from "app/data";
import type { Route } from "./+types/sidebar";
import {
  Form,
  Link,
  NavLink,
  Outlet,
  redirect,
  useNavigation,
} from "react-router";
import { getSession } from "../lib/auth";

export async function loader({ request }: { request: Request }) {
  const session = await getSession(request);
  if (!session) {
    return redirect("/sign-in");
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q");

  const response = await fetch(
    process.env.API_URL + "/api/contacts/search" + (q ? "?query=" + q : ""),
    {
      headers: {
        Authorization: `Bearer ${session.token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Response("Not Found", { status: response.status });
  }

  const contacts = (await response.json()) as ContactRecord[];

  return { contacts, q, session };
}

export default function SidebarLayout({ loaderData }: Route.ComponentProps) {
  const { contacts, q, session } = loaderData;
  const navigation = useNavigation();
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q");

  return (
    <>
      <div id="sidebar">
        <h1>
          <Link to="about">React Router Contacts</Link>
        </h1>
        <div className="sign-out-container">
          <p>{session.user.email}</p>
          <form action="/sign-out" method="post">
            <button type="submit">Sign out</button>
          </form>
        </div>
        <div>
          <Form method="get" id="search-form" role="search">
            <input
              aria-label="Search contacts"
              className={searching ? "loading" : ""}
              defaultValue={q || ""}
              id="q"
              name="q"
              placeholder="Search"
              type="search"
            />
            <div aria-hidden hidden={!searching} id="search-spinner" />
          </Form>
          <Form action="/contacts/create">
            <button type="submit">New</button>
          </Form>
        </div>
        <nav>
          {contacts.length ? (
            <ul>
              {contacts.map((contact) => (
                <li key={contact.id}>
                  <NavLink
                    className={({ isActive, isPending }) =>
                      isActive ? "active" : isPending ? "pending" : ""
                    }
                    to={`contacts/${contact.id}`}
                  >
                    {contact.first || contact.last ? (
                      <>
                        {contact.first} {contact.last}
                      </>
                    ) : (
                      <i>No Name</i>
                    )}
                    {contact.favorite ? <span>★</span> : null}
                  </NavLink>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              <i>No contacts</i>
            </p>
          )}
        </nav>
      </div>
      <div
        className={navigation.state === "loading" ? "loading" : ""}
        id="detail"
      >
        <Outlet />
      </div>
    </>
  );
}
