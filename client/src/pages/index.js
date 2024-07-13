import React from "react";
const Home = React.lazy(() => import("./Home"));
const Others = React.lazy(() => import("./Others"));
const Landing = React.lazy(() => import("./Landing"));
const Register = React.lazy(() => import("./Register"));

export { Home, Others, Landing, Register };
