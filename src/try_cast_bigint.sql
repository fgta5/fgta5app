	CREATE OR REPLACE FUNCTION try_cast_bigint(text, default_value bigint DEFAULT 0)
	RETURNS bigint AS $$
	BEGIN
	RETURN $1::bigint;
	EXCEPTION
	WHEN others THEN
		RETURN default_value;
	END;
	$$ LANGUAGE plpgsql;