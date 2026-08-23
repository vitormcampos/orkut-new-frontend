import type { Route } from "./+types/forgot-password"
import { ForgotPasswordForm } from "~/components/forgot-password-form"

export function meta({}: Route.MetaArgs) {
  return [{ title: "Esqueceu sua senha? | newkut" }]
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
