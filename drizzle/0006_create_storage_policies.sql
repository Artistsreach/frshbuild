CREATE OR REPLACE FUNCTION create_storage_policies_for_user(
  bucket_name TEXT,
  user_id_text TEXT
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  policy_name_owner TEXT;
  policy_name_public TEXT;
  user_id_uuid UUID;
BEGIN
  -- Convert text UUID to UUID type
  user_id_uuid := user_id_text::uuid;

  -- Policy for owner's full access to their private folder
  policy_name_owner := 'Enable full access for user ' || user_id_text || ' on their folder in ' || bucket_name;
  
  -- Drop policy if it already exists to make the function idempotent
  EXECUTE 'DROP POLICY IF EXISTS "' || policy_name_owner || '" ON storage.objects;';

  EXECUTE format('
    CREATE POLICY "%s"
    ON storage.objects FOR ALL
    TO authenticated
    USING (bucket_id = %L AND (storage.foldername(name))[1] = %L)
    WITH CHECK (bucket_id = %L AND (storage.foldername(name))[1] = %L);
  ', policy_name_owner, bucket_name, user_id_text, bucket_name, user_id_text);

  -- Policy for public read access to a 'public' folder within the user's space
  policy_name_public := 'Enable public read on public folder for user ' || user_id_text || ' in ' || bucket_name;

  EXECUTE 'DROP POLICY IF EXISTS "' || policy_name_public || '" ON storage.objects;';

  EXECUTE format('
    CREATE POLICY "%s"
    ON storage.objects FOR SELECT
    USING (bucket_id = %L AND (storage.foldername(name))[1] = %L AND (storage.foldername(name))[2] = ''public'');
  ', policy_name_public, bucket_name, user_id_text);

END;
$$;
