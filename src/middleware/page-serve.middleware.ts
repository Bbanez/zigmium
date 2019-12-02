import { Middleware, Logger, AppLogger } from 'purple-cheetah';
import { RequestHandler, Request, Response, NextFunction } from 'express';
import { Page } from '../models/page.model';

export class PageServeMiddleware implements Middleware {
  @AppLogger(PageServeMiddleware)
  private static logger: Logger;
  public static pages: Page[] = [];

  public uri: string = '/';
  public handler: RequestHandler = (
    request: Request,
    response: Response,
    next: NextFunction,
  ) => {
    if (process.env.STATE === 'DEV') {
      let page: Page;
      if (request.originalUrl.endsWith('/')) {
        page = PageServeMiddleware.pages.find(
          p =>
            request.originalUrl === p.location.path.replace('index.html', ''),
        );
      } else {
        page = PageServeMiddleware.pages.find(
          p =>
            request.originalUrl === p.location.path.replace('/index.html', ''),
        );
      }
      if (page) {
        response.status(200);
        response.setHeader('Content-Type', 'text/html');
        response.send(page.html.src);
        response.end();
      } else {
        next();
      }
    } else {
      next();
    }
  }
}
