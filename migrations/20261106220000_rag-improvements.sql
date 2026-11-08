-- =============================================================================
-- Mejoras de precisión RAG: metadatos en match_contexto y umbrales min_score
-- =============================================================================

DROP FUNCTION IF EXISTS public.match_contexto(vector, int, text);
DROP FUNCTION IF EXISTS public.match_contexto(vector, int, text, double precision);

CREATE OR REPLACE FUNCTION public.match_contexto(
  query_embedding vector(1536),
  match_count     int DEFAULT 6,
  filtro_grado    text DEFAULT NULL,
  min_score       double precision DEFAULT 0.35
)
RETURNS TABLE (
  id_beca          uuid,
  name             text,
  grado_academico  text,
  fecha_expiracion date,
  vigente          boolean,
  tipo_fuente      text,
  content          text,
  score            double precision
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public, pg_temp
AS $$
  WITH candidatos AS (
    SELECT b.id_beca,
           b.name,
           b.grado_academico,
           b.fecha_expiracion,
           (b.fecha_expiracion IS NULL OR b.fecha_expiracion >= public.hoy_mx()) AS vigente,
           'beca'::text AS tipo_fuente,
           COALESCE(b.description, '') AS content,
           1 - (b.embedding <=> query_embedding) AS score
    FROM public.becas b
    WHERE b.embedding IS NOT NULL
      AND (filtro_grado IS NULL OR b.grado_academico ILIKE '%' || filtro_grado || '%')

    UNION ALL

    SELECT b.id_beca,
           b.name,
           b.grado_academico,
           b.fecha_expiracion,
           (b.fecha_expiracion IS NULL OR b.fecha_expiracion >= public.hoy_mx()) AS vigente,
           'beca'::text AS tipo_fuente,
           c.content,
           1 - (c.embedding <=> query_embedding) AS score
    FROM public.beca_chunks c
    JOIN public.becas b ON b.id_beca = c.id_beca
    WHERE c.embedding IS NOT NULL
      AND (filtro_grado IS NULL OR b.grado_academico ILIKE '%' || filtro_grado || '%')

    UNION ALL

    SELECT b.id_beca,
           b.name,
           b.grado_academico,
           b.fecha_expiracion,
           (b.fecha_expiracion IS NULL OR b.fecha_expiracion >= public.hoy_mx()) AS vigente,
           'requisito'::text AS tipo_fuente,
           r.descripcion AS content,
           1 - (r.embedding <=> query_embedding) AS score
    FROM public.requisitos r
    JOIN public.becas b ON b.id_beca = r.id_beca
    WHERE r.embedding IS NOT NULL
      AND (filtro_grado IS NULL OR b.grado_academico ILIKE '%' || filtro_grado || '%')
  )
  SELECT c.id_beca,
         c.name,
         c.grado_academico,
         c.fecha_expiracion,
         c.vigente,
         c.tipo_fuente,
         c.content,
         c.score
  FROM candidatos c
  WHERE c.score >= min_score
  ORDER BY c.vigente DESC, c.score DESC
  LIMIT match_count;
$$;

GRANT EXECUTE ON FUNCTION public.match_contexto(vector, int, text, double precision) TO anon, authenticated;

-- Actualizar match_conocimiento_web con min_score
DROP FUNCTION IF EXISTS public.match_conocimiento_web(vector, int);
DROP FUNCTION IF EXISTS public.match_conocimiento_web(vector, int, double precision);

CREATE OR REPLACE FUNCTION public.match_conocimiento_web(
  query_embedding vector(1536),
  match_count     int DEFAULT 3,
  min_score       double precision DEFAULT 0.45
)
RETURNS TABLE (
  id_conocimiento uuid,
  pregunta        text,
  contenido       text,
  fuentes         jsonb,
  score           double precision
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = pg_catalog, public, pg_temp
AS $$
  SELECT c.id_conocimiento,
         c.pregunta,
         c.contenido,
         c.fuentes,
         1 - (c.embedding <=> query_embedding) AS score
  FROM public.conocimiento_web c
  WHERE c.embedding IS NOT NULL
    AND (1 - (c.embedding <=> query_embedding)) >= min_score
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
$$;

GRANT EXECUTE ON FUNCTION public.match_conocimiento_web(vector, int, double precision) TO anon, authenticated;
