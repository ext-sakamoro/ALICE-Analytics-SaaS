-- ALICE Analytics: Domain-specific tables
CREATE TABLE IF NOT EXISTS analytics_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    name TEXT NOT NULL,
    total_events BIGINT NOT NULL DEFAULT 0,
    bytes_ingested BIGINT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analytics_sketches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES analytics_sources(id) ON DELETE CASCADE,
    sketch_type TEXT NOT NULL CHECK (sketch_type IN ('hyperloglog', 'count-min-sketch', 'ddsketch')),
    field_name TEXT NOT NULL,
    memory_bytes BIGINT NOT NULL DEFAULT 0,
    last_updated TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analytics_query_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES analytics_sources(id) ON DELETE CASCADE,
    query_type TEXT NOT NULL CHECK (query_type IN ('cardinality', 'quantile', 'frequency', 'custom')),
    field_name TEXT NOT NULL,
    elapsed_us BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_analytics_sources_user ON analytics_sources(user_id);
CREATE INDEX idx_analytics_sketches_source ON analytics_sketches(source_id);
CREATE INDEX idx_analytics_query_logs_source ON analytics_query_logs(source_id, created_at);
