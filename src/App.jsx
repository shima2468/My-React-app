import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { AuthLayout, SignIn } from "./assets/pages";
import SignUp from "./assets/pages/Authentication/Signup/SignUp";
;

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <AuthLayout />,
      // errorElement: <NotFound />,
      children: [
        { index: true, element: <SignIn /> },
        // Auth routes
        { path: "login", element: <SignIn /> },
        { path: "register", element: <SignUp /> },
      ],
    },
  ]);
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
