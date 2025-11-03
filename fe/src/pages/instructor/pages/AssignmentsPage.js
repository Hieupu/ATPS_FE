import React, { useState } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  Tabs,
  Tab,
  Snackbar,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Add, FilterList, Search } from "@mui/icons-material";
import AssignmentCard from "../components/assignment/AssignmentCard";
import AssignmentActionsMenu from "../components/assignment/AssignmentActionsMenu";
import AssignmentFormDialog from "../components/assignment/AssignmentFormDialog";
import StatusConfirmDialog from "../components/assignment/StatusConfirmDialog";
import useAssignment from "../hooks/useAssignment";
import { getAssignmentByIdApi } from "../../../apiServices/assignmentService";

export default function AssignmentsPage() {
  const {
    assignments,
    filtered,
    stats,
    loading,
    busy,
    error,
    success,
    setError,
    setSuccess,
    tabValue,
    setTabValue,
    searchQuery,
    setSearchQuery,
    form,
    setForm,
    openCreate,
    setOpenCreate,
    openEdit,
    setOpenEdit,
    openStatus,
    setOpenStatus,
    statusTarget,
    setStatusTarget,
    submitCreate,
    submitEdit,
    submitStatus,
    editFromItem,
    units,
    uploadLocalFile,
    openCreateNew,
    resetForm,
    unitsLoading,
    courses,
    coursesLoading,
    onPickCourse,
    onPickUnit,
  } = useAssignment();

  const [anchorEl, setAnchorEl] = useState(null);
  const [selected, setSelected] = useState(null);
  const openMenu = (e, item) => {
    setAnchorEl(e.currentTarget);
    setSelected(item);
  };
  const closeMenu = () => {
    setAnchorEl(null);
    setSelected(null);
  };

  // View Detail
  const [openDetail, setOpenDetail] = useState(false);
  const [detail, setDetail] = useState(null);
  const handleView = async (item) => {
    try {
      const data = await getAssignmentByIdApi(item.AssignmentID);
      setDetail(data);
      setOpenDetail(true);
    } catch (err) {
      setError(err?.message || "Không thể tải chi tiết bài tập");
    }
  };

  return (
    <Box sx={{ p: 2, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Assignments
        </Typography>
        <Button
          startIcon={<Add />}
          variant="contained"
          onClick={openCreateNew} // mở form sạch
          disabled={busy}
        >
          Create New
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Total", value: stats.total },
          { label: "Active", value: stats.active ?? stats.open }, // giữ tương thích
          { label: "Grading", value: stats.active ?? stats.grading },
          { label: "Deleted", value: stats.deleted },
        ].map((s, i) => (
          <Grid item xs={6} sm={3} key={i}>
            <Card>
              <CardContent>
                <Typography variant="caption" color="text.secondary">
                  {s.label}
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  {s.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Search + Tabs */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search by title or class..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ flex: 1 }}
          InputProps={{ startAdornment: <Search sx={{ mr: 1 }} /> }}
        />
        <Button variant="outlined" startIcon={<FilterList />}>
          Filter
        </Button>
      </Box>
      <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
        <Tab label={`All (${assignments.length})`} />
        <Tab label={`Assignments`} />
        <Tab label="Homework" />
      </Tabs>

      {/* List */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
          <CircularProgress />
        </Box>
      ) : filtered.length === 0 ? (
        <Typography align="center" sx={{ mt: 8 }}>
          Không có bài tập nào phù hợp
        </Typography>
      ) : (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {filtered.map((it) => (
            <Grid item xs={12} sm={6} md={4} key={it.AssignmentID}>
              <AssignmentCard item={it} onMenu={openMenu} onView={handleView} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Actions menu */}
      <AssignmentActionsMenu
        anchorEl={anchorEl}
        onClose={closeMenu}
        item={selected}
        onEdit={(it) => editFromItem(it)}
        onView={handleView} // bật View Detail
        onAskStatus={(it, next) => {
          setStatusTarget({ id: it.AssignmentID, next });
          setOpenStatus(true);
        }}
      />

      {/* Create Dialog */}
      <AssignmentFormDialog
        open={openCreate}
        onClose={() => {
          setOpenCreate(false);
          resetForm();
        }}
        onSubmit={submitCreate}
        busy={busy}
        form={form}
        setForm={setForm}
        editMode={false}
        courses={courses}
        coursesLoading={coursesLoading}
        units={units}
        unitsLoading={unitsLoading}
        onPickCourse={onPickCourse}
        onPickUnit={onPickUnit}
        onPickFile={uploadLocalFile} // upload -> set FileURL
      />

      {/* Edit Dialog */}
      <AssignmentFormDialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        onSubmit={submitEdit}
        busy={busy}
        form={form}
        setForm={setForm}
        editMode={true}
        courses={courses}
        coursesLoading={coursesLoading}
        units={units}
        unitsLoading={unitsLoading}
        onPickCourse={onPickCourse}
        onPickUnit={onPickUnit}
        onPickFile={uploadLocalFile}
      />

      {/* Status confirm */}
      <StatusConfirmDialog
        open={openStatus}
        onClose={() => setOpenStatus(false)}
        onConfirm={submitStatus}
        next={statusTarget.next}
        busy={busy}
      />

      {/* View Detail Dialog */}
      <Dialog
        open={openDetail}
        onClose={() => setOpenDetail(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Assignment Detail</DialogTitle>
        <DialogContent dividers>
          {detail ? (
            <Box sx={{ display: "grid", rowGap: 1.25 }}>
              <Typography>
                <b>Title:</b> {detail.Title}
              </Typography>
              <Typography>
                <b>Description:</b> {detail.Description}
              </Typography>
              <Typography>
                <b>Type:</b> {detail.Type}
              </Typography>
              <Typography>
                <b>Status:</b> {detail.Status}
              </Typography>
              <Typography>
                <b>Unit:</b> {detail.UnitTitle || "—"}
              </Typography>
              <Typography>
                <b>Course:</b> {detail.CourseTitle || "—"}
              </Typography>
              <Typography>
                <b>Deadline:</b> {detail.Deadline || "—"}
              </Typography>
              <Typography>
                <b>File URL:</b> {detail.FileURL || "—"}
              </Typography>
              <Typography>
                <b>Instructor:</b> {detail.InstructorName || "—"}
              </Typography>
            </Box>
          ) : (
            <Typography>Đang tải…</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDetail(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbars */}
      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError("")}
      >
        <Alert
          severity="error"
          onClose={() => setError("")}
          variant="filled"
        >
          {error}
        </Alert>
      </Snackbar>
      <Snackbar
        open={!!success}
        autoHideDuration={3000}
        onClose={() => setSuccess("")}
      >
        <Alert
          severity="success"
          onClose={() => setSuccess("")}
          variant="filled"
        >
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}
