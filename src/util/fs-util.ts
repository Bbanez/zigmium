import * as path from 'path';
import * as util from 'util';
import * as fs from 'fs';
import { FileTree } from '../interfaces/file-tree.interface';

export class FSUtil {
  public static async save(
    data: string | Buffer,
    root: string,
    isAbsolute?: boolean,
  ) {
    const parts = root.split('/');
    let base: string;
    if (isAbsolute === true) {
      base = '/';
    } else {
      base = path.join(process.env.PROJECT_ROOT);
    }
    // tslint:disable-next-line: prefer-for-of
    for (let j = 0; j < parts.length; j = j + 1) {
      if (parts[j].indexOf('.') === -1) {
        base = path.join(base, parts[j]);
        try {
          if ((await util.promisify(fs.exists)(base)) === false) {
            await util.promisify(fs.mkdir)(base);
          }
        } catch (error) {
          // tslint:disable-next-line:no-console
          console.log(`Failed to create directory '${base}'`);
        }
      }
    }
    await util.promisify(fs.writeFile)(
      path.join(base, parts[parts.length - 1]),
      data,
    );
  }

  public static async mkdir(root: string, isAbsolute?: boolean) {
    const parts = root.split('/');
    let base: string;
    if (isAbsolute === true) {
      base = '/';
    } else {
      base = path.join(process.env.PROJECT_ROOT);
    }
    // tslint:disable-next-line: prefer-for-of
    for (let j = 0; j < parts.length; j = j + 1) {
      if (parts[j].indexOf('.') === -1) {
        base = path.join(base, parts[j]);
        try {
          if ((await util.promisify(fs.exists)(base)) === false) {
            await util.promisify(fs.mkdir)(base);
          }
        } catch (error) {
          // tslint:disable-next-line:no-console
          console.log(`Failed to create directory '${base}'`);
        }
      }
    }
  }

  public static async read(root: string) {
    return await util.promisify(fs.readFile)(
      path.join(process.env.PROJECT_ROOT, root),
    );
  }

  public static async exist(root: string) {
    return await util.promisify(fs.exists)(
      path.join(process.env.PROJECT_ROOT, root),
    );
  }

  public static async deleteFile(root: string) {
    const base = path.join(process.env.PROJECT_ROOT);
    await util.promisify(fs.unlink)(path.join(base, root));
  }

  public static async deleteDir(root: string) {
    const base = path.join(process.env.PROJECT_ROOT);
    await util.promisify(fs.rmdir)(path.join(base, root));
  }

  public static async rename(oldRoot: string, newRoot: string) {
    const base = path.join(process.env.PROJECT_ROOT);
    await util.promisify(fs.rename)(
      path.join(base, oldRoot),
      path.join(base, newRoot),
    );
  }

  public static async fileTree(p: string): Promise<FileTree[]> {
    const fileTree: FileTree[] = [];
    try {
      const result = await util.promisify(fs.readdir)(p);
      for (const i in result) {
        if (result[i].indexOf('.') === -1) {
          fileTree.push({
            name: result[i],
            children: await FSUtil.fileTree(path.join(p, result[i])),
          });
        } else {
          fileTree.push({ name: result[i] });
        }
      }
    } catch (error) {
      // tslint:disable-next-line:no-console
      console.log(`'${p}' does not exist.`);
    }
    return fileTree;
  }

  public static composeFileTree(fileTree: FileTree[]): string[] {
    const roots: string[] = [];
    fileTree.forEach(ft => {
      const root = ft.name;
      let childRoots: string[] = [];
      if (ft.children) {
        childRoots = FSUtil.composeFileTree(ft.children);
        if (childRoots.length === 0) {
          roots.push(root);
        } else {
          childRoots.forEach(cr => {
            roots.push(`${root}/${cr}`);
          });
        }
      }
    });
    return roots;
  }
}
