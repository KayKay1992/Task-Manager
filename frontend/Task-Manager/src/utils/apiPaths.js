

export const BASE_URL = import.meta.env.VITE_API_BASE_URL;

//utils /apiPaths.js
export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register", //Register a new user (admin or user)
    LOGIN: "/api/auth/login", //login a user and return a jwt token
    GET_PROFILE: "/api/auth/profile", //get logged in user details.
  },
  USERS: {
    GET_ALL_USERS: "/api/users", //get all users admin only
    GET_USER_BY_ID: (userId) => `/api/users/${userId}`,
    CREATE_USER: "/api/users", //admin create a new user
    UPDATE_USER: (userId) => `/api/users/${userId}`, //update user details
    DELETE_USER: (userId) => `/api/users/${userId}`, //delete user
  },
  TASKS: {
    GET_DASHBOARD_DATA: "/api/tasks/dashboard-data", //get dashboard data
    GET_USER_DASHBOARD_DATA: "/api/tasks/user-dashboard-data", //Get user dashboard.
    GET_ALL_TASKS: "/api/tasks", //admin and assigned user to get all tasks
    GET_TASK_BY_ID: (taskId) => `/api/tasks/${taskId}`, //get task by id
    CREATE_TASK: "/api/tasks", //create task admin
    UPDATE_TASK: (taskId) => `/api/tasks/${taskId}`, //update task details
    DELETE_TASK: (taskId) => `/api/tasks/${taskId}`, //admin to delete a task
    UPDATE_TASK_STATUS: (taskId) => `/api/tasks/${taskId}/status`,
    UPDATE_TODO_CHECKLIST: (taskId) => `/api/tasks/${taskId}/todo`,
  },
  REPORTS: {
    EXPORT_TASKS: "/api/reports/export/tasks", //download all tasks as excel file
    EXPORT_USERS: "/api/reports/export/users", //download user-task report
  },
  IMAGE: {
    UPLOAD_IMAGE: "/api/auth/upload-image",
  },
};
