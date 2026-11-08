CREATE OR REPLACE FUNCTION public.activar_premium_demo(p_dias int DEFAULT 30)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_sub record;
  v_fecha_fin timestamptz := now() + (p_dias || ' days')::interval;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  UPDATE public.suscripciones
  SET estado = 'cancelada'
  WHERE id_usuario = v_uid AND estado = 'activa';

  INSERT INTO public.suscripciones (
    id_usuario,
    estado,
    fecha_inicio,
    fecha_fin,
    precio_aplicado,
    moneda
  )
  VALUES (
    v_uid,
    'activa',
    now(),
    v_fecha_fin,
    49.00,
    'MXN'
  )
  RETURNING * INTO v_sub;

  RETURN json_build_object(
    'ok', true,
    'id_suscripcion', v_sub.id_suscripcion,
    'estado', v_sub.estado,
    'fecha_fin', v_sub.fecha_fin,
    'es_premium', true
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.desactivar_premium_demo()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado';
  END IF;

  UPDATE public.suscripciones
  SET estado = 'cancelada',
      fecha_fin = now() - interval '1 second'
  WHERE id_usuario = v_uid AND estado = 'activa';

  RETURN json_build_object(
    'ok', true,
    'es_premium', false
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.crear_recordatorio_desde_texto(p_nombre_beca text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_es_prem boolean;
  v_id_beca uuid;
  v_nombre_final text;
  v_fecha_exp date;
  v_grado text;
  v_id_alerta uuid;
  v_limpio text := trim(p_nombre_beca);
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;

  SELECT public.es_premium(v_uid) INTO v_es_prem;
  IF NOT COALESCE(v_es_prem, false) THEN
    RAISE EXCEPTION 'PREMIUM_REQUIRED';
  END IF;

  IF v_limpio = '' THEN
    RAISE EXCEPTION 'NOMBRE_BECA_VACIO';
  END IF;

  SELECT id_beca, name, fecha_expiracion, grado_academico
  INTO v_id_beca, v_nombre_final, v_fecha_exp, v_grado
  FROM public.becas
  WHERE name ILIKE '%' || v_limpio || '%'
     OR v_limpio ILIKE '%' || name || '%'
  ORDER BY (fecha_expiracion IS NOT NULL) DESC
  LIMIT 1;

  IF v_id_beca IS NULL THEN
    INSERT INTO public.becas (name, description, grado_academico, fecha_expiracion)
    VALUES (v_limpio, 'Registrada vía solicitud de recordatorio', 'General', (now() + interval '45 days')::date)
    RETURNING id_beca, name, fecha_expiracion, grado_academico
    INTO v_id_beca, v_nombre_final, v_fecha_exp, v_grado;
  END IF;

  INSERT INTO public.postulaciones (id_usuario, id_beca, estado, notas)
  VALUES (v_uid, v_id_beca, 'pendiente', 'Recordatorio agendado desde el Asesor IA')
  ON CONFLICT (id_usuario, id_beca)
  DO UPDATE SET estado = 'pendiente', updated_at = now();

  INSERT INTO public.alertas_beca (id_usuario, id_beca, dias_antes, canal, activa)
  VALUES (v_uid, v_id_beca, '{30,7,1}', 'email', true)
  ON CONFLICT (id_usuario, id_beca)
  DO UPDATE SET activa = true
  RETURNING id_alerta INTO v_id_alerta;

  RETURN json_build_object(
    'ok', true,
    'id_alerta', v_id_alerta,
    'id_beca', v_id_beca,
    'nombre_beca', v_nombre_final,
    'grado_academico', v_grado,
    'fecha_expiracion', v_fecha_exp,
    'dias_antes', ARRAY[30, 7, 1],
    'canal', 'email'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.activar_premium_demo(int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.desactivar_premium_demo() TO authenticated;
GRANT EXECUTE ON FUNCTION public.crear_recordatorio_desde_texto(text) TO authenticated;
