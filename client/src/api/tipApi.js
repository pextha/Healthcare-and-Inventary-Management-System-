import axiosInstance from "./axiosInstance";

/** Fetch all tips for the mother's current pregnancy week (MOTHER only) */
export const getTipsForCurrentWeek = () => axiosInstance.get("/tips/current-week");
