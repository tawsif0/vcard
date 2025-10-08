import React from "react";
import { useRoutes, Navigate } from "react-router-dom";
import Home from "../view/pages/Home";
import About from "../view/pages/About/About";
import Resume from "../view/pages/Resume/Resume";
import Contact from "../view/pages/Contact";
import Portfolio from "../view/pages/Portfolio";
import Blog from "../view/pages/Blog";

const usePremiumRoutes = (userId) => {
  const routes = useRoutes([
    {
      path: "/",
      element: <Navigate to="home" replace />,
    },
    {
      path: "home",
      element: <Home userId={userId} />,
    },
    {
      path: "about",
      element: <About userId={userId} />,
    },
    {
      path: "resume",
      element: <Resume userId={userId} />,
    },
    {
      path: "contact",
      element: <Contact userId={userId} />,
    },
    {
      path: "portfolio",
      element: <Portfolio userId={userId} />,
    },
    {
      path: "blog",
      element: <Blog userId={userId} />,
    },
  ]);

  return routes;
};

export default usePremiumRoutes;
