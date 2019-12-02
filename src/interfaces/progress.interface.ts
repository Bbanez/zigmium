export interface Progress {
  time: {
    offset: number;
    doneIn: number;
  };
  static: {
    page: {
      count: number;
      done: number;
    };
    stats: Array<{
      name: string;
      timeDelta: number;
    }>;
  };
  template: {
    page: {
      count: number;
      done: number;
    };
    stats: Array<{
      name: string;
      timeDelta: number;
    }>;
  };
}
