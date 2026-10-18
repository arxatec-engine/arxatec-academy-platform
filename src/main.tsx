import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { Core } from "@/components/layout/core";
import { RouteFallback } from "@/components/shared/route_fallback";
import { router } from "@/routes/router";

import "./index.css";

const container = document.getElementById("root");
const previewSplash =
  import.meta.env.DEV &&
  new URLSearchParams(window.location.search).get("preview") === "splash";

if (container !== null) {
  createRoot(container).render(
    <StrictMode>
      <Core>
        {previewSplash ? (
          <RouteFallback />
        ) : (
          <RouterProvider router={router} />
        )}
      </Core>
    </StrictMode>,
  );
}
