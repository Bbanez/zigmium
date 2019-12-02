import * as path from 'path';

import { FSUtil } from './util/fs-util';
import { IPage, PageType } from './interfaces/page.interface';
import { PageFactory } from './factories/page.factory';
import { Logger } from 'purple-cheetah';
import { Progress } from './interfaces/progress.interface';
import { Builder } from './util/builder';
import { StaticContent } from './util/static-content';
import { Page } from './models/page.model';
import { PageServeMiddleware } from './middleware/page-serve.middleware';

export class Build {
  public static logger: Logger = new Logger('Sprint');
  public static pageCount: number = 0;
  public static progress: Progress = {
    time: {
      offset: 0,
      doneIn: 0,
    },
    static: {
      page: {
        count: 0,
        done: 0,
      },
      stats: [],
    },
    template: {
      page: {
        count: 0,
        done: 0,
      },
      stats: [],
    },
  };
  private static compiledPages: Page[] = [];
  public static progressTimer: any;
  private static node: any;

  public static async checkProgress() {
    if (
      Build.progress.static.page.count === Build.progress.static.page.done &&
      Build.progress.template.page.count === Build.progress.template.page.done
    ) {
      Build.progress.time.doneIn = Date.now() - Build.progress.time.offset;
      clearInterval(Build.progressTimer);
      // Build.logger.info('', `STATS`);
      // Build.logger.info('', Build.progress);
      Build.logger.info(
        '',
        `Build completed in ${Build.progress.time.doneIn / 1000}s for '${
          Build.pageCount
        }' pages.`,
      );
      if (process.env.STATE === 'DEV') {
        PageServeMiddleware.pages = Build.compiledPages;
      } else {
        if (typeof Build.node.finalize === 'function') {
          await Build.node.finalize(Build.compiledPages);
        }
      }
      Build.compiledPages = [];
    }
  }

  public static async process() {
    Build.node = require(process.env.PROJECT_ROOT + '/zigmium-node.js');
    Build.pageCount = 0;
    Build.progress = {
      time: {
        offset: 0,
        doneIn: 0,
      },
      static: {
        page: {
          count: 0,
          done: 0,
        },
        stats: [],
      },
      template: {
        page: {
          count: 0,
          done: 0,
        },
        stats: [],
      },
    };
    Build.logger.info('', 'Build Started...');
    if (typeof Build.node.init === 'function') {
      await Build.node.init();
    }
    Build.progress.time.offset = Date.now();
    // CREATE STATIC PAGES
    {
      const rootPath = path.join(process.env.PROJECT_ROOT, '/src/pages');
      const fileTree = await FSUtil.fileTree(rootPath);
      const pages: Page[] = PageFactory.fromFileTree(fileTree).map(e => {
        e.type = PageType.STATIC;
        return e;
      });
      Build.progress.static.page.count = pages.length;
      for (const i in pages) {
        const page = pages[i];
        const rollup = StaticContent.rollup.find(r => r.id === page.name);
        if (rollup) {
          const builtPages = await Builder.createPages(
            page,
            rollup.css,
            rollup.js,
          );
          Build.pageCount = Build.pageCount + builtPages.length;
          builtPages.forEach(bp => {
            Build.compiledPages.push(bp);
          });
          Build.logger.info(
            '',
            `Build done in ${(Date.now() - Build.progress.time.offset) /
              1000}s for '${page.name}'`,
          );
          Build.progress.static.page.done = Build.progress.static.page.done + 1;
          Build.progress.static.stats.push({
            name: page.name,
            timeDelta: Date.now() - Build.progress.time.offset,
          });
        } else {
          Build.logger.error(
            '',
            `Rollup for page '${page.name}' does not exist`,
          );
        }
      }
    }
    // CREATE TEMPLATE PAGES
    {
      const rootPath = path.join(process.env.PROJECT_ROOT, '/src/templates');
      const fileTree = await FSUtil.fileTree(rootPath);
      const pages: Page[] = PageFactory.fromFileTree(fileTree).map(e => {
        e.type = PageType.TEMPLATE;
        return e;
      });
      Build.progress.template.page.count = pages.length;
      for (const i in pages) {
        const page = pages[i];
        const rollup = StaticContent.rollup.find(r => r.id === page.name);
        if (rollup) {
          page.location.path = 'none';
          const builtPages = await Builder.createPages(
            page,
            rollup.css,
            rollup.js,
          );
          Build.pageCount = Build.pageCount + builtPages.length;
          builtPages.forEach(bp => {
            Build.compiledPages.push(bp);
          });
          Build.logger.info(
            '',
            `Build done in ${(Date.now() - Build.progress.time.offset) /
              1000}s for '${page.name}'`,
          );
          Build.progress.template.page.done =
            Build.progress.template.page.done + 1;
          Build.progress.template.stats.push({
            name: page.name,
            timeDelta: Date.now() - Build.progress.time.offset,
          });
        } else {
          Build.logger.error(
            '',
            `Rollup for page '${page.name}' does not exist`,
          );
        }
      }
    }
  }
}
