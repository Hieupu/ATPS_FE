import React from "react";
import { Menu, MenuItem } from "@mui/material";
import { Edit, Visibility, Delete, RestoreFromTrash } from "@mui/icons-material";

export default function AssignmentActionsMenu({ anchorEl, onClose, item, onEdit, onAskStatus, onView }) {
  const status = (item?.Status ?? "").toLowerCase();

  return (
    <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={onClose} PaperProps={{ sx: { borderRadius: 2, minWidth: 220 } }}>
      <MenuItem onClick={() => { onEdit(item); onClose(); }}><Edit sx={{ mr: 1 }} /> Edit</MenuItem>
      <MenuItem onClick={() => { onView?.(item); onClose(); }}><Visibility sx={{ mr: 1 }} /> View Detail</MenuItem>
      {status !== "deleted" ? (
        <MenuItem sx={{ color: "error.main" }} onClick={() => { onAskStatus(item, "deleted"); onClose(); }}>
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      ) : (
        <MenuItem sx={{ color: "success.main" }} onClick={() => { onAskStatus(item, "active"); onClose(); }}>
          <RestoreFromTrash sx={{ mr: 1 }} /> Restore
        </MenuItem>
      )}
    </Menu>
  );
}
