// MyTasks.js - React component for displaying and filtering user tasks

import React, { useEffect } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance"; // Custom axios instance
import { API_PATHS } from "../../utils/apiPaths"; // API endpoint constants
import { LuFileSpreadsheet } from "react-icons/lu"; // Icon for tasks
import TaskStatusTab from "../../components/TaskStatusTab"; // Tab component for status filtering
import TaskCard from "../../components/Cards/TaskCard"; // Component for individual task cards

const MyTasks = () => {
  // State for storing all tasks
  const [allTasks, setAllTasks] = useState([]);
  // State for status filter tabs data
  const [tabs, setTabs] = useState([]);
  // State for tracking active filter status
  const [filterStatus, setFilterStatus] = useState("All");

  const navigate = useNavigate(); // Router navigation hook

  // Fetches tasks from API based on current filter status
  const getAllTasks = async () => {
    try {
      // API call with status filter parameter
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
        params: {
          status: filterStatus === "All" ? "" : filterStatus,
        },
      });
      
      // Update tasks state with response data or empty array if no tasks
      setAllTasks(response.data?.tasks?.length > 0 ? response.data.tasks : []);

      // Process status summary data for filter tabs
      const StatusSummary = response.data?.StatusSummary || {};
      const statusArray = [
        { label: "All", count: StatusSummary.all || 0 },
        { label: "Pending", count: StatusSummary.PendingTasks || 0 },
        { label: "In Progress", count: StatusSummary.InProgressTasks || 0 },
        { label: "Completed", count: StatusSummary.CompletedTasks || 0 },
      ];
      setTabs(statusArray); // Update tabs state with processed data
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  };

  // Handles click on task card to navigate to task details
  const handleClick = (taskId) => {
    navigate(`/user/task-details/${taskId}`);
  };

  // Effect hook to fetch tasks when filter status changes
  useEffect(() => {
    getAllTasks(filterStatus);
    return () => {};
  }, [filterStatus]);

  return (
    <DashboardLayout activeMenu="My Tasks">
      <div className="my-5">
        {/* Header and filter tabs section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between ">
          <h2 className="text-xl md:text-xl font-medium">My Tasks</h2>
          {/* Render filter tabs if tasks exist */}
          {tabs?.[0]?.count > 0 && (
            <TaskStatusTab
              tabs={tabs}
              activeTab={filterStatus}
              setActiveTab={setFilterStatus}
            />
          )}
        </div>

        {/* Task cards grid layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {allTasks?.map((item, index) => (
            <TaskCard
              key={item._id}
              title={item.title}
              description={item.description}
              priority={item.priority}
              status={item.status}
              progress={item.progress}
              createdAt={item.createdAt}
              dueDate={item.dueDate}
              assignedTo={item.assignedTo?.map((item) => item.profileImageUrl)}
              attachmentCount={item.attachments?.length || 0}
              completedTodoCount={item.completedTodoCount || 0}
              todoChecklist={item.todoChecklist || []}
              onClick={() => {
                handleClick(item._id);
              }}
            />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MyTasks;