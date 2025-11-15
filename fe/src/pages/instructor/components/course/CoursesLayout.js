import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Snackbar,
  Alert,
  Pagination,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import CoursesCardList from "./CoursesCardList";
import CourseFormDialog from "./CourseFormDialog";
import CourseReview from "./CourseReview";

export default function CoursesLayout({
  courses,
  loading,
  onCreateCourse,
  onUpdateCourse,
  onDeleteCourse,
  onSubmitCourse,
  onOpenBuilder,
  onPreviewCourse,
  previewCourse,
  closePreview,
}) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [page, setPage] = useState(1);
  const pageSize = 6;
  const totalPages = Math.ceil((courses?.length || 0) / pageSize);

  const handleChangePage = (event, value) => {
    setPage(value);
  };

  const paginatedCourses = courses.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  useEffect(() => {
    setPage(1);
  }, [courses]);

  const handleOpenCreate = () => {
    setCreateOpen(true);
  };

  const handleCloseCreate = () => {
    setCreateOpen(false);
  };

  const handleOpenEdit = (course) => {
    setEditingCourse(course);
    setEditOpen(true);
  };

  const handleCloseEdit = () => {
    setEditOpen(false);
    setEditingCourse(null);
  };

  // ------------------ CREATE ------------------
  const handleCreateSubmit = async (values) => {
    try {
      const formData = new FormData();
      formData.append("Title", values.Title || "");
      formData.append("Description", values.Description || "");
      if (values.Duration !== null && values.Duration !== undefined) {
        formData.append("Duration", values.Duration);
      }
      formData.append("Ojectives", values.Ojectives || "");
      formData.append("Requirements", values.Requirements || "");
      formData.append("Level", values.Level || "BEGINNER");
      formData.append("Status", values.Status || "DRAFT");

      if (values.Image) {
        formData.append("Image", values.Image);
      }

      if (values.ImageFile) {
        formData.append("image", values.ImageFile);
      }

      await onCreateCourse(formData);

      setSnack({
        open: true,
        message: "Tạo khóa học thành công",
        severity: "success",
      });
      handleCloseCreate();
    } catch (err) {
      console.error(err);
      setSnack({
        open: true,
        message: "Tạo khóa học thất bại",
        severity: "error",
      });
    }
  };

  // ------------------ EDIT ------------------
  const handleEditSubmit = async (values) => {
    if (!editingCourse) return;
    try {
      const formData = new FormData();
      formData.append("Title", values.Title || "");
      formData.append("Description", values.Description || "");
      if (values.Duration !== null && values.Duration !== undefined) {
        formData.append("Duration", values.Duration);
      }
      formData.append("Ojectives", values.Ojectives || "");
      formData.append("Requirements", values.Requirements || "");
      formData.append("Level", values.Level || "BEGINNER");
      formData.append("Status", values.Status || "DRAFT");

      if (values.Image && !values.ImageFile) {
        formData.append("Image", values.Image);
      }

      if (values.ImageFile) {
        formData.append("image", values.ImageFile);
      }

      await onUpdateCourse(editingCourse.CourseID, formData);
      setSnack({
        open: true,
        message: "Cập nhật khóa học thành công",
        severity: "success",
      });
      handleCloseEdit();
    } catch (err) {
      console.error(err);
      setSnack({
        open: true,
        message: "Cập nhật khóa học thất bại",
        severity: "error",
      });
    }
  };

  const handleDeleteCourse = async (course) => {
    if (!window.confirm(`Xóa khóa học "${course.Title}"?`)) return;
    try {
      await onDeleteCourse(course.CourseID);
      setSnack({
        open: true,
        message: "Xóa khóa học thành công",
        severity: "success",
      });
    } catch (err) {
      setSnack({
        open: true,
        message: "Xóa khóa học thất bại",
        severity: "error",
      });
    }
  };

  const handleSubmitCourse = async (course) => {
    if (!window.confirm(`Gửi duyệt khóa học "${course.Title}"?`)) return;
    try {
      await onSubmitCourse(course.CourseID);
      setSnack({
        open: true,
        message: "Đã gửi khóa học để duyệt",
        severity: "success",
      });
    } catch (err) {
      setSnack({
        open: true,
        message: "Gửi duyệt thất bại",
        severity: "error",
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          mb: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={600}>
            Courses
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý các khóa học mà bạn đang giảng dạy
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenCreate}
        >
          New Course
        </Button>
      </Box>

      <CourseReview course={previewCourse} onClose={closePreview} />

      <CoursesCardList
        courses={paginatedCourses}
        loading={loading}
        onOpenBuilder={onOpenBuilder}
        onEditCourse={handleOpenEdit}
        onDeleteCourse={handleDeleteCourse}
        onSubmitCourse={handleSubmitCourse}
        onPreviewCourse={onPreviewCourse}
      />
      {!loading && courses.length > pageSize && (
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handleChangePage}
            color="primary"
            shape="rounded"
          />
        </Box>
      )}

      <CourseFormDialog
        open={createOpen}
        onClose={handleCloseCreate}
        mode="create"
        title="Tạo khóa học mới"
        initialValues={{
          Title: "",
          Description: "",
          Image: "",
          Duration: "",
          Ojectives: "",
          Requirements: "",
          Level: "BEGINNER",
          Status: "DRAFT",
        }}
        onSubmit={handleCreateSubmit}
      />

      <CourseFormDialog
        open={editOpen}
        onClose={handleCloseEdit}
        mode="edit"
        title="Chỉnh sửa khóa học"
        initialValues={
          editingCourse
            ? {
                Title: editingCourse.Title || "",
                Description: editingCourse.Description || "",
                Image: editingCourse.Image || "",
                Duration: editingCourse.Duration || "",
                Ojectives: editingCourse.Ojectives || "",
                Requirements: editingCourse.Requirements || "",
                Level: editingCourse.Level || "BEGINNER",
                Status: editingCourse.Status || "DRAFT",
              }
            : null
        }
        onSubmit={handleEditSubmit}
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      >
        <Alert
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
          severity={snack.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
