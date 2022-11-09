type Result = unknown;

type WhateverUnderlayingDatabaseLibrary = {
  connect: () => Promise<void>;
  query: (sql: string) => Promise<Result>;
}

type DatabaseClient<S> = { readonly _S: S, readonly client: WhateverUnderlayingDatabaseLibrary };

type Closed = { readonly ConnectionNotOpened: unique symbol };
type Opened = { readonly ConnectionNotOpened: unique symbol };
type InTransaction = { readonly ConnectionNotOpened: unique symbol };

type DatabaseClientState = Closed | Opened | InTransaction;

const unsafeConvert = 
  <A extends DatabaseClientState, B extends DatabaseClientState>(fa: DatabaseClient<A>): DatabaseClient<B> => 
    fa as unknown as DatabaseClient<B>;

const openConnection = async (db: DatabaseClient<Closed>): Promise<DatabaseClient<Opened>> => {
  await db.client.connect();
  return unsafeConvert(db);
}

const beginTransaction = async (db: DatabaseClient<Opened>): Promise<DatabaseClient<InTransaction>> => {
  await db.client.query('BEGIN');
  return unsafeConvert(db);
}

const commitTransaction = async (db: DatabaseClient<InTransaction>): Promise<DatabaseClient<Opened>> => {
  await db.client.query('COMMIT');
  return unsafeConvert(db);
}

const rollbackTransaction = async (db: DatabaseClient<InTransaction>): Promise<DatabaseClient<Opened>> => {
  await db.client.query('COMMIT');
  return unsafeConvert(db);
}

const query = async <T extends InTransaction | Opened>(sql: string, db: DatabaseClient<T>): Promise<[Result, DatabaseClient<T>]> => {
  const result = await db.client.query(sql);
  return [result, unsafeConvert(db)];
}

const exampleProgram1 = async (db: DatabaseClient<Closed>) => {
  const openedDb = await openConnection(db);
  rollbackTransaction(openedDb);
};

const exampleProgram2 = async (db: DatabaseClient<Closed>) => {
  const result = await query('SELECT * FROM test;', db);
};
