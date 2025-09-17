declare module 'better-sqlite3' {
  interface DatabaseOptions {
    readonly?: boolean;
    fileMustExist?: boolean;
    memory?: boolean;
    verbose?: (...args: any[]) => void;
  }

  interface Statement {
    run(...params: any[]): any;
    get(...params: any[]): any;
    all(...params: any[]): any[];
  }

  class Database {
    constructor(path: string, options?: DatabaseOptions);
    prepare(sql: string): Statement;
    exec(sql: string): void;
    close(): void;
  }

  const BetterSqlite3: typeof Database;
  export = BetterSqlite3;
}