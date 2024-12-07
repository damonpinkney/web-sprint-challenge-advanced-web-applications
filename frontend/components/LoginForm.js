import React, { useState } from 'react';

const initialFormValues = { username: '', password: '' };

export default function LoginForm({ login }) {
  const [values, setValues] = useState(initialFormValues);

  const onChange = evt => {
    const { id, value } = evt.target;
    setValues({ ...values, [id]: value });
  };

  const onSubmit = evt => {
    evt.preventDefault();
    login(values);
  };

  const isDisabled = () => {
    const { username, password } = values;
    return !(username.trim().length >= 3 && password.trim().length >= 8);
  };

  return (
    <form id="loginForm" onSubmit={onSubmit}>
      <h2>Login</h2>
      <input
        onChange={onChange}
        value={values.username}
        placeholder="Enter username"
        id="username"
      />
      <input
        onChange={onChange}
        value={values.password}
        placeholder="Enter password"
        id="password"
        type="password"
      />
      <button data-testid="loginBtn" disabled={isDisabled()} id="submitCredentials">
        Submit credentials
      </button>
    </form>
  );
}
