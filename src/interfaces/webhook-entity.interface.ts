import { KeyValue } from './key-value.interface';

export interface WebhookPayload {
  js?: {
    var: KeyValue[];
  };
  css?: {
    var: KeyValue[];
  };
  html?: {
    var: KeyValue[];
  };
  customPool?: any;
}

export interface WebhookEntity {
  apiKey: string;
  nonce: string;
  timestamp: number;
  page: string;
  signature: string;
  payload: string;
}
