import React from "react";
const Home = React.lazy(() => import("./Home"));
const Others = React.lazy(() => import("./Others"));
const WaitingPage = React.lazy(() => import("./WaitingPage"));
const Register = React.lazy(() => import("./Register"));
const AlottedRooms = React.lazy(() => import("./FresherRoom"));
const Success = React.lazy(() => import("./Success"));

export { Home, Others, WaitingPage, Register, AlottedRooms, Success };
