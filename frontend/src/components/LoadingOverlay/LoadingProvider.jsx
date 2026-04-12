import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

const LoadingContext = createContext({
  active: false,
  startLoading: () => {},
  stopLoading: () => {},
});

export function useLoading() {
  return useContext(LoadingContext);
}

function shouldSkipFetch(url, method = "GET") {
  if (!url) return false;
  // Avoid accidental overlays for dev tooling / noise.
  if (url.includes("sockjs-node") || url.includes("hot-update")) return true;

  // Don't show global loading overlay when approving/unapproving interview questions.
  const upperMethod = String(method || "GET").toUpperCase();
  if (url.includes("/api/questions/") && (upperMethod === "PATCH" || upperMethod === "PUT")) {
    return true;
  }

  return false;
}

export default function LoadingProvider({ children }) {
  const [loadingCount, setLoadingCount] = useState(0);
  const loadingCountRef = useRef(0);

  const startLoading = useCallback(() => {
    loadingCountRef.current += 1;
    setLoadingCount(loadingCountRef.current);
  }, []);

  const stopLoading = useCallback(() => {
    loadingCountRef.current = Math.max(0, loadingCountRef.current - 1);
    setLoadingCount(loadingCountRef.current);
  }, []);

  useEffect(() => {
    const originalFetch = window.fetch;

    window.fetch = async (...args) => {
      const input = args[0];
      const init = args[1];
      const url = typeof input === "string" ? input : input?.url;
      const method =
        init?.method ||
        (typeof input !== "string" ? input?.method : undefined) ||
        "GET";

      if (shouldSkipFetch(url, method)) {
        return originalFetch(...args);
      }

      startLoading();
      try {
        return await originalFetch(...args);
      } finally {
        stopLoading();
      }
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [startLoading, stopLoading]);

  const value = useMemo(
    () => ({
      active: loadingCount > 0,
      startLoading,
      stopLoading,
    }),
    [loadingCount, startLoading, stopLoading]
  );

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
}
