import { api } from "./client"
import { tokenStore } from "./store"
import type {
  CreateUserRequest,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  UserDto,
} from "./types"

// ─── Helpers ───────────────────────────────────────────

const API_BASE = (import.meta.env.VITE_API_URL as string) ?? "http://localhost:5272/api/v1"

function serverBaseUrl(): string {
  return API_BASE.replace(/\/api\/v1\/?$/, "")
}

export function getProfilePictureUrl(
  profilePicture: string | null | undefined
): string | null {
  if (!profilePicture) return null
  if (profilePicture.startsWith("http://") || profilePicture.startsWith("https://")) {
    return profilePicture
  }
  if (profilePicture.startsWith("/")) {
    return `${serverBaseUrl()}${profilePicture}`
  }
  return `${serverBaseUrl()}/${profilePicture}`
}

function normalizeUser(user: UserDto): UserDto {
  if (user.profilePicture) {
    const full = getProfilePictureUrl(user.profilePicture)
    if (full) user = { ...user, profilePicture: full }
  }
  return user
}

// ─── Auth ──────────────────────────────────────────────

export async function register(body: CreateUserRequest): Promise<UserDto> {
  const user = await api.post<UserDto>("/Auth/register", body)
  return user
}

export async function login(body: LoginRequest): Promise<LoginResponse> {
  const data = await api.post<LoginResponse>("/Auth/login", body)
  if (data.accessToken) tokenStore.setAccessToken(data.accessToken)
  if (data.refreshToken) tokenStore.setRefreshToken(data.refreshToken)
  return { ...data, user: data.user ? normalizeUser(data.user) : undefined }
}

export async function refreshToken(): Promise<LoginResponse> {
  const refreshToken = tokenStore.getRefreshToken()
  if (!refreshToken) throw new Error("No refresh token available")

  const body: RefreshTokenRequest = { refreshToken }
  const data = await api.post<LoginResponse>("/Auth/refresh", body)
  if (data.accessToken) tokenStore.setAccessToken(data.accessToken)
  if (data.refreshToken) tokenStore.setRefreshToken(data.refreshToken)
  return { ...data, user: data.user ? normalizeUser(data.user) : undefined }
}

export async function logout(): Promise<void> {
  const refreshToken = tokenStore.getRefreshToken()
  try {
    if (refreshToken) {
      const body: RefreshTokenRequest = { refreshToken }
      await api.post<void>("/Auth/logout", body)
    }
  } finally {
    tokenStore.clear()
  }
}

// ─── Password Recovery ─────────────────────────────────

export async function forgotPassword(body: ForgotPasswordRequest): Promise<void> {
  await api.post<void>("/PasswordRecovery/forgot", body)
}

export async function resetPassword(body: ResetPasswordRequest): Promise<void> {
  await api.post<void>("/PasswordRecovery/reset", body)
}

// ─── User Profile ──────────────────────────────────────

export async function getMe(): Promise<UserDto> {
  return api.get<UserDto>("/Users/me")
}

export async function updateProfile(body: UpdateProfileRequest): Promise<UserDto> {
  return api.put<UserDto>("/Users/me", body)
}

export async function deleteAccount(): Promise<void> {
  await api.delete<void>("/Users/me")
  tokenStore.clear()
}

export async function uploadPhoto(file: File): Promise<UserDto> {
  const formData = new FormData()
  formData.append("file", file)
  return api.upload<UserDto>("/Users/me/photo", formData)
}
