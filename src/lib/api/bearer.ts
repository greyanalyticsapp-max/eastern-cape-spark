// Browser helper: build an Authorization header from the current Supabase
// session. Returned as HeadersInit so it composes with other headers.
import { supabase } from "@/integrations/supabase/client";

export async function bearerHeaders(): Promise<HeadersInit> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}
