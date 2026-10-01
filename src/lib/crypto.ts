/** SHA-256 hex hash for PIN/password (Web Crypto). */
export async function hashSecret(value: string): Promise<string> {
  const data = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function verifySecret(value: string, hash: string) {
  return (await hashSecret(value)) === hash
}
