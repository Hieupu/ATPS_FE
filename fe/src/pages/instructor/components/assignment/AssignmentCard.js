import React from "react";
import {
  Card, CardContent, Typography, Box, Stack, IconButton, Chip, LinearProgress, Tooltip,
} from "@mui/material";
import { MoreVert, Assignment as AssignmentIcon, Assessment, Visibility, Grade } from "@mui/icons-material";
import dayjs from "dayjs";

const typeIcon = () => <AssignmentIcon />;
const statusColor = (status) => {
  const s = (status ?? "").toLowerCase();
  if (s === "active") return "success";
  if (s === "inactive") return "warning";
  if (s === "deleted") return "default";
  return "default";
};

export default function AssignmentCard({ item, onMenu,onView  }) {
  const title = item.Title ?? "Untitled";
  const type = (item.Type ?? "assignment").toLowerCase();
  const deadline = item.Deadline ? dayjs(item.Deadline).format("MMM DD, YYYY") : "—";
  const className = item.ClassName || item.CourseTitle || "";
  const status = item.Status ?? "active";
  const submitted = item.Submitted ?? 0;
  const total = item.Total ?? 0;
  const progress = total > 0 ? (submitted / total) * 100 : 0;

  return (
    <Card sx={{ borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", transition: "all .3s",
      "&:hover": { transform: "translateY(-4px)", boxShadow: "0 8px 16px rgba(0,0,0,.1)" } }}>
      <CardContent sx={{ pt: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Chip icon={typeIcon(type)} label={type} size="small" color={type === "exam" ? "primary" : "secondary"} />
          <IconButton size="small" onClick={(e) => onMenu(e, item)}><MoreVert /></IconButton>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>{title}</Typography>
        {className && <Chip label={className} size="small" variant="outlined" sx={{ mb: 2 }} />}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption" color="text.secondary">Submissions</Typography>
            <Typography variant="caption">{submitted}/{total}</Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3 }} />
        </Box>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip label={status} size="small" color={statusColor(status)} />
        </Stack>
        <Box sx={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #f1f5f9", pt: 1.5 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Deadline</Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 13 }}>{deadline}</Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            <IconButton size="small" color="primary" onClick={() => onView?.(item)}><Visibility /></IconButton>
            <IconButton size="small" color="secondary"><Grade /></IconButton>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
