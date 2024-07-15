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
// Outlook Auth
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./authConfig.js";

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

export const msalInstance = new PublicClientApplication(msalConfig);
await msalInstance.initialize();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MsalProvider instance={msalInstance}>
      <Suspense fallback={<Spinner loading={true} />}>
        <RouterProvider router={router} />
      </Suspense>
    </MsalProvider>
  </React.StrictMode>
);
/* vi: set et sw=2: */
