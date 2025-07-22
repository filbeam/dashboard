import { parseArgs } from 'node:util'
import { query } from './cloudflare-client.js'

const {
  values: { client },
} = parseArgs({
  options: { client: { type: 'string' } },
})

// TODO: Add proof-set stats after proof-set id column is added to retrieval logs 
const response = await query(
  `
  SELECT
    proof_set_id
  FROM
    indexer_proof_set_rails
  WHERE
    payer = $1 AND with_cdn = true
`,
  [client],
)

process.stdout.write(JSON.stringify(response.result[0].results))
