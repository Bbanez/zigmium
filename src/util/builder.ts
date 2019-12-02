import * as path from 'path';
import { PageType } from '../interfaces/page.interface';
import { JSUtil } from './js-util';
import { CssUtil } from './css-util';
import { Template } from '../interfaces/template.interface';
import { StaticContent } from './static-content';
import { StringUtil } from './string-util';
import { Page } from '../models/page.model';
import { PageFactory } from '../factories';

// tslint:disable-next-line: no-var-requires
const node = require(process.env.PROJECT_ROOT + '/zigmium-node.js');
// tslint:disable-next-line: no-var-requires
const config = require(process.env.PROJECT_ROOT + '/zigmium-config.js');

export class Builder {
  public static async createPages(page: Page, css: string, js: string) {
    const pages: Page[] = [];
    // SETUP
    {
      page.html = {
        src: '' + StaticContent.indexTemplate,
        var: [
          {
            key: '{{__seoMeta__}}',
            value: StaticContent.seoMeta,
          },
          {
            key: '{{__pageTitle__}}',
            value: 'Sprint',
          },
          {
            key: '{{__script__}}',
            value: '',
          },
          {
            key: '{__script__}',
            value: '__script__',
          },
          {
            key: '__id__',
            value: page.id,
          },
        ],
      };
      // JSUtil.pullVariables(StaticContent.seoMeta).forEach(keyValue => {
      //   page.html.var.push(keyValue);
      // });
      page.css = {
        src: css,
        cls: [],
        var: [],
      };
      page.js = {
        src: js,
        var: [
          {
            key: '__id__',
            value: page.id,
          },
        ],
      };
      JSUtil.pullVariables(page.js.src).forEach(keyValue => {
        page.js.var.push(keyValue);
      });
      if (process.env.DEV === 'false') {
        page.css = CssUtil.pullVariablesAndClasses(page.css.src);
      }
    }
    if (config && config.siteMetadata) {
      if (config.siteMetadata.title) {
        page.setHtmlVar('__pageTitle__', config.siteMetadata.title);
        page.setHtmlVar('__siteName__', config.siteMetadata.title);
      }
      if (config.siteMetadata.favicon) {
        page.setHtmlVar('__pageFaviconUrl__', config.siteMetadata.favicon);
        page.setHtmlVar('__pageImage__', config.siteMetadata.favicon);
      }
      if (config.siteMetadata.locale) {
        page.setHtmlVar('__pageLocale__', config.siteMetadata.locale);
      }
      if (config.siteMetadata.description) {
        page.setHtmlVar('__pageDesc__', config.siteMetadata.description);
      }
    }
    // COMPILE TEMPLATE
    let templates: Template[];
    {
      if (
        typeof node.modifyTemplate === 'function' &&
        page.type === PageType.TEMPLATE
      ) {
        templates = await node.modifyTemplate(page);
        if (templates instanceof Array) {
          templates.forEach(template => {
            page.js.var = page.js.var.filter(
              v => !template.var.find(e => e.key === v.key),
            );
          });
          page.location.path = 'process-template';
        }
      }
    }
    // CALL USER DEFINED createPage
    if (typeof node.modifyPage === 'function') {
      await node.modifyPage(page);
      if (page.location.path === 'none') {
        return;
      }
    }

    // COMPILE CSS VARIABLES
    page.css.var.forEach(v => {
      while (true) {
        const oldCss = '' + page.css.src;
        page.css.src = page.css.src.replace(v.key, v.value);
        if (page.css.src === oldCss) {
          break;
        }
      }
      while (true) {
        const oldJs = '' + page.js.src;
        page.js.src = page.js.src.replace(v.key, v.value);
        if (page.js.src === oldJs) {
          break;
        }
      }
    });
    // MINIFY CSS CLASS NAMES
    {
      page.css.cls.forEach(cls => {
        page.css.src = page.css.src.replace(/\./g, '________');
        page.css.src = page.css.src.replace(
          new RegExp(`________${cls.key}`, 'g'),
          `________${cls.value}`,
        );
        page.css.src = page.css.src.replace(/________/g, '.');
      });
      const clsArr: Array<{
        replace: string;
        key: string;
        value: string;
      }> = [];
      StringUtil.getAllStringBetween('class="', '"', page.js.src).forEach(c => {
        if (!clsArr.find(e => e.key === c)) {
          clsArr.push({
            replace: c,
            key: StringUtil.escapeRegExp(c),
            value: c,
          });
        }
      });
      StringUtil.getAllStringBetween('class",', ')', page.js.src).forEach(c => {
        if (!clsArr.find(e => e.key === c)) {
          clsArr.push({
            replace: c,
            key: StringUtil.escapeRegExp(c),
            value: c,
          });
        }
      });
      for (const i in clsArr) {
        page.css.cls.forEach(cls => {
          clsArr[i].value = clsArr[i].value
            .replace(new RegExp(`"${cls.key}"`, 'g'), `"${cls.value}"`)
            .replace(new RegExp(`"${cls.key} `, 'g'), `"${cls.value} `)
            .replace(new RegExp(` ${cls.key} `, 'g'), ` ${cls.value} `)
            .replace(new RegExp(` ${cls.key}"`, 'g'), ` ${cls.value}"`);
        });
      }
      clsArr.forEach(ca => {
        while (true) {
          const old = '' + page.js.src;
          page.js.src = page.js.src.replace(ca.replace, ca.value);
          if (page.js.src === old) {
            break;
          }
        }
      });
      // console.log(clsArr);
    }
    // INJECT CSS INTO SVELTE BUNDLE
    if (page.js.var.find(v => v.key === '__css__')) {
      page.js.var = page.js.var.map(v => {
        if (v.key === '__css__') {
          v.value = page.css.src.replace(/"/g, '\\"');
        }
        return v;
      });
    } else {
      page.js.var.push({
        key: '__css__',
        value: page.css.src.replace(/"/g, '\\"'),
      });
    }
    // INJECT JS VARIABLES
    page.js.var.forEach(v => {
      page.js.src = page.js.src.replace(new RegExp(v.key, 'g'), v.value);
    });
    // CREATE PAGES
    if (templates && templates.length > 0) {
      // tslint:disable-next-line: forin
      for (const i in templates) {
        const template = templates[i];
        const p: Page = PageFactory.fromIPage(JSON.parse(JSON.stringify(page)));
        if (template.path.endsWith('/index.html')) {
          p.location.path = template.path;
        } else {
          p.location.path = path.join(template.path, '/index.html');
        }
        if (process.env.ORIGIN) {
          p.setHtmlVar(
            '__pageUrl__',
            `${process.env.ORIGIN}${p.location.path.replace(
              '/index.html',
              '',
            )}`,
          );
        } else {
          p.setHtmlVar(
            '__pageUrl__',
            p.location.path.replace('/index.html', ''),
          );
        }
        template.var.forEach(v => {
          p.html.src = p.html.src.replace(new RegExp(v.key, 'g'), v.value);
          p.js.src = p.js.src.replace(new RegExp(v.key, 'g'), v.value);
        });
        p.html.var = p.html.var.map(v => {
          if (v.key === '{{__script__}}') {
            v.value = p.js.src;
          }
          return v;
        });
        p.html.var.forEach(v => {
          p.html.src = p.html.src.replace(new RegExp(v.key, 'g'), v.value);
        });
        template.var.forEach(v => {
          p.html.src = p.html.src.replace(new RegExp(v.key, 'g'), v.value);
        });
        pages.push(p);
      }
    } else {
      if (process.env.ORIGIN) {
        page.setHtmlVar(
          '__pageUrl__',
          `${process.env.ORIGIN}${page.location.path.replace(
            '/index.html',
            '',
          )}`,
        );
      } else {
        page.setHtmlVar(
          '__pageUrl__',
          page.location.path.replace('/index.html', ''),
        );
      }
      page.html.var = page.html.var.map(v => {
        if (v.key === '{{__script__}}') {
          v.value = page.js.src;
        }
        return v;
      });
      page.html.var.forEach(v => {
        page.html.src = page.html.src.replace(new RegExp(v.key, 'g'), v.value);
      });
      pages.push(page);
    }
    for (const i in pages) {
      Builder.fixErrors(pages[i]);
    }
    return pages;
  }

  public static fixErrors(page: Page) {
    let index = page.html.src.indexOf('{__script__}&');
    const scope = 20;
    if (index !== -1) {
      // console.log(page.html.src.substring(index - scope, index + scope));
      page.html.src = page.html.src.replace(/{__script__}&/g, '');
    }
    index = page.html.src.indexOf('prototype.=');
    if (index !== -1) {
      // console.log(page.html.src.substring(index - scope, index + scope));
      page.html.src = page.html.src.replace(/prototype\.=/g, 'prototype=');
      page.js.src = page.js.src.replace(/prototype\.=/g, 'prototype=');
    }
    index = page.html.src.indexOf('.)');
    if (index !== -1) {
      // console.log(page.html.src.substring(index - scope, index + scope));
      page.html.src = page.html.src.replace(/\.\)/g, ')');
      page.js.src = page.js.src.replace(/\.\)/g, ')');
    }
    index = page.html.src.indexOf('!//.test(');
    if (index !== -1) {
      page.html.src = page.html.src.replace(
        /!\/\/\.test\(/g,
        '!/^\\s*$/.test(',
      );
      page.js.src = page.js.src.replace(/!\/\/\.test\(/g, '!/^\\s*$/.test(');
    }
  }
}
