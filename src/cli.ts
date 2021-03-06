import * as arg from 'arg';
import * as path from 'path';
import * as fs from 'fs';

const rootPath = 'zigmium';

function parseArgsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--dev': Boolean,
      '--serve': Boolean,
      '--build': Boolean,
      '-d': '--dev',
      '-s': '--serve',
      '-b': '--build',
    },
    {
      argv: rawArgs.slice(2),
    },
  );
  return {
    dev: args['--dev'] || false,
    serve: args['--serve'] || false,
    build: args['--build'] || false,
  };
}

export function cli(args) {
  const options = parseArgsIntoOptions(args);
  process.env.PROJECT_ROOT = process.cwd();
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
  if (options.dev) {
    const App = require(`${rootPath}/app.module.js`);
    const app = new App.App();
    app.listen();
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
    let startWatching: boolean = false;
    setTimeout(() => {
      startWatching = true;
    }, 1000);
    const chokidar = require('chokidar');
    const watcher = chokidar.watch(path.join(process.env.PROJECT_ROOT, 'src'), {
      ignored: /^\./,
      persistent: true,
    });
    watcher
      .on('add', location => {
        if (startWatching === true) {
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
      })
      .on('change', location => {
        if (startWatching === true) {
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
      })
      .on('unlink', location => {
        if (startWatching === true) {
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
      })
      .on('error', error => {
        // tslint:disable-next-line:no-console
        console.error('Error happened', error);
      });
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
    const App = require(`${rootPath}/app.module.js`);
    const app = new App.App();
    app.listen();
  }
}
