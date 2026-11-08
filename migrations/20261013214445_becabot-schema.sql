-- =============================================================================
-- BecaBot — esquema base, funciones, triggers, indices vectoriales y RLS
-- Zona horaria del producto: America/Mexico_City
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =============================================================================
-- 1. TABLAS
-- =============================================================================

-- usuarios: perfil de la app. id_usuario == id en auth.users (InsForge Auth).
CREATE TABLE public.usuarios (
  id_usuario UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username   TEXT,
  email      TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- becas
CREATE TABLE public.becas (
  id_beca          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT NOT NULL,
  description      TEXT,
  grado_academico  TEXT,
  embedding        vector(1536),
  fecha_consulta   TIMESTAMPTZ,
  fecha_expiracion DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- requisitos (hijos de beca)
CREATE TABLE public.requisitos (
  id_requisito UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_beca      UUID NOT NULL REFERENCES public.becas(id_beca) ON DELETE CASCADE,
  descripcion  TEXT NOT NULL,
  embedding    vector(1536),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- beca_chunks (solo si la descripcion supera ~500 tokens)
CREATE TABLE public.beca_chunks (
  id_chunk   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_beca    UUID NOT NULL REFERENCES public.becas(id_beca) ON DELETE CASCADE,
  content    TEXT NOT NULL,
  embedding  vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- suscripciones (plan premium). is_first lo calcula un trigger.
CREATE TABLE public.suscripciones (
  id_suscripcion UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  estado         TEXT NOT NULL CHECK (estado IN ('activa', 'cancelada', 'vencida')),
  fecha_inicio   TIMESTAMPTZ NOT NULL DEFAULT now(),
  fecha_fin      TIMESTAMPTZ,
  is_first       BOOLEAN NOT NULL DEFAULT false,
  precio_aplicado NUMERIC,
  moneda         TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- postulaciones (exclusivo premium)
CREATE TABLE public.postulaciones (
  id_postulacion    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  id_beca           UUID NOT NULL REFERENCES public.becas(id_beca) ON DELETE CASCADE,
  fecha_postulacion TIMESTAMPTZ NOT NULL DEFAULT now(),
  estado            TEXT NOT NULL DEFAULT 'pendiente'
                      CHECK (estado IN ('pendiente', 'enviada', 'aceptada', 'rechazada')),
  notas             TEXT,
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (id_usuario, id_beca)
);

-- alertas_beca (exclusivo premium)
CREATE TABLE public.alertas_beca (
  id_alerta  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  id_beca    UUID NOT NULL REFERENCES public.becas(id_beca) ON DELETE CASCADE,
  dias_antes INT[] NOT NULL DEFAULT '{30,7,1}',
  canal      TEXT NOT NULL DEFAULT 'email' CHECK (canal IN ('email')),
  activa     BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (id_usuario, id_beca)
);

-- recordatorios: solo los escribe el backend (service role)
CREATE TABLE public.recordatorios (
  id_recordatorio UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_alerta       UUID NOT NULL REFERENCES public.alertas_beca(id_alerta) ON DELETE CASCADE,
  dias_antes      INT NOT NULL,
  estado          TEXT NOT NULL DEFAULT 'pendiente'
                    CHECK (estado IN ('pendiente', 'enviado', 'fallido')),
  intentos        INT NOT NULL DEFAULT 0,
  error           TEXT,
  fecha_envio     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (id_alerta, dias_antes)
);

-- conversaciones
CREATE TABLE public.conversaciones (
  id_conversacion UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_usuario      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title           TEXT,
  fecha           TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- mensajes
CREATE TABLE public.mensajes (
  id_mensaje      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_conversacion UUID NOT NULL REFERENCES public.conversaciones(id_conversacion) ON DELETE CASCADE,
  mensaje         TEXT NOT NULL,
  tipo            TEXT NOT NULL CHECK (tipo IN ('user', 'assistant')),
  embedding       vector(1536),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================================
-- 2. INDICES (claves foraneas y vectoriales HNSW)
-- =============================================================================

CREATE INDEX becas_grado_academico_idx      ON public.becas (grado_academico);
CREATE INDEX becas_fecha_expiracion_idx     ON public.becas (fecha_expiracion);
CREATE INDEX requisitos_id_beca_idx         ON public.requisitos (id_beca);
CREATE INDEX beca_chunks_id_beca_idx        ON public.beca_chunks (id_beca);
CREATE INDEX suscripciones_id_usuario_idx   ON public.suscripciones (id_usuario);
CREATE INDEX postulaciones_id_usuario_idx   ON public.postulaciones (id_usuario);
CREATE INDEX postulaciones_id_beca_idx      ON public.postulaciones (id_beca);
CREATE INDEX alertas_beca_id_usuario_idx    ON public.alertas_beca (id_usuario);
CREATE INDEX alertas_beca_id_beca_idx       ON public.alertas_beca (id_beca);
CREATE INDEX recordatorios_id_alerta_idx    ON public.recordatorios (id_alerta);
CREATE INDEX conversaciones_id_usuario_idx  ON public.conversaciones (id_usuario);
CREATE INDEX mensajes_id_conversacion_idx   ON public.mensajes (id_conversacion);

CREATE INDEX becas_embedding_hnsw_idx
  ON public.becas USING hnsw (embedding vector_cosine_ops);
CREATE INDEX requisitos_embedding_hnsw_idx
  ON public.requisitos USING hnsw (embedding vector_cosine_ops);
CREATE INDEX beca_chunks_embedding_hnsw_idx
  ON public.beca_chunks USING hnsw (embedding vector_cosine_ops);

-- =============================================================================
-- 3. FUNCIONES
-- =============================================================================

-- hoy_mx(): fecha actual en la zona horaria del producto.
CREATE OR REPLACE FUNCTION public.hoy_mx()
RETURNS date
LANGUAGE sql
STABLE
AS $$
  SELECT (now() AT TIME ZONE 'America/Mexico_City')::date;
$$;

-- es_premium(uid): true si el usuario tiene una suscripcion activa y vigente.
-- SECURITY DEFINER para poder consultar suscripciones (con RLS) desde politicas.
CREATE OR REPLACE FUNCTION public.es_premium(uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.suscripciones s
    WHERE s.id_usuario = uid
      AND s.estado = 'activa'
      AND s.fecha_fin > now()
  );
$$;

-- Helper para RLS de mensajes (evita recursion RLS sobre conversaciones).
CREATE OR REPLACE FUNCTION public.es_dueno_conversacion(p_id_conversacion uuid, p_uid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.conversaciones c
    WHERE c.id_conversacion = p_id_conversacion
      AND c.id_usuario = p_uid
  );
$$;

-- match_contexto: busqueda semantica en becas, requisitos y beca_chunks.
CREATE OR REPLACE FUNCTION public.match_contexto(
  query_embedding vector(1536),
  match_count     int DEFAULT 5,
  filtro_grado    text DEFAULT NULL
)
RETURNS TABLE (
  id_beca     uuid,
  name        text,
  tipo_fuente text,
  content     text,
  score       double precision
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public, pg_temp
AS $$
  WITH candidatos AS (
    SELECT b.id_beca,
           b.name,
           'beca'::text AS tipo_fuente,
           COALESCE(b.description, '') AS content,
           1 - (b.embedding <=> query_embedding) AS score
    FROM public.becas b
    WHERE b.embedding IS NOT NULL
      AND (b.fecha_expiracion IS NULL OR b.fecha_expiracion >= public.hoy_mx())
      AND (filtro_grado IS NULL OR b.grado_academico = filtro_grado)

    UNION ALL

    SELECT b.id_beca,
           b.name,
           'beca'::text AS tipo_fuente,
           c.content,
           1 - (c.embedding <=> query_embedding) AS score
    FROM public.beca_chunks c
    JOIN public.becas b ON b.id_beca = c.id_beca
    WHERE c.embedding IS NOT NULL
      AND (b.fecha_expiracion IS NULL OR b.fecha_expiracion >= public.hoy_mx())
      AND (filtro_grado IS NULL OR b.grado_academico = filtro_grado)

    UNION ALL

    SELECT b.id_beca,
           b.name,
           'requisito'::text AS tipo_fuente,
           r.descripcion AS content,
           1 - (r.embedding <=> query_embedding) AS score
    FROM public.requisitos r
    JOIN public.becas b ON b.id_beca = r.id_beca
    WHERE r.embedding IS NOT NULL
      AND (b.fecha_expiracion IS NULL OR b.fecha_expiracion >= public.hoy_mx())
      AND (filtro_grado IS NULL OR b.grado_academico = filtro_grado)
  )
  SELECT c.id_beca, c.name, c.tipo_fuente, c.content, c.score
  FROM candidatos c
  ORDER BY c.score DESC
  LIMIT match_count;
$$;

-- =============================================================================
-- 4. TRIGGERS
-- =============================================================================

-- is_first: calculado por el backend al insertar una suscripcion.
CREATE OR REPLACE FUNCTION public.suscripcion_set_is_first()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  SELECT NOT EXISTS (
    SELECT 1 FROM public.suscripciones s WHERE s.id_usuario = NEW.id_usuario
  ) INTO NEW.is_first;
  RETURN NEW;
END;
$$;

CREATE TRIGGER suscripcion_set_is_first
BEFORE INSERT ON public.suscripciones
FOR EACH ROW EXECUTE FUNCTION public.suscripcion_set_is_first();

-- is_first / id_usuario no pueden modificarse por el cliente.
CREATE OR REPLACE FUNCTION public.suscripcion_protege_campos()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.is_first IS DISTINCT FROM OLD.is_first THEN
    RAISE EXCEPTION 'is_first lo calcula el backend y no puede modificarse';
  END IF;
  IF NEW.id_usuario IS DISTINCT FROM OLD.id_usuario THEN
    RAISE EXCEPTION 'id_usuario no puede modificarse';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER suscripcion_protege_campos
BEFORE UPDATE ON public.suscripciones
FOR EACH ROW EXECUTE FUNCTION public.suscripcion_protege_campos();

-- updated_at automatico en postulaciones.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER postulaciones_set_updated_at
BEFORE UPDATE ON public.postulaciones
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Al crear una postulacion 'pendiente', crea la alerta correspondiente.
CREATE OR REPLACE FUNCTION public.postulacion_crear_alerta()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  IF NEW.estado = 'pendiente' THEN
    INSERT INTO public.alertas_beca (id_usuario, id_beca)
    VALUES (NEW.id_usuario, NEW.id_beca)
    ON CONFLICT (id_usuario, id_beca) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER postulacion_crear_alerta
AFTER INSERT ON public.postulaciones
FOR EACH ROW EXECUTE FUNCTION public.postulacion_crear_alerta();

-- Al cambiar el estado fuera de 'pendiente', desactiva la alerta.
CREATE OR REPLACE FUNCTION public.postulacion_actualiza_alerta()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
BEGIN
  IF NEW.estado <> 'pendiente' THEN
    UPDATE public.alertas_beca
    SET activa = false
    WHERE id_usuario = NEW.id_usuario
      AND id_beca = NEW.id_beca;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER postulacion_actualiza_alerta
AFTER UPDATE ON public.postulaciones
FOR EACH ROW
WHEN (NEW.estado IS DISTINCT FROM OLD.estado)
EXECUTE FUNCTION public.postulacion_actualiza_alerta();

-- =============================================================================
-- 5. RLS + GRANTS
-- =============================================================================

ALTER TABLE public.usuarios        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.becas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requisitos      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.beca_chunks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suscripciones   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.postulaciones   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alertas_beca    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recordatorios   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversaciones  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes        ENABLE ROW LEVEL SECURITY;

GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- --- usuarios: cada usuario administra su propio perfil ---
CREATE POLICY "usuarios_propio_select" ON public.usuarios
  FOR SELECT TO authenticated
  USING (id_usuario = (SELECT auth.uid()));
CREATE POLICY "usuarios_propio_insert" ON public.usuarios
  FOR INSERT TO authenticated
  WITH CHECK (id_usuario = (SELECT auth.uid()));
CREATE POLICY "usuarios_propio_update" ON public.usuarios
  FOR UPDATE TO authenticated
  USING (id_usuario = (SELECT auth.uid()))
  WITH CHECK (id_usuario = (SELECT auth.uid()));
CREATE POLICY "usuarios_propio_delete" ON public.usuarios
  FOR DELETE TO authenticated
  USING (id_usuario = (SELECT auth.uid()));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.usuarios TO authenticated;

-- --- becas / requisitos / beca_chunks: lectura publica, escritura solo backend ---
CREATE POLICY "becas_lectura_publica" ON public.becas
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "requisitos_lectura_publica" ON public.requisitos
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "beca_chunks_lectura_publica" ON public.beca_chunks
  FOR SELECT TO anon, authenticated USING (true);

REVOKE INSERT, UPDATE, DELETE ON public.becas, public.requisitos, public.beca_chunks
  FROM anon, authenticated;
GRANT SELECT ON public.becas, public.requisitos, public.beca_chunks
  TO anon, authenticated;

-- --- conversaciones / mensajes: solo el dueno ---
CREATE POLICY "conversaciones_propio_all" ON public.conversaciones
  FOR ALL TO authenticated
  USING (id_usuario = (SELECT auth.uid()))
  WITH CHECK (id_usuario = (SELECT auth.uid()));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversaciones TO authenticated;

CREATE POLICY "mensajes_propio_all" ON public.mensajes
  FOR ALL TO authenticated
  USING (public.es_dueno_conversacion(id_conversacion, (SELECT auth.uid())))
  WITH CHECK (public.es_dueno_conversacion(id_conversacion, (SELECT auth.uid())));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mensajes TO authenticated;

-- --- suscripciones: el usuario solo lee las suyas; escribe solo el backend ---
CREATE POLICY "suscripciones_propio_select" ON public.suscripciones
  FOR SELECT TO authenticated
  USING (id_usuario = (SELECT auth.uid()));
REVOKE INSERT, UPDATE, DELETE ON public.suscripciones FROM anon, authenticated;
GRANT SELECT ON public.suscripciones TO authenticated;

-- --- postulaciones / alertas_beca: solo dueno Y premium ---
CREATE POLICY "postulaciones_premium_all" ON public.postulaciones
  FOR ALL TO authenticated
  USING (id_usuario = (SELECT auth.uid()) AND public.es_premium((SELECT auth.uid())))
  WITH CHECK (id_usuario = (SELECT auth.uid()) AND public.es_premium((SELECT auth.uid())));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.postulaciones TO authenticated;

CREATE POLICY "alertas_premium_all" ON public.alertas_beca
  FOR ALL TO authenticated
  USING (id_usuario = (SELECT auth.uid()) AND public.es_premium((SELECT auth.uid())))
  WITH CHECK (id_usuario = (SELECT auth.uid()) AND public.es_premium((SELECT auth.uid())));
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alertas_beca TO authenticated;

-- --- recordatorios: sin acceso desde el cliente (solo service role) ---
REVOKE ALL ON public.recordatorios FROM anon, authenticated;

-- --- ejecucion de funciones ---
GRANT EXECUTE ON FUNCTION public.hoy_mx() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.es_premium(uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.match_contexto(vector, int, text) TO anon, authenticated;
