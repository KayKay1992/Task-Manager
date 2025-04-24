import React, { useState } from "react";
import AuthLayout from "../../components/layouts/AuthLayout";
import { Link, useNavigate } from "react-router-dom";
import Input from "../../components/inputs/Input";
import { validateEmail } from "../../utils/helper";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  //handle login form submit
  const handleLogin = async (e) => {
    e.preventDefault();

    if(!validateEmail(email)){
      setError('Please Enter a Valid Credential')
      return;
    }
    if(!password){
      setError('Please Enter a Valid Credential')
      return;
    }
     setError('')


     //Login API call
     try{}catch(error){}
  };
  return (
    <AuthLayout>
      <div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-black ">Welcome Back</h3>
        <p className="text-xs text-slate-700 mt-[px] mb-6">
          Please enter your details to log in
        </p>

        <form onSubmit={handleLogin}>
          <Input
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            label="Email Address"
            placeholder="John@mgmail.com"
            type="text"
          />
          <Input
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            label="Enter Password"
            placeholder="min 8 characters"
            type="password"
          />

          {error && <p className="text-red-600 text-xs pb-2.5">{error}</p>}

          <button type="submit" className="btn-primary">LOGIN</button>

          <p className='text-[13px] text-slate-800 mt-3 '>Don't have an account? {' '} <Link className="font-medium text-primary underline" to='/signup'>Sign Up</Link></p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Login;
