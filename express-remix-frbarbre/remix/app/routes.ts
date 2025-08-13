import type { RouteConfig } from "@react-router/dev/routes";
import { index, layout, route } from "@react-router/dev/routes";

export default [
  layout("layouts/sidebar.tsx", [
    index("routes/home.tsx"),
    route("contacts/:contactId", "routes/contact.tsx"),
    route("contacts/:contactId/edit", "routes/edit-contact.tsx"),
    route("contacts/create", "routes/create-contact.tsx"),
    route("contacts/:contactId/destroy", "routes/destroy-contact.tsx"),
    route("sign-out", "routes/sign-out.tsx"),
  ]),
  route("about", "routes/about.tsx"),
  layout("layouts/auth.tsx", [
    route("sign-in", "routes/sign-in.tsx"),
    route("register", "routes/register.tsx"),
  ]),
] satisfies RouteConfig;
