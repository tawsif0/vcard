import React, { useState, useContext, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiCheckCircle,
  FiPhone,
} from "react-icons/fi";
import AuthContext from "../context/AuthContext";
import toast from "react-hot-toast";

const OTP_LENGTH = 4;

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
    forgotEmail: "",
    otp: "",
    forgotNewPassword: "",
    forgotConfirmPassword: "",
  });
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(0);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(""));
  const otpRefs = useRef([]);
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // Auto-clear forgotMessage after 5 seconds
  useEffect(() => {
    if (forgotMessage) {
      const timer = setTimeout(() => setForgotMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [forgotMessage]);

  const clearFieldError = (field) => {
    setErrors((prev) => ({ ...prev, [field]: "", general: "" }));
    if (success) setSuccess("");
  };

  const handleChange = (e) => {
    let val = e.target.value;
    if (e.target.name === "email") {
      val = val.toLowerCase();
    }
    setFormData({ ...formData, [e.target.name]: val });
    clearFieldError(e.target.name);
  };

  const togglePasswordVisibility = () => setShowPassword((p) => !p);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({
      email: "",
      password: "",
      general: "",
      forgotEmail: "",
      otp: "",
      forgotNewPassword: "",
      forgotConfirmPassword: "",
    });
    setSuccess("");

    let validationErrors = {};
    if (!formData.email.trim()) {
      validationErrors.email = "Please enter your email.";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      validationErrors.email = "Please enter a valid email.";
    }
    if (!formData.password.trim()) {
      validationErrors.password = "Please enter your password.";
    }
    if (Object.keys(validationErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...validationErrors }));
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error((prev) => ({
          ...prev,
          general: data.msg || "Invalid credentials",
        }));
        return;
      }

      login(data.user, data.token);
      window.location.href =
        data.user.role === "admin" ? "/admin" : "/dashboard";
    } catch (err) {
      toast.error((prev) => ({ ...prev, general: err.message }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    toast.error((prev) => ({ ...prev, forgotEmail: "", general: "" }));
    setSuccess("");
    if (!forgotEmail.trim()) {
      toast.error((prev) => ({
        ...prev,
        forgotEmail: "Please enter your email.",
      }));
      return;
    }
    if (!/\S+@\S+\.\S+/.test(forgotEmail)) {
      toast.error((prev) => ({
        ...prev,
        forgotEmail: "Please enter a valid email.",
      }));
      return;
    }
    setForgotLoading(true);
    try {
      const res = await fetch(
        "http://localhost:5000/api/password-reset/request",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: forgotEmail.toLowerCase() }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to send code");
      setForgotMessage(
        "If this email is registered, a reset code has been sent."
      );
      setForgotStep(2);
    } catch (err) {
      toast.error((prev) => ({ ...prev, general: err.message }));
    } finally {
      setForgotLoading(false);
    }
  };

  const handleOtpChange = (e, idx) => {
    toast.error((prev) => ({ ...prev, otp: "", general: "" }));
    setForgotMessage(""); // Clear success message on typing OTP
    setSuccess("");
    const val = e.target.value;
    if (/^[0-9]?$/.test(val)) {
      const newOtp = [...otp];
      newOtp[idx] = val;
      setOtp(newOtp);
      if (val && idx < OTP_LENGTH - 1) {
        otpRefs.current[idx + 1].focus();
      }
    }
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === "Backspace" && otp[idx] === "" && idx > 0) {
      otpRefs.current[idx - 1].focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    toast.error((prev) => ({ ...prev, otp: "", general: "" }));
    setSuccess("");
    setForgotMessage(""); // Clear success message on submit

    if (otp.some((digit) => digit === "")) {
      toast.error((prev) => ({
        ...prev,
        otp: "Please enter the complete 4-digit code.",
      }));
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch(
        "http://localhost:5000/api/password-reset/verify-code",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: forgotEmail.toLowerCase(),
            code: otp.join(""),
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Invalid or expired code");
      setForgotMessage("Code verified! Please enter your new password.");
      setForgotStep(3);
    } catch (err) {
      toast.error((prev) => ({
        ...prev,
        otp: err.message.includes("code") ? err.message : "",
        general: err.message.includes("code") ? "" : err.message,
      }));
      setForgotMessage("");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotResetSubmit = async (e) => {
    e.preventDefault();
    toast.error({
      email: "",
      password: "",
      general: "",
      forgotEmail: "",
      otp: "",
      forgotNewPassword: "",
      forgotConfirmPassword: "",
    });
    setSuccess("");
    if (!forgotNewPassword) {
      setErrors((prev) => ({
        ...prev,
        forgotNewPassword: "Please enter new password.",
      }));
      return;
    }
    if (forgotNewPassword.length < 8) {
      setErrors((prev) => ({
        ...prev,
        forgotNewPassword: "Password must be at least 8 characters.",
      }));
      return;
    }
    if (!forgotConfirmPassword) {
      setErrors((prev) => ({
        ...prev,
        forgotConfirmPassword: "Please confirm your password.",
      }));
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setErrors((prev) => ({
        ...prev,
        forgotConfirmPassword: "Passwords do not match.",
      }));
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch(
        "http://localhost:5000/api/password-reset/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: forgotEmail.toLowerCase(),
            code: otp.join(""),
            newPassword: forgotNewPassword,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to reset password");
      setSuccess("Password reset successful. You can now login.");
      setForgotStep(4);
    } catch (err) {
      setErrors((prev) => ({ ...prev, general: err.message }));
    } finally {
      setForgotLoading(false);
    }
  };

  const resetToLogin = () => {
    setForgotStep(0);
    setErrors({
      email: "",
      password: "",
      general: "",
      forgotEmail: "",
      otp: "",
      forgotNewPassword: "",
      forgotConfirmPassword: "",
    });
    setSuccess("");
    setForgotMessage("");
    setOtp(new Array(OTP_LENGTH).fill(""));
    setForgotEmail("");
    setForgotNewPassword("");
    setForgotConfirmPassword("");
  };

  return (
    <div className="min-h-screen w-full bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10 animate-pulse"
            style={{
              width: `${Math.random() * 200 + 100}px`,
              height: `${Math.random() * 200 + 100}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              background: "linear-gradient(145deg, #666, #999)",
              animationDuration: `${Math.random() * 10 + 15}s`,
              animationDelay: `${i * 2}s`,
            }}
          />
        ))}
      </div>
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `radial-gradient(circle 500px at 50% 100px, rgba(192,92,246,0.4), transparent)`,
        }}
      />

      <div className="w-full max-w-md bg-gray-900/20 backdrop-blur-md rounded-3xl shadow-2xl overflow-hidden transition-all duration-500 border border-gray-700/30 relative z-10 glass-card">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gray-600 to-gray-400"></div>

        <div className="p-8">
          {/* Step 0: Login */}
          {forgotStep === 0 && (
            <>
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center shadow-lg">
                    <FiMail className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Welcome Back
                </h1>
                <p className="text-gray-400">Login to access your account</p>
              </div>

              {errors.general && (
                <div
                  className="mb-6 p-4 bg-red-900/30 text-red-200 rounded-xl text-sm border border-red-700/30"
                  role="alert"
                >
                  {errors.general}
                </div>
              )}
              {success && (
                <div
                  className="mb-6 p-4 bg-green-900/30 text-green-200 rounded-xl text-sm border border-green-700/30"
                  role="status"
                >
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div>
                  <label
                    htmlFor="login-email"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="login-email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                      autoComplete="email"
                      className={`block w-full pl-12 pr-12 py-4 bg-gray-800 border rounded-2xl focus:ring-2 focus:ring-gray-500 focus:border-gray-400 transition text-white placeholder-gray-500 ${
                        errors.email ? "border-red-500/50" : "border-gray-700"
                      }`}
                      aria-describedby="email-error"
                      aria-invalid={!!errors.email}
                    />
                  </div>
                  {errors.email && (
                    <p id="email-error" className="mt-2 text-sm text-red-400">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="login-password"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                      autoComplete="current-password"
                      className={`block w-full pl-12 pr-12 py-4 bg-gray-800 border rounded-2xl focus:ring-2 focus:ring-gray-500 focus:border-gray-400 transition text-white placeholder-gray-500 ${
                        errors.password
                          ? "border-red-500/50"
                          : "border-gray-700"
                      }`}
                      aria-describedby="password-error"
                      aria-invalid={!!errors.password}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={togglePasswordVisibility}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <FiEye className="h-5 w-5 text-gray-500 hover:text-gray-300 transition-colors" />
                      ) : (
                        <FiEyeOff className="h-5 w-5 text-gray-500 hover:text-gray-300 transition-colors" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p
                      id="password-error"
                      className="mt-2 text-sm text-red-400"
                    >
                      {errors.password}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                  <span className="relative flex items-center justify-center">
                    {isLoading ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </span>
                </button>

                <div className="text-center text-sm text-gray-400">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep(1);
                      setErrors({
                        email: "",
                        password: "",
                        general: "",
                        forgotEmail: "",
                        otp: "",
                        forgotNewPassword: "",
                        forgotConfirmPassword: "",
                      });
                      setSuccess("");
                      setForgotMessage("");
                      setOtp(new Array(OTP_LENGTH).fill(""));
                    }}
                    className="font-medium text-white hover:text-gray-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                  <p className="mt-2">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="font-medium text-white hover:text-gray-300 transition-colors"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              </form>
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => navigate("/")}
                  className="inline-flex items-center text-sm text-gray-300 hover:text-white transition-colors mb-6 group"
                >
                  <FiArrowLeft className="mr-1 transform group-hover:-translate-x-1 transition-transform" />
                  Back to home
                </button>
              </div>
            </>
          )}

          {/* Step 1: Forgot Email */}
          {forgotStep === 1 && (
            <>
              <div className="text-center mb-8">
                <button
                  onClick={() => setForgotStep(0)}
                  className="inline-flex items-center text-sm text-gray-300 hover:text-white transition-colors mb-6 group"
                >
                  <FiArrowLeft className="mr-1 transform group-hover:-translate-x-1 transition-transform" />
                  Back
                </button>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center shadow-lg">
                    <FiMail className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Forgot Password
                </h1>
                <p className="text-gray-400">
                  Enter your email to get reset code
                </p>
              </div>

              {errors.general && (
                <div
                  className="mb-6 p-4 bg-red-900/30 text-red-200 rounded-xl text-sm border border-red-700/30"
                  role="alert"
                >
                  {errors.general}
                </div>
              )}
              {forgotMessage && (
                <div
                  className="mb-6 p-4 bg-green-900/30 text-green-200 rounded-xl text-sm border border-green-700/30"
                  role="status"
                >
                  {forgotMessage}
                </div>
              )}

              <form
                onSubmit={handleForgotEmailSubmit}
                className="space-y-6"
                noValidate
              >
                <div>
                  <label
                    htmlFor="forgot-email"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="forgot-email"
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => {
                        clearFieldError("forgotEmail");
                        setForgotEmail(e.target.value.toLowerCase());
                      }}
                      placeholder="Enter your email"
                      required
                      autoComplete="email"
                      className={`block w-full pl-12 pr-12 py-4 bg-gray-800 border rounded-2xl focus:ring-2 focus:ring-gray-500 focus:border-gray-400 transition text-white placeholder-gray-500 ${
                        errors.forgotEmail
                          ? "border-red-500/50"
                          : "border-gray-700"
                      }`}
                      aria-describedby="forgotEmail-error"
                      aria-invalid={!!errors.forgotEmail}
                    />
                  </div>
                  {errors.forgotEmail && (
                    <p
                      id="forgotEmail-error"
                      className="mt-2 text-sm text-red-400"
                    >
                      {errors.forgotEmail}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                  <span className="relative flex items-center justify-center">
                    {forgotLoading ? "Sending code..." : "Send Reset Code"}
                  </span>
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={resetToLogin}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Step 2: Enter OTP */}
          {forgotStep === 2 && (
            <>
              <div className="text-center mb-8">
                <button
                  onClick={() => setForgotStep(1)}
                  className="inline-flex items-center text-sm text-gray-300 hover:text-white transition-colors mb-6 group"
                >
                  <FiArrowLeft className="mr-1 transform group-hover:-translate-x-1 transition-transform" />
                  Back
                </button>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center shadow-lg">
                    <FiPhone className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Enter Reset Code
                </h1>
                <p className="text-gray-400">
                  Enter the 4-digit code sent to your email
                </p>
              </div>

              {forgotMessage && (
                <div
                  className="mb-6 p-4 bg-green-900/30 text-green-200 rounded-xl text-sm border border-green-700/30"
                  role="status"
                >
                  {forgotMessage}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-6" noValidate>
                <div className="space-y-4">
                  <div className="flex justify-center space-x-3">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className={`w-16 h-16 text-center text-2xl font-semibold border rounded-xl focus:ring-2 focus:ring-gray-500 focus:border-gray-400 transition bg-gray-800 text-white ${
                          errors.otp ? "border-red-500/50" : "border-gray-700"
                        }`}
                        value={digit}
                        ref={(el) => (otpRefs.current[idx] = el)}
                        onChange={(e) => handleOtpChange(e, idx)}
                        onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                        aria-label={`Digit ${idx + 1}`}
                        aria-describedby="otp-error"
                        aria-invalid={!!errors.otp}
                        required
                        autoComplete="off"
                      />
                    ))}
                  </div>
                  {errors.otp && (
                    <p
                      id="otp-error"
                      className="text-sm text-red-400 text-center"
                    >
                      {errors.otp}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                  <span className="relative flex items-center justify-center">
                    {forgotLoading ? "Verifying..." : "Verify Code"}
                  </span>
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotStep(1);
                      setOtp(new Array(OTP_LENGTH).fill(""));
                      setErrors({
                        email: "",
                        password: "",
                        general: "",
                        forgotEmail: "",
                        otp: "",
                        forgotNewPassword: "",
                        forgotConfirmPassword: "",
                      });
                      setForgotMessage("");
                    }}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Back to Email
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Step 3: Reset Password */}
          {forgotStep === 3 && (
            <>
              <div className="text-center mb-8">
                <button
                  onClick={() => setForgotStep(2)}
                  className="inline-flex items-center text-sm text-gray-300 hover:text-white transition-colors mb-6 group"
                >
                  <FiArrowLeft className="mr-1 transform group-hover:-translate-x-1 transition-transform" />
                  Back
                </button>
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center shadow-lg">
                    <FiLock className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Reset Password
                </h1>
                <p className="text-gray-400">Enter your new password below</p>
              </div>

              {errors.general && (
                <div
                  className="mb-6 p-4 bg-red-900/30 text-red-200 rounded-xl text-sm border border-red-700/30"
                  role="alert"
                >
                  {errors.general}
                </div>
              )}
              {success && (
                <div
                  className="mb-6 p-4 bg-green-900/30 text-green-200 rounded-xl text-sm border border-green-700/30"
                  role="status"
                >
                  {success}
                </div>
              )}

              <form
                onSubmit={handleForgotResetSubmit}
                className="space-y-6"
                noValidate
              >
                <div>
                  <label
                    htmlFor="new-password"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="new-password"
                      type={showNewPassword ? "text" : "password"}
                      value={forgotNewPassword}
                      onChange={(e) => {
                        clearFieldError("forgotNewPassword");
                        setForgotNewPassword(e.target.value);
                      }}
                      placeholder="New Password"
                      required
                      minLength={8}
                      className={`block w-full pl-12 pr-12 py-4 bg-gray-800 border rounded-2xl focus:ring-2 focus:ring-gray-500 focus:border-gray-400 transition text-white placeholder-gray-500 ${
                        errors.forgotNewPassword
                          ? "border-red-500/50"
                          : "border-gray-700"
                      }`}
                      aria-describedby="forgotNewPassword-error"
                      aria-invalid={!!errors.forgotNewPassword}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      aria-label={
                        showNewPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showNewPassword ? (
                        <FiEyeOff className="h-5 w-5 text-gray-500 hover:text-gray-300 transition-colors" />
                      ) : (
                        <FiEye className="h-5 w-5 text-gray-500 hover:text-gray-300 transition-colors" />
                      )}
                    </button>
                  </div>
                  {errors.forgotNewPassword && (
                    <p
                      id="forgotNewPassword-error"
                      className="mt-2 text-sm text-red-400"
                    >
                      {errors.forgotNewPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={forgotConfirmPassword}
                      onChange={(e) => {
                        clearFieldError("forgotConfirmPassword");
                        setForgotConfirmPassword(e.target.value);
                      }}
                      placeholder="Confirm Password"
                      required
                      minLength={8}
                      className={`block w-full pl-12 pr-12 py-4 bg-gray-800 border rounded-2xl focus:ring-2 focus:ring-gray-500 focus:border-gray-400 transition text-white placeholder-gray-500 ${
                        errors.forgotConfirmPassword
                          ? "border-red-500/50"
                          : "border-gray-700"
                      }`}
                      aria-describedby="forgotConfirmPassword-error"
                      aria-invalid={!!errors.forgotConfirmPassword}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={
                        showConfirmPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showConfirmPassword ? (
                        <FiEyeOff className="h-5 w-5 text-gray-500 hover:text-gray-300 transition-colors" />
                      ) : (
                        <FiEye className="h-5 w-5 text-gray-500 hover:text-gray-300 transition-colors" />
                      )}
                    </button>
                  </div>
                  {errors.forgotConfirmPassword && (
                    <p
                      id="forgotConfirmPassword-error"
                      className="mt-2 text-sm text-red-400"
                    >
                      {errors.forgotConfirmPassword}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                  <span className="relative flex items-center justify-center">
                    {forgotLoading ? "Resetting..." : "Reset Password"}
                  </span>
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={resetToLogin}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Step 4: Password Reset Success */}
          {forgotStep === 4 && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 mb-6 shadow-lg">
                <FiCheckCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">
                Password Reset Successful!
              </h1>
              <p className="text-gray-400 mb-8">
                Your password has been reset successfully. You can now login
                with your new password.
              </p>
              <button
                onClick={resetToLogin}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                <span className="relative">Back to Login</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
