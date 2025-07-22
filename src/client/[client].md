---
toc: false
title: Client Summary
---

```js
import { LineGraph } from '../components/line-graph.js'
import { getDateXDaysAgo } from '../utils/date-utils.js'
import { formatBytesIEC } from '../utils/bytes.js'

const stats = FileAttachment(
  `../data/${observable.params.client}-daily-stats.json`,
).json()
const proofSetStats = FileAttachment(
  `../data/${observable.params.client}-proof-set-stats.json`,
).json()
```

<div class="hero">
  <body><a href="/"><img src="../media/filcdn-logo.png" alt="FilCDN Logo" width="300" /></a><body>
    <h2>FilCDN Dashboard</h2>
</div>

<h4>Client Stats Summary</h4>
<body>This sections shows the summary of client statistics over the selected date range.</body>

```js
const startDate = getDateXDaysAgo(180)
const minStartDate = '2025-06-01'
const start = view(
  Inputs.date({
    label: 'Start',
    value:
      new Date(startDate) >= new Date(minStartDate) ? startDate : minStartDate,
  }),
)
const end = view(Inputs.date({ label: 'End', value: getDateXDaysAgo(1) }))
```

```js
const filteredStats = stats.filter((item) => {
  const date = new Date(item.day)
  return date >= new Date(start) && date <= new Date(end)
})
const totalRequests = filteredStats.reduce(
  (acc, item) => acc + item.total_requests,
  0,
)
const cacheHitRequests = filteredStats.reduce(
  (acc, item) => acc + item.cache_hit_requests,
  0,
)
const totalEgress = filteredStats.reduce(
  (acc, item) => acc + item.total_egress_gib,
  0,
)
const totalCacheMissEgress = filteredStats.reduce(
  (acc, item) => acc + item.total_cache_miss_egress_gib,
  0,
)
const cacheHitRate = totalRequests
  ? ((cacheHitRequests / totalRequests) * 100).toFixed(2)
  : 0
```

<h3>Stats for ${observable.params.client}</h3>

<div class="divider"></div>

<div class="grid grid-cols-4">
  <h4 class="font-normal">Total Requests: ${totalRequests.toLocaleString()}</h4>
  <h4 class="font-normal">Total Egress: ${totalEgress.toLocaleString()} GiB</h4>
  <h4 class="font-normal">Total Cache Miss Egress: ${totalCacheMissEgress.toLocaleString()} GiB</h4>
  <h4 class="font-normal">Cache Hit Rate: ${cacheHitRate}%</h4>
</div>

<div class="divider"></div>

<h4>Daily Stats</h4>

<div class="grid grid-cols-2" style="grid-auto-rows: 500px;">
  <div class="card">${
    resize((width) => LineGraph(filteredStats, {width, title: "Requests Served", xKey: "day", yKey: "total_requests", label: "Requests Served" }))
  }</div>
  <div class="card">${
        resize((width) => LineGraph(filteredStats, {width, title: "Daily Egress (GiB)", xKey: "day", yKey: "total_egress_gib", label: "Bytes Served (GiB)" }))
  }</div>
</div>

```js
// TODO: Load network from config
const network = 'calibration'
const proofSetStatsTable = Inputs.table(proofSetStats, {
  rows: 16,
  format: {
    proof_set_id: (v) =>
      htl.html`<a href="https://pdp.vxb.ai/${network}/proofsets/${v}" target="_blank" rel="noopener noreferrer">${v}</a>`,
  },
  header: {
    proof_set_id: 'Proof-Set ID',
  },
})
```

<div class="divider"></div>
<h4>Proof-Set Stats</h4>
<div class="card" style="padding: 0;">
  ${proofSetStatsTable}
</div>

<style>
.hero {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: var(--sans-serif);
  margin: 4rem 0 8rem;
  text-wrap: balance;
  text-align: center;
}

.hero h1 {
  margin: 1rem 0;
  padding: 1rem 0;
  max-width: none;
  font-size: 14vw;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(30deg, var(--theme-foreground-focus), currentColor);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero h2 {
  margin: 0;
  max-width: 34em;
  font-size: 20px;
  font-style: initial;
  font-weight: 500;
  line-height: 1.5;
  color: var(--theme-foreground-muted);
}

.hero img {
  max-width: 20%;
}

.divider {
  margin: 50px;
}

@media (min-width: 640px) {
  .hero h1 {
    font-size: 90px;
  }
}

</style>
