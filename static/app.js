const apiUrl = "http://localhost:7525/api/todos";

document.getElementById("filterButton").addEventListener("click", async () => {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  if (!startDate || !endDate) {
    alert("Please select both start and end dates.");
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/${startDate}/${endDate}`);
    const todos = await response.json();
    todosContainer.innerHTML = todos
      .map(
        (todo) => `
      <div class="todo">
        <h3>${todo.title}</h3>
        <p>${todo.description}</p>
        <p>Priority: ${todo.priority}</p>
        <p>Date: ${todo.date}</p>
        <div class="actions">
          <button onclick="deleteTodo(${todo.id})">Delete</button>
          <button onclick="editTodo(${todo.id})">Edit</button>
        </div>
      </div>
    `
      )
      .join("");
  } catch (error) {
    console.error("Failed to fetch todos by date range:", error);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("todoForm");
  const todosContainer = document.getElementById("todosContainer");

  const fetchTodos = async () => {
    try {
      const response = await fetch(apiUrl);
      const todos = await response.json();
      todosContainer.innerHTML = todos
        .map(
          (todo) => `
        <div class="todo">
          <h3>${todo.title}</h3>
          <p>${todo.description}</p>
          <p>Priority: ${todo.priority}</p>
          <p>Date: ${todo.date}</p>
          <div class="actions">
            <button onclick="deleteTodo(${todo.id})">Delete</button>
            <button onclick="editTodo(${todo.id})">Edit</button>
          </div>
        </div>
      `
        )
        .join("");
    } catch (error) {
      console.error("Failed to fetch todos:", error);
    }
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("title").value;
    const description = document.getElementById("description").value;
    const priority = document.getElementById("priority").value;
    const date = document.getElementById("date").value;

    await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description, priority, date }),
    });

    form.reset();
    fetchTodos();
  });

  window.deleteTodo = async (id) => {
    await fetch(`${apiUrl}/${id}`, { method: "DELETE" });
    fetchTodos();
  };

  window.editTodo = async (id) => {
    const newTitle = prompt("Enter new title:");
    const newDescription = prompt("Enter new description:");
    const newPriority = prompt("Enter new priority:");
    const newDate = prompt("Enter new date:");

    if (newTitle || newDescription || newPriority || newDate) {
      await fetch(`${apiUrl}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDescription,
          priority: newPriority,
          date: newDate,
        }),
      });
      fetchTodos();
    }
  };
  fetchTodos();
});
