import apiClient from "./apiClient";

export const getAllInstructorsApi = async () => {
  try {
    const response = await apiClient.get("/instructors");
    return response.data;
  } catch (error) {
    console.error("Get instructors error:", error);
    throw error.response?.data || { message: "Failed to fetch instructors" };
  }
};

export const getFeaturedInstructorsApi = async (limit = 4) => {
  try {
    const response = await apiClient.get(
      `/instructors/featured?limit=${limit}`
    );
    return response.data;
  } catch (error) {
    console.error("Get featured instructors error:", error);
    throw (
      error.response?.data || {
        message: "Failed to fetch featured instructors",
      }
    );
  }
};

export const searchInstructorsApi = async ({
  search = "",
  major = "",
  type = "",
  timeslots = [],
  minFee = 0,
  maxFee = 1000000,
  page = 1,
  pageSize = 10,
}) => {
  try {
    const params = new URLSearchParams({
      search,
      page: String(page),
      pageSize: String(pageSize),
      minFee: String(minFee),
      maxFee: String(maxFee),
    });
    if (major) params.append("major", major);
    if (type) params.append("type", type);

    if (timeslots && timeslots.length > 0) {
      timeslots.forEach((timeslot) => {
        params.append("timeslots", timeslot);
      });
    }

    const response = await apiClient.get(`/instructors?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to search instructors" };
  }
};

export const getInstructorByIdApi = async (instructorId) => {
  try {
    const response = await apiClient.get(`/instructors/${instructorId}`);
    return response.data;
  } catch (error) {
    console.error("Get instructor error:", error);
    throw error.response?.data || { message: "Failed to fetch instructor" };
  }
};
