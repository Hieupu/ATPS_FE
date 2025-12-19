import apiClient from "./apiClient";

export const getInstructorPayrollApi = async (
  startDate,
  endDate,
  instructorId = null,
  page = 1,
  limit = 10
) => {
  try {
    const params = {
      startDate,
      endDate,
      page,
      limit,
    };
    if (instructorId) {
      params.instructorId = instructorId;
    }
    const response = await apiClient.get("/payroll/instructors", { params });
    return response.data;
  } catch (error) {
    console.error(error);
    throw error.response?.data;
  }
};

export const getAllInstructorsApi = async () => {
  try {
    const response = await apiClient.get("/payroll/instructors/list");
    return response.data;
  } catch (error) {
    console.error("Get all instructors error:", error);
    throw (
      error.response?.data || {
        message: "Failed to fetch instructors",
      }
    );
  }
};
