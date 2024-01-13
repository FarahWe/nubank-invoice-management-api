export const slugify = (spaceName: string) => {
  // Remove diacritics (accents)
  const cleanedName = spaceName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/gi, '')
    .replace(/\d+/g, '')
    .trim()

  // Replace spaces with dashes and convert to lowercase
  const slug = cleanedName.toLowerCase().replace(/\s+/g, '-')

  const shortSlug = slug.slice(0, 20)

  // Use a regular expression to match and remove the trailing dash
  return shortSlug.replace(/-$/, '')
}
