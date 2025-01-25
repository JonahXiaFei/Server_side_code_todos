// Import required modules
import express from "express"; // Web framework for creating server and APIs
import Database from "better-sqlite3"; // SQLite database wrapper
import cors from "cors"; // Middleware to enable Cross-Origin Resource Sharing
import env from "dotenv"; // Load environment variables from a .env file

// Load environment variables
env.config();

// Initialize the SQLite database
const db = new Database("ToDo.db"); // Connects to the database file 'ToDo.db'

// Initialize the Express application
const app = express();

// Middleware to parse JSON request bodies
app.use(express.json());

// Configure CORS middleware
app.use(
  cors({
    origin: "https://client-side-todos.onrender.com", // Allow only requests from this domain
    methods: ["GET", "POST", "PATCH", "DELETE"], // Specify allowed HTTP methods
  })
);

// Define the root route
app.get("/", (req, res) => {
  res.send("Hello Word"); // Responds with a simple message
});

// Fetch all todos with optional sorting
app.get("/api/todos", (req, res) => {
  let query = `SELECT * FROM todos`; // Base query to fetch all todos
  const sort = req.query.sort; // Get the 'sort' query parameter
  if (sort === "asc") {
    query += ` ORDER BY title ASC`; // Sort by title in ascending order
  } else if (sort === "desc") {
    query += ` ORDER BY title DESC`; // Sort by title in descending order
  }
  const todo = db.prepare(query).all(); // Execute the query and fetch results
  res.json(todo); // Send the fetched todos as JSON response
});

// Fetch todos within a date range
app.get("/api/todos/:startDate/:endDate", (req, res) => {
  const { startDate, endDate } = req.params; // Extract date range from URL parameters

  try {
    const query = `
      SELECT *
      FROM todos
      WHERE date BETWEEN ? AND ?
      ORDER BY date;
    `;
    const statement = db.prepare(query); // Prepare the SQL query
    const rows = statement.all(startDate, endDate); // Execute query with parameters
    res.json(rows); // Send the results as JSON
  } catch (err) {
    console.error("Error executing query:", err.message); // Log errors
    res.status(500).send("Internal Server Error"); // Send error response
  }
});

// Fetch a specific todo by ID
app.get("/api/todos/:id", (req, res) => {
  let id = parseInt(req.params.id); // Parse ID from URL parameter
  let query = `SELECT * FROM todos WHERE id = ?`; // SQL query to fetch by ID
  const item = db.prepare(query).get(id); // Execute query
  res.send(item); // Send the fetched todo as response
});

// Add a new todo
app.post("/api/todos", (req, res) => {
  const { title, description, priority, date } = req.body; // Extract fields from request body
  let query = `INSERT INTO todos (title, description, priority, date) VALUES (?, ?, ?, ?)`; // SQL insert query
  const insertResult = db
    .prepare(query)
    .run(title, description, priority, date); // Execute insert
  const newItemId = insertResult.lastInsertId; // Get the ID of the new item
  res.send(newItemId); // Respond with the new item's ID
});

// Delete a todo by ID
app.delete("/api/todos/:id", (req, res) => {
  let parseId = parseInt(req.params.id); // Parse ID from URL parameter
  const findToDelete = db
    .prepare(`DELETE FROM todos WHERE id = ?`)
    .run(parseId); // Execute delete query
  if (findToDelete) {
    res.status(200).send({ msg: "The item has been deleted." }); // Success response
  } else {
    res.status(404).send({ msg: "Bad request" }); // Error response if item not found
  }
});

// Update a specific todo by ID
app.patch("/api/todos/:id", (req, res) => {
  let parseId = parseInt(req.params.id); // Parse ID from URL parameter
  const { title, description, priority, date } = req.body; // Extract fields from request body
  const queryToDos = db.prepare(`SELECT * FROM todos WHERE id=?`).get(parseId); // Fetch the existing todo
  if (!queryToDos) {
    return res.status(404).send({
      msg: `Todo item with ID ${parseId} not found.`, // Respond if item not found
    });
  }
  if (!title && !description && !priority && !date) {
    return res.status(404).send({
      msg: "Please provide at least one field to update: title, description, priority, or date.", // Respond if no fields are provided
    });
  }

  // Use existing values if no updates provided
  const newTitle = title || queryToDos.title;
  const newDescription = description || queryToDos.description;
  const newPriority = priority || queryToDos.priority;
  const newDate = date || queryToDos.date;

  const result = db
    .prepare(
      `UPDATE todos SET title=?, description=?, priority=?, date=? WHERE id=?`
    )
    .run(newTitle, newDescription, newPriority, newDate, parseId); // Execute update query

  res.status(200).send({
    msg: "Todo item updated successfully.", // Success response
    result: result, // Include update result
  });
});

// Middleware to log each request
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.url}`); // Log HTTP method and URL
  next(); // Pass control to the next middleware or route
});

// Start the server
const PORT = process.env.PORT || 5725; // Use environment variable or default port
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`); // Log the server URL
});
