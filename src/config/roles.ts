const permissions = {
  // accounts
  getAccounts: 'getAccounts',
  manageAccounts: 'manageAccounts'
}

const allRoles = {
  user: [
    // accounts
    permissions.getAccounts,
    permissions.manageAccounts
  ],
  superuser: [
    // accounts
    permissions.getAccounts,
    permissions.manageAccounts
  ]
}

const roles = Object.keys(allRoles)
const roleRights = new Map(Object.entries(allRoles))

export { permissions, roles, roleRights }
