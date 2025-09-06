import React, { Children, Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { RouterProvider, createBrowserRouter } from "react-router";
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
import Header from "@/components/Header";
// Outlook Auth
import { MsalProvider } from "@azure/msal-react";
import { PublicClientApplication, EventType } from "@azure/msal-browser";
import { msalConfig } from "./authConfig.js";
import SMPPage from "./pages/SMP";
import GetSMP from "./pages/getSMP";
// import SmpForm from "./components/SmpForm";

const router = createBrowserRouter([
  {
    errorElement: <Error />,
    children: [
      {
        path: "/",
        element: <Home />,
        errorElement: <Error />,
      },
      /* {
        path: "/Register",
        element: <Register />,
        errorElement: <Error />,
      }, */
      {
        path: "/allotroom",
        element: <Others />,
        errorElement: <Error />,
      },
      /* {
         path: "/smpform",
         element: <><Header /><SmpForm /></>,
         errorElement: <Error />,
       }, */
      {
        path: "/success",
        element: <Success />,
        errorElement: <Error />,
      },
      {
        path: "/smp",
        element: <SMPPage />,
        errorElement: <Error />,
      },
      {
        path: "/getSMP",
        element: <GetSMP />,
        errorElement: <Error />,
      },
      /* {
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
      }, */
    ],
  },
]);

/**
 * MSAL should be instantiated outside of the component tree to prevent it from being re-instantiated on re-renders.
 * For more, visit: https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-react/docs/getting-started.md
 */
const msalInstance = new PublicClientApplication(msalConfig);

// Default to using the first account if no account is active on page load
if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
  // Account selection logic is app dependent. Adjust as needed for different use cases.
  msalInstance.setActiveAccount(msalInstance.getAllAccounts()[0]);
}

// Listen for sign-in event and set active account
msalInstance.addEventCallback((event) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
    const account = event.payload.account;
    msalInstance.setActiveAccount(account);
  }
});

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
