import { type RouteConfig, index, route } from "@react-router/dev/routes"

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("forgot-password", "routes/forgot-password.tsx"),
  route("reset-password", "routes/reset-password.tsx"),
  route("me", "routes/me.tsx"),
  route("friends", "routes/friends.tsx"),
  route("search", "routes/search.tsx"),
  route("u/:username", "routes/profile.tsx"),
  route("communities", "routes/communities.tsx"),
  route("communities/new", "routes/communities-new.tsx"),
  route("communities/:id", "routes/community-detail.tsx"),
  route("communities/:id/edit", "routes/community-edit.tsx"),
] satisfies RouteConfig
