import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { signup } from "../../services/authentication";

export function SignupPage() {
  const [userInfo, setUserInfo] = useState({
    email: '',
    password: '',
    username: '',
    firstname: '',
    lastname: ''
  })

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      await signup(userInfo);
      navigate("/login");
    } catch (err) {
      console.error(err);
      navigate("/signup");
    }
  }


  const handleInputChanges = (e) => {
    setUserInfo({...userInfo, [e.target.name]: e.target.value})
  } 

  return (
    <>
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email:</label>
        <input
          id="email"
          type="text"
          name='email'
          value={userInfo.email}
          placeholder="email"
          onChange={handleInputChanges}
        />
        <label htmlFor="password">Password:</label>
        <input
          placeholder="Password"
          id="password"
          type="password"
          name='password'
          value={userInfo.password}
          onChange={handleInputChanges}
        />
        <label htmlFor="username">Username:</label>
        <input
          placeholder="username"
          id="username"
          type="text"
          name='username'
          value={userInfo.username}
          onChange={handleInputChanges}
        />
        <label htmlFor="firstname">First Name:</label>
        <input
          placeholder="firsname"
          id="firstname"
          type="text"
          name='firstname'
          value={userInfo.firstname}
          onChange={handleInputChanges}
        />
        <label htmlFor="lastname">Last Name:</label>
        <input
          placeholder="lastname"
          id="lastname"
          type="text"
          name='lastname'
          value={userInfo.lastname}
          onChange={handleInputChanges}
        />
        <input role="submit-button" id="submit" type="submit" value="Submit" />
      </form>
    </>
  );
}
