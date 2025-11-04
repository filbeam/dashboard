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
      ROUND(SUM(rl.egress_bytes) / 1073741824.0, 2) AS total_egress_gib,
      SUM(CASE WHEN rl.cache_miss = 1 THEN 1 ELSE 0 END) AS cache_miss_requests,
      SUM(CASE WHEN rl.cache_miss = 0 THEN 1 ELSE 0 END) AS cache_hit_requests,
      ROUND(SUM(rl.cdn_egress_quota) / 1073741824.0, 2) AS remaining_cdn_egress_gib,
      ROUND(SUM(rl.cache_miss_egress_quota) / 1073741824.0, 2) AS remaining_cache_miss_egress_gib
  FROM
      data_sets ds
  LEFT JOIN
      retrieval_logs rl ON rl.data_set_id = ds.id
  WHERE
      ds.payer_address = $1 AND ds.with_cdn = 1 AND
      (rl.timestamp IS NULL OR DATE(rl.timestamp) < DATE('now'))
  GROUP BY
      data_set_id
  ORDER BY
      total_requests DESC;
`,
  [client],
)

process.stdout.write(JSON.stringify(response.result[0].results))
