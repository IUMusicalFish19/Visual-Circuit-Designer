import React, { useState, useEffect, useRef } from "react";
import "../../CSS/reg.css";
import "../../CSS/variables.css";
import { Link } from "react-router-dom";

const EMAIL_REGEXP =
  /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu;
const USERNAME_REGEXP = /^[a-zA-Z0-9._-]{4,25}$/;

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isTouched, setIsTouched] = useState(false);
  const emailRef = useRef(null);
  const [username, setUsername] = useState("");
  const [isUsernameTouched, setIsUsernameTouched] = useState(false);
  const usernameRef = useRef(null);

  const [confirmPassword, setConfirmPassword] = useState("");
  const [isConfirmPasswordTouched, setIsConfirmPasswordTouched] =
    useState(false);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const isValidUsername = USERNAME_REGEXP.test(username);

  const isValidEmail = EMAIL_REGEXP.test(email);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };

  const passwordsMatch = password === confirmPassword;

  useEffect(() => {
    if (usernameRef.current) {
      const showError =
        isUsernameTouched && !isValidUsername && username !== "";
      usernameRef.current.style.borderColor = showError
        ? "red"
        : "var(--main-5)";
    }

    if (emailRef.current) {
      const showEmailError = isTouched && !isValidEmail && email !== "";
      emailRef.current.style.borderColor = showEmailError
        ? "red"
        : "var(--main-5)";
    }

    if (passwordRef.current) {
      passwordRef.current.style.borderColor = "var(--main-5)";
    }

    if (confirmPasswordRef.current) {
      const showError =
        isConfirmPasswordTouched && !passwordsMatch && confirmPassword !== "";
      confirmPasswordRef.current.style.borderColor = showError
        ? "red"
        : "var(--main-5)";
    }
  }, [
    isValidUsername,
    isUsernameTouched,
    username,
    isValidEmail,
    isTouched,
    email,
    passwordsMatch,
    isConfirmPasswordTouched,
    confirmPassword,
  ]);

  return (
    <div className="reg-container">
      <div className="reg-window">
        <div className="reg-window-text">Registration</div>
        <div className="input-line-container">
          <div className="input-username-text">Username</div>
          <input
            ref={usernameRef}
            className={`input-username-window ${
              isUsernameTouched && !isValidUsername && username !== ""
                ? "invalid"
                : ""
            }`}
            value={username}
            onChange={handleUsernameChange}
            onBlur={() => setIsUsernameTouched(true)}
          />

          <div className="input-email-text">Email</div>
          <input
            ref={emailRef}
            className={`input-email-window ${isTouched && !isValidEmail && email !== "" ? "invalid" : ""}`}
            value={email}
            onChange={handleEmailChange}
            onBlur={() => setIsTouched(true)}
            placeholder="myEmail@example.com"
          />

          <div className="input-password-text">Password</div>
          <input
            className="input-password-window"
            type="password"
            value={password}
            onChange={handlePasswordChange}
          />
          <div className="input-confirm-password-text">Confirm password:</div>
          <input
            ref={confirmPasswordRef}
            className={`input-password-window ${
              isConfirmPasswordTouched &&
              !passwordsMatch &&
              confirmPassword !== ""
                ? "invalid"
                : ""
            }`}
            type="password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            onBlur={() => setIsConfirmPasswordTouched(true)}
          />
        </div>
        <Link
          to="/profile"
          className="reg-button"
          style={{ textDecoration: "none" }}
        >
          <span className="reg-button-text">Register</span>
        </Link>
      </div>
    </div>
  );
};

export default Auth;
