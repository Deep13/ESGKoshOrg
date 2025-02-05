import { FaUserAlt, FaLock } from "react-icons/fa";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"; // Import eye icons
import logo from "../assets/logo.png";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");

  const onLogin = (e) => {
    e.preventDefault();
    setError(""); // Reset error before attempting login

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        navigate("/");
        console.log(user);
      })
      .catch((error) => {
        setError("Invalid email or password. Please try again.");
        console.log(error.code, error.message);
      });
  };

  return (
    <div className="bg-loginBg bg-cover bg-center w-full h-screen flex">
      {/* Login Form Container */}
      <div className="w-[40%] h-[90%] rounded-lg bg-white shadow-lg flex flex-col justify-center items-center ml-auto mr-16 mt-10">
        {/* Inner Content */}
        <div className="w-4/5 mx-auto">
          {/* Logo Section */}
          <div className="flex items-center justify-center mb-6 mt-4">
            <img src={logo} alt="Logo" className="mb-2" />
            <h2 className="text-2xl font-bold text-gray-800">ESG Koshish</h2>
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-700 mb-2 text-center">
            Sustrack Dashboard
          </h3>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-md text-center mb-4">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={onLogin}>
            {/* Email Input */}
            <div className="flex items-center border border-gray-300 rounded-xl mb-4 px-3 py-2">
              <FaUserAlt className="text-gray-400 mr-2" />
              <input
                type="email"
                placeholder="Enter email"
                className="w-full border-none outline-none text-gray-700"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Input with Show/Hide Toggle */}
            <div className="flex items-center border border-gray-300 rounded-xl mb-6 px-3 py-2 relative">
              <FaLock className="text-gray-400 mr-2" />
              <input
                type={passwordVisible ? "text" : "password"}
                placeholder="Enter password"
                className="w-full border-none outline-none text-gray-700"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span
                className="absolute right-3 cursor-pointer text-gray-500"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 rounded-md font-semibold hover:bg-green-600 transition"
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
