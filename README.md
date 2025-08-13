# internationalcarcompanyinc

## Deployment

This project is configured for Netlify and Supabase.

- Netlify: add environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXTAUTH_SECRET, NEXTAUTH_URL, etc.).
- Supabase: create a Storage bucket (default: `car-images`) and mark it public if you want public URLs.
- Images are served from Supabase Storage; Vercel-specific analytics and Blob have been removed.
