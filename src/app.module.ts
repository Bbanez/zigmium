import * as path from 'path';
import * as express from 'express';
import {
  Application,
  BodyParserMiddleware,
  RequestLoggerMiddleware,
  CorsMiddleware,
  Logger,
  Middleware,
  ExceptionHandlerMiddleware,
} from 'purple-cheetah';
import { AppController } from './app.controller';
import { Build } from './build';
import { ExceptionHandler } from 'purple-cheetah/interfaces/exception-handler.interface';
import { StaticContent } from './util/static-content';
import { FSUtil } from './util';
import { Page } from './models/page.model';
import { PageServeMiddleware } from './middleware/page-serve.middleware';

@Application({
  port: parseInt(process.env.PORT, 10),
  controllers: [new AppController()],
  middleware: [
    new BodyParserMiddleware(),
    new CorsMiddleware(),
    new RequestLoggerMiddleware(),
    new PageServeMiddleware(),
  ],
  exceptionHandlers: [],
})
export class App {
  private app: express.Application;
  private logger: Logger;
  private controllers: any[];
  private middleware: Middleware[];
  private exceptionHandlers: ExceptionHandler[];
  private static pages: Page[] = [];
  public listen: () => void;

  constructor() {
    this.logger = new Logger('App');
    Logger.filePath = path.join(process.env.PROJECT_ROOT, '/app.log');

    this.controllers.forEach(controller => {
      controller.initRouter();
    });

    this.initializeMiddleware(this.middleware);
    this.initializeControllers(this.controllers);
  }

  public setPages(pages: Page[]) {
    App.pages = pages;
  }

  private initializeMiddleware(middleware: Middleware[]) {
    middleware.forEach(e => {
      if (e.uri) {
        if (e.handler instanceof Array) {
          e.handler.forEach(h => {
            this.app.use(e.uri, h);
          });
        } else {
          this.app.use(e.uri, e.handler);
        }
      } else {
        this.app.use(e.handler);
      }
    });
  }

  private async initializeControllers(controllers: any[]) {
    if (process.env.STATE === 'DEV') {
      this.app.use(
        express.static(path.join(process.env.PROJECT_ROOT, '/static')),
      );
    } else {
      this.app.use(
        express.static(path.join(process.env.PROJECT_ROOT, '/public')),
      );
    }
    controllers.forEach(controller => {
      this.app.use(controller.baseUri, controller.router);
      this.logger.info('.controller', `[${controller.name}] mapping done.`);
    });
    this.exceptionHandlers.forEach(e => {
      this.app.use(e.handler);
      this.logger.info('.exceptionHandler', `[${e.name}] mapping done.`);
    });
    this.app.use(new ExceptionHandlerMiddleware().handler);
    if (process.env.STATE === 'DEV') {
      this.app.use(
        '/',
        (request: express.Request, response: express.Response) => {
          const page = PageServeMiddleware.pages.find(
            p => '/404/index.html' === p.location.path,
          );
          if (page) {
            response.status(404);
            response.setHeader('Content-Type', 'text/html');
            response.send(page.html.src);
            response.end();
          } else {
            response.status(404);
            response.send(`Page not found - This is 404 page for development.`);
            response.end();
          }
        },
      );
    } else {
      if (await FSUtil.exist('/public/404.html')) {
        this.app.use(
          '/',
          (request: express.Request, response: express.Response) => {
            response.status(404);
            response.sendFile(
              path.join(process.env.PROJECT_ROOT, '/public/404.html'),
            );
          },
        );
      } else {
        this.app.use(
          '/',
          (request: express.Request, response: express.Response) => {
            response.status(404);
            response.sendFile(
              path.join(process.env.PROJECT_ROOT, '/public/404/index.html'),
            );
          },
        );
      }
    }
  }
}
