// Import necessary React hooks and components
import React, { useEffect, useState } from 'react'
// Import layout component for the dashboard structure
import DashboardLayout from '../../components/layouts/DashboardLayout'
// Import axios instance for making API calls with base configuration
import axiosInstance from '../../utils/axiosInstance';
// Import API path constants for consistent endpoint references
import { API_PATHS } from '../../utils/apiPaths';
// Import icon component from react-icons library
import { LuFileSpreadsheet } from 'react-icons/lu';
// Import custom UserCard component for displaying user information
import UserCard from '../../components/Cards/UserCard';

// Main component for managing users
const ManageUsers = () => {
  // State to store all users data
  const [allUsers, setAllUsers] = useState([]);

  // Function to fetch all users from the API
  const getAllUsers = async () => {
    try{
      // Make GET request to fetch all users
      const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
      // If response contains data, update the state
      if(response.data?.length  > 0){
        setAllUsers(response.data)
      }
    }catch(error){
      // Log any errors that occur during the API call
      console.error('Error fetching Users:', error)
    }
  };

  // Function to handle downloading user reports (currently empty)
  const handleDownloadReport = async () => {
    // TODO: Implement report download functionality
  }

  // useEffect hook to fetch users when component mounts
  useEffect(() => {
    getAllUsers()
  
    return () => {
      // Cleanup function (currently empty)
    }
  }, []) // Empty dependency array means this runs only once on mount
  
  return (
    <DashboardLayout activeMenu="Team Members">
      <div className="mt-5 mb-10">
        {/* Header section with title and download button */}
        <div className="flex md:flex-row md:items-center justify-between">
          <h2 className="text-xl md:text-xl font-medium ">Team Members</h2>
          <button className="flex md:flex download-btn" onClick={handleDownloadReport}>
            <LuFileSpreadsheet className='text-lg'/>
            Dwnload Report
          </button>
        </div>
        {/* Grid layout to display user cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 ">
          {/* Map through allUsers array to render UserCard for each user */}
          {allUsers?.map((user) =>(
            <UserCard key={user._id} userInfo={user}/>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

export default ManageUsers