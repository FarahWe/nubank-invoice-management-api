const permissions = {
  // accounts
  getAccounts: 'getAccounts',
  manageAccounts: 'manageAccounts',
  deleteAccount: 'deleteAccount'
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
    permissions.manageAccounts,
    permissions.deleteAccount
  ]
}

const roles = Object.keys(allRoles)
const roleRights = new Map(Object.entries(allRoles))

export { permissions, roles, roleRights }
