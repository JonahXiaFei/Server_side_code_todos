import Database from "better-sqlite3";

const db = new Database("ToDo.db");

const createTable = `
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL,
    date DATETIME NOT NULL
  )
`;

db.exec(createTable);
// close
db.close();
