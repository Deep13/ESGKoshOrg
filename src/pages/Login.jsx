import { FaUserAlt, FaLock } from 'react-icons/fa';
import logo from '../assets/logo.png'
import {  signInWithEmailAndPassword   } from 'firebase/auth';
import {auth} from "../firebase"
import {useState} from 'react'
import {useNavigate} from 'react-router-dom'

const Login = () => {
  
  const navigate=useNavigate()
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  

  const onLogin = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
        // Signed in
        const user = userCredential.user;
        // localStorage.setItem("userDetails",user.email);
        
        // navigate("/")
        console.log(user);
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage)
    });

}


  return (
    <div className="bg-loginBg bg-cover bg-center w-full h-screen flex">
      {/* Login Form Container */}
      <div className="w-[40%] h-[90%] rounded-lg bg-white shadow-lg flex flex-col justify-center items-center ml-auto mr-16 mt-10">
        {/* Inner Content */}
        <div className="w-4/5 mx-auto">
          {/* Logo Section */}
          <div className="flex items-center justify-center mb-6 mt-4">
            <img
              src={logo}
              alt="Logo"
              className="mb-2"
            />
            <h2 className="text-2xl font-bold text-gray-800">ESG Koshish</h2>
          </div>

          {/* Title and Subtitle */}
          <h3 className="text-xl font-semibold text-gray-700 mb-2 text-center">
            Sustrack Dashboard
          </h3>
          <p className="text-sm text-gray-500 text-center mb-6">
            Lorem Ipsum has been the industry's standard dummy text ever since.
          </p>

          {/* Login Form */}
          <form>
            {/* Username Input */}
            <div className="flex items-center border border-gray-300 rounded-xl mb-4 px-3 py-2">
              <FaUserAlt className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Enter username"
                className="w-full border-none outline-none text-gray-700"
                onChange={(e)=>setEmail(e.target.value)}
              />
            </div>

            {/* Password Input */}
            <div className="flex items-center border border-gray-300 rounded-xl mb-6 px-3 py-2">
              <FaLock className="text-gray-400 mr-2" />
              <input
                type="password"
                placeholder="Enter password"
                className="w-full border-none outline-none text-gray-700"
                onChange={(e)=>setPassword(e.target.value)}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 rounded-md font-semibold hover:bg-green-600 transition"
              onClick={onLogin}
            >
              Login
            </button>
          </form>

          {/* Terms and Conditions */}
          <p className="text-sm text-gray-500 mt-6 text-center">
            <a href="/terms" className="text-green-500 hover:underline">
              Terms & Conditions
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
