import express from "express";
import Database from "better-sqlite3";
import cors from "cors";
import env from "dotenv";

env.config();
const db = new Database("ToDo.db");
const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello Word");
});
app.get("/api/todos", (req, res) => {
  let query = `SELECT * FROM todos`;
  const sort = req.query.sort;
  if (sort === "asc") {
    query += ` ORDER BY title ASC`;
  } else if (sort === "desc") {
    query += ` ORDER BY title DESC`;
  }
  const todo = db.prepare(query).all();
  res.json(todo);
});
app.get("/api/todos/:startDate/:endDate", (req, res) => {
  const { startDate, endDate } = req.params;

  try {
    // Prepare and execute the query
    const query = `
      SELECT *
      FROM todos
      WHERE date BETWEEN ? AND ?
      ORDER BY date;
    `;
    const statement = db.prepare(query);
    const rows = statement.all(startDate, endDate);

    res.json(rows); // Send the results
  } catch (err) {
    console.error("Error executing query:", err.message);
    res.status(500).send("Internal Server Error");
  }
});
app.get("/api/todos/:id", (req, res) => {
  let id = parseInt(req.params.id);
  let query = `SELECT * FROM todos WHERE id = ?`;
  const item = db.prepare(query).get(id);
  res.send(item);
});

app.post("/api/todos", (req, res) => {
  const { title, description, priority, date } = req.body;
  let query = `INSERT INTO todos (title, description, priority, date) VALUES (?, ?, ?, ?)`;
  const insertResult = db
    .prepare(query)
    .run(title, description, priority, date);
  const newItemId = insertResult.lastInsertId;
  res.send(newItemId);
});

app.delete("/api/todos/:id", (req, res) => {
  let parseId = parseInt(req.params.id);
  const findToDelete = db
    .prepare(`DELETE FROM todos WHERE id = ?`)
    .run(parseId);
  if (findToDelete) {
    res.status(200).send({ msg: "The item has been deleted." });
  } else {
    res.status(404).send({ msg: "Bad request" });
  }
});

app.patch("/api/todos/:id", (req, res) => {
  let parseId = parseInt(req.params.id);
  const { title, description, priority, date } = req.body;
  const queryToDos = db.prepare(`SELECT * FROM todos WHERE id=?`).get(parseId);
  if (!queryToDos) {
    return res.status(404).send({
      msg: `Todo item with ID ${parseId} not found.`,
    });
  }
  if (!title && !description && !priority && !date) {
    return res.status(404).send({
      msg: "Please provide at least one field to update: title, description, priority, or date.",
    });
  }
  const newTitle = title || queryToDos.title;
  const newDescription = description || queryToDos.description;
  const newPriority = priority || queryToDos.priority;
  const newDate = date || queryToDos.date;

  const result = db
    .prepare(
      `UPDATE todos SET title=?, description=?, priority=?, date=? WHERE id=?`
    )
    .run(newTitle, newDescription, newPriority, newDate, parseId);

  res.status(200).send({
    msg: "Todo item updated successfully.",
    result: result,
  });
});

app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`);
  next();
});
const PORT = process.env.PORT || 5725;
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
