import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiMail,
  FiLock,
  FiUser,
  FiEye,
  FiEyeOff,
  FiArrowLeft,
  FiCheckCircle,
  FiPhone,
} from "react-icons/fi";
import toast from "react-hot-toast";

const OTP_LENGTH = 4;

const Register = () => {
  const [step, setStep] = useState(1); // 1=register, 2=otp, 3=success
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(""));
  const otpRefs = useRef([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // Handle form input changes with clearing specific field error
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "", general: "" }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => setShowPassword((p) => !p);

  // Handle OTP input changes with digit-only validation
  const handleOtpChange = (e, idx) => {
    const val = e.target.value;
    if (/^\d?$/.test(val)) {
      const newOtp = [...otp];
      newOtp[idx] = val;
      setOtp(newOtp);
      if (val && idx < OTP_LENGTH - 1) otpRefs.current[idx + 1].focus();
    }
    setErrors((prev) => ({ ...prev, otp: "", general: "" }));
  };

  // Handle OTP input keydown for backspace behavior
  const handleOtpKeyDown = (e, idx) => {
    if (e.key === "Backspace" && otp[idx] === "" && idx > 0) {
      otpRefs.current[idx - 1].focus();
    }
  };

  // Validate registration form with all possible validations
  const validateRegister = () => {
    let errs = {};

    // Name validations:
    if (!formData.name.trim()) {
      errs.name = "Name is required.";
    } else if (formData.name.length < 3) {
      errs.name = "Name must be at least 3 characters long.";
    } else if (formData.name.length > 50) {
      errs.name = "Name cannot exceed 50 characters.";
    } else if (/[^a-zA-Z\s.'()-]/.test(formData.name)) {
      // Allow letters, spaces, apostrophes, hyphens, dots, and parentheses
      errs.name =
        "Name can contain only letters, spaces, apostrophes, hyphens, dots, and parentheses.";
    }

    // Email validations:
    if (!formData.email.trim()) {
      errs.email = "Email is required.";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errs.email = "Please enter a valid email address.";
      } else {
        const disposableDomains = [
          "mailinator.com",
          "tempmail.net",
          "10minutemail.com",
          "dispostable.com",
        ];
        const emailDomain = formData.email.split("@")[1].toLowerCase();
        if (disposableDomains.includes(emailDomain)) {
          errs.email = "Disposable email addresses are not allowed.";
        }
      }
    }

    // Password validations:
    if (!formData.password.trim()) {
      errs.password = "Password is required.";
    } else if (formData.password.length < 8) {
      errs.password = "Password must be at least 8 characters.";
    } else {
      // Complexity: at least one uppercase, one lowercase, one number, one special char
      const uppercase = /[A-Z]/;
      const lowercase = /[a-z]/;
      const number = /[0-9]/;
      const specialChar = /[!@#$%^&*(),.?":{}|<>]/;
      if (!uppercase.test(formData.password)) {
        errs.password = "Password must include at least one uppercase letter.";
      } else if (!lowercase.test(formData.password)) {
        errs.password = "Password must include at least one lowercase letter.";
      } else if (!number.test(formData.password)) {
        errs.password = "Password must include at least one number.";
      } else if (!specialChar.test(formData.password)) {
        errs.password = "Password must include at least one special character.";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit registration form: send data and get OTP sent
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!validateRegister()) return;

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to start registration");
      toast.success("Verification code sent to your email.");
      setStep(2);
    } catch (err) {
      toast.error({ general: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP with validations and error handling
  const handleOtpVerify = async (e) => {
    e.preventDefault();

    // Check if all OTP digits are entered
    if (otp.some((d) => d === "")) {
      toast.error({ otp: "Please enter the complete 4-digit code." });
      return;
    }

    // Join OTP digits
    const otpCode = otp.join("");

    // Check OTP length and numeric content explicitly (extra safety)
    if (otpCode.length !== 4 || !/^\d{4}$/.test(otpCode)) {
      toast.error({ otp: "OTP code must be exactly 4 digits." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/register/verify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email.toLowerCase(),
            code: otpCode,
            password: formData.password,
            name: formData.name,
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        // Show OTP-specific error under OTP input
        if (
          data.msg &&
          (data.msg.toLowerCase().includes("otp") ||
            data.msg.toLowerCase().includes("code"))
        ) {
          toast.error({ otp: data.msg });
        } else {
          toast.error({ general: data.msg || "Verification failed." });
        }
        return;
      }
      toast.success("Registration successful! You can now login.");
      setStep(3);
    } catch (err) {
      toast.error({ general: err.message });
    } finally {
      setLoading(false);
    }
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
          {/* Step 1: Registration Form */}
          {step === 1 && (
            <>
              <div className="text-center mb-8">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center shadow-lg">
                    <FiUser className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  Create Your Account
                </h1>
                <p className="text-gray-400">
                  Join our community and begin your journey
                </p>
              </div>

              <form
                onSubmit={handleRegisterSubmit}
                className="space-y-6"
                noValidate
              >
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiUser className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      className={`block w-full pl-12 pr-12 py-4 bg-gray-800 border rounded-2xl focus:ring-2 focus:ring-gray-500 focus:border-gray-400 transition text-white placeholder-gray-500 ${
                        errors.name ? "border-red-500/50" : "border-gray-700"
                      }`}
                      aria-describedby="name-error"
                      aria-invalid={!!errors.name}
                      required
                      autoComplete="off"
                    />
                  </div>
                  {errors.name && (
                    <p id="name-error" className="mt-2 text-sm text-red-400">
                      {errors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className={`block w-full pl-12 pr-12 py-4 bg-gray-800 border rounded-2xl focus:ring-2 focus:ring-gray-500 focus:border-gray-400 transition text-white placeholder-gray-500 ${
                        errors.email ? "border-red-500/50" : "border-gray-700"
                      }`}
                      aria-describedby="email-error"
                      aria-invalid={!!errors.email}
                      required
                      autoComplete="off"
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
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a strong password"
                      className={`block w-full pl-12 pr-12 py-4 bg-gray-800 border rounded-2xl focus:ring-2 focus:ring-gray-500 focus:border-gray-400 transition text-white placeholder-gray-500 ${
                        errors.password
                          ? "border-red-500/50"
                          : "border-gray-700"
                      }`}
                      aria-describedby="password-error"
                      aria-invalid={!!errors.password}
                      required
                      autoComplete="off"
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
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                  <span className="relative flex items-center justify-center">
                    {loading ? (
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
                        Creating Account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </span>
                </button>

                <div className="text-center text-sm text-gray-400">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="font-medium text-white hover:text-gray-300 transition-colors"
                  >
                    Sign in
                  </Link>
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

          {/* Step 2: OTP Verification */}
          {step === 2 && (
            <>
              <div className="text-center mb-8">
                <button
                  onClick={() => setStep(1)}
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
                  Verify Your Email
                </h1>
                <p className="text-gray-400">
                  Enter the 4-digit code sent to{" "}
                  <span className="text-white font-medium">
                    {formData.email}
                  </span>
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
              {successMsg && (
                <div
                  className="mb-6 p-4 bg-green-900/30 text-green-200 rounded-xl text-sm border border-green-700/30"
                  role="status"
                >
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleOtpVerify} className="space-y-6" noValidate>
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
                  disabled={loading}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group relative overflow-hidden"
                >
                  <span className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                  <span className="relative flex items-center justify-center">
                    {loading ? (
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
                        Verifying...
                      </>
                    ) : (
                      "Verify Code"
                    )}
                  </span>
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtp(new Array(OTP_LENGTH).fill(""));
                      setErrors({});
                      setSuccessMsg("");
                    }}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    Back to Registration
                  </button>
                </div>
              </form>
            </>
          )}

          {/* Step 3: Success Message */}
          {step === 3 && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 mb-6 shadow-lg">
                <FiCheckCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">
                Registration Successful!
              </h1>
              <p className="text-gray-400 mb-8">
                Your account has been created successfully. You can now login to
                continue.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 group relative overflow-hidden"
              >
                <span className="absolute inset-0 bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                <span className="relative">Continue to Login</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;
