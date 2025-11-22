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

// Tạo bài tập mới
export const createAssignmentApi = async (assignmentData) => {
  try {
    const response = await apiClient.post("/instructor/assignments", {
      ...assignmentData,
      Status: "active"
    });
    return response.data;
  } catch (error) {
    console.error("Create assignment error:", error);
    throw error.response?.data || { message: "Không thể tạo bài tập" };
  }
};

// Cập nhật bài tập
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



// Lấy danh sách Course của instructor
export const getCoursesApi = async () => {
  try {
    const response = await apiClient.get("/instructor/courses");
    const courses = response.data?.courses || [];
    const mapped = courses.map(c => ({
      value: c.CourseID,
      label: (c.Title || "").trim(),
    }));
    return mapped;
  } catch (error) {
    return [];
  }
};

// Lấy tất cả Units của instructor (không filter theo course)
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

// Lấy Units theo courseId (dropdown động)
export const getUnitsByCourseApi = async (courseId) => {
  if (!courseId) return [];
  try {
    const response = await apiClient.get("/instructor/units", {
      params: { courseId },
    });
    const units = response.data?.units || [];
    return Array.isArray(units) ? units : [];
  } catch (error) {
    console.error("Get units by course error:", error);
    return [];
  }
};



// Upload file lên Cloudinary
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


// Lấy danh sách câu hỏi của assignment
export const getAssignmentQuestionsApi = async (assignmentId) => {
  try {
    const response = await apiClient.get(`/instructor/assignments/${assignmentId}/questions`);
    return response.data.questions || [];
  } catch (error) {
    console.error("Get questions error:", error);
    throw error.response?.data || { message: "Không thể tải danh sách câu hỏi" };
  }
};



export const addQuestionToAssignmentApi = async (assignmentId, questionData) => {
  try {
    const payload = questionData.questions
      ? questionData
      : { questions: [questionData] };
    const response = await apiClient.post(
      `/instructor/assignments/${assignmentId}/questions`,
      payload
    );
    return response.data;
  } catch (error) {
    console.error("Add question error:", error);
    console.error("Error details:", error.response?.data);
    throw error.response?.data || { message: "Không thể thêm câu hỏi" };
  }
};

// Xóa một câu hỏi khỏi assignment
export const removeQuestionFromAssignmentApi = async (assignmentId, questionId) => {
  try {
    const response = await apiClient.delete(
      `/instructor/assignments/${assignmentId}/questions/${questionId}`
    );
    return response.data;
  } catch (error) {
    console.error("Remove question error:", error);
    throw error.response?.data || { message: "Không thể xóa câu hỏi" };
  }
};



// Lấy stats của tất cả assignments
export const getAllAssignmentsStatsApi = async () => {
  try {
    const response = await apiClient.get("/instructor/stats/all");
    return response.data.stats || [];
  } catch (error) {
    console.error("Get all stats error:", error);
    throw error.response?.data || { message: "Không thể tải thống kê" };
  }
};

// Lấy stats của 1 assignment cụ thể
export const getAssignmentStatsApi = async (assignmentId) => {
  try {
    const response = await apiClient.get(`/instructor/assignments/${assignmentId}/stats`);
    return response.data;
  } catch (error) {
    console.error("Get assignment stats error:", error);
    throw error.response?.data || { message: "Không thể tải thống kê bài tập" };
  }
};



// Format date cho API (yyyy-mm-dd)
export const formatDateForApi = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Validate assignment data trước khi gửi API
export const validateAssignmentData = (data) => {
  const errors = {};

  if (!data.title?.trim()) {
    errors.title = "Tiêu đề là bắt buộc";
  }

  if (!data.description?.trim()) {
    errors.description = "Mô tả là bắt buộc";
  }

  const validTypes = ["quiz", "audio", "video", "document"];
  if (data.type && !validTypes.includes(data.type)) {
    errors.type = "Loại bài tập không hợp lệ";
  }

  const validStatuses = ["draft", "published", "scheduled", "archived", "deleted"];
  if (data.status && !validStatuses.includes(data.status)) {
    errors.status = "Trạng thái không hợp lệ";
  }

  const validShowAnswers = ["after_submission", "after_deadline", "never"];
  if (data.showAnswersAfter && !validShowAnswers.includes(data.showAnswersAfter)) {
    errors.showAnswersAfter = "Giá trị ShowAnswersAfter không hợp lệ";
  }

  if (data.deadline) {
    const deadlineDate = new Date(data.deadline);
    if (isNaN(deadlineDate.getTime())) {
      errors.deadline = "Hạn nộp không hợp lệ";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validate question data (theo từng type)
export const validateQuestionData = (data) => {
  const errors = {};
  if (!data.content?.trim()) {
    errors.content = "Nội dung câu hỏi là bắt buộc";
  }
  switch (data.type) {
    case "multiple_choice": {
      if (!Array.isArray(data.options) || data.options.length < 2) {
        errors.options = "Cần ít nhất 2 lựa chọn";
      } else {
        const hasCorrect = data.options.some((o) => o.isCorrect === true);
        if (!hasCorrect) {
          errors.options = "Phải có ít nhất 1 đáp án đúng";
        }
      }
      break;
    }
    case "true_false": {
      const val = (data.correctAnswer || "").toString().toLowerCase();
      if (!["true", "false"].includes(val)) {
        errors.correctAnswer = "Đáp án đúng phải là 'true' hoặc 'false'";
      }
      break;
    }
    case "fill_in_blank": {
      if (!data.correctAnswer || (typeof data.correctAnswer === "string" && !data.correctAnswer.trim())) {
        errors.correctAnswer = "Đáp án đúng là bắt buộc";
      }
      break;
    }
    case "matching": {
      const ca = data.correctAnswer;
      const isEmptyObject = typeof ca === "object" && ca !== null && Object.keys(ca).length === 0;
      const isEmptyString = typeof ca === "string" && !ca.trim();
      if (!ca || isEmptyObject || isEmptyString) {
        errors.correctAnswer = "Cặp ghép đúng là bắt buộc";
      }
      break;
    }
    case "essay":
    case "speaking": {
      break;
    }
    default:
      errors.type = "Loại câu hỏi không hợp lệ";
  }
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
// Import câu hỏi từ file Excel vào 1 assignment
export const importQuestionsFromExcelApi = async (assignmentId, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file); // tên field "file" phải trùng với backend

    const response = await apiClient.post(
      `/instructor/assignments/${assignmentId}/questions/import-excel`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Import questions from Excel error:", error);
    throw error.response?.data || { message: "Không thể import câu hỏi từ Excel" };
  }
};

// Parse assignment data từ API response
export const parseAssignmentFromApi = (apiData) => {
  return {
    assignmentId: apiData.AssignmentID,
    title: apiData.Title,
    description: apiData.Description,
    deadline: apiData.Deadline,
    type: apiData.Type,
    status: apiData.Status,
    fileURL: apiData.FileURL,
    mediaURL: apiData.MediaURL,
    maxDuration: apiData.MaxDuration,
    showAnswersAfter: apiData.ShowAnswersAfter,
    unitId: apiData.UnitID,
    unitTitle: apiData.UnitTitle,
    courseId: apiData.CourseID,
    courseTitle: apiData.CourseTitle,
    instructorName: apiData.InstructorName,
  };
};

// Prepare assignment data để gửi lên API
export const prepareAssignmentForApi = (formData) => {
  return {
    title: formData.title,
    description: formData.description,
    deadline: formData.deadline ? formatDateForApi(formData.deadline) : null,
    type: formData.type || "document",
    status: formData.status || "draft",
    unitId: formData.unitId || null,
    fileURL: formData.fileURL || null,
    mediaURL: formData.mediaURL || null,
    maxDuration: formData.maxDuration || null,
    showAnswersAfter: formData.showAnswersAfter || "after_submission",
    questions: formData.type === "quiz" ? (formData.localQuestions || []) : []

  };
};