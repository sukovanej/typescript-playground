"use strict";
const unsafeConvert = (fa) => fa;
const openConnection = async (db) => {
    await db.client.connect();
    return unsafeConvert(db);
};
const beginTransaction = async (db) => {
    await db.client.query('BEGIN');
    return unsafeConvert(db);
};
const commitTransaction = async (db) => {
    await db.client.query('COMMIT');
    return unsafeConvert(db);
};
const rollbackTransaction = async (db) => {
    await db.client.query('COMMIT');
    return unsafeConvert(db);
};
const query = async (sql, db) => {
    const result = await db.client.query(sql);
    return [result, unsafeConvert(db)];
};
const exampleProgram1 = async (db) => {
    const openedDb = await openConnection(db);
    rollbackTransaction(openedDb);
};
const exampleProgram2 = async (db) => {
    const result = await query('SELECT * FROM test;', db);
};
