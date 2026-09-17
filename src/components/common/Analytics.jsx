import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

function sendPageView(path) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", import.meta.env.VITE_GA_MEASUREMENT_ID || "", {
      page_path: path,
    });
  }
}

export default function Analytics() {
  const location = useLocation();
  const firstRender = useRef(true);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://www.googletagmanager.com/gtag/js?id=${import.meta.env.VITE_GA_MEASUREMENT_ID || ""}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag("js", new Date());
    sendPageView(location.pathname);

    return () => {
      script.remove();
    };
  }, []);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    sendPageView(location.pathname);
  }, [location.pathname]);

  return null;
}
