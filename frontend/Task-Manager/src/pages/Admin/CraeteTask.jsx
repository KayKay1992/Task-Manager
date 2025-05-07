import React from 'react'
import toast from 'react-hot-toast'
import moment from 'moment';
import { LuTrash2 } from 'react-icons/lu';
import { useLocation, useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import { useState } from 'react';
import { PRIORITY_DATA } from '../../utils/data';
import SelectDropdown from '../../components/inputs/SelectDropdown';
import SelectUsers from '../../components/inputs/SelectUsers';
import TodoListInput from '../../components/inputs/TodoListInput';
import AddAttachmentInput from '../../components/inputs/AddAttachmentInput ';

const CraeteTask = () => {
  const location = useLocation()
  const {taskId} = location.state || {}
  const navigate = useNavigate()

  const [taskData ,setTaskData] = useState({
    title: '',
    description: '',
    priority: 'Low',
    dueDate: null,
    assignedTo: [],
    todoChecklist: [],
    attachments: [],
  })
   
  const [currentTask, setCurrentTask] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);

  const handleValueChange = (key, value) => {
    setTaskData((prevData) => ({...prevData, [key]: value}));
  };

  const clearData = () => {
    //reset form
    setTaskData({
      title: '',
      description: '',
      priority: 'Low',
      dueDate: null,
      assignedTo: [],
      todoChecklist: [],
      attachments: [],
    })
  }

  //Create task 
  const createTask = async () => {};

  //update task
  const updateTask = async () => {};

  const handleSubmit = async () => {
    setError(null)
  };

  //getTask Infor by Id
  const getTaskByID = async () => {};

  //Delete Task
  const deleteTask = async () => {};

  return (
    <DashboardLayout activeMenu="Create Task">
            <div className="mt-5">
              <div className="grid grid-cols-1 md:grid-cols-4 mt-4">
                <div className="form-card col-span-3">
                  <div className="flex items-center justify-between ">
                    <h2 className="text-xl md:text-xl font-medium">
                      {taskId ? "Update Task" : "Create Task"}
                    </h2>
                    {taskId && (
                      <button className="flex items-center gap-1.5 text-[13xl] font-medium text-rose-500  bg-rose-50 rounded px-2 py-1 border border-rose-100 hover:border-rose-300 cursor-pointer " onClick={() => setOpenDeleteAlert(true)}>
                         <LuTrash2 className="text-base"/>
                      </button>
                    )}
                  </div>

                  <div className="mt-4">
                    <label  className="text-xs font-medium text-slate-600">
                       Task Titile
                    </label>
                    <input placeholder='Create App UI' className='form-input' value={taskData.title} onChange={({target}) => handleValueChange('title', target.value)} />
                  </div>
                  <div className="mt-3">
                    <label className="text-xs font-medium text-slate-600">
                      Description
                    </label>
                    <textarea className='form-input' placeholder='Describe task' rows={4} value={taskData.description} onChange={({target})=> handleValueChange('description', target.value)}/>
                  </div>

                  <div className="grid grid-cols-12  gap-4 mt-2">
                     <div className="col-span-6 md:col-span-4">
                      <label className="text-xs font-medium text-slate-600">
                        Priority
                      </label>
                      <SelectDropdown options={PRIORITY_DATA} value={taskData.priority} onChange={(value)=> handleValueChange('priority', value)} placeholder= 'Select Priority'/>
                     </div>

                     <div className="col-span-6 md:col-span-4">
                      <label className="text-xs font-medium text-slate-600">
                         Due Date
                      </label>
                      <input type="date" className="form-input" placeholder='Create App UI' value={taskData.dueDate}  onChange={({target})=> handleValueChange('dueDate', target.value)}/>
                     </div>

                     <div className="col-span-12 md:col-span-3">
                      <label className="text-xs font-medium text-slate-600">
                        Assigned To
                      </label>
                      <SelectUsers selectedUsers={taskData.assignedTo} setSelectedUsers={(value) => {
                        handleValueChange('assignedTo', value)
                      }}
                      />
                     </div>
                  </div>

                  <div className="mt-3">
                    <label className="text-sm font-medium text-slate-600">
                      TODO CHECKLIST
                    </label>
                    <TodoListInput todoList = {taskData?.todoChecklist} setTodoList ={(value) => handleValueChange('todoChecklist', value)}/>
                  </div>

                  <div className="mt-3">
                    <label className="text-xs font-medium text-slate-600">Add Attachments</label>
                    <AddAttachmentInput attachments={taskData?.attachments} setAttachments={(value) => handleValueChange('attachments', value)}/>
                  </div>

                  {error && (
                    <p className="txt-xs font-medium text-red-500">{error}</p>
                  )}

                  <div className="flex justify-end mt-7">
                    <button className="add-btn" onClick={handleSubmit} disabled={loading}>
                       {taskId ? 'UPDATE TASK' : 'CREATE TASK'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
    </DashboardLayout>
  )
}

export default CraeteTask