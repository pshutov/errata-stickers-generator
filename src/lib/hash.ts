/** SHA-256 of raw bytes as a lowercase hex string (used to fingerprint source PDFs). */
export async function sha256Hex(bytes: Uint8Array): Promise<string> {
  // Copy into a concrete ArrayBuffer-backed view so the WebCrypto BufferSource type is satisfied.
  const buf = await crypto.subtle.digest('SHA-256', new Uint8Array(bytes))
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('')
}
