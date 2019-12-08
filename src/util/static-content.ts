import * as path from 'path';
import { FSUtil } from './fs-util';
import { IPage, PageType } from '../interfaces/page.interface';
import { PageFactory } from '../factories/page.factory';
import { Rollup } from './rollup';
import { Logger } from 'purple-cheetah';
import { Page } from '../models/page.model';

export class StaticContent {
  private static SeoMeta: string;
  private static IndexTemplate: string;
  private static Rollup: Array<{
    id: string;
    js: string;
    css: string;
  }>;
  private static logger: Logger = new Logger('StaticContent');

  public static async init() {
    try {
      StaticContent.SeoMeta = (await FSUtil.read('/src/assets/seoMeta.html'))
        .toString()
        .replace(/\n/g, '')
        .replace(/\r/g, '')
        .replace(/\t/g, '')
        .replace(/  /g, '');
    } catch (error) {
      StaticContent.SeoMeta = '';
    }
    try {
      StaticContent.IndexTemplate = (
        await FSUtil.read('/src/assets/index.html')
      )
        .toString()
        .replace(/\n/g, '')
        .replace(/\r/g, '')
        .replace(/\t/g, '')
        .replace(/  /g, '');
    } catch (error) {
      StaticContent.IndexTemplate = `
      <!doctype html>
      <html lang="en">

      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">

        <title>__pageTitle__</title>

        {{__seoMeta__}}
      </head>

      <body>
        <div id="root">
          <script>{{__script__}}</script>
        </div>
      </body>

      </html>
      `
        .replace(/\n/g, '')
        .replace(/\r/g, '')
        .replace(/\t/g, '')
        .replace(/  /g, '');
    }
    const rollupOffset = Date.now();
    StaticContent.logger.info('', 'Start building rollup...');
    StaticContent.Rollup = [];
    // Static pages rollup
    {
      const rootPath = path.join(process.env.PROJECT_ROOT, '/src/pages');
      const fileTree = await FSUtil.fileTree(rootPath);
      const pages: Page[] = PageFactory.fromFileTree(fileTree).map(e => {
        e.type = PageType.STATIC;
        return e;
      });
      for (const i in pages) {
        const page = pages[i];
        const rollupResult = await Rollup.build({
          input: path.join(
            'src/pages',
            page.location.path.replace('.html', '.js'),
          ),
          output: 'scripts/assets',
        });
        StaticContent.Rollup.push({
          id: page.name,
          js: rollupResult.js,
          css: rollupResult.css,
        });
      }
    }
    // Template pages rollup
    {
      const rootPath = path.join(process.env.PROJECT_ROOT, '/src/templates');
      const fileTree = await FSUtil.fileTree(rootPath);
      const pages: Page[] = PageFactory.fromFileTree(fileTree).map(e => {
        e.type = PageType.TEMPLATE;
        return e;
      });
      for (const i in pages) {
        const page = pages[i];
        const rollupResult = await Rollup.build({
          input: path.join(
            'src/templates',
            page.location.path.replace('.html', '.js'),
          ),
          output: 'scripts/assets',
        });
        StaticContent.Rollup.push({
          id: page.name,
          js: rollupResult.js,
          css: rollupResult.css,
        });
      }
    }
    StaticContent.logger.info(
      '',
      `... done in ${(Date.now() - rollupOffset) / 1000}s`,
    );
  }

  public static get seoMeta() {
    return '' + StaticContent.SeoMeta;
  }

  public static get indexTemplate() {
    return '' + StaticContent.IndexTemplate;
  }

  public static get rollup(): Array<{
    id: string;
    js: string;
    css: string;
  }> {
    return JSON.parse(JSON.stringify(StaticContent.Rollup));
  }

  public static async rollupUpdatePage(page: Page) {
    StaticContent.logger.info(
      '.rollupUpdatePage',
      `Updating Rollup for page '${page.name}'...`,
    );
    const rollupResult = await Rollup.build({
      input: path.join(
        page.type === PageType.STATIC ? 'src/pages' : 'src/template',
        page.location.path.replace('.html', '.js'),
      ),
      output: 'scripts/assets',
    });
    const rollup = StaticContent.Rollup.find(e => e.id === page.name);
    if (rollup) {
      StaticContent.logger.info(
        '.rollupUpdatePage',
        'Page does not exist, UPDATING.',
      );
      StaticContent.Rollup.forEach(e => {
        if (e.id === page.name) {
          e = {
            id: page.name,
            js: rollupResult.js,
            css: rollupResult.css,
          };
        }
      });
    } else {
      StaticContent.logger.info(
        '.rollupUpdatePage',
        'Page does not exist, PUSHING.',
      );
      StaticContent.Rollup.push({
        id: page.name,
        js: rollupResult.js,
        css: rollupResult.css,
      });
    }
  }
}
