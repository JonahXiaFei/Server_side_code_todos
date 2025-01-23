import Database from "better-sqlite3";

const db = new Database("ToDo.db");

// Initialize the todos table if it doesn't exist
const initializeTable = () => {
  const createTable = `
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority TEXT NOT NULL,
    date DATETIME NOT NULL
  )
`;
  db.prepare(createTable).run();
};

initializeTable(); // Call to ensure the table exists
// close
