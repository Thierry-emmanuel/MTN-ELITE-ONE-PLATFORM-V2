-- IAM Foundation Migration
-- Creates all IAM tables and seeds system roles

-- iam_roles
CREATE TABLE IF NOT EXISTS iam_roles (
  id              UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  key             VARCHAR(64)  NOT NULL,
  name            VARCHAR(120) NOT NULL,
  description     TEXT,
  permissions     JSONB        NOT NULL DEFAULT '[]',
  field_policies  JSONB        NOT NULL DEFAULT '{}',
  is_system       BOOLEAN      NOT NULL DEFAULT FALSE,
  is_default      BOOLEAN      NOT NULL DEFAULT FALSE,
  status          VARCHAR(16)  NOT NULL DEFAULT 'active',
  version         INTEGER      NOT NULL DEFAULT 1,
  cloned_from_key VARCHAR(64),
  created_at      TIMESTAMP    NOT NULL DEFAULT now(),
  updated_at      TIMESTAMP    NOT NULL DEFAULT now(),
  CONSTRAINT iam_roles_key_unique UNIQUE (key)
);

-- iam_organizations
CREATE TABLE IF NOT EXISTS iam_organizations (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  name        VARCHAR(160) NOT NULL,
  type        VARCHAR(24)  NOT NULL,
  parent_id   UUID,
  club_id     VARCHAR(64),
  status      VARCHAR(16)  NOT NULL DEFAULT 'active',
  description TEXT,
  created_at  TIMESTAMP    NOT NULL DEFAULT now(),
  updated_at  TIMESTAMP    NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_iam_org_parent ON iam_organizations(parent_id);

-- iam_audit_logs
CREATE TABLE IF NOT EXISTS iam_audit_logs (
  id          BIGSERIAL    PRIMARY KEY,
  actor_id    INTEGER,
  actor_email VARCHAR(160),
  action      VARCHAR(80)  NOT NULL,
  target_type VARCHAR(64),
  target_id   VARCHAR(64),
  metadata    JSONB,
  ip          VARCHAR(64),
  created_at  TIMESTAMP    NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_iam_audit_actor  ON iam_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_iam_audit_action ON iam_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_iam_audit_ttype  ON iam_audit_logs(target_type);
CREATE INDEX IF NOT EXISTS idx_iam_audit_cat    ON iam_audit_logs(created_at);

-- iam_user_sessions
CREATE TABLE IF NOT EXISTS iam_user_sessions (
  id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            INTEGER      NOT NULL,
  refresh_token_hash VARCHAR(64)  NOT NULL,
  user_agent         VARCHAR(400),
  ip                 VARCHAR(64),
  expires_at         TIMESTAMP    NOT NULL,
  last_used_at       TIMESTAMP,
  revoked_at         TIMESTAMP,
  created_at         TIMESTAMP    NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_iam_sess_user  ON iam_user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_iam_sess_token ON iam_user_sessions(refresh_token_hash);

-- iam_config
CREATE TABLE IF NOT EXISTS iam_config (
  key        VARCHAR(120) PRIMARY KEY,
  value      JSONB        NOT NULL DEFAULT '{}',
  updated_by INTEGER,
  updated_at TIMESTAMP    NOT NULL DEFAULT now()
);

-- Seed the 3 system roles
INSERT INTO iam_roles (key, name, description, permissions, is_system, is_default, status)
VALUES
  ('admin',  'Administrateur', 'Acces complet a toute la plateforme', '["*"]', TRUE, FALSE, 'active'),
  ('editor', 'Editeur', 'Gestion des contenus editoriaux', '["articles.*","media.*"]', TRUE, FALSE, 'active'),
  ('user',   'Utilisateur', 'Acces lecture seule aux contenus publics', '[]', TRUE, TRUE, 'active')
ON CONFLICT (key) DO NOTHING;
