import { parseArgs } from 'node:util'
import { query } from './cloudflare-client.js'

const {
  values: { client },
} = parseArgs({
  options: { client: { type: 'string' } },
})

const response = await query(
  `
  SELECT
    ipr.proof_set_id,
    COUNT(rl.id) AS total_requests,
		ROUND(SUM(rl.egress_bytes) / 1073741824.0, 2) AS total_egress_gib,
    SUM(CASE WHEN rl.cache_miss THEN 1 ELSE 0 END) AS cache_miss_requests,
    SUM(CASE WHEN NOT rl.cache_miss THEN 1 ELSE 0 END) AS cache_hit_requests
  FROM
    indexer_proof_set_rails ipr
  LEFT JOIN
    retrieval_logs rl ON rl.proof_set_id = ipr.proof_set_id
  WHERE
    payer = $1 AND with_cdn = true
  GROUP BY
    ipr.proof_set_id
  ORDER BY
    ipr.proof_set_id;
`,
  [client],
)

process.stdout.write(JSON.stringify(response.result[0].results))
