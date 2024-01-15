import { writeFile } from 'fs/promises'

/**
 * @param sort must be an string containing field and direction eg:
 * "name,-email,is_email_verified", where - means DESC
 */
export const normalizeSort = (validFields: string[], sort: string) => {
  // Parse and validate the sort parameter
  const sortFields = sort ? sort.split(',') : []

  const sortingOptions = sortFields
    .map((field) => {
      const direction = field.startsWith('-') ? 'desc' : 'asc'
      const fieldName = field.replace(/^-/, '') // Remove '-' prefix if present

      if (!validFields.includes(fieldName)) {
        return null // Invalid sort field or direction
      }

      return { [fieldName]: direction }
    })
    .filter(Boolean) // remove invalid fields or invalid direction

  return sortingOptions
}

export const saveCertificate = (
  filepath: string,
  cert: Buffer
): Promise<void> => {
  return writeFile(filepath, cert, { encoding: 'binary' })
}
