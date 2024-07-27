import React, { Children, Suspense } from "react";
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
  FresherSuccess,
  Freshers,
  Success,
  Error,
} from "./pages/index.js";
// Outlook Auth
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication } from "@azure/msal-browser";
import { msalConfig } from "./authConfig.js";

const router = createBrowserRouter([
  {
    errorElement: <Error />,
    children: [
      {
        path: "/",
        element: <Home />,
        errorElement: <Error />,
      },
      {
        path: "/Register",
        element: <Register />,
        errorElement: <Error />,
      },
      {
        path: "/allotroom",
        element: <Others />,
        errorElement: <Error />,
      },
      {
        path: "/success",
        element: <Success />,
        errorElement: <Error />,
      },
      {
        path: "/waiting",
        element: <WaitingPage />,
        errorElement: <Error />,
      },
      {
        path: "/freshers",
        element: <Freshers />,
        errorElement: <Error />,
      },
      {
        path: "/fresher/success",
        element: <FresherSuccess />,
        errorElement: <Error />,
      },
    ],
  },
]);

export const msalInstance = new PublicClientApplication(msalConfig);
msalInstance.initialize().then(() => {
  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <MsalProvider instance={msalInstance}>
        <Suspense fallback={<Spinner loading={true} />}>
          <RouterProvider router={router} />
        </Suspense>
      </MsalProvider>
    </React.StrictMode>
  );
});
/* vi: set et sw=2: */
