import { QueryClient } from "@tanstack/react-query";

async function throwIfResNotOk(res) {
  if (!res.ok) {
    throw new Error(await res.text());
  }
}

export async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  await throwIfResNotOk(response);
  
  if (response.headers.get("content-type")?.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

export const getQueryFn = (options) => {
  const { on401 } = options;
  
  return async ({ queryKey }) => {
    const [url] = queryKey;
    
    try {
      return await apiRequest(url);
    } catch (error) {
      if (error.message.includes("401") || error.message.includes("Unauthorized")) {
        if (on401 === "returnNull") {
          return null;
        } else {
          throw error;
        }
      }
      throw error;
    }
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});