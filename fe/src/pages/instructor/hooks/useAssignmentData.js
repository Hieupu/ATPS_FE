import { useState, useCallback } from "react";
import {
  getAssignmentsApi,
  createAssignmentApi,
  updateAssignmentApi,
  deleteAssignmentApi,
  getCoursesApi,
  getUnitsByCourseApi,
  uploadAssignmentFileApi,
} from "../../../apiServices/assignmentService";

export function useAssignmentData() {
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [units, setUnits] = useState([]);

  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [busy, setBusy] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load assignments
  const loadAssignments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAssignmentsApi();
      setAssignments(data || []);
    } catch (err) {
      setError(err.message || "Không thể tải bài tập");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load courses
  const loadCourses = useCallback(async () => {
    setCoursesLoading(true);
    try {
      const data = await getCoursesApi();
      setCourses(data || []);
    } catch (err) {
      setCourses([]);
      setError(err?.message || "Không thể tải danh sách Course");
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  // Load units by course
  const loadUnitsByCourse = useCallback(async (courseId) => {
    if (!courseId) {
      setUnits([]);
      return;
    }

    setUnitsLoading(true);
    try {
      const data = await getUnitsByCourseApi(courseId);
      const mapped = (data || [])
        .map(u => ({
          value: u.UnitID ?? u.unitId,
          label: u.Title ?? u.title ?? "",
        }))
        .filter(x => x.value && x.label);
      setUnits(mapped);
    } catch (err) {
      setUnits([]);
      setError(err?.message || "Không thể tải danh sách Unit");
    } finally {
      setUnitsLoading(false);
    }
  }, []);

  // Create assignment
  const createAssignment = useCallback(async (payload) => {
    setBusy(true);
    try {
      const res = await createAssignmentApi(payload);
      const created = res.assignment || res.data || res;
      const enriched = {
        ...created,
        CourseTitle: courses.find(c => c.CourseID === payload.courseId)?.Title ||
          courses.find(c => c.value === payload.courseId)?.label ||
          'Chưa gán khóa học',
        UnitTitle: units.find(u => u.value === payload.unitId)?.label || ''
      };
      setAssignments(prev => [created, ...prev]);
      setSuccess("Tạo bài tập thành công");
      return enriched;
    } catch (err) {
      setError(err.message || "Không thể tạo bài tập");
      throw err;
    } finally {
      setBusy(false);
    }
  }, [courses, units]);

  // Update assignment
  const updateAssignment = useCallback(async (id, payload) => {
    setBusy(true);
    try {
      const res = await updateAssignmentApi(id, payload);
      const updated = res.assignment || res.data || res;
      setAssignments(prev =>
        prev.map(a => a.AssignmentID === id ? updated : a)
      );
      setSuccess("Cập nhật thành công");
      return updated;
    } catch (err) {
      setError(err.message || "Không thể cập nhật bài tập");
      throw err;
    } finally {
      setBusy(false);
    }
  }, []);

  // Delete assignment
  const deleteAssignment = useCallback(async (id) => {
    setBusy(true);
    try {
      await deleteAssignmentApi(id);
      setAssignments(prev => prev.filter(a => a.AssignmentID !== id));
      setSuccess("Xóa bài tập thành công");
    } catch (err) {
      setError(err.message || "Không thể xóa bài tập");
      throw err;
    } finally {
      setBusy(false);
    }
  }, []);

  // Upload file
  const uploadFile = useCallback(async (file) => {
    setBusy(true);
    try {
      const result = await uploadAssignmentFileApi(file);
      const url = result.url || result.secure_url || "";
      if (!url) throw new Error("Không nhận được URL từ server");
      setSuccess(`Upload file thành công: ${file.name}`);
      return url;
    } catch (err) {
      setError(err.message || "Upload file thất bại");
      throw err;
    } finally {
      setBusy(false);
    }
  }, []);

  return {
    assignments,
    setAssignments,
    courses,
    units,
    loading,
    coursesLoading,
    unitsLoading,
    busy,
    error,
    success,
    setError,
    setSuccess,
    loadAssignments,
    loadCourses,
    loadUnitsByCourse,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    uploadFile,
  };
}