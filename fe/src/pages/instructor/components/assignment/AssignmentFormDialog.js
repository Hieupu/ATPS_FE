import React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, TextField, Button, Stack, Typography, CircularProgress, Alert
} from "@mui/material";
import { CloudUpload, CheckCircle } from "@mui/icons-material";
import Autocomplete from "@mui/material/Autocomplete";

export default function AssignmentFormDialog({
  open, onClose, onSubmit, busy,
  form, setForm, editMode,
  courses = [], coursesLoading = false,
  units = [], unitsLoading = false,
  onPickCourse, onPickUnit,
  onPickFile,
}) {
  const hasFile = !!form.FileURL;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editMode ? "Edit Assignment" : "Create Assignment"}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Title" required
            value={form.Title}
            onChange={(e) => setForm({ ...form, Title: e.target.value })}
            error={!form.Title.trim() && form.Title !== ""}
            helperText={!form.Title.trim() && form.Title !== "" ? "Tiêu đề là bắt buộc" : ""}
          />

          <TextField
            label="Description" required multiline minRows={3}
            value={form.Description}
            onChange={(e) => setForm({ ...form, Description: e.target.value })}
            error={!form.Description.trim() && form.Description !== ""}
            helperText={!form.Description.trim() && form.Description !== "" ? "Mô tả là bắt buộc" : ""}
          />

          <TextField
            select label="Type" value={form.Type}
            onChange={(e) => setForm({ ...form, Type: e.target.value })}
            SelectProps={{ native: true }}
          >
            <option value="assignment">Assignment</option>
            <option value="homework">Homework</option>
          </TextField>

          {/* Course (searchable) */}
          <Autocomplete
            options={courses}
            getOptionLabel={(o) => o.label || ""}
            loading={coursesLoading}
            value={courses.find(c => c.value === form.CourseID) || null}
            onChange={(_, val) => onPickCourse?.(val)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Course"
                placeholder="Chọn course..."
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {coursesLoading ? <CircularProgress size={16} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          {/* Unit (searchable) */}
          <Autocomplete
            options={units}
            getOptionLabel={(o) => o.label || ""}
            loading={unitsLoading}
            value={units.find(u => u.value === form.UnitID) || null}
            onChange={(_, val) => onPickUnit?.(val)}
            disabled={!form.CourseID}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Unit Title"
                placeholder={form.CourseID ? "Chọn unit..." : "Chọn course trước"}
                helperText="Có thể để trống để tạo bản nháp (draft)"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {unitsLoading ? <CircularProgress size={16} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          {/* Upload file */}
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                component="label" variant="outlined" disabled={busy}
                startIcon={hasFile ? <CheckCircle /> : <CloudUpload />}
                color={hasFile ? "success" : "primary"}
              >
                {hasFile ? "File uploaded" : "Upload file"}
                <input
                  type="file" hidden
                  onChange={(e) => e.target.files?.[0] && onPickFile?.(e.target.files[0])}
                />
              </Button>
              {busy && <CircularProgress size={20} />}
            </Stack>

            {form.FileURL && (
              <Typography variant="body2" sx={{ mt: 1, p: 1, bgcolor: 'success.lighter', borderRadius: 1, wordBreak: 'break-all' }}>
                ✓ {form.FileURL}
              </Typography>
            )}
          </Box>

          <TextField
            label="Deadline" type="date"
            InputLabelProps={{ shrink: true }}
            value={form.Deadline}
            onChange={(e) => setForm({ ...form, Deadline: e.target.value })}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={busy || !form.Title.trim() || !form.Description.trim()}>
          {busy ? (editMode ? "Saving..." : "Creating...") : (editMode ? "Save" : "Create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
