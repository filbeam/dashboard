import { query } from './cloudflare-client.js'

const response = await query(
  `
WITH retrieval_speeds AS (
    SELECT
        DATE(timestamp) AS day,
        (egress_bytes * 8.0) / (fetch_ttlb / 1000.0) / 1_000_000 AS retrieval_speed_mbps
    FROM
        retrieval_logs
    WHERE 
        cache_miss = 1 AND fetch_ttlb > 0 
),
percentile_buckets AS (
  SELECT 
    day,
    retrieval_speed_mbps,
    NTILE(100) OVER (ORDER BY retrieval_speed_mbps) as percentile_bucket
  FROM retrieval_speeds
)
SELECT
    day,
    ROUND(AVG(retrieval_speed_mbps), 2) AS avg_retrieval_speed_mbps,
    (
        SELECT
            MIN(retrieval_speed_mbps)
        FROM
            percentile_buckets pb
        WHERE
            pb.day = rs.day AND
            pb.percentile_bucket = 96 -- 96th bucket represents the 95th percentile
    ) AS p95_retrieval_speed_mbps
FROM
    retrieval_speeds rs
GROUP BY
    day
ORDER BY
    day;
`,
  [],
)

process.stdout.write(JSON.stringify(response.result[0].results))
