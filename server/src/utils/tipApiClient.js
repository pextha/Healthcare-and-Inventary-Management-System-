import axios from "axios";

const TIP_API_BASE_URL = process.env.TIP_API_BASE_URL;

/** Fetch all tips for a specific pregnancy week (1–42) */
export async function fetchTipsByWeekFromAPI(weekNumber) {
  const url = `${TIP_API_BASE_URL}/api/tips/week/${weekNumber}`;
  const response = await axios.get(url);

  if (!response.data?.success || !Array.isArray(response.data?.data)) {
    throw new Error("Invalid response from pregnancy tips API");
  }

  return response.data.data; // array of tip objects
}
