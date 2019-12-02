import * as rup from 'rollup';
import * as svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';
// tslint:disable-next-line:no-var-requires
const resolve = require('rollup-plugin-node-resolve');
// tslint:disable-next-line:no-var-requires
const commonjs = require('rollup-plugin-commonjs');
// tslint:disable-next-line: no-var-requires
const sveltePreprocess = require('svelte-preprocess');

export interface RollupResult {
  js: string;
  css: string;
}

export class Rollup {
  public static async build(config: {
    input: string;
    output: string;
  }): Promise<RollupResult> {
    const production = true;
    let cssCode: string = '';
    const rollupGenerator = await rup.rollup({
      input: config.input,
      output: {
        sourcemap: false,
        format: 'iife',
        name: 'app',
        file: `${config.output}/bundle.js`,
      },
      plugins: [
        svelte({
          preprocess: sveltePreprocess({
            scss: {
              includePaths: ['src'],
            },
            postcss: {
              plugins: [require('autoprefixer')],
            },
          }),
          css: css => {
            cssCode = css.code;
          },
        }),
        resolve({
          browser: true,
          dedupe: importee =>
            importee === 'svelte' || importee.startsWith('svelte/'),
        }),
        commonjs(),

        production && terser(),
      ],
      watch: {
        clearScreen: false,
      },
    });
    const result = await rollupGenerator.generate({
      sourcemap: true,
      format: 'iife',
      name: 'app',
      file: `${config.output}/bundle.js`,
    });
    return {
      js: result.output[0].code
        .replace(/\n/g, '')
        .replace(/\r/g, '')
        .replace(/\t/g, '')
        .replace(/  /g, ''),
      css: cssCode
        .replace(/\n/g, '')
        .replace(/\r/g, '')
        .replace(/\t/g, '')
        .replace(/  /g, ''),
    };
  }
}
