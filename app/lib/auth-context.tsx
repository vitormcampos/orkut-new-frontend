import { createContext, useCallback, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"
import {
  getMe,
  login as loginApi,
  logout as logoutApi,
  register as registerApi,
  uploadPhoto as uploadPhotoApi,
  updateProfile as updateProfileApi,
  deleteAccount as deleteAccountApi,
  getProfilePictureUrl,
} from "~/lib/api/auth"
import { tokenStore } from "~/lib/api/store"
import type {
  CreateUserRequest,
  LoginRequest,
  LoginResponse,
  UpdateProfileRequest,
  UserDto,
} from "~/lib/api/types"

interface AuthState {
  user: UserDto | null
  loading: boolean
  login: (body: LoginRequest) => Promise<LoginResponse>
  register: (body: CreateUserRequest) => Promise<UserDto>
  logout: () => Promise<void>
  updateProfile: (body: UpdateProfileRequest) => Promise<UserDto>
  uploadPhoto: (file: File) => Promise<UserDto>
  deleteAccount: () => Promise<void>
  setUser: (user: UserDto | null) => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = tokenStore.getAccessToken()
    if (!token) {
      setLoading(false)
      return
    }

    let cancelled = false
    getMe()
      .then((data) => {
        if (!cancelled) {
          setUser({
            ...data,
            profilePicture: getProfilePictureUrl(data.profilePicture),
          })
        }
      })
      .catch(() => {
        // token inválido — limpa e segue
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (body: LoginRequest) => {
    const data = await loginApi(body)
    setUser(data.user ?? null)
    return data
  }, [])

  const register = useCallback(async (body: CreateUserRequest) => {
    return registerApi(body)
  }, [])

  const logout = useCallback(async () => {
    await logoutApi()
    setUser(null)
  }, [])

  const updateProfile = useCallback(async (body: UpdateProfileRequest) => {
    const updated = await updateProfileApi(body)
    const normalized = {
      ...updated,
      profilePicture: getProfilePictureUrl(updated.profilePicture),
    }
    setUser(normalized)
    return normalized
  }, [])

  const uploadPhoto = useCallback(async (file: File) => {
    const updated = await uploadPhotoApi(file)
    const normalized = {
      ...updated,
      profilePicture: getProfilePictureUrl(updated.profilePicture),
    }
    setUser(normalized)
    return normalized
  }, [])

  const deleteAccount = useCallback(async () => {
    await deleteAccountApi()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateProfile,
        uploadPhoto,
        deleteAccount,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider")
  }
  return ctx
}
