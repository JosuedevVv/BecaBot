CREATE TABLE public.conocimiento_web (
  id_conocimiento UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pregunta        TEXT NOT NULL,
  contenido       TEXT NOT NULL,
  fuentes         JSONB NOT NULL DEFAULT '[]'::jsonb,
  embedding       vector(1536),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX conocimiento_web_embedding_hnsw_idx
  ON public.conocimiento_web USING hnsw (embedding vector_cosine_ops);

CREATE OR REPLACE FUNCTION public.match_conocimiento_web(
  query_embedding vector(1536),
  match_count     int DEFAULT 3
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
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
$$;

ALTER TABLE public.conocimiento_web ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conocimiento_web_lectura_publica" ON public.conocimiento_web
  FOR SELECT TO anon, authenticated USING (true);

REVOKE INSERT, UPDATE, DELETE ON public.conocimiento_web FROM anon, authenticated;
GRANT SELECT ON public.conocimiento_web TO anon, authenticated;

GRANT EXECUTE ON FUNCTION public.match_conocimiento_web(vector, int) TO anon, authenticated;
