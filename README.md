# Purple Lightning

![Logo](https://i.imgur.com/3xXqhtN.png)

This project was started with an idea to create a static site generator using [Svelte](https://svelte.dev/). Few requirement for this framework were:

- Every page is bundled into single HTML file,
- Bundle will include minified Javascript,
- Bundle will include minified CSS,
- Framework must support page template.

With this in mind project was started and results were very interesting which is the reason for publishing this Github repository. If you have some ideas on how to make this framework better, please contact me.

## Basic understanding

`build.ts` is the main entry for bundling and creating static content.

- First of all static content is loaded in memory,
- After that file tree is created for root directories `src/pages` and `src/templates`,
- From file tree, [rollup](https://rollupjs.org/guide/en/) bundle is created, in memory, for each page and page template,
- With this information in memory, build process is started,
  - Find rollup for current page,
  - Bundle page information,
    - Lead `html`, `css` and `js` src into page,
    - Find all PL_VARIABLES in `js` src,
    - Pull `css` classes from src,
    - If page is TEMPLATE and function `modifyTemplate` is available in `zigmium-node.js` file, call it,
    - If function `modifyPage` is available in `zigmium-node.js` file, call it,
    - Minify CSS classes and variables in src,
    - Inject CSS into JS bundle,
    - Inject PL_VARIABLES into JS bundle,
    - Inject JS bundle into page HTML,
  - Add bundled page to page buffer,
  - Call function `finalize` from `zigmium-node.js` file.

## How to use

Please visit [starter project](https://github.com/Bbanez/purple-lightning-started).