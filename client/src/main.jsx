import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Spinner from "./components/spinner.jsx";
import {
  Home,
  WaitingPage,
  Others,
  Register,
  AlottedRooms,
  Success,
} from "./pages/index.js";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/Register",
    element: <Register />,
  },
  {
    path: "/allotroom",
    element: <Others />,
  },
  {
    path: "/success",
    element: <Success />,
  },
  {
    path: "/waiting",
    element: <WaitingPage />,
  },
  {
    path: "/AlottedRooms",
    element: <AlottedRooms />,
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Suspense fallback={<Spinner loading={true} />}>
      <RouterProvider router={router} />
    </Suspense>
  </React.StrictMode>
);
