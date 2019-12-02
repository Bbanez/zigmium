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
    StaticContent.SeoMeta = (await FSUtil.read('/src/assets/seoMeta.html'))
      .toString()
      .replace(/\n/g, '')
      .replace(/\r/g, '')
      .replace(/\t/g, '')
      .replace(/  /g, '');
    StaticContent.IndexTemplate = (await FSUtil.read('/src/assets/index.html'))
      .toString()
      .replace(/\n/g, '')
      .replace(/\r/g, '')
      .replace(/\t/g, '')
      .replace(/  /g, '');
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
}
