"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";

const UserForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const value = e.target.value;
    const name = e.target.name;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    const res = await fetch("/api/Users", {
      method: "POST",
      body: JSON.stringify({ formData }),
      "content-type": "application/json",
    });

    if (!res.ok) {
      const response = await res.json();
      setErrorMessage(response.message);
    } else {
      router.refresh();
      router.push("/");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
           id="name"
           name="name"
           type="text"
           onChange={handleChange}
           required={true}
           value={formData.name}
           placeholder="enter name"
            className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
          />
          <input
             id="email"
             name="email"
             type="text"
             onChange={handleChange}
             required={true}
             value={formData.email}
             placeholder="Email"
            className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
          />
          <input
             id="password"
             name="password"
             type="password"
             onChange={handleChange}
             required={true}
             value={formData.password}
             placeholder="Password"
            className="w-full p-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
          />
          <button
            type="submit"
            value="Create User"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            Create User
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserForm;