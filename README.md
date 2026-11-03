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

The homepage includes cycling, ski, outdoor and golf collections, OEM/ODM services, company positioning, a development process and a responsive inquiry form. Navigation scrolls to each section; selecting a collection prefills the inquiry category.

The inquiry form validates required fields and downloads a text draft locally. It does not send or store personal information on a server. Connect an approved email or CRM backend before production use.

Images in `public/images` are AI-generated concept assets, not actual Net Sportswear products or facilities. Replace them with approved brand photography and confirm company copy before launch. All assets are served locally; no external fonts, analytics or image services are required.

No deployment or changes to www.net-sportswear.cn are part of this project.
