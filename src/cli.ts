import * as arg from 'arg';
import * as path from 'path';

const rootPath = 'zigmium';

function parseArgsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--dev': Boolean,
      '--serve': Boolean,
      '--build': Boolean,
      '--init': Boolean,
      '-d': '--dev',
      '-s': '--serve',
      '-b': '--build',
      '-i': '--init',
    },
    {
      argv: rawArgs.slice(2),
    },
  );
  return {
    dev: args['--dev'] || false,
    serve: args['--serve'] || false,
    build: args['--build'] || false,
    init: args['--init'] || false,
  };
}

export function cli(args) {
  const options = parseArgsIntoOptions(args);
  process.env.PROJECT_ROOT = path.join(__dirname, '../..');
  if (!process.env.PORT && !process.env.ORIGIN) {
    process.env.PORT = '1290';
    process.env.ORIGIN = `http://localhost:${process.env.PORT}`;
  } else if (process.env.PORT && !process.env.ORIGIN) {
    process.env.ORIGIN = `http://localhost:${process.env.PORT}`;
  }
  if (options.dev) {
    process.env.STATE = 'DEV';
  } else if (options.serve) {
    process.env.STATE = 'SERVE';
  } else {
    process.env.STATE = 'BUILD';
  }
  if (options.dev || options.serve) {
    const App = require(`${rootPath}/app.module.js`);
    const app = new App.App();
    app.listen();
  } else {
    const { StaticContent } = require(`${rootPath}/util/static-content.js`);
    const { Build } = require(`${rootPath}/build.js`);
    StaticContent.init().then(async () => {
      try {
        await Build.process();
        Build.progressTimer = setInterval(Build.checkProgress, 10);
      } catch (error) {
        Build.logger.error('', error);
        clearInterval(Build.progressTimer);
      }
    });
  }
}
