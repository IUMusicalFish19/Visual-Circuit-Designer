import React, { useState, useEffect, useRef } from "react";
import "../../CSS/auth.css";
import "../../CSS/variables.css";
import { Link } from "react-router-dom";

const EMAIL_REGEXP =
  /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu;

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isTouched, setIsTouched] = useState(false);
  const emailRef = useRef(null);

  const isValidEmail = EMAIL_REGEXP.test(email);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  useEffect(() => {
    if (emailRef.current) {
      const showError = isTouched && !EMAIL_REGEXP.test(email) && email !== "";
      emailRef.current.style.borderColor = showError ? "red" : "var(--main-5)";
    }
  }, [isValidEmail, isTouched, email]);

  return (
    <div className="auth-container">
      <div className="auth-window">
        <div className="auth-window-text">Log in</div>
        <div className="input-line-container">
          <div className="input-email-text">Enter email:</div>
          <input
            ref={emailRef}
            className={`input-email-window ${isTouched && !isValidEmail && email !== "" ? "invalid" : ""}`}
            value={email}
            onChange={handleEmailChange}
            onBlur={() => setIsTouched(true)}
            placeholder="myEmail@example.com"
          />

          <div className="input-password-text">Enter password:</div>
          <input
            className="input-password-window"
            type="password"
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        <Link
          to="/profile"
          className="log-in-button"
          style={{ textDecoration: "none" }}
        >
          <span className="log-in-button-text">Log in</span>
        </Link>
        <div className="register-text"> Have no account? </div>
        <Link to="/reg" className="register-link">
          <span className="register-link-text">Register</span>
        </Link>
      </div>
    </div>
  );
};

export default Auth;
