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
      ds.id AS data_set_id,
      COUNT(rl.id) AS total_requests,
      SUM(rl.egress_bytes) AS total_egress_used,
      SUM(CASE WHEN rl.cache_miss = 1 THEN 1 ELSE 0 END) AS cache_miss_requests,
      SUM(CASE WHEN rl.cache_miss = 0 THEN 1 ELSE 0 END) AS cache_hit_requests,
      dseqs.cdn_egress_quota,
      dseqs.cache_miss_egress_quota
  FROM
      data_sets ds
  LEFT JOIN
      retrieval_logs rl ON rl.data_set_id = ds.id
  JOIN
      data_set_egress_quotas dseqs ON ds.id = dseqs.data_set_id
  WHERE
      ds.payer_address = $1 AND ds.with_cdn = 1 AND
      (rl.timestamp IS NULL OR DATE(rl.timestamp) < DATE('now'))
  GROUP BY
      ds.id
  ORDER BY
      total_requests DESC;
`,
  [client],
)

process.stdout.write(JSON.stringify(response.result[0].results))
