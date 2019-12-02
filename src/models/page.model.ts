import { IPage, PageType, KeyValue, PageCss } from '../interfaces';

export class Page implements IPage {
  constructor(
    public id: string,
    public createdAt: number,
    public updatedAt: number,
    public type: PageType,
    public name: string,
    public location: {
      path: string;
      var: KeyValue[];
    },
    public html?: {
      src: string;
      var: KeyValue[];
    },
    public js?: {
      src: string;
      var: KeyValue[];
    },
    public css?: PageCss,
  ) {}

  public setJsVar(key: string, value: string) {
    const v = this.js.var.find(e => e.key === key);
    if (v) {
      this.js.var.forEach(e => {
        if (e.key === key) {
          e.value = value;
        }
      });
    } else {
      this.js.var.push({
        key,
        value,
      });
    }
  }

  public setHtmlVar(key: string, value: string) {
    const v = this.html.var.find(e => e.key === key);
    if (v) {
      this.html.var.forEach(e => {
        if (e.key === key) {
          e.value = value;
        }
      });
    } else {
      this.html.var.push({
        key,
        value,
      });
    }
  }
}
