# Net Sportswear — homepage design preview

An independent English-language B2B website concept for brands, importers and wholesalers. It does not connect to or change the existing Net Sportswear website.

## Develop

Requires Node.js 20.19+ or 22.12+ (validated with Node 24).

```sh
npm ci
npm run dev -- --port 5173
```

## Production build

```sh
npm run build
npm run preview
```

The homepage includes SKI, CYCLING and OUTDOOR collections, OEM/ODM services, company positioning, a development process and a responsive inquiry form. Navigation scrolls to each section; selecting a collection prefills the inquiry category.

The inquiry form validates required fields and downloads a text draft locally. It does not send or store personal information on a server. Connect an approved email or CRM backend before production use.

Images in `public/images` are AI-generated concept assets, not actual Net Sportswear products or facilities. Replace them with approved brand photography and confirm company copy before launch. All assets are served locally; no external fonts, analytics or image services are required.

No deployment or changes to www.net-sportswear.cn are part of this project.

## GitHub Pages design preview

The Vite base path is `/net-sportswear-website/`. Image URLs use Vite's base placeholder so they resolve correctly on the project site.

In this repository's **Settings → Pages**, choose **GitHub Actions** as the build source. The `Deploy design preview to GitHub Pages` workflow builds and deploys on pushes to `main`, or can be started manually from the Actions tab. The expected default preview address is:

https://saulchi.github.io/net-sportswear-website/

Do not configure a custom domain or add a `CNAME` file. This preview is separate from the existing live website. Confirm a successful Pages deployment before treating the URL as live.

To validate the production output locally, run `npm run build`, then `npm run preview -- --port 4173` and open `/net-sportswear-website/` on that server.

## Carousel regression checks

The homepage starts playing on load and advances Ski → Cycling → Outdoor every five seconds. Hover and focus do not stop playback. Pause/Play controls playback explicitly; manual selection and swipes restart the five-second interval while preserving the selected playback state. Background tabs suspend the timer and resume when visible. Reduced-motion preferences disable the visual transition while retaining the requested autoplay.

Run `npx playwright install chromium` once, then `npm run test:carousel`. Tests exercise the production build with Chromium, including autoplay while hovered, Pause/Play while focused, continuous looping, manual selection, mobile swipes and reduced-motion settings. `CHROMIUM_PATH` can select an existing Chromium executable.

The Pages workflow stamps the deployed revision and runs these same browser checks against the public preview URL after deployment. A successful deployment job therefore confirms the new revision is live and its carousel behavior passes.

## Product navigation

Desktop SKI, CYCLING and OUTDOOR disclosures open on hover or click. Each full-width panel has MEN and WOMEN columns linking directly to the selected product type. Mobile uses expandable category sections. Native buttons and links support Enter/Space, Tab, ArrowDown and Escape, with focus restored to the category trigger on dismissal. Outside clicks and viewport changes close open menus.

`products.html?category=SKI&gender=Men&subcategory=Jackets` is a static GitHub Pages-compatible product destination. Men/Women and product-type filter interfaces have been removed. The same catalog module supplies both the menus and product pages. Inquiry links carry the chosen category, product type and fit into the local inquiry draft.

Run `npm test` for carousel and product-navigation browser checks. Both suites also run against the published Pages revision. Tests cover all 24 menu destinations, hover/click, keyboard, mobile expansion, direct-page reloads, removal of filter controls and inquiry downloads. The original homepage images and five-second carousel are preserved. No prices, carts or checkout are included.

## Image-led collection layout

Product listing pages use a compact title/description and a photo grid: four columns on desktop, three on tablets, two on phones. Each existing development option has a matching subcategory/fit concept image; counts reflect these options, not invented retail stock. Cards link to the project inquiry form. No gender filters, retail sorting, prices or checkout are included.

Studio images in `public/images/products` are AI-generated concept visuals with paired Men/Women panels, cropped for display using CSS. They are not photographs of Net Sportswear inventory. Replace these with approved photography when available. The original homepage image files and carousel code remain unchanged.

## Product details

Product images and titles open `detail.html` with the category, subcategory and fit in the query string. All 24 development options have a detail destination with full/close-up image views, optional colour/size brief preferences, native expandable development notes and an inquiry link. Each detail has the original front image plus four AI-generated concept views. Full view and zoom operate on whichever gallery image is selected. Colour choices describe a requested direction and do not recolour the reference image. Size choices are development preferences, not stock availability. Both preferences are carried into the editable inquiry draft.

Run `npm run test:details` for image controls, all 24 destinations, keyboard, mobile and inquiry-prefill checks. The Pages workflow runs this suite against the deployed revision as well as the existing carousel and navigation checks. No price, cart, checkout or unsupported technical product claims are included.

## Five-image product galleries

All 24 product detail destinations retain their original image and add four AI-generated concept views: rear, three-quarter, front detail and construction detail. The added images are arranged in local 4-column / 2-row contact sheets (Men above Women) under `public/images/products/gallery`, displayed as separate gallery panels with CSS. They visualise possible design details and are not photographs of approved physical samples.

Previous/next arrows wrap through all five images; thumbnails select directly and indicate the active image. Keyboard Left/Right/Home/End and horizontal mobile swipes are supported. Vertical gestures retain normal page scrolling, and the thumbnail strip scrolls horizontally without jumping the page. Selecting another image resets zoom. There is no automatic playback in the detail gallery; the homepage's separate five-second carousel is unchanged.
