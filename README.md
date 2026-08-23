# Magic Concert Archive V2

Public concert-ticket gallery with an Add Ticket form.

## Current behavior
- The 3 starter tickets are bundled with the site.
- If `config.js` is blank, new tickets are stored only in that browser (demo/local mode).
- Connect Supabase once to make new tickets persistent and visible to every visitor.

## Supabase setup
1. Create a free Supabase project.
2. In SQL Editor run `supabase-setup.sql`.
3. Project Settings → API: copy Project URL and anon/public key.
4. Paste both values into `config.js`.
5. Upload/replace `index.html`, `app.js`, `styles.css`, `config.js` on your GitHub Pages repo.

The site then uploads ticket images to the public `ticket-images` bucket and stores metadata in the `tickets` table.
