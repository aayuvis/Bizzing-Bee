/* sb-config.js — the only file that knows where the backend lives.

   PASTE YOUR TWO VALUES BELOW and accounts switch from local to real. Leave them
   empty and the app runs exactly as it does today, on-device, with no network
   calls — which is why this file is safe to ship before the project exists.

   Supabase dashboard → Project Settings → API:
     url  = "Project URL"        e.g. https://abcdefghijklm.supabase.co
     anon = "anon public" key    the long eyJ... string

   THE ANON KEY IS MEANT TO BE PUBLIC. It identifies the project, it does not grant
   access: every table is protected by row-level security, so the key alone can read
   nothing. Do NOT paste the "service_role" key here — that one bypasses RLS and
   would hand the whole database to anyone who views source.  */
window.SB_CFG = {
  url: '',
  anon: '',

  /* Off until the values above are filled in AND this is true. Lets you deploy the
     plumbing and switch it on separately, and turn it off again in one line if
     anything misbehaves in the wild. */
  cloud: true,

  /* How long to wait on the network before falling back to the on-device copy.
     Deliberately short: this app promises to work on a plane, so a slow or absent
     connection must never hold up a child who wants to spell. */
  timeoutMs: 6000,
};
window.SB_CLOUD_ON = function () {
  try { var c = window.SB_CFG; return !!(c && c.cloud && c.url && c.anon); }
  catch (e) { return false; }
};
