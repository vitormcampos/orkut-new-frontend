export interface ProblemDetails {
  type?: string
  title?: string
  status?: number
  detail?: string
  instance?: string
}

export interface CreateUserRequest {
  name?: string
  email?: string
  username?: string
  password?: string
}

export interface LoginRequest {
  email?: string
  password?: string
}

export interface LoginResponse {
  accessToken?: string
  refreshToken?: string
  user?: UserDto
}

export interface RefreshTokenRequest {
  refreshToken?: string
}

export interface ForgotPasswordRequest {
  email?: string
}

export interface ResetPasswordRequest {
  token?: string
  newPassword?: string
}

export interface UpdateProfileRequest {
  name?: string
  username?: string
  bio?: string
}

export interface UserDto {
  id: string
  name?: string | null
  email?: string | null
  username?: string | null
  profilePicture?: string | null
  bio?: string | null
  isActive: boolean
  createdAt: string
}

export interface SendFriendshipRequest {
  addresseeUsername: string
}

export interface FriendshipDto {
  id: string
  requesterId: string
  requesterName?: string | null
  requesterUsername?: string | null
  addresseeId: string
  addresseeName?: string | null
  addresseeUsername?: string | null
  status?: string | null
  requestedAt: string
  respondedAt?: string | null
}
