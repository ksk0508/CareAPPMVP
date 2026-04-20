import client from "./client";

export const getDailyTasks = (date) =>
  client.get(`/patients/daily-tasks?date=${date}`);

export const completeTask = (taskId, scheduledTime) =>
  client.post("/execution/complete", { taskId, scheduledTime });

export const skipTask = (taskId, scheduledTime) =>
  client.post("/execution/skip", { taskId, scheduledTime });

export const getTasks = () => client.get("/tasks");

export const createTask = (taskData) => {
  console.log("📤 TaskAPI: Sending POST /tasks with data:", taskData);
  return client.post("/tasks", taskData);
};

export const searchTasks = (searchType = "title", searchValue) =>
  client.get(`/tasks/search?${searchType}=${encodeURIComponent(searchValue)}`);

export const getTaskById = (taskId) =>
  client.get(`/tasks/${taskId}`);

export const updateTask = (taskId, taskData) =>
  client.put(`/tasks/${taskId}`, taskData);

export const deleteTask = (taskId) =>
  client.delete(`/tasks/${taskId}`);