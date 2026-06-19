const API_URL = "https://dummyjson.com/todos";

const pendingList = document.getElementById("pendingList");
const completedList = document.getElementById("completedList");
const todoInput = document.getElementById("todoInput");
const submitBtn = document.getElementById("submitBtn");

let todos = [];

async function fetchTodos() {
  try {
    const response = await fetch(API_URL);
    const data = await response.json();

    todos = data.todos;

    renderTodos();
  } catch (error) {
    console.error("Error fetching todos:", error);
  }
}

function renderTodos() {
  pendingList.innerHTML = "";
  completedList.innerHTML = "";

  todos.forEach((todo) => {
    const li = document.createElement("li");

    li.className = "todo-item";
    li.dataset.id = todo.id;

    li.innerHTML = `
      <span class="todo-text">${todo.todo}</span>

      <div class="actions">
        <button class="toggle-btn">
          ${todo.completed ? "←" : "→"}
        </button>

        <button class="edit-btn">
          Edit
        </button>

        <button class="delete-btn">
          Delete
        </button>
      </div>
    `;

    if (todo.completed) {
      completedList.appendChild(li);
    } else {
      pendingList.appendChild(li);
    }
  });
}


async function addTodo() {
  const text = todoInput.value.trim();

  if (!text) return;

  try {
    const response = await fetch(`${API_URL}/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        todo: text,
        completed: false,
        userId: 1,
      }),
    });

    const newTodo = await response.json();

    todos.unshift(newTodo);

    renderTodos();

    todoInput.value = "";
  } catch (error) {
    console.error(error);
  }
}

submitBtn.addEventListener("click", addTodo);

todoInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    addTodo();
  }
});


async function deleteTodo(id) {
  try {
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    todos = todos.filter((todo) => todo.id !== id);

    renderTodos();
  } catch (error) {
    console.error(error);
  }
}

async function toggleTodo(id) {
  const todo = todos.find((item) => item.id === id);

  if (!todo) return;

  const updatedStatus = !todo.completed;

  try {
    await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        completed: updatedStatus,
      }),
    });

    todo.completed = updatedStatus;

    renderTodos();
  } catch (error) {
    console.error(error);
  }
}


async function updateTodo(id, newText) {
  try {
    await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        todo: newText,
      }),
    });

    const todo = todos.find((item) => item.id === id);

    if (todo) {
      todo.todo = newText;
    }

    renderTodos();
  } catch (error) {
    console.error(error);
  }
}

function handleListClick(event) {
  const button = event.target;

  if (!button.matches("button")) return;

  const li = button.closest(".todo-item");
  const id = Number(li.dataset.id);

  if (button.classList.contains("delete-btn")) {
    deleteTodo(id);
    return;
  }

  if (button.classList.contains("toggle-btn")) {
    toggleTodo(id);
    return;
  }


  if (button.classList.contains("edit-btn")) {
    const textElement = li.querySelector(".todo-text");

    const currentText = textElement.textContent;

    textElement.innerHTML = `
      <input
        type="text"
        class="edit-input"
        value="${currentText}"
      />
    `;

    button.textContent = "Save";
    button.classList.remove("edit-btn");
    button.classList.add("save-btn");

    return;
  }

  if (button.classList.contains("save-btn")) {
    const input = li.querySelector(".edit-input");

    const updatedText = input.value.trim();

    if (!updatedText) return;

    updateTodo(id, updatedText);
  }
}

pendingList.addEventListener("click", handleListClick);
completedList.addEventListener("click", handleListClick);


pendingList.addEventListener("keydown", handleEditKeydown);
completedList.addEventListener("keydown", handleEditKeydown);

function handleEditKeydown(event) {
  if (
    event.key === "Enter" &&
    event.target.classList.contains("edit-input")
  ) {
    const li = event.target.closest(".todo-item");
    const id = Number(li.dataset.id);

    const updatedText = event.target.value.trim();

    if (!updatedText) return;

    updateTodo(id, updatedText);
  }
}


fetchTodos();