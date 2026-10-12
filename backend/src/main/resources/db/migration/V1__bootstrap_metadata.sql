-- Technical readiness marker only: no business data, account or permission seed.
CREATE TABLE bootstrap_metadata (
    id SMALLINT PRIMARY KEY CHECK (id = 1),
    initialized_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO bootstrap_metadata (id) VALUES (1);
