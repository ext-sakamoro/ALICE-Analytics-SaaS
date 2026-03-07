# ALICE-Analytics-SaaS

Probabilistic data-sketch analytics service. HyperLogLog cardinality estimation, Count-Min Sketch top-K frequency, and DDSketch quantile analysis at any scale with sub-linear memory. Part of Project A.L.I.C.E.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     ALICE-Analytics-SaaS                     │
│                                                             │
│  ┌──────────┐   ┌──────────────┐   ┌────────────────────┐  │
│  │  Next.js │   │  Rust API    │   │  Sketch Engine     │  │
│  │ Frontend │──▶│  (Axum)      │──▶│  HyperLogLog       │  │
│  │          │   │  :8081       │   │  Count-Min Sketch  │  │
│  └──────────┘   └──────────────┘   │  DDSketch          │  │
│                        │           └────────────────────┘  │
│                 ┌──────▼──────┐                            │
│                 │  Stream     │                            │
│                 │  Registry   │                            │
│                 └─────────────┘                            │
└─────────────────────────────────────────────────────────────┘
```

## Features

| Feature | Detail |
|---|---|
| HyperLogLog | Cardinality estimation with < 2% error, constant memory |
| Count-Min Sketch | Top-K frequency over high-cardinality streams |
| DDSketch | Quantile estimation (p50/p99/p999) with relative error bounds |
| Event ingestion | Batch JSON event ingestion into named streams |
| Multi-stream | Independent sketch groups per stream, per field |
| Sub-linear memory | Kilobytes of state regardless of dataset size |

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/v1/analytics/ingest` | Ingest a batch of events into a stream |
| POST | `/api/v1/analytics/cardinality` | HyperLogLog cardinality estimate for a field |
| POST | `/api/v1/analytics/quantile` | DDSketch quantile estimate for a numeric field |
| POST | `/api/v1/analytics/frequency` | Count-Min Sketch top-K for a field |
| GET | `/api/v1/analytics/sketches` | List all active sketches |
| GET | `/api/v1/analytics/stats` | Global ingestion and sketch stats |

## Quick Start

```bash
# Clone and start
git clone https://github.com/ext-sakamoro/ALICE-Analytics-SaaS.git
cd ALICE-Analytics-SaaS

# Start the API (Rust)
cargo run --release

# Start the frontend
cd frontend
npm install
npm run dev
# Open http://localhost:3000

# Ingest events
curl -X POST http://localhost:8081/api/v1/analytics/ingest \
  -H "Content-Type: application/json" \
  -d '{"stream":"pageviews","events":[{"user_id":"u-001","page":"/home"},{"user_id":"u-002","page":"/pricing"}]}'

# Estimate cardinality of unique users
curl -X POST http://localhost:8081/api/v1/analytics/cardinality \
  -H "Content-Type: application/json" \
  -d '{"stream":"pageviews","field":"user_id"}'

# Top-10 pages by frequency
curl -X POST http://localhost:8081/api/v1/analytics/frequency \
  -H "Content-Type: application/json" \
  -d '{"stream":"pageviews","field":"page","top_k":10}'

# p99 latency quantile
curl -X POST http://localhost:8081/api/v1/analytics/quantile \
  -H "Content-Type: application/json" \
  -d '{"stream":"response_times","field":"latency_ms","q":0.99}'
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8081` | Backend API base URL |
| `ALICE_ANALYTICS_DATA_DIR` | `/var/lib/alice-analytics` | Sketch persistence directory |
| `ALICE_ANALYTICS_HLL_PRECISION` | `14` | HyperLogLog precision bits (10-18) |

## License

AGPL-3.0-or-later. See [LICENSE](./LICENSE).

Part of [Project A.L.I.C.E.](https://github.com/ext-sakamoro)
