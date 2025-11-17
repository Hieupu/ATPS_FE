import React, { useState } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Stack,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import HandymanIcon from "@mui/icons-material/Handyman";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SendIcon from "@mui/icons-material/Send";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import DescriptionIcon from "@mui/icons-material/Description";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

export default function CoursesCardList({
  courses,
  loading,
  onOpenBuilder,
  onEditCourse,
  onDeleteCourse,
  onSubmitCourse,
  onPreviewCourse,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuCourse, setMenuCourse] = useState(null);

  const handleOpenMenu = (event, course) => {
    setAnchorEl(event.currentTarget);
    setMenuCourse(course);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuCourse(null);
  };

  if (loading) {
    return <Typography>Đang tải danh sách khóa học...</Typography>;
  }

  if (!courses || courses.length === 0) {
    return <Typography>Chưa có khóa học nào.</Typography>;
  }

  return (
    <>
      <Grid container spacing={2}>
        {courses.map((course) => {
          const {
            CourseID,
            Title,
            Description,
            Image,
            Duration,
            Ojectives,
            Requirements,
            Level,
            Status,
            Code,
            UnitCount,
            LessonCount,
            MaterialMissingCount,
          } = course;

          const units = UnitCount ?? 0;
          const lessons = LessonCount ?? 0;
          const missingMaterials = MaterialMissingCount ?? 0;

          const progressPercent =
            lessons > 0 && missingMaterials >= 0
              ? Math.max(
                  0,
                  Math.min(100, ((lessons - missingMaterials) / lessons) * 100)
                )
              : 0;

          return (
            <Grid item xs={12} sm={6} md={4} key={CourseID}>
              <Card
                variant="outlined"
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                {/* IMAGE TRÊN ĐẦU */}
                {Image && (
                  <Box sx={{ position: "relative" }}>
                    <CardMedia
                      component="img"
                      height="150"
                      image={Image}
                      alt={Title}
                      sx={{ objectFit: "cover" }}
                    />

                    {/* Status chip trên ảnh */}
                    {Status && (
                      <Chip
                        size="small"
                        label={Status}
                        sx={{
                          position: "absolute",
                          top: 8,
                          left: 8,
                          backgroundColor:
                            Status === "PUBLISHED"
                              ? "success.main"
                              : Status === "IN_REVIEW"
                              ? "warning.main"
                              : Status === "APPROVED"
                              ? "info.main"
                              : "grey.700",
                          color: "#fff",
                        }}
                      />
                    )}

                    {/* Menu 3 chấm */}
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        bgcolor: "rgba(0,0,0,0.35)",
                        color: "#fff",
                        "&:hover": { bgcolor: "rgba(0,0,0,0.55)" },
                      }}
                      onClick={(e) => handleOpenMenu(e, course)}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}

                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Title + Level + Code */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    spacing={1}
                  >
                    <Box sx={{ pr: 1, maxWidth: "70%" }}>
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        sx={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                        title={Title}
                      >
                        {Title}
                      </Typography>

                      {Code && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                          title={Code}
                        >
                          Mã khóa học: {Code}
                        </Typography>
                      )}
                    </Box>

                    {Level && (
                      <Chip
                        size="small"
                        label={Level}
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Stack>

                  {/* Description */}
                  {Description && (
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        color: "text.secondary",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                      title={Description}
                    >
                      {Description}
                    </Typography>
                  )}

                  {/* Duration */}
                  {(Duration || Duration === 0) && (
                    <Typography
                      variant="caption"
                      sx={{ mt: 0.75, display: "block" }}
                      color="text.secondary"
                    >
                      ⏱ Thời lượng: {Duration} giờ
                    </Typography>
                  )}

                  {/* THỐNG KÊ UNITS / LESSONS / MATERIALS */}
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ mt: 1 }}
                    alignItems="center"
                  >
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <MenuBookIcon fontSize="small" />
                      <Typography variant="caption">{units} unit</Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <MenuOpenIcon fontSize="small" />
                      <Typography variant="caption">
                        {lessons} lesson
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <DescriptionIcon fontSize="small" />
                      <Typography variant="caption">
                        {missingMaterials} material
                      </Typography>
                    </Stack>
                  </Stack>

                  {/* Objectives / Requirements (rút gọn, có ... nếu dài) */}
                  {(Ojectives || Requirements) && (
                    <Box sx={{ mt: 1 }}>
                      {Ojectives && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                          title={Ojectives}
                        >
                          🎯 <b>Mục tiêu:</b> {Ojectives}
                        </Typography>
                      )}
                      {Requirements && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            mt: 0.25,
                            display: "-webkit-box",
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                          title={Requirements}
                        >
                          📌 <b>Yêu cầu:</b> {Requirements}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {/* Cảnh báo nếu thiếu material */}
                  {missingMaterials > 0 && (
                    <Stack
                      direction="row"
                      spacing={0.5}
                      alignItems="center"
                      sx={{ mt: 0.75 }}
                    >
                      <WarningAmberIcon fontSize="inherit" color="warning" />
                      <Typography variant="caption" color="warning.main">
                        Còn {missingMaterials} lesson chưa có tài liệu.
                      </Typography>
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {menuCourse && (
          <>
            <MenuItem
              onClick={() => {
                onPreviewCourse && onPreviewCourse(menuCourse);
                handleCloseMenu();
              }}
            >
              <VisibilityIcon fontSize="small" style={{ marginRight: 8 }} />
              Preview
            </MenuItem>

            <MenuItem
              onClick={() => {
                onOpenBuilder(menuCourse.CourseID);
                handleCloseMenu();
              }}
            >
              <HandymanIcon fontSize="small" style={{ marginRight: 8 }} />
              Builder
            </MenuItem>

            <MenuItem
              onClick={() => {
                onEditCourse(menuCourse);
                handleCloseMenu();
              }}
            >
              <EditIcon fontSize="small" style={{ marginRight: 8 }} />
              Chỉnh sửa
            </MenuItem>

            {menuCourse.Status === "DRAFT" && (
              <MenuItem
                onClick={() => {
                  onSubmitCourse(menuCourse);
                  handleCloseMenu();
                }}
              >
                <SendIcon fontSize="small" style={{ marginRight: 8 }} />
                Gửi duyệt
              </MenuItem>
            )}

            <MenuItem
              onClick={() => {
                onDeleteCourse(menuCourse);
                handleCloseMenu();
              }}
            >
              <DeleteIcon fontSize="small" style={{ marginRight: 8 }} />
              Xóa khóa học
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
}
