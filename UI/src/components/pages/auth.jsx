import React, { useState, useEffect, useCallback } from "react";
import "../../CSS/auth.css";
import "../../CSS/variables.css";
import { Link, useNavigate } from "react-router-dom";

const Auth = () => {
  const navigate = useNavigate();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");

  const [loginError, setLoginError] = useState("");
  const [wasLoginFocused, setWasLoginFocused] = useState(false);

  const [passwordError, setPasswordError] = useState("");
  const [wasPasswordFocused, setWasPasswordFocused] = useState(false);

  const [serverError, setServerError] = useState("");

  const validateLogin = useCallback(() => {
    if (login.trim() === "") {
      return "Login is required";
    }
    return "";
  }, [login]);

  const validatePassword = useCallback(() => {
    if (password.trim() === "") {
      return "Password is required";
    }
    return "";
  }, [password]);

  // Обработчики изменений
  const handleLoginChange = (e) => setLogin(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);

  // Эффекты валидации
  useEffect(() => {
    if (wasLoginFocused) {
      setLoginError(validateLogin());
    }
  }, [login, wasLoginFocused, validateLogin]);

  useEffect(() => {
    if (wasPasswordFocused) {
      setPasswordError(validatePassword());
    }
  }, [password, wasPasswordFocused, validatePassword]);

  // Обработчик входа
  const handleLogin = async () => {
    setWasLoginFocused(true);
    setWasPasswordFocused(true);
    setLoginError("");
    setPasswordError("");
    setServerError("");

    const loginErr = validateLogin();
    const passwordErr = validatePassword();

    setLoginError(loginErr);
    setPasswordError(passwordErr);

    if (loginErr || passwordErr) {
      return;
    }
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("accessToken", data.access);
        localStorage.setItem("refreshToken", data.refresh);
        navigate("/profile");
      } else if (response.status === 401) {
        const errorText = await response.text();
        setServerError(errorText || "Invalid login or password");
      } else {
        const errorText = await response.text();
        setServerError(errorText || "Authorization failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setServerError("Network error. Please try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-window">
        <div className="auth-window-text">Log in</div>

        <div className="input-line-container">
          <div className="input-email-text">Login</div>
          <input
            className={`input-email-window ${wasLoginFocused && loginError ? "invalid" : ""}`}
            value={login}
            onChange={handleLoginChange}
            onFocus={() => setWasLoginFocused(false)}
            onBlur={() => {
              if (login.trim() !== "") {
                setWasLoginFocused(true);
              }
            }}
            placeholder="email or username"
          />
          {/* Ошибки валидации и не-401 ошибки сервера */}
          {wasLoginFocused && loginError && !serverError && (
            <div className="error-message email-error">{loginError}</div>
          )}

          <div className="input-password-text">Password:</div>
          <input
            className={`input-password-window ${wasPasswordFocused && passwordError ? "invalid" : ""}`}
            type="password"
            value={password}
            onChange={handlePasswordChange}
            onFocus={() => setWasPasswordFocused(false)}
            onBlur={() => {
              if (password.trim() !== "") {
                setWasPasswordFocused(true);
              }
            }}
          />
          {wasPasswordFocused && passwordError && (
            <div className="error-message password-error">{passwordError}</div>
          )}
        </div>

        <button className="log-in-button" onClick={handleLogin}>
          <span className="log-in-button-text">Log in</span>
        </button>
        {serverError && (
          <div className="server-error-message">{serverError}</div>
        )}

        <div className="register-text"> Don't have an account yet? </div>
        <Link to="/register" className="register-link">
          <span className="register-link-text">Register now</span>
        </Link>
      </div>
    </div>
  );
};

export default Auth;
