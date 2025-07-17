import { BACKEND_URL } from "../constants";

/**
 * Fetch all source types for a given sourceKey
 * GET /api/source-types/:sourceKey
 */
export const fetchSourceTypesByKey = async (sourceKey) => {
  const response = await fetch(
    `${BACKEND_URL}api/sourcetype/${encodeURIComponent(sourceKey)}`
  );
  if (!response.ok) throw new Error("Failed to fetch source types");
  return response.json();
};
