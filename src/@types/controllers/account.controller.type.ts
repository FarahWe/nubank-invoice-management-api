import { RoleTypes } from '../../enums/RoleTypes'

export type AccountsQuery = {
  name: string
  email: string
  role: RoleTypes
  sortBy: string
  limit: string
  page: string
}
