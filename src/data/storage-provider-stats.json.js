import { query } from './cloudflare-client.js'

const response = await query(
  `
WITH retrieval_speeds AS (
    SELECT
        owner_address,
        (egress_bytes * 8.0) / (fetch_ttlb / 1000.0) / 1_000_000 AS retrieval_speed_mbps
    FROM
        retrieval_logs
    WHERE
        cache_miss = 1 AND
        fetch_ttlb > 0
),
percentile_buckets AS (
  SELECT 
    owner_address,
    retrieval_speed_mbps,
    NTILE(100) OVER (ORDER BY retrieval_speed_mbps) as percentile_bucket -- Create 100 buckets for percentiles
  FROM retrieval_speeds
)
SELECT
    rl.owner_address,
    COUNT(*) AS total_requests,
    SUM(CASE WHEN rl.cache_miss THEN 1 ELSE 0 END) AS cache_miss_requests,
    SUM(rl.egress_bytes) AS total_egress_bytes,
    SUM(CASE WHEN rl.cache_miss THEN rl.egress_bytes ELSE 0 END) AS cache_miss_egress_bytes,
    AVG(CASE WHEN rl.cache_miss THEN rl.fetch_ttfb ELSE NULL END) AS avg_ttfb,
    ROUND(AVG(CASE WHEN rl.cache_miss THEN (rl.egress_bytes * 8.0) / (rl.fetch_ttlb / 1000.0) / 1_000_000 ELSE NULL END), 2) AS avg_cache_miss_retrieval_speed_mbps,
    (
        SELECT
            MIN(pb.retrieval_speed_mbps)
        FROM
            percentile_buckets pb
        WHERE
            pb.owner_address = rl.owner_address
            AND percentile_bucket = 96 -- 96th bucket represents the 95th percentile
    ) AS p95_cache_miss_retrieval_speed_mbps,
    ROUND(
        100.0 * SUM(CASE WHEN rl.cache_miss AND rl.response_status = 200 THEN 1 ELSE 0 END)
        / NULLIF(SUM(CASE WHEN rl.cache_miss THEN 1 ELSE 0 END), 0), 2
    ) AS cache_miss_rsr
FROM
    retrieval_logs rl
GROUP BY
    rl.owner_address
ORDER BY
    total_requests DESC;
`,
  [],
)

const results = response?.result?.[0]?.results || [];
process.stdout.write(JSON.stringify(results));

