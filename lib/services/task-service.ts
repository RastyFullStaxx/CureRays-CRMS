import { getTasks } from "@/lib/module-data";

export const taskService = {
  listTasks() {
    return getTasks();
  },
  listByQueue(queue: "MY_TASKS" | "TEAM_TASKS" | "UNASSIGNED" | "SIGNATURES" | "OVERDUE" | "COMPLETED") {
    const tasks = getTasks();
    if (queue === "SIGNATURES") {
      return tasks.filter((task) => task.type === "SIGN_DOCUMENT" || task.title.toLowerCase().includes("sign"));
    }
    if (queue === "OVERDUE") {
      return tasks.filter((task) => task.status === "OVERDUE" || task.priority === "URGENT");
    }
    if (queue === "COMPLETED") {
      return tasks.filter((task) => ["COMPLETED", "SIGNED", "CLOSED"].includes(task.status));
    }
    if (queue === "UNASSIGNED") {
      return tasks.filter((task) => !task.assignedUserId);
    }
    return tasks;
  }
};
