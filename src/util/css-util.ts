import { KeyValue } from '../interfaces/key-value.interface';

export class CssUtil {
  public static pullVariablesAndClasses(
    src: string,
  ): {
    var: KeyValue[];
    cls: KeyValue[];
    src: string;
  } {
    const rawClasses = src
      .replace(/}\./g, '}\n.____')
      .replace(/} \./g, '\n.____')
      .split('\n.____')
      .map(e => {
        const index = e.indexOf('{');
        if (index === -1) {
          return `.${e}`;
        } else {
          return `.${e.substring(0, index)}`;
        }
      });
    const classes: any = {};
    const svelteAdditions: any = {};
    const replaceSet = CssUtil.getReplaceSet();
    let counter: number = 1;
    let id: string = 'x';
    rawClasses.forEach((cls, i) => {
      if (i > 0) {
        cls.split(',').forEach(multiClass => {
          multiClass.split(' ').forEach(nestedClass => {
            const svelteSplit = nestedClass.split('.svelte-');
            let classPart = svelteSplit[0];
            let sveltePart: string = `.svelte-${svelteSplit[1]}`;
            const svelteClassDecorator: string[] = sveltePart.split(':');
            if (svelteClassDecorator.length !== 1) {
              sveltePart = svelteClassDecorator[0];
            }
            const classDecorator: string[] = classPart.split(':');
            if (classDecorator.length !== 1) {
              classPart = classDecorator[0];
            }
            svelteAdditions[sveltePart.replace('.', '')] = `s${id}`;
            if (classPart.indexOf('.') !== -1) {
              classes[`${classPart.split('.')[1]}`] = `${id}`;
            }
            counter = counter + 1;
            id = `${counter}`;
            replaceSet.forEach(e => {
              id = id.replace(e.regex, e.value);
            });
          });
        });
      }
    });
    const rules = {
      cls: {
        index: {
          start: 0,
          end: 0,
        },
        start: '.cls_',
        end: '{',
      },
      var: {
        index: {
          start: 0,
          end: 0,
        },
        start: '--',
        end: ';',
        split: ': ',
      },
    };
    const naming: {
      var: KeyValue[];
      cls: KeyValue[];
    } = {
      cls: [],
      var: [],
    };
    let cssStartVarIndex: number = src.indexOf('/*{{__START_VAR__}}');
    if (cssStartVarIndex !== -1) {
      cssStartVarIndex = cssStartVarIndex + '/*{{__START_VAR__}}'.length;
      let cssEndVarIndex: number = src.indexOf('{{__END_VAR__}}*/');
      if (cssEndVarIndex !== -1) {
        const cssVars = src.substring(cssStartVarIndex, cssEndVarIndex);
        while (true) {
          rules.var.index.start = cssVars.indexOf(
            rules.var.start,
            rules.var.index.end,
          );
          if (rules.var.index.start === -1) {
            break;
          }
          rules.var.index.end = cssVars.indexOf(
            rules.var.end,
            rules.var.index.start,
          );
          if (rules.var.index.end === -1) {
            break;
          }
          const parts: string[] = cssVars
            .substring(rules.var.index.start, rules.var.index.end)
            .split(rules.var.split);
          if (parts.length === 2) {
            naming.var.push({
              key: `var(${parts[0]})`,
              value: parts[1],
            });
          }
        }
        cssStartVarIndex = cssStartVarIndex - '/*{{__START_VAR__}}'.length;
        cssEndVarIndex = cssEndVarIndex + '{{__END_VAR__}}*/'.length;
        src = src.replace(src.substring(cssStartVarIndex, cssEndVarIndex), '');
      }
    }
    for (const key in classes) {
      naming.cls.push({
        key,
        value: classes[key],
      });
    }
    for (const key in svelteAdditions) {
      naming.cls.push({
        key,
        value: svelteAdditions[key],
      });
    }
    naming.var = naming.var.sort((a, b) => {
      if (a.key.length > b.key.length) {
        return -1;
      } else if (a.key.length < b.key.length) {
        return 1;
      }
      return 0;
    });
    naming.cls = naming.cls.sort((a, b) => {
      if (a.key.length > b.key.length) {
        return -1;
      } else if (a.key.length < b.key.length) {
        return 1;
      }
      return 0;
    });
    return {
      var: naming.var,
      cls: naming.cls,
      src,
    };
  }

  private static getRandomInt(max: number) {
    const min = Math.ceil(0);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private static getReplaceSet(): Array<{
    regex: RegExp;
    value: string;
  }> {
    const charSet = 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM'
      .split('')
      .sort(() => {
        return 0.5 - Math.random();
      })
      .join('');
    const startSetFrom = CssUtil.getRandomInt(charSet.length - 10);
    return [
      {
        regex: /0/g,
        value: charSet.charAt(startSetFrom),
      },
      {
        regex: /1/g,
        value: charSet.charAt(startSetFrom + 1),
      },
      {
        regex: /2/g,
        value: charSet.charAt(startSetFrom + 2),
      },
      {
        regex: /3/g,
        value: charSet.charAt(startSetFrom + 3),
      },
      {
        regex: /4/g,
        value: charSet.charAt(startSetFrom + 4),
      },
      {
        regex: /5/g,
        value: charSet.charAt(startSetFrom + 5),
      },
      {
        regex: /6/g,
        value: charSet.charAt(startSetFrom + 6),
      },
      {
        regex: /7/g,
        value: charSet.charAt(startSetFrom + 7),
      },
      {
        regex: /8/g,
        value: charSet.charAt(startSetFrom + 8),
      },
      {
        regex: /9/g,
        value: charSet.charAt(startSetFrom + 9),
      },
    ];
  }
}
