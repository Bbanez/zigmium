// tslint:disable-next-line: no-var-requires
const { Remarkable } = require('remarkable');
import * as YAML from 'yamljs';
import { Markdown } from '../interfaces/markdown.interface';
import { StringUtil } from './string-util';
import { FSUtil } from './fs-util';

export class MDHelper {
  private static remarkable = new Remarkable();

  public static init(options: Remarkable.Options) {
    this.remarkable = new Remarkable(options);
  }

  public static async toObject(root: string): Promise<Markdown> {
    const md: string = (await FSUtil.read(root)).toString();
    const metaAsString = StringUtil.getAllStringBetween('---', '---', md)[0];
    // metaAsString = metaAsString.substring(3, metaAsString.length - 3);
    // console.log(metaAsString);
    return {
      meta: YAML.parse(metaAsString.substring(3, metaAsString.length - 3)),
      content: md.replace(metaAsString, ''),
    };
  }

  public static parseContent(content: string): string {
    return this.remarkable.render(content);
  }
}
