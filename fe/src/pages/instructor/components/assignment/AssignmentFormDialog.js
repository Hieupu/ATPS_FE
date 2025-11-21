import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, TextField, Button } from "@mui/material";

export default function AssignmentFormDialog({ open, onClose, onSubmit, busy, form, setForm, editMode }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editMode ? "Edit Assignment" : "Create Assignment"}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField label="Title" value={form.Title} onChange={(e) => setForm({ ...form, Title: e.target.value })} />
          <TextField label="Description" multiline minRows={3} value={form.Description} onChange={(e) => setForm({ ...form, Description: e.target.value })} />
          <TextField select label="Type" value={form.Type} onChange={(e) => setForm({ ...form, Type: e.target.value })} SelectProps={{ native: true }}>
            <option value="assignment">Assignment</option>
            <option value="homework">Homework</option>
            <option value="exam">Exam</option>
          </TextField>
          <TextField label="UnitID" type="number" value={form.UnitID} onChange={(e) => setForm({ ...form, UnitID: e.target.value })} />
          <TextField label="Deadline" type="date" InputLabelProps={{ shrink: true }} value={form.Deadline} onChange={(e) => setForm({ ...form, Deadline: e.target.value })} />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>Cancel</Button>
        <Button variant="contained" onClick={onSubmit} disabled={busy}>
          {busy ? (editMode ? "Saving..." : "Creating...") : (editMode ? "Save" : "Create")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}