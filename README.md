# Ev1l Pizza Arcade

The home of ev1lpizza's web games. Built with [Astro](https://astro.build), TypeScript, GSAP and a hand-written WebGL shader. Deploys to GitHub Pages on every push to `main`.

## Run it locally

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # type-checks, then builds to dist/
```

## Add a game

1. **Put the web build in `public/play/<slug>/`.** Anything with an `index.html` works: Godot or Unity web exports, Phaser, plain canvas. Use relative paths inside the build.
2. **Add `src/content/games/<slug>.md`.** Copy `src/content/games/_example-draft.md`, fill in the fields and set `draft: false`. The text under the `---` becomes the "About the game" section.
3. **Push to `main`.** The game gets a card on the rack and its own page at `/games/<slug>/`.

Useful fields:

| Field | What it does |
| --- | --- |
| `embed` | Path to the build, e.g. `/play/<slug>/index.html`, or a full https URL |
| `aspect` | Shape of the play area, e.g. `16 / 9` |
| `cover` | Image next to the Markdown file, e.g. `./covers/<slug>.png` (optimized automatically) |
| `attract` | Name of an animated preview in `src/scripts/attract.ts` (optional) |
| `featured` | Gives the game the big card on the homepage |
| `mobile` | Set `false` to show "Best on a computer" |
| `warnings` | Shown before play, e.g. `[Flashing lights]` |
| `links` | Extra buttons, e.g. itch.io or source code |

**Points in the header score:** a game can send points to the site with
`parent.postMessage({ type: 'ev1l:score', points: 50 }, location.origin)`.

**Privacy:** if a game stores anything in `localStorage`, add the key to the table in `src/pages/privacy.astro`. If a game ever talks to a server (leaderboards, analytics, ads), update the privacy policy before it ships.

## Write a devlog post

Add `src/content/devlog/<slug>.md` with `title`, `date`, `summary` and optionally `game: <game-slug>`. Posts show on the homepage, on the game's page and in the RSS feed.

## Settings

- Site name, contact link and the legal "last updated" date live in `src/data/site.ts`.
- Colors and fonts are tokens at the top of `src/styles/global.css`.

## Deploying

The workflow in `.github/workflows/deploy.yml` builds and publishes the site. In the repository on GitHub, open **Settings → Pages** and set **Source** to **GitHub Actions**.

If the repository isn't named `ev1lpizza.github.io`, the site lives under a sub-path. Set `SITE_BASE: /<repo-name>` in the workflow's `env` block.

## License

The website code is MIT. The games, art and the Ev1l Pizza name and logo are not. See [LICENSE](LICENSE).
