import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { Core } from "@/components/layout/core";
import { router } from "@/routes/router";

import "./index.css";

const container = document.getElementById("root");

if (container !== null) {
  createRoot(container).render(
    <StrictMode>
      <Core>
        <RouterProvider router={router} />
      </Core>
    </StrictMode>,
  );
}
