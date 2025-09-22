/**
 * @param {string} sql
 * @param {string[]} [params=[]] Default is `[]`
 * @returns {Promise<any[]>}
 */
export const query = async (sql, params = []) => {
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/d1/database/${process.env.CLOUDFLARE_DATABASE_ID}/query`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CLOUDFLARE_API_KEY}`,
      },
      body: JSON.stringify({ sql, params }),
    },
  )

  return await response.json()
}
