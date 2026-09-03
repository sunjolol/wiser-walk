# Theology Compass — site

Astro + Vercel. The audited quiz data is upstream: `audit/compass-data.revised.json` is the
source of truth, and `npm run data` regenerates `src/data/compass.json` from it. Never hand-edit
the generated file.

    npm install
    npm run dev      # regenerates data, then serves
    npm run build    # regenerates data, then builds to dist/ + .vercel/output

Deploying (needs your Vercel account, from this folder):

    npx vercel        # first run links the project
    npx vercel --prod

Pages are `noindex` until Stage 2 lands real content — see ../V1-BLUEPRINT.md.
