import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from "react-icons/fi";
import "./Register.css";

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
    } else if (/[^a-zA-Z\s'-]/.test(formData.name)) {
      // Allow letters, spaces, apostrophes, hyphens only
      errs.name =
        "Name can contain only letters, spaces, apostrophes, and hyphens.";
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
    setErrors({});
    setSuccessMsg("");
    if (!validateRegister()) return;

    setLoading(true);
    try {
      const res = await fetch(
        process.env.REACT_APP_API_BASE_URL + "/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Failed to start registration");
      setSuccessMsg("Verification code sent to your email.");
      setStep(2);
    } catch (err) {
      setErrors({ general: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP with validations and error handling
  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccessMsg("");

    // Check if all OTP digits are entered
    if (otp.some((d) => d === "")) {
      setErrors({ otp: "Please enter the complete 4-digit code." });
      return;
    }

    // Join OTP digits
    const otpCode = otp.join("");

    // Check OTP length and numeric content explicitly (extra safety)
    if (otpCode.length !== 4 || !/^\d{4}$/.test(otpCode)) {
      setErrors({ otp: "OTP code must be exactly 4 digits." });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        process.env.REACT_APP_API_BASE_URL + "/api/auth/register/verify",
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
          setErrors({ otp: data.msg });
        } else {
          setErrors({ general: data.msg || "Verification failed." });
        }
        return;
      }
      setSuccessMsg("Registration successful! You can now login.");
      setStep(3);
    } catch (err) {
      setErrors({ general: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card" role="main" aria-live="polite">
        {step === 1 && (
          <>
            <div className="login-header">
              <h2 className="login-title">Register</h2>
              <p className="login-subtitle">Create a new account</p>
            </div>

            {errors.general && (
              <div className="login-error" role="alert" tabIndex={-1}>
                {errors.general}
              </div>
            )}
            {successMsg && (
              <div className="login-success" role="status">
                {successMsg}
              </div>
            )}

            <form
              onSubmit={handleRegisterSubmit}
              className="login-form"
              noValidate
            >
              <div className="login-form-group">
                <label htmlFor="register-name" className="login-label">
                  Name
                </label>
                <div className="login-input-wrapper">
                  <FiUser className="login-icon" />
                  <input
                    id="register-name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="login-input"
                    aria-describedby="name-error"
                    aria-invalid={!!errors.name}
                    required
                  />
                </div>
                {errors.name && (
                  <p
                    id="name-error"
                    className="login-error"
                    role="alert"
                    aria-live="assertive"
                  >
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="login-form-group">
                <label htmlFor="register-email" className="login-label">
                  Email
                </label>
                <div className="login-input-wrapper">
                  <FiMail className="login-icon" />
                  <input
                    id="register-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="login-input"
                    aria-describedby="email-error"
                    aria-invalid={!!errors.email}
                    required
                  />
                </div>
                {errors.email && (
                  <p
                    id="email-error"
                    className="login-error"
                    role="alert"
                    aria-live="assertive"
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="login-form-group">
                <label htmlFor="register-password" className="login-label">
                  Password
                </label>
                <div className="login-input-wrapper">
                  <FiLock className="login-icon" />
                  <input
                    id="register-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="login-input"
                    aria-describedby="password-error"
                    aria-invalid={!!errors.password}
                    required
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
                    role="alert"
                    aria-live="assertive"
                  >
                    {errors.password}
                  </p>
                )}
              </div>

              <button type="submit" disabled={loading} className="login-btn">
                {loading ? "Sending Code..." : "Register"}
              </button>

              <div className="register-footer">
                Already have an account? <Link to="/login">Login</Link>
              </div>
            </form>
          </>
        )}

        {step === 2 && (
          <>
            <div className="login-header">
              <h2 className="login-title">Verify Email</h2>
              <p className="login-subtitle">
                Enter the 4-digit code sent to your email
              </p>
            </div>

            {errors.general && (
              <div className="login-error" role="alert" tabIndex={-1}>
                {errors.general}
              </div>
            )}
            {successMsg && (
              <div className="login-success" role="status">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleOtpVerify} className="login-form" noValidate>
              <div className="otp-input-group">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="otp-input"
                    value={digit}
                    ref={(el) => (otpRefs.current[idx] = el)}
                    onChange={(e) => handleOtpChange(e, idx)}
                    onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                    aria-label={`Digit ${idx + 1}`}
                    aria-describedby="otp-error"
                    aria-invalid={!!errors.otp}
                    required
                  />
                ))}
                {errors.otp && (
                  <p
                    className="login-error"
                    style={{ marginTop: "0.3rem", marginBottom: "1rem" }}
                    id="otp-error"
                    role="alert"
                    aria-live="assertive"
                  >
                    {errors.otp}
                  </p>
                )}
              </div>

              <button type="submit" disabled={loading} className="login-btn">
                {loading ? "Verifying..." : "Verify Code"}
              </button>

              <div className="login-footer">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp(new Array(OTP_LENGTH).fill(""));
                    setErrors({});
                    setSuccessMsg("");
                  }}
                  className="login-forgot-password"
                >
                  Back to Registration
                </button>
              </div>
            </form>
          </>
        )}

        {step === 3 && (
          <div className="login-success-container">
            <div className="login-header">
              <h2 className="login-title">Registration Successful</h2>
            </div>
            <p className="login-success">
              Your account has been created. You can now{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="login-forgot-password"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  fontWeight: "600",
                  color: "var(--login-primary)",
                }}
              >
                login
              </button>{" "}
              to continue.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
