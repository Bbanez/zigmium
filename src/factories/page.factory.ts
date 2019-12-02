import * as path from 'path';
import * as uuid from 'uuid';
import { FileTree } from '../interfaces/file-tree.interface';
import { IPage, PageType } from '../interfaces/page.interface';
import { Page } from '../models/page.model';

export class PageFactory {
  public static fromIPage(iPage: IPage): Page {
    return new Page(
      iPage.id,
      iPage.createdAt,
      iPage.updatedAt,
      iPage.type,
      iPage.name,
      iPage.location,
      iPage.html,
      iPage.js,
      iPage.css,
    );
  }

  public static fromFileTree(fileTree: FileTree[], rootPath?: string): Page[] {
    if (!rootPath) {
      rootPath = '/';
    }
    const pages: Page[] = [];
    for (const i in fileTree) {
      if (fileTree[i].children) {
        PageFactory.fromFileTree(
          fileTree[i].children,
          path.join(rootPath, fileTree[i].name),
        ).forEach(page => {
          pages.push(page);
        });
      } else {
        if (fileTree[i].name === 'index.svelte') {
          pages.push(
            this.fromIPage({
              id: uuid.v4(),
              createdAt: Date.now(),
              updatedAt: Date.now(),
              type: PageType.OTHER,
              name: rootPath,
              location: {
                path: path.join(rootPath, 'index.html'),
                var: [],
              },
            }),
          );
        }
      }
    }
    return pages;
  }
}
