import type { Route } from "./+types/me"
import { Navbar } from "~/components/navbar"
import { ProfileForm } from "~/components/profile-form"

export function meta({}: Route.MetaArgs) {
  return [{ title: "Meu perfil | Orkut New" }]
}

export default function MePage() {
  return (
    <div className="min-h-svh">
      <Navbar />
      <ProfileForm />
    </div>
  )
}
