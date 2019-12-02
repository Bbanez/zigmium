import { KeyValue } from './key-value.interface';
import { PageCss } from './page-css.interface';

export enum PageType {
  STATIC = 'STATIC',
  TEMPLATE = 'TEMPLATE',
  OTHER = 'OTHER',
}

export interface IPage {
  id: string;
  createdAt: number;
  updatedAt: number;
  type: PageType;
  name: string;
  html?: {
    src: string;
    var: KeyValue[];
  };
  js?: {
    src: string;
    var: KeyValue[];
  };
  css?: PageCss;
  location: {
    path: string;
    var: KeyValue[];
  };
}
