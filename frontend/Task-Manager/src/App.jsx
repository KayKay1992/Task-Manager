import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from "react-router-dom";
import Login from "./pages/Auth/Login";
import SignUp from "./pages/Auth/SignUp";
import Dashboard from "./pages/Admin/Dashboard";
import ManageTasks from "./pages/Admin/ManageTasks";
import CraeteTask from "./pages/Admin/CraeteTask";
import ManageUsers from "./pages/Admin/ManageUsers";
import UserDashboard from "./pages/User/UserDashboard";
import MyTasks from "./pages/User/MyTasks";
import ViewTaskDetails from "./pages/User/ViewTaskDetails";
import PrivateRoute from "./routes/PrivateRoute";
import UserProvider, { UserContext } from "./context/userContext";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <UserProvider>
    <div>
      <Router>
        <Routes>
          {/* auth routes here */}
          {/* <Route path="/" element={<Home />} /> */}
          <Route path="/login" element={<Login />} />
          <Route path="/signUp" element={<SignUp />} />

          {/* Add admin routes here */}
          <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/tasks" element={<ManageTasks />} />
            <Route path="/admin/create-task" element={<CraeteTask/>} />
            <Route path="/admin/users" element={<ManageUsers/>} />
          </Route>

           {/* Add users routes here */}
           <Route element={<PrivateRoute allowedRoles={["admin"]} />}>
            <Route path="/user/dashboard" element={<UserDashboard />} />
            <Route path="/user/tasks" element={<MyTasks />} />
            <Route path="/user/task-details/:id" element={<ViewTaskDetails />} />
          </Route>
          {/*DEFAULT ROUTE */}
          <Route path='/' element={<Root/>}/>
        </Routes>
      </Router>
    </div>
    <Toaster toastOptions={{
      className: '',
      style: {
        fontSize: '13px',
      },
    }}/>
    </UserProvider>
  );
}

export default App;


//Define the root
const Root = () => {
  const {user, loading} = useContext(UserContext)

  if(loading) return <Outlet/>

  if(!user){
    return <Navigate to='/login'/>
  }
  return user.role === 'admin' ? <Navigate to='/admin/dashboard' /> : <Navigate to="/user/dashboard"/>
}
