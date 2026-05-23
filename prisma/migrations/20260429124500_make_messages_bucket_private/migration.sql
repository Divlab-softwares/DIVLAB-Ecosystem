DO $$
BEGIN
    IF to_regclass('storage.buckets') IS NOT NULL THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('messages', 'messages', FALSE)
        ON CONFLICT (id) DO UPDATE SET public = FALSE;
    END IF;
END $$;
