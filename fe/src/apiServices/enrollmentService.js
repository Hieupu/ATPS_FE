import apiClient from "./apiClient";

const enrollmentService = {
  // Admin: change class for a learner
  changeClassForLearner: async ({ learnerId, fromClassId, toClassId }) => {
    try {
      const response = await apiClient.post("/enrollments/admin/change-class", {
        learnerId,
        fromClassId,
        toClassId,
      });
      return response.data;
    } catch (error) {
      console.error("Change class for learner error:", error);
      throw error.response?.data || {
        message: "Failed to change class for learner",
      };
    }
  },
};

export default enrollmentService;


