import React, { useState, useEffect, useCallback } from "react";
import "../../CSS/reg.css";
import "../../CSS/variables.css";
import { Link, useNavigate } from "react-router-dom";

const EMAIL_REGEXP =
  /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu;

const Reg = () => {
  const navigate = useNavigate();

  // Состояния полей формы
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Состояния валидации
  const [nameError, setNameError] = useState("");
  const [wasNameFocused, setWasNameFocused] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [wasEmailFocused, setWasEmailFocused] = useState(false);

  const [usernameError, setUsernameError] = useState("");
  const [wasUsernameFocused, setWasUsernameFocused] = useState(false);

  const [passwordError, setPasswordError] = useState("");
  const [wasPasswordFocused, setWasPasswordFocused] = useState(false);

  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [wasConfirmPasswordFocused, setWasConfirmPasswordFocused] =
    useState(false);

  // Функции валидации
  const validateName = useCallback(() => {
    if (name.trim() === "") {
      return "Name is required";
    }
    if (name.length < 2 || name.length > 52) {
      return "Name length must be 2-52 characters";
    }
    if (!/^[a-zA-Z]*$/.test(name)) {
      return "Name contains invalid character";
    }
    return "";
  }, [name]);

  const validateUsername = useCallback(() => {
    if (username.trim() === "") {
      return "Username is required";
    }
    if (username.length < 4 || username.length > 25) {
      return "Username length must be 4-25 characters";
    }
    if (!/^[a-zA-Z0-9._-]*$/.test(username)) {
      return "Username contains invalid character";
    }
    return "";
  }, [username]);

  const validateEmail = useCallback(() => {
    if (email.trim() === "") {
      return "Email is required";
    }
    if (!EMAIL_REGEXP.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  }, [email]);

  const validatePassword = useCallback(() => {
    if (password.trim() === "") {
      return "Password is required";
    }
    if (password.length < 8 || password.length > 16) {
      return "Password must be 8-16 characters";
    }
    if (!/^[a-zA-Z0-9]*$/.test(password)) {
      return "Password can only contain Latin letters and numbers";
    }
    return "";
  }, [password]);

  const validateConfirmPassword = useCallback(() => {
    if (confirmPassword.trim() === "") {
      return "Confirm password is required";
    }
    if (password !== confirmPassword) {
      return "Passwords do not match";
    }
    return "";
  }, [confirmPassword, password]);

  // Обработчики изменений
  const handleNameChange = (e) => setName(e.target.value);
  const handleUsernameChange = (e) => setUsername(e.target.value);
  const handleEmailChange = (e) => setEmail(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);

  // Эффект валидации
  useEffect(() => {
    if (wasNameFocused) {
      setNameError(validateName());
    }

    if (wasUsernameFocused) {
      setUsernameError(validateUsername());
    }

    if (wasEmailFocused) {
      setEmailError(validateEmail());
    }

    if (wasPasswordFocused) {
      setPasswordError(validatePassword());
    }

    if (wasConfirmPasswordFocused) {
      setConfirmPasswordError(validateConfirmPassword());
    }
  }, [
    name,
    wasNameFocused,
    username,
    wasUsernameFocused,
    email,
    wasEmailFocused,
    password,
    wasPasswordFocused,
    confirmPassword,
    wasConfirmPasswordFocused,
    validateName,
    validateUsername,
    validateEmail,
    validatePassword,
    validateConfirmPassword,
  ]);

  // Обработчик регистрации
  const handleRegister = async () => {
    setWasNameFocused(true);
    setWasUsernameFocused(true);
    setWasEmailFocused(true);
    setWasPasswordFocused(true);
    setWasConfirmPasswordFocused(true);

    const errors = {
      name: validateName(),
      username: validateUsername(),
      email: validateEmail(),
      password: validatePassword(),
      confirmPassword: validateConfirmPassword(),
    };

    setNameError(errors.name);
    setUsernameError(errors.username);
    setEmailError(errors.email);
    setPasswordError(errors.password);
    setConfirmPasswordError(errors.confirmPassword);

    const hasErrors = Object.values(errors).some((error) => error !== "");

    if (!hasErrors) {
      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            username,
            email,
            password,
          }),
        });
        if (response.ok) {
          navigate("/profile");
        } else if (response.status === 409) {
          const errorText = await response.text();
          if (errorText === "username exists") {
            setUsernameError(errorText);
          } else if (errorText === "email exists") {
            setEmailError(errorText);
          }
        } else {
          throw new Error("Registration failed");
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <div className="reg-container">
      <div className="reg-window">
        <div className="reg-window-text">Registration</div>
        <div className="input-line-container">
          {/*Поле для имени*/}
          <div className="input-name-text">Name</div>
          <input
            className={`input-name-window ${
              wasNameFocused && nameError ? "invalid" : ""
            }`}
            value={name}
            onChange={handleNameChange}
            onFocus={() => setWasNameFocused(false)}
            onBlur={() => {
              if (name.trim() !== "") {
                setWasNameFocused(true);
              }
            }}
          />
          {wasNameFocused && nameError && (
            <div className="error-message name-error">{nameError}</div>
          )}
          {/* Поле username */}
          <div className="input-username-text">Username</div>
          <input
            className={`input-username-window ${
              wasUsernameFocused && usernameError ? "invalid" : ""
            }`}
            value={username}
            onChange={handleUsernameChange}
            onFocus={() => setWasUsernameFocused(false)}
            onBlur={() => {
              if (username.trim() !== "") {
                setWasUsernameFocused(true);
              }
            }}
          />
          {wasUsernameFocused && usernameError && (
            <div className="error-message username-error">{usernameError}</div>
          )}

          {/* Поле email */}
          <div className="input-email-text">Email</div>
          <input
            className={`input-email-window ${
              wasEmailFocused && emailError ? "invalid" : ""
            }`}
            value={email}
            onChange={handleEmailChange}
            onFocus={() => setWasEmailFocused(false)}
            onBlur={() => {
              if (email.trim() !== "") {
                setWasEmailFocused(true);
              }
            }}
            placeholder="myEmail@example.com"
          />
          {wasEmailFocused && emailError && (
            <div className="error-message email-error">{emailError}</div>
          )}

          {/* Поля пароля */}
          <div className="input-password-text">Password</div>
          <input
            className={`input-password-window ${
              wasPasswordFocused && passwordError ? "invalid" : ""
            }`}
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
            <div className="error-message password-main-error">
              {passwordError}
            </div>
          )}

          <div className="input-confirm-password-text">Confirm password:</div>
          <input
            className={`input-password-window ${
              wasConfirmPasswordFocused && confirmPasswordError ? "invalid" : ""
            }`}
            type="password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            onFocus={() => setWasConfirmPasswordFocused(false)}
            onBlur={() => {
              if (confirmPassword.trim() !== "") {
                setWasConfirmPasswordFocused(true);
              }
            }}
          />
          {wasConfirmPasswordFocused && confirmPasswordError && (
            <div className="error-message password-error">
              {confirmPasswordError}
            </div>
          )}
        </div>

        <button className="reg-button" onClick={handleRegister}>
          <span className="reg-button-text">Register</span>
        </button>

        <div className="login-text"> Already have an account? </div>
        <Link to="/login" className="login-link">
          <span className="login-link-text">Log In</span>
        </Link>
      </div>
    </div>
  );
};

export default Reg;
