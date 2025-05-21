import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import moment from "moment";
import AvatarGroup from "../../components/AvatarGroup";
import { LuSquareArrowOutUpRight } from "react-icons/lu";

// Component to view detailed information about a specific task
const ViewTaskDetails = () => {
  const { id } = useParams(); // Get task ID from URL params
  const [task, setTask] = useState(null); // State to store task details

  // Helper function to determine status tag color based on task status
  const getStatusTagColor = (status) => {
    switch (status) {
      case "In Progress":
        return "bg-cyan-50 text-cyan-500 border border-cyan-500/10";
      case "Completed":
        return "text-lime-500 bg-lime-50 border border-lime-500/10";
      default:
        return "text-violet-500 bg-violet-50 border border-violet-500/10";
    }
  };

  // Fetch task details from API using the task ID
  const getTaskDetailsById = async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.TASKS.GET_TASK_BY_ID(id)
      );
      if (response.data) {
        setTask(response.data); // Update state with task data
      }
    } catch (error) {
      console.error("Error fetching Users:", error);
    }
  };

  // Placeholder function to update todo checklist (to be implemented)
  const updateTodoChecklist = async (index) => {};

  // Open attachment link in new tab with proper URL formatting
  const handleLinkClick = (link) => {
    if(!/^https:\/\//i.test(link)){
      link='https://'+link //default to https
    }
    window.open(link, "_blank");
  };

  // Fetch task details when component mounts or ID changes
  useEffect(() => {
    if (id) getTaskDetailsById();
    return () => {};
  }, [id]);

  // Render task details in a dashboard layout
  return (
    <DashboardLayout activeMeenu="My Tasks">
      <div className="mt-5">
        {task && (
          <div className="grid grid-cols-1 md:grid-cols-4 mt-4">
            <div className="form-card col-span-3">
              {/* Task title and status */}
              <div className="flex items-center justify-between">
                <h2 className="text-sm md:text-xl font-medium">{task?.title}</h2>
                <div className={`text-[11px] md:text-[13px] font-medium ${getStatusTagColor(task?.status)} px-4 py-0.5 rounded`}>
                  {task?.status}
                </div>
              </div>
              
              {/* Task description and metadata */}
              <div className="mt-4">
                <InfoBox label="Description" value={task?.description} />
              </div>

              {/* Task priority, due date, and assignees */}
              <div className="grid grid-cols-12 gap-4 mt-4">
                <div className="col-span-6 md:col-span-4">
                  <InfoBox label='Priority' value={task?.priority}/>
                </div>
                <div className="col-span-6 md:col-span-4">
                  <InfoBox label='Due Date' value={task?.dueDate ? moment(task?.dueDate).format("Do MMM YYYY"): 'N/A'}/>
                </div>
                <div className="col-span-6 md:col-span-4">
                  <label className="text-xs font-medium text-slate-500">AssignedTo</label>
                  <AvatarGroup avatars={task?.assignedTo?.map((item)=> item?.profileImageUrl) || []} maxVisible={5}/>
                </div>
              </div>

              {/* Todo checklist section */}
              <div className="mt-2">
                <label className="text-xs font-medium text-slate-500">Todo Checklist</label>
                {task?.todoChecklist?.map((item, index) => (
                  <TodoChecklist key={`todo_${index}`} text={item.text} isChecked={item?.completed} onChange={()=> updateTodoChecklist(index)}/>
                ))}
              </div>

              {/* Attachments section */}
              {task?.attachments?.length > 0 && (
                <div className="mt-2">
                  <label className="text-xs font-medium text-slate-500">Attachments</label>
                  {task?.attachments?.map((link, index) => (
                    <Attachment key={`link_${index}`} link={link} index={index} onClick={()=> handleLinkClick(link)}/>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

// Reusable component to display label-value pairs
const InfoBox = ({ label, value }) => {
  return (
    <>
      <label className="text-xs font-medium text-slate-500">{label}</label>
      <p className="text-[12px] md:text-[13px] font-medium text-gray-700 mt-0.5">{value}</p>
    </>
  );
};

// Component for individual todo checklist items
const TodoChecklist= ({text, isChecked, onChange}) => {
  return (
    <div className="flex items-center gap-3 p-3">
      <input type="checkbox" checked={isChecked} onChange={onChange} 
        className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded-sm outline-none cursor-pointer"/>
      <p className="text-[15px] text-gray-800">{text}</p>
    </div>
  );
};

// Component for displaying attachments with click handler
const Attachment = ({link, index, onClick}) => {
  return (
    <div className="flex justify-between bg-gray-50 border border-gray-100 py-3 px-3 mt-2 cursor-pointer" onClick={onClick}>
      <div className="flex-1 flex items-center gap-3">
        <span className="text-xs text-gray-400 font-semibold mr-2">
          {index < 9 ? `0${index + 1}` : index + 1}
        </span>
        <p className="text-xs text-black">{link}</p>
      </div>
      <LuSquareArrowOutUpRight className="text-gray-400"/>
    </div>
  );
};

export default ViewTaskDetails;

/*
SUMMARY (20 lines):
1. ViewTaskDetails component displays detailed information about a specific task
2. Uses task ID from URL params to fetch data from API
3. Manages task state with useState hook
4. Implements status-based styling with getStatusTagColor function
5. Fetches task details in getTaskDetailsById function
6. Handles attachment clicks with proper URL formatting
7. Uses DashboardLayout as the main container
8. Displays task title with status badge
9. Shows task description in InfoBox component
10. Displays priority, formatted due date, and assigned users
11. Uses AvatarGroup to show assignee profile pictures
12. Renders todo checklist with checkboxes (update functionality pending)
13. Lists attachments as clickable links that open in new tabs
14. Includes helper components: InfoBox, TodoChecklist, Attachment
15. InfoBox displays label-value pairs consistently
16. TodoChecklist shows checkbox with task text
17. Attachment component formats links with numbering and external link icon
18. Responsive design with grid layouts for different screen sizes
19. Uses moment.js for date formatting
20. Handles potential missing data with optional chaining
*/