import { useState, useEffect, useMemo } from "react";
import {
  getAssignmentsApi,
  getAssignmentByIdApi,
  createAssignmentApi,
  updateAssignmentApi,
  deleteAssignmentApi,
  getCoursesApi,
  getUnitsByCourseApi,
  uploadAssignmentFileApi,
} from "../../../apiServices/assignmentService";

const EMPTY_FORM = {
  AssignmentID: null,
  Title: "",
  Description: "",
  Type: "assignment",
  Deadline: "",
  CourseID: null,
  CourseTitle: "",
  UnitID: null,
  UnitTitle: "",
  FileURL: "",
};

export default function useAssignment() {
  const [assignments, setAssignments] = useState([]);

  // Courses / Units cho dropdown
  const [courses, setCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  const [units, setUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openStatus, setOpenStatus] = useState(false);
  const [statusTarget, setStatusTarget] = useState({ id: null, next: "" });

  const resetForm = () => setForm(EMPTY_FORM);

  // ===== Loaders =====
  const loadAssignments = async () => {
    setLoading(true);
    try {
      const data = await getAssignmentsApi();
      setAssignments(data || []);
    } catch (err) {
      setError(err.message || "Không thể tải bài tập");
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    try {
      setCoursesLoading(true);
      const data = await getCoursesApi(); 
      setCourses(data);
    } catch (err) {
      setCourses([]);
      setError(err?.message || "Không thể tải danh sách Course");
    } finally {
      setCoursesLoading(false);
    }
  };


  const loadUnitsByCourse = async (courseId) => {
    try {
      setUnitsLoading(true);
      const data = await getUnitsByCourseApi(courseId); // Call API lấy units theo courseId
      const mapped = (data || []).map(u => ({
        value: u.UnitID ?? u.unitId ?? u.id,
        label: u.Title ?? u.title ?? "",
      })).filter(x => x.value && x.label);
      setUnits(mapped);
    } catch (err) {
      setUnits([]);
      setError(err?.message || "Không thể tải danh sách Unit");
    } finally {
      setUnitsLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const openCreateNew = async () => {
    resetForm();
    await loadCourses();
    setUnits([]);
    setOpenCreate(true);
  };

  // ===== Stats & filters =====
  const stats = useMemo(() => {
    const total = assignments.length;
    const active = assignments.filter((a) => a.Status === "active").length;
    const draft = assignments.filter((a) => a.Status === "draft").length;
    const deleted = assignments.filter((a) => a.Status === "deleted").length;
    return { total, active, draft, deleted };
  }, [assignments]);

  const filtered = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    const base = assignments.filter((a) => {
      const t = (a.Title ?? "").toLowerCase();
      const c = (a.CourseTitle ?? a.ClassName ?? "").toLowerCase();
      return !term || t.includes(term) || c.includes(term);
    });
    const visible = base.filter(a => (a.Status || "").toLowerCase() !== "deleted");
    if (tabValue === 1) return visible.filter(a => (a.Type ?? "").toLowerCase() === "assignment");
    if (tabValue === 2) return visible.filter(a => (a.Type ?? "").toLowerCase() === "homework");
    return visible;
  }, [assignments, searchQuery, tabValue]);

  // ===== Create / Update =====
  const submitCreate = async () => {
    if (!form.Title.trim()) return setError("Vui lòng nhập tiêu đề");
    if (!form.Description.trim()) return setError("Vui lòng nhập mô tả");

    setBusy(true);
    try {
      const payload = {
        title: form.Title,
        description: form.Description,
        type: form.Type,
        deadline: form.Deadline || null,
        unitId: form.UnitID ?? null,
        unitTitle: form.UnitID ? null : (form.UnitTitle || null),
        fileURL: form.FileURL || null,
      };
      const res = await createAssignmentApi(payload);
      setSuccess("Tạo bài tập thành công");
      const created = res.assignment || res.data || res;
      setAssignments((prev) => [created, ...prev]);
      setOpenCreate(false);
      resetForm();
    } catch (err) {
      setError(err.message || "Không thể tạo bài tập");
    } finally {
      setBusy(false);
    }
  };

  const editFromItem = async (item) => {
    setForm({
      AssignmentID: item.AssignmentID,
      Title: item.Title || "",
      Description: item.Description || "",
      Type: item.Type || "assignment",
      Deadline: item.Deadline ? String(item.Deadline).slice(0, 10) : "",
      CourseID: item.CourseID ?? null,
      CourseTitle: item.CourseTitle || "",
      UnitID: item.UnitID ?? null,
      UnitTitle: item.UnitTitle || "",
      FileURL: item.FileURL || "",
    });

    if (courses.length === 0 && !coursesLoading) await loadCourses();
    if (item.CourseID) await loadUnitsByCourse(item.CourseID);

    setStatusTarget({ id: item.AssignmentID, next: "" });
    setOpenEdit(true);
  };

  const submitEdit = async () => {
    if (!form.Title.trim()) return setError("Vui lòng nhập tiêu đề");

    setBusy(true);
    try {
      const payload = {
        title: form.Title,
        description: form.Description,
        deadline: form.Deadline || null,
        type: form.Type,
        unitId: form.UnitID ?? null,
        unitTitle: form.UnitID ? null : (form.UnitTitle || null),
        fileURL: form.FileURL || null,
      };
      const res = await updateAssignmentApi(form.AssignmentID, payload);
      const updated = res.assignment || res.data || res;
      setAssignments((prev) =>
        prev.map((a) => (a.AssignmentID === form.AssignmentID ? updated : a))
      );
      setSuccess("Cập nhật thành công");
      setOpenEdit(false);
    } catch (err) {
      setError(err.message || "Không thể cập nhật bài tập");
    } finally {
      setBusy(false);
    }
  };

  const submitStatus = async () => {
    setBusy(true);
    try {
      const { id, next } = statusTarget;
      if (next === "deleted") {
        await deleteAssignmentApi(id);
        setAssignments(prev => prev.filter(a => a.AssignmentID !== id));
      } else {
        await updateAssignmentApi(id, { status: next });
        setAssignments(prev => prev.map(a => a.AssignmentID === id ? { ...a, Status: next } : a));
      }
      await loadAssignments();
      setSuccess("Cập nhật trạng thái thành công");
      setOpenStatus(false);
    } catch (err) {
      setError(err.message || "Không thể cập nhật trạng thái");
    } finally {
      setBusy(false);
    }
  };

  const uploadLocalFile = async (file) => {
    try {
      setBusy(true);
      const result = await uploadAssignmentFileApi(file);
      const url = result.url || result.secure_url || "";
      if (!url) throw new Error("Không nhận được URL từ server");
      setForm((f) => ({ ...f, FileURL: url }));
      setSuccess(`Upload file thành công: ${file.name}`);
    } catch (err) {
      setError(err.message || "Upload file thất bại");
    } finally {
      setBusy(false);
    }
  };

  // ===== Handlers cho dropdown =====
  const onPickCourse = async (course) => {
    const id = course?.value ?? null;
    setForm((f) => ({
      ...f,
      CourseID: id,
      CourseTitle: course?.label || "",
      // reset unit khi đổi course
      UnitID: null,
      UnitTitle: "",
    }));
    if (id) await loadUnitsByCourse(id);
    else setUnits([]);
  };

  const onPickUnit = (unit) => {
    setForm((f) => ({
      ...f,
      UnitID: unit?.value ?? null,
      UnitTitle: unit?.label || "",
    }));
  };

  return {
    assignments, filtered, stats,
    courses, coursesLoading,
    units, unitsLoading,
    loading, busy, error, success, setError, setSuccess,
    tabValue, setTabValue, searchQuery, setSearchQuery,
    form, setForm, resetForm,
    openCreate, setOpenCreate, openCreateNew,
    openEdit, setOpenEdit,
    openStatus, setOpenStatus,
    statusTarget, setStatusTarget,
    submitCreate, submitEdit, submitStatus, editFromItem,
    uploadLocalFile,
    onPickCourse, onPickUnit,
  };
}
