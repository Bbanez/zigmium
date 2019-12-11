import * as crypto from 'crypto';
import {
  Controller,
  Post,
  AppLogger,
  Logger,
  HttpErrorFactory,
  HttpStatus,
  ObjectUtility,
} from 'purple-cheetah';
import { Request } from 'express';
import { Build } from './build';
// tslint:disable-next-line:no-var-requires
const config = require(process.env.PROJECT_ROOT + '/zigmium-config.js');

@Controller()
export class AppController {
  @AppLogger(AppController)
  private logger: Logger;

  @Post('/webhook')
  async webhook(request: Request) {
    const error = HttpErrorFactory.simple('.webhook', this.logger);
    if (process.env.STATE !== 'DEV') {
      try {
        ObjectUtility.compareWithSchema(
          request.body,
          {
            apiKey: {
              __type: 'string',
              __required: true,
            },
            nonce: {
              __type: 'string',
              __required: true,
            },
            timestamp: {
              __type: 'number',
              __required: true,
            },
            signature: {
              __type: 'string',
              __required: true,
            },
          },
          'body',
        );
      } catch (e) {
        throw error.occurred(HttpStatus.BAD_REQUEST, e.message);
      }
      if (
        request.body.timestamp < Date.now() - 3000 ||
        request.body.timestamp > Date.now() + 3000
      ) {
        throw error.occurred(HttpStatus.FORBIDDEN, 'TIMESTAMP out of range.');
      }
      if (config && config.security && config.security instanceof Array) {
        const securityKeys: {
          key: string;
          secret: string;
        } = config.security.find(e => e.key === request.body.apiKey);
        if (!securityKeys) {
          throw error.occurred(
            HttpStatus.UNAUTHORIZED,
            'Invalid KEY was provided.',
          );
        }
        const signature = crypto
          .createHmac('sha256', securityKeys.secret)
          .update(
            request.body.nonce + securityKeys.key + request.body.timestamp,
          )
          .digest('hex');
        if (signature !== request.body.signature) {
          throw error.occurred(
            HttpStatus.UNAUTHORIZED,
            'Invalid SIGNATURE was provided.',
          );
        }
      } else {
        throw error.occurred(
          HttpStatus.UNAUTHORIZED,
          'Invalid KEY was provided.',
        );
      }
    }
    await Build.process();
    Build.progressTimer = setInterval(Build.checkProgress, 100);
    return {
      message: 'Success.',
    };
  }
}
