import React, { useEffect } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { LuFileSpreadsheet } from "react-icons/lu";
import TaskStatusTab from "../../components/TaskStatusTab";
import TaskCard from "../../components/Cards/TaskCard";

const ManageTasks = () => {
  const [allTasks, setAllTasks] = useState([]);
  const [tabs, setTabs] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");

  const navigate = useNavigate();

  const getAllTasks = async () => {
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
        params: {
          status: filterStatus === "All" ? '' : filterStatus,
        },
      });
         console.log("API Response:", response.data.tasks); // Add this line
      setAllTasks(response.data?.tasks?.length > 0 ? response.data.tasks : []); // Return the fetched data

      //Manage StatusSummary data with fixed labels and order
      const StatusSummary = response.data?.StatusSummary || {};

      const statusArray = [
        { label: "All", count: StatusSummary.all || 0 },
        { label: "Pending", count: StatusSummary.PendingTasks || 0 },
        { label: "In Progress", count: StatusSummary.InProgressTasks || 0 },
        { label: "Completed", count: StatusSummary.CompletedTasks || 0 },
      ];
      setTabs(statusArray);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error; // Re-throw for calling function to handle
    }
  };

  const handleClick = (taskData) => {
    navigate(`/admin/create-task`, { state: { taskId: taskData } });
  };

  //download task report
  const handleDownloadReport = async () => {
    try{
      const response = await axiosInstance.get(API_PATHS.REPORTS.EXPORT_TASKS, {
        responseType: 'blob'
      });
      //Create a url for the blob
       const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "task_details.xlsx"); // Changed to match backend
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url); 
    }catch(error){
       console.error("Error downloading task details:", error);
      toast.error("Failed to downloadd task details, please try again");
    }
  };

  useEffect(() => {
    getAllTasks(filterStatus);
    return () => {};
  }, [filterStatus]);
  return (
    <DashboardLayout activeMenu="Manage Task">
      <div className="my-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between ">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl md:text-xl font-medium">My Tasks</h2>
            <button className="flex lg:hidden download-btn" onClick={handleDownloadReport}>
              <LuFileSpreadsheet className="text-lg"/>
              Download Report
            </button>
          </div>

          {tabs?.[0]?.count > 0 && (
            <div className="flex items-center gap-3">
              <TaskStatusTab tabs={tabs} activeTab={filterStatus} setActiveTab={setFilterStatus}/>

              <button className="hidden lg:flex download-btn" onClick={handleDownloadReport}>
                <LuFileSpreadsheet className="text-lg"/>
                Download Report
              </button>
            </div>
          )}
        </div>
          
          {/* DISPLAYING TASKS CARD IN GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
             {allTasks?.map((item, index) => (
              <TaskCard key={item._id} title={item.title} description={item.description} priority={item.priority} status={item.status} progress={item.progress} createdAt = {item.createdAt} dueDate={item.dueDate} assignedTo={item.assignedTo?.map((item)=> item.profileImageUrl)} attachmentCount={item.attachments?.length || 0} completedTodoCount={item.completedTodoCount || 0}
              todoChecklist={item.todoChecklist || []}
              onClick={()=> {handleClick(item)}}/>
             ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ManageTasks;
