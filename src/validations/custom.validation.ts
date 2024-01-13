const password = (value: any, helpers: any) => {
  if (value.length < 6) {
    return helpers.message('password must be at least 6 characters')
  }

  return value
}

const phone = (value: any, helpers: any) => {
  if (
    !value.match(
      /^\(?(?:(?:1[2-9]|2[1-9]|3[1-9]|4[1-9]|5[1-9]|6[1-9]|7[1-9]|8[1-9]|9[1-9])\)?[-. ]?)(?:(?:\d[-. ]?){8,9})$/
    )
  ) {
    return helpers.message('must be a valid phone')
  }

  return value.replace(/\D/g, '')
}

export { password, phone }
