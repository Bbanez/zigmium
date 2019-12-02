import { KeyValue } from '../interfaces/key-value.interface';

export class JSUtil {
  public static pullVariables(src: string): KeyValue[] {
    const rules = {
      var: {
        index: {
          start: 0,
          end: 0,
        },
        start: '__',
        end: '__',
      },
    };
    const vars: any = {};
    while (true) {
      rules.var.index.start = src.indexOf(rules.var.start, rules.var.index.end);
      if (rules.var.index.start === -1) {
        break;
      }
      rules.var.index.end = src.indexOf(
        rules.var.end,
        rules.var.index.start + rules.var.start.length,
      );
      if (rules.var.index.end === -1) {
        break;
      }
      rules.var.index.end = rules.var.index.end + rules.var.end.length;
      if (rules.var.index.end - rules.var.index.start < 64) {
        vars[src.substring(rules.var.index.start, rules.var.index.end)] = '';
      }
    }
    const keyValues: KeyValue[] = [];
    // tslint:disable-next-line:forin
    for (const key in vars) {
      if (/^[a-zA-Z]+$/i.test(key.replace(/__/g, '')) === true) {
        keyValues.push({
          key,
          value: '',
        });
      }
    }
    return keyValues;
  }
}
