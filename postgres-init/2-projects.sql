CREATE TABLE public.projects (
    pid SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(id),
    name VARCHAR(100) NOT NULL,
    circuit JSONB,
    custom_nodes JSONB,
    verilog TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.projects OWNER TO vcd;
