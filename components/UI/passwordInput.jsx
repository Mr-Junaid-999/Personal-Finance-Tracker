// components/PasswordInput.jsx - WITH VALIDATION
"use client";
import { useState } from "react";

export default function PasswordInput({
  name = "password",
  label = "Password",
  required = true,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState([]);

  // Password validation rules
  const validatePassword = (value) => {
    const newErrors = [];

    if (value.length < 8) {
      newErrors.push("Password must be at least 8 characters");
    }
    if (!/(?=.*[a-z])/.test(value)) {
      newErrors.push("Password must contain at least one lowercase letter");
    }
    if (!/(?=.*[A-Z])/.test(value)) {
      newErrors.push("Password must contain at least one uppercase letter");
    }
    if (!/(?=.*\d)/.test(value)) {
      newErrors.push("Password must contain at least one number");
    }
    if (!/(?=.*[@$!%*?&])/.test(value)) {
      newErrors.push(
        "Password must contain at least one special character (@$!%*?&)"
      );
    }

    return newErrors;
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    if (value.length > 0) {
      setErrors(validatePassword(value));
    } else {
      setErrors([]);
    }
  };

  // Password strength indicator
  const getPasswordStrength = () => {
    if (password.length === 0) return { strength: 0, color: "bg-gray-200" };

    const errors = validatePassword(password);
    const strength = 5 - errors.length; // 5 total requirements

    if (strength <= 2) return { strength, color: "bg-red-500" };
    if (strength <= 3) return { strength, color: "bg-yellow-500" };
    return { strength, color: "bg-green-500" };
  };

  const { strength, color } = getPasswordStrength();

  return (
    <div className="mb-6">
      <div className="relative">
        <input
          name={name}
          id={name}
          value={password}
          onChange={handlePasswordChange}
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline pr-20 ${
            errors.length > 0 && password.length > 0
              ? "border-red-500"
              : "border-gray-300"
          }`}
          type={showPassword ? "text" : "password"}
          placeholder="Enter your password"
          required={required}
        />

        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-600 hover:text-gray-800"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      {/* Password Strength Indicator */}
      {password.length > 0 && (
        <div className="mt-2">
          <div className="flex space-x-1 mb-1">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className={`h-1 flex-1 rounded ${
                  item <= strength ? color : "bg-gray-200"
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-gray-600">
            Strength:{" "}
            {strength <= 2 ? "Weak" : strength <= 3 ? "Medium" : "Strong"}
          </p>
        </div>
      )}

      {/* Validation Errors */}
      {errors.length > 0 && (
        <div className="mt-2">
          {errors.map((error, index) => (
            <p
              key={index}
              className="text-red-500 text-xs mt-1 flex items-center"
            >
              <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
              {error}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
