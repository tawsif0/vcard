import React, { useState, useContext, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import AuthContext from "../context/AuthContext";
import "./Login.css";

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
      const response = await fetch(
        process.env.REACT_APP_API_BASE_URL + "/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrors((prev) => ({
          ...prev,
          general: data.msg || "Invalid credentials",
        }));
        return;
      }

      login(data.user, data.token);
      window.location.href =
        data.user.role === "admin" ? "/admin" : "/dashboard";
    } catch (err) {
      setErrors((prev) => ({ ...prev, general: err.message }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    setErrors((prev) => ({ ...prev, forgotEmail: "", general: "" }));
    setSuccess("");
    if (!forgotEmail.trim()) {
      setErrors((prev) => ({
        ...prev,
        forgotEmail: "Please enter your email.",
      }));
      return;
    }
    if (!/\S+@\S+\.\S+/.test(forgotEmail)) {
      setErrors((prev) => ({
        ...prev,
        forgotEmail: "Please enter a valid email.",
      }));
      return;
    }
    setForgotLoading(true);
    try {
      const res = await fetch(
        process.env.REACT_APP_API_BASE_URL + "/api/password-reset/request",
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
      setErrors((prev) => ({ ...prev, general: err.message }));
    } finally {
      setForgotLoading(false);
    }
  };

  const handleOtpChange = (e, idx) => {
    setErrors((prev) => ({ ...prev, otp: "", general: "" }));
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
    setErrors((prev) => ({ ...prev, otp: "", general: "" }));
    setSuccess("");
    setForgotMessage(""); // Clear success message on submit

    if (otp.some((digit) => digit === "")) {
      setErrors((prev) => ({
        ...prev,
        otp: "Please enter the complete 4-digit code.",
      }));
      return;
    }

    setForgotLoading(true);
    try {
      const res = await fetch(
        process.env.REACT_APP_API_BASE_URL + "/api/password-reset/verify-code",
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
      setErrors((prev) => ({
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
        process.env.REACT_APP_API_BASE_URL +
          "/api/password-reset/reset-password",
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
    <div className="login-container">
      <div className="login-card">
        {/* Step 0: Login */}
        {forgotStep === 0 && (
          <>
            <div className="login-header">
              <h2 className="login-title">Welcome Back</h2>
              <p className="login-subtitle">Login to access your account</p>
            </div>

            {errors.general && (
              <div className="login-error">{errors.general}</div>
            )}
            {success && <div className="login-success">{success}</div>}

            <form onSubmit={handleSubmit} className="login-form" noValidate>
              <div className="login-form-group">
                <label htmlFor="login-email" className="login-label">
                  Email Address
                </label>
                <div className="login-input-wrapper">
                  <FiMail className="login-icon" />
                  <input
                    id="login-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    required
                    autoComplete="email"
                    className="login-input"
                    aria-describedby="email-error"
                  />
                </div>
                {errors.email && (
                  <p
                    id="email-error"
                    className="login-error"
                    style={{ marginTop: "0.3rem" }}
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="login-form-group">
                <label htmlFor="login-password" className="login-label">
                  Password
                </label>
                <div className="login-input-wrapper">
                  <FiLock className="login-icon" />
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className="login-input"
                    aria-describedby="password-error"
                  />
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={togglePasswordVisibility}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <FiEye /> : <FiEyeOff />}
                  </button>
                </div>
                {errors.password && (
                  <p
                    id="password-error"
                    className="login-error"
                    style={{ marginTop: "0.3rem" }}
                  >
                    {errors.password}
                  </p>
                )}
              </div>

              <button type="submit" className="login-btn" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <span className="login-spinner"></span> Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </button>

              <div className="login-footer">
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
                  className="login-forgot-password"
                >
                  Forgot password?
                </button>
                <p className="login-register-text">
                  Don't have an account? <Link to="/register">Sign up</Link>
                </p>
              </div>
            </form>
          </>
        )}

        {/* Step 1: Forgot Email */}
        {forgotStep === 1 && (
          <>
            <div className="login-header">
              <h2 className="login-title">Forgot Password</h2>
              <p className="login-subtitle">
                Enter your email to get reset code
              </p>
            </div>

            {errors.general && (
              <div className="login-error">{errors.general}</div>
            )}
            {forgotMessage && (
              <div className="login-success">{forgotMessage}</div>
            )}

            <form
              onSubmit={handleForgotEmailSubmit}
              className="login-form"
              noValidate
            >
              <div className="login-form-group">
                <label htmlFor="forgot-email" className="login-label">
                  Email Address
                </label>
                <div className="login-input-wrapper">
                  <FiMail className="login-icon" />
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
                    className="login-input"
                    aria-describedby="forgotEmail-error"
                  />
                </div>
                {errors.forgotEmail && (
                  <p
                    id="forgotEmail-error"
                    className="login-error"
                    style={{ marginTop: "0.3rem" }}
                  >
                    {errors.forgotEmail}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="login-btn"
                disabled={forgotLoading}
              >
                {forgotLoading ? "Sending code..." : "Send Reset Code"}
              </button>

              <div className="login-footer">
                <button
                  type="button"
                  onClick={resetToLogin}
                  className="login-forgot-password"
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
            <div className="login-header">
              <h2 className="login-title">Enter Reset Code</h2>
              <p className="login-subtitle">
                Enter the 4-digit code sent to your email
              </p>
            </div>

            {forgotMessage && (
              <div className="login-success">{forgotMessage}</div>
            )}

            <form onSubmit={handleVerifyOtp} className="login-form" noValidate>
              <div
                className="otp-input-group"
                style={{ display: "flex", gap: "10px" }}
              >
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="otp-input"
                    value={digit}
                    ref={(el) => (otpRefs.current[index] = el)}
                    onChange={(e) => handleOtpChange(e, index)}
                    onKeyDown={(e) => handleOtpKeyDown(e, index)}
                    required
                    aria-label={`Digit ${index + 1}`}
                    style={{
                      width: "50px",
                      textAlign: "center",
                      fontSize: "1.5rem",
                    }}
                  />
                ))}
                {errors.otp && (
                  <p
                    className="login-errors"
                    style={{ marginTop: "0.5rem", color: "red" }}
                    role="alert"
                  >
                    {errors.otp}
                  </p>
                )}
              </div>

              {/* Single OTP error message under all inputs */}

              <button
                type="submit"
                className="login-btn"
                disabled={forgotLoading}
              >
                {forgotLoading ? "Verifying..." : "Verify Code"}
              </button>

              <div className="login-footer">
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
                  className="login-forgot-password"
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
            <div className="login-header">
              <h2 className="login-title">Reset Password</h2>
              <p className="login-subtitle">Enter your new password below</p>
            </div>

            {errors.general && (
              <div className="login-error">{errors.general}</div>
            )}
            {success && <div className="login-success">{success}</div>}

            <form
              onSubmit={handleForgotResetSubmit}
              className="login-form"
              noValidate
            >
              <div className="login-form-group">
                <label htmlFor="new-password" className="login-label">
                  New Password
                </label>
                <div className="login-input-wrapper">
                  <FiLock className="login-icon" />
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
                    className="login-input"
                    aria-describedby="forgotNewPassword-error"
                  />
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    aria-label={
                      showNewPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showNewPassword ? <FiEye /> : <FiEyeOff />}
                  </button>
                </div>
                {errors.forgotNewPassword && (
                  <p
                    id="forgotNewPassword-error"
                    className="login-error"
                    style={{ marginTop: "0.3rem" }}
                  >
                    {errors.forgotNewPassword}
                  </p>
                )}
              </div>

              <div className="login-form-group">
                <label htmlFor="confirm-password" className="login-label">
                  Confirm New Password
                </label>
                <div className="login-input-wrapper">
                  <FiLock className="login-icon" />
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
                    className="login-input"
                    aria-describedby="forgotConfirmPassword-error"
                  />
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? <FiEye /> : <FiEyeOff />}
                  </button>
                </div>
                {errors.forgotConfirmPassword && (
                  <p
                    id="forgotConfirmPassword-error"
                    className="login-error"
                    style={{ marginTop: "0.3rem" }}
                  >
                    {errors.forgotConfirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="login-btn"
                disabled={forgotLoading}
              >
                {forgotLoading ? "Resetting..." : "Reset Password"}
              </button>

              <div className="login-footer">
                <button
                  type="button"
                  onClick={resetToLogin}
                  className="login-forgot-password"
                >
                  Back to Login
                </button>
              </div>
            </form>
          </>
        )}

        {/* Step 4: Password Reset Success */}
        {forgotStep === 4 && (
          <div className="login-success-container">
            <div className="login-header">
              <h2 className="login-title">Password Reset Successful</h2>
            </div>
            <p className="login-success">
              Your password has been reset. You can now{" "}
              <button
                type="button"
                onClick={resetToLogin}
                className="login-forgot-password"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "var(--login-primary)",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                login
              </button>{" "}
              with your new password.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
