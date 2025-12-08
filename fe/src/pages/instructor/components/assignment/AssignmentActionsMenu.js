import React from "react";
import { Menu, MenuItem } from "@mui/material";
import { Edit, Visibility, Grade, Feedback, Delete, RestoreFromTrash } from "@mui/icons-material";

export default function AssignmentActionsMenu({ anchorEl, onClose, item, onEdit, onAskStatus }) {
  const inactive = (item?.Status ?? "active").toLowerCase() === "inactive";
  return (
    <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={onClose} PaperProps={{ sx: { borderRadius: 2, minWidth: 220 } }}>
      <MenuItem onClick={() => { onEdit(item); onClose(); }}><Edit sx={{ mr: 1 }} /> Edit</MenuItem>
      <MenuItem onClick={onClose}><Visibility sx={{ mr: 1 }} /> View</MenuItem>
      <MenuItem onClick={onClose}><Grade sx={{ mr: 1 }} /> Grade</MenuItem>
      <MenuItem onClick={onClose}><Feedback sx={{ mr: 1 }} /> Feedback</MenuItem>
      {!inactive ? (
        <MenuItem sx={{ color: "error.main" }} onClick={() => { onAskStatus(item, "inactive"); onClose(); }}>
          <Delete sx={{ mr: 1 }} /> Move to Inactive
        </MenuItem>
      ) : (
        <MenuItem sx={{ color: "success.main" }} onClick={() => { onAskStatus(item, "active"); onClose(); }}>
          <RestoreFromTrash sx={{ mr: 1 }} /> Restore Active
        </MenuItem>
      )}
    </Menu>
  );
}