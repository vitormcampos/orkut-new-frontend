import type { Route } from "./+types/reset-password"
import { ResetPasswordForm } from "~/components/reset-password-form"

export function meta({}: Route.MetaArgs) {
  return [{ title: "Redefinir senha | Orkut New" }]
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ResetPasswordForm />
      </div>
    </div>
  )
}
