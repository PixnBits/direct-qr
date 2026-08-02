# Direct QR

**Client-side static QR generator & validator that never uses intermediate redirect domains.**

Many free QR tools create codes that point at *their* short links. Later those links can require accounts, show ads, force app downloads, or break entirely. Direct QR only ever encodes the payload you provide — fully in the browser, with no server storage.

- **Live demo path:** open the built site (or `npm run dev`) and use the generator / validator on one page.
- **Repository:** [github.com/PixnBits/direct-qr](https://github.com/PixnBits/direct-qr)
- **License:** MIT

## Why it exists

| Static QR (this tool) | Dynamic / “free generator” QR |
| --- | --- |
| Encodes your real URL or text in the image | Encodes a vendor short URL |
| Works offline after download | Depends on someone else’s servers |
| No account, no expiry from a SaaS plan | Free tiers often expire or degrade |
| You can decode and verify the exact payload | Destination can change without reprinting |

Primary audience: non-technical publishers (menus, posters, packaging, handouts) who need permanence and transparency.

## Features

### Generator
- URL or arbitrary text payload
- Pure static encoding (no short links, no server round-trips)
- Live preview as you type
- Error correction L / M / Q / H
- Foreground & background colours with contrast warning
- Quiet-zone (margin) control
- Optional centre logo with clear durability warning
- Export resolution for print (PNG) + SVG download
- Always shows the **exact string** that will be encoded
- Capacity / denseness warnings for long payloads

### Validator
- Drag-and-drop or file upload (clipboard paste when the browser allows)
- Client-side decode ([jsQR](https://github.com/cozmo/jsQR))
- Raw payload display
- URL analysis against a hardcoded list of common shorteners and dynamic-QR / tracking domains
- Clear “direct content” vs “third-party redirector” verdict
- Cautious “Open link” action

### Education
- Static vs dynamic explained in plain language
- Print recommendations (size, quiet zone, contrast, distance, testing)
- Privacy statement

## Privacy

Everything runs in your browser:

- Payloads are **not** uploaded to generate codes
- Images you validate are read locally for decoding
- No accounts

If you host the site on a normal web server, access logs may show that the page was loaded — not the QR content you type. For maximum privacy, open the built files offline or self-host.

## Use

### Generator
1. Paste your **final** destination URL (or any text).
2. Confirm the “Exact string encoded” panel matches what you intend.
3. Adjust error correction, colours, margin, and size as needed.
4. Download PNG and/or SVG.
5. Scan the downloaded file on a real phone before any print run.

### Validator
1. Upload or paste a QR image.
2. Read the raw payload and the verdict.
3. If it points at a shortener or dynamic-QR domain, regenerate with your real URL.

## Develop locally

Requirements: Node.js 20+ (22 recommended).

```bash
npm install
npm run dev
```

Open the printed local URL (default Vite port is configured to **8080**).

```bash
npm run build     # typecheck + production build → dist/
npm run preview   # serve dist/ for a production smoke check
npm run typecheck
```

## Deploy on GitHub Pages

This project builds a static site into `dist/` with relative asset paths (`base: './'`), so it works at the root of a Pages site or under a project subpath.

1. Push this repository to GitHub (already set up as `PixnBits/direct-qr` if you are following the official repo).
2. In the repo **Settings → Pages**:
   - **Source:** GitHub Actions, **or**
   - Deploy from branch: use a workflow that builds and uploads `dist`, or the classic “branch /docs” flow after copying `dist` contents.
3. Suggested GitHub Actions workflow (create `.github/workflows/pages.yml`):

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

4. After the first successful run, the site is available at  
   `https://pixnbits.github.io/direct-qr/`  
   (or your user/org Pages URL).

You can also drop the contents of `dist/` onto any static host (Netlify, Cloudflare Pages, S3, etc.).

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- [qrcode](https://github.com/soldair/node-qrcode) (generation)
- [jsQR](https://github.com/cozmo/jsQR) (decoding)
- lucide-react (icons)

No backend. No analytics required.

## Contributing

Issues and pull requests are welcome. Keep the product opinionated toward **transparency and permanence**: if a feature would reintroduce intermediate domains, server-side payload storage, or dark-pattern “free” tiers, it does not belong here.

## License

[MIT](./LICENSE)
