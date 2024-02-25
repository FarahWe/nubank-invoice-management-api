import { RoleTypes } from '../../enums/RoleTypes'

export type RegisterBody = {
  email: string
  password: string
  notion_api_key?: string
  name: string
  role: RoleTypes
  phone: string
}

export type UpdatePasswordBody = {
  password: string
  newPassword: string
}

export type UpdateBody = {
  email?: string
  name?: string
  role?: RoleTypes
  phone?: string
  notion_api_key?: string
  notion_database_url?: string
}

export type LoginBody = {
  email: string
  password: string
}

export type LogoutBody = {
  refreshToken: string
}
