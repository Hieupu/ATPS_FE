import apiClient from "./apiClient";

// Lấy danh sách tất cả bài tập của giảng viên
export const getAssignmentsApi = async () => {
  try {
    const response = await apiClient.get("/instructor/assignments");
    return response.data.assignments || response.data;
  } catch (error) {
    console.error("Get assignments error:", error);
    throw error.response?.data || { message: "Không thể tải danh sách bài tập" };
  }
};

// Lấy chi tiết một bài tập
export const getAssignmentByIdApi = async (assignmentId) => {
  try {
    const response = await apiClient.get(`/instructor/assignments/${assignmentId}`);
    return response.data;
  } catch (error) {
    console.error("Get assignment error:", error);
    throw error.response?.data || { message: "Không thể tải thông tin bài tập" };
  }
};

// Tạo bài tập mới (draft hoặc active)
export const createAssignmentApi = async (assignmentData) => {
  try {
    const response = await apiClient.post("/instructor/assignments", assignmentData);
    return response.data;
  } catch (error) {
    console.error("Create assignment error:", error);
    throw error.response?.data || { message: "Không thể tạo bài tập" };
  }
};

// Cập nhật bài tập (update UnitTitle/UnitID, FileURL, Status, v.v.)
export const updateAssignmentApi = async (assignmentId, assignmentData) => {
  try {
    const response = await apiClient.put(`/instructor/assignments/${assignmentId}`, assignmentData);
    return response.data;
  } catch (error) {
    console.error("Update assignment error:", error);
    throw error.response?.data || { message: "Không thể cập nhật bài tập" };
  }
};

// Xóa mềm bài tập (Status = 'deleted')
export const deleteAssignmentApi = async (assignmentId) => {
  try {
    const response = await apiClient.delete(`/instructor/assignments/${assignmentId}`);
    return response.data;
  } catch (error) {
    console.error("Delete assignment error:", error);
    throw error.response?.data || { message: "Không thể xóa bài tập" };
  }
};

// Lấy danh sách Course của instructor (dropdown 1)
export const getCoursesApi = async () => {
  try {
    const response = await apiClient.get("/instructor/courses");
    console.log("📡 API /instructor/courses response:", response.data);

    const courses = response.data?.courses || [];
    const mapped = courses.map(c => ({
      value: c.CourseID,
      label: (c.Title || "").trim(),
    }));

    console.log("✅ mapped courses:", mapped);
    return mapped;
  } catch (error) {
    console.error("❌ Get courses error:", error);
    return [];
  }
};



// Lấy Units theo courseId (dropdown 2 - động theo Course)
export const getUnitsByCourseApi = async (courseId) => {
  if (!courseId) return [];
  try {
    const response = await apiClient.get(`/instructor/units`, {
      params: { courseId },
    });
    const units = response.data?.units || [];
    return Array.isArray(units) ? units : [];
  } catch (error) {
    console.error("Get units by course error:", error);
    return [];
  }
};

//Lấy tất cả Unit cho instructor 
export const getUnitsApi = async () => {
  try {
    const response = await apiClient.get("/instructor/units");
    const units = response.data?.units || [];
    return Array.isArray(units) ? units : [];
  } catch (error) {
    console.error("Get units error:", error);
    return [];
  }
};

// Upload file lên server (Cloudinary/multer)
export const uploadAssignmentFileApi = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post("/instructor/uploads", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data; 
  } catch (error) {
    console.error("Upload file error:", error);
    throw error.response?.data || { message: "Không thể upload file" };
  }
};
