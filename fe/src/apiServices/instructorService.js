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

export const searchInstructorsApi = async ({
  search = "",
  major = "",
  sort = "newest",
  page = 1,
  pageSize = 10,
}) => {
  try {
    const params = new URLSearchParams({
      search,
      sort,
      page: String(page),
      pageSize: String(pageSize),
    });
    if (major) params.append("major", major);
    const response = await apiClient.get(`/instructors?${params.toString()}`);
    return response.data; // { items, total, page, pageSize }
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
