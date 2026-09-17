-- Habilita pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Tenants (multi-tenant)
CREATE TABLE tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  plan text DEFAULT 'starter', -- starter, professional, business
  created_at timestamptz DEFAULT now()
);

-- Users (operadores, admins, clientes)
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id),
  email text UNIQUE NOT NULL,
  role text NOT NULL, -- admin, operador, cliente
  created_at timestamptz DEFAULT now()
);

-- Pedidos (ingestão de iFood/99/Keeta)
CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id),
  external_id text UNIQUE, -- iFood/99/Keeta ID
  source text, -- ifood, 99, keeta
  restaurant jsonb, -- {id, name, geo: {lat, lng}}
  customer jsonb, -- {name, phone, address: {street, number, geo: {lat, lng}}, handover: {type, instructions}}
  items jsonb, -- [{sku, name, qty, weight_g}]
  payload jsonb, -- {weight_g, volume_l}
  time_window jsonb, -- {ready_at, promise_by}
  status text DEFAULT 'received', -- received, feasible, assigned, executing, completed, cancelled
  created_at timestamptz DEFAULT now()
);

-- Missões (dispatch de drones)
CREATE TABLE missions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id),
  tenant_id uuid REFERENCES tenants(id),
  hub_id uuid, -- hub de decolagem
  drone_id uuid, -- drone atribuído
  route_3d jsonb, -- {waypoints: [{lat, lng, alt_m}]}
  status text DEFAULT 'planning', -- planning, executing, completed, failed
  eta_seconds int,
  created_at timestamptz DEFAULT now()
);

-- Drones (frota)
CREATE TABLE drones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id),
  model text, -- DJI Mini 2, M300, etc.
  status text DEFAULT 'available', -- available, busy, maintenance
  battery_pct int,
  location jsonb, -- {lat, lng}
  last_maintenance timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Hubs (droneports)
CREATE TABLE hubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id),
  name text NOT NULL,
  location jsonb, -- {lat, lng}
  capacity int, -- número de drones simultâneos
  active_missions int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Telemetria (GPS, bateria, sensores)
CREATE TABLE telemetry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES missions(id),
  drone_id uuid REFERENCES drones(id),
  ts timestamptz DEFAULT now(),
  gps jsonb, -- {lat, lng, alt_m}
  battery jsonb, -- {pct, temp_c, voltage_v}
  flight jsonb, -- {groundspeed_mps, heading_deg}
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_telemetry_ts ON telemetry(ts DESC);

-- Logs de Conformidade (geofencing, Remote ID, SARPAS)
CREATE TABLE compliance_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES missions(id),
  event_type text, -- geofence_warning, remote_id, sarpas_clearance
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Billing (faturamento por tenant)
CREATE TABLE billing (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id),
  plan text, -- starter, professional, business
  drones_limit int,
  missions_month int,
  amount numeric,
  created_at timestamptz DEFAULT now()
);

-- Knowledge Base (RAG com pgvector)
CREATE TABLE knowledge_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chunk text NOT NULL,
  embedding vector(1024), -- bge-m3, e5-mista
  source text, -- rbac100, sora, sarpas, manual, decision
  tags text[], -- ['conformidade', 'dispatch', 'rotas']
  created_at timestamptz DEFAULT now()
);
CREATE INDEX idx_knowledge_base_embedding ON knowledge_base USING ivfflat (embedding vector_cosine_ops);

-- Decision Examples (para fine-tune LoRA)
CREATE TABLE decision_examples (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  input text NOT NULL, -- pergunta/contexto
  output text NOT NULL, -- resposta/decisão
  feedback int, -- 1 (up), -1 (down)
  mission_id uuid,
  source text, -- feedback, telemetry, compliance
  created_at timestamptz DEFAULT now()
);

-- Feedback (avaliações do operador)
CREATE TABLE feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  decision_id uuid REFERENCES decision_examples(id),
  rating int, -- 1 (up), -1 (down)
  comment text,
  created_at timestamptz DEFAULT now()
);
