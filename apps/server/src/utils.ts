export function verifyCupSlug(cupSlug: string) {
  if (!cupSlug.match(/^[a-zA-Z0-9]{16,64}$/)) throw new Error('Invalid cupId only a-z, A-Z, 0-9 and length 16-64 characters are allowed')
}

export function verifyResourceName(resourceName: string) {
  if (!resourceName.match(/^[a-zA-Z0-9]{1,64}$/)) throw new Error('Invalid resourceName only a-z, A-Z, 0-9 and length 1-64 characters are allowed')
}

export function verifyEntityId(entityId: string) {
  if (!entityId.match(/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/)) throw new Error('Invalid entityId only uuid v4 is allowed')
}
