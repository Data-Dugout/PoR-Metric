# PoR — Progression or Regression

A static site introducing the PoR hitting metric: home, article, methodology, results, and about pages. Plain HTML/CSS/JS — no build step required.

## File structure
```
por-site/
├── index.html          Home
├── article.html         The main article
├── methodology.html     Formula + data sources
├── results.html          Accuracy tables + charts
├── about.html
├── css/style.css
├── js/main.js
└── netlify.toml
```

## Deploy — Option A: Netlify Drop (fastest, no account setup needed)
1. Go to https://app.netlify.com/drop
2. Drag the entire `por-site` folder onto the page
3. Netlify gives you a live URL immediately (e.g. `random-name-123.netlify.app`)
4. To keep it long-term / add a custom domain, create a free Netlify account and claim the site

## Deploy — Option B: GitHub + Netlify (recommended if you'll keep editing)
1. Create a new repo on GitHub (e.g. `por-metric`)
2. From inside the `por-site` folder:
   ```
   git init
   git add .
   git commit -m "Initial PoR site"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/por-metric.git
   git push -u origin main
   ```
3. Go to https://app.netlify.com → **Add new site** → **Import an existing project**
4. Connect your GitHub account, select the `por-metric` repo
5. Build settings: leave **Build command** blank, set **Publish directory** to `.`
6. Click **Deploy site**

From then on, any `git push` to `main` auto-deploys the update — no re-dragging files.

## Custom domain
Netlify → your site → **Domain settings** → **Add a domain**. Follow the DNS instructions it gives you (usually just adding a CNAME or changing nameservers at your registrar).

## Updating content later
- New results/tables → edit `results.html`
- Article text → edit `article.html`
- Site-wide colors/fonts → edit `css/style.css` (design tokens are at the top, in `:root`)
