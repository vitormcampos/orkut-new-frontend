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
  bio?: string | null
  birthDate?: string | null
  city?: string | null
  state?: string | null
  relationshipStatus?: string | null
  musicInterests?: string[] | null
  movieInterests?: string[] | null
  bookInterests?: string[] | null
  hobbies?: string[] | null
}

export interface UserDto {
  id: string
  name?: string | null
  email?: string | null
  username?: string | null
  profilePicture?: string | null
  bio?: string | null
  birthDate?: string | null
  city?: string | null
  state?: string | null
  relationshipStatus?: string | null
  musicInterests?: string[] | null
  movieInterests?: string[] | null
  bookInterests?: string[] | null
  hobbies?: string[] | null
  isActive: boolean
  createdAt: string
}

export interface PublicProfileDto {
  id: string
  name: string
  username: string
  profilePicture?: string | null
  bio?: string | null
  age?: number | null
  city?: string | null
  state?: string | null
  relationshipStatus?: string | null
  musicInterests?: string[] | null
  movieInterests?: string[] | null
  bookInterests?: string[] | null
  hobbies?: string[] | null
  friendCount: number
  createdAt: string
}

export interface UserSummaryDto {
  id: string
  name: string
  username: string
  profilePicture?: string | null
}

export interface UserSearchResultDto {
  id: string
  name: string
  username: string
  profilePicture?: string | null
  bio?: string | null
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
  requesterProfilePicture?: string | null
  addresseeId: string
  addresseeName?: string | null
  addresseeUsername?: string | null
  addresseeProfilePicture?: string | null
  status?: string | null
  requestedAt: string
  respondedAt?: string | null
}

export type ScrapVisibility = "Public" | "Private"

export interface ScrapDto {
  id: string
  authorId: string
  authorName: string
  authorUsername: string
  authorProfilePicture?: string | null
  recipientId: string
  recipientName: string
  recipientUsername: string
  content: string
  visibility: ScrapVisibility
  createdAt: string
}

export interface ScrapPageDto {
  items: ScrapDto[]
  page: number
  pageSize: number
  totalItems: number
  hasNextPage: boolean
}

export interface CreateScrapRequest {
  recipientId: string
  content: string
  visibility?: ScrapVisibility
}

export type MembershipRole = "Owner" | "Member" | "Moderator"

export interface CommunityDto {
  id: string
  name: string
  description?: string | null
  photo?: string | null
  ownerId: string
  ownerName?: string | null
  memberCount: number
  createdAt: string
  updatedAt?: string | null
}

export interface SearchPageDto<T> {
  items: T[]
  page: number
  pageSize: number
  totalItems: number
  hasNextPage: boolean
}

export interface CommunitySearchResultDto {
  id: string
  name: string
  description?: string | null
  photo?: string | null
  memberCount: number
}

export interface CommunityMemberDto {
  communityId: string
  userId: string
  userName: string
  userProfilePicture?: string | null
  role: MembershipRole
  joinedAt: string
}

export interface CreateCommunityRequest {
  name: string
  description?: string
}

export interface UpdateCommunityRequest {
  name: string
  description?: string
}
