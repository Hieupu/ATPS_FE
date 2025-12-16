import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Avatar,
  Button,
} from "@mui/material";
import { People, Schedule, Star, ArrowForward } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

// Array ảnh để random
const courseImages = [
  "https://wp-s3-edilume-test-bucket.s3.ap-southeast-1.amazonaws.com/wp-content/uploads/2022/12/31183122/IELTS_new_thumbnail.png",
  "https://top-courses.org/wp-content/uploads/2022/07/IELTS-TEST_Speaking-and-Writing.jpg",
  "https://www.focusedu.org/wp-content/uploads/2021/03/Top-Reasons-Why-IELTS-Coaching-Is-Important.jpg",
];

const CourseCard = ({ course }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/courses/${course.CourseID}`);
  };

  // Level labels in Vietnamese
  const getLevelLabel = (level) => {
    const labels = {
      BEGINNER: "Dành cho người mới",
      INTERMEDIATE: "Trình độ trung cấp",
      ADVANCED: "Trình độ nâng cao",
    };
    return labels[level] || level;
  };

  // Sử dụng ảnh từ database mới
  const imageUrl =
    course.CourseImage || courseImages[course.CourseID % courseImages.length];

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        borderRadius: 5,
        overflow: "hidden",
        position: "relative",
        border: "1px solid rgba(99,102,241,0.12)",
        boxShadow: "0 20px 40px rgba(15,23,42,0.08)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,249,255,0.9) 100%)",
        "&:hover": {
          transform: "translateY(-12px)",
          boxShadow: "0 25px 60px rgba(99,102,241,0.3)",
          borderColor: "rgba(99,102,241,0.4)",
          "& .course-image": {
            transform: "scale(1.05)",
          },
          "& .view-button": {
            background: "linear-gradient(135deg, #4c51bf 0%, #6d28d9 100%)",
            boxShadow: "0 10px 25px rgba(109,40,217,0.35)",
          },
        },
      }}
    >
      {/* Course Image */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          height: 210,
        }}
      >
        <CardMedia
          component="img"
          className="course-image"
          image={imageUrl}
          alt={course.Title}
          sx={{
            objectFit: "cover",
            transition: "transform 0.4s ease",
          }}
        />
        <Chip
          label={getLevelLabel(course.Level || "BEGINNER")}
          size="small"
          sx={{
            position: "absolute",
            top: 18,
            left: 18,
            bgcolor: "rgba(17, 25, 40, 0.75)",
            color: "white",
            fontWeight: 600,
            fontSize: "0.7rem",
            borderRadius: 999,
            px: 2,
            backdropFilter: "blur(8px)",
            boxShadow: "0 10px 20px rgba(0,0,0,0.35)",
          }}
        />
      </Box>

      <CardContent
        sx={{
          flexGrow: 1,
          p: { xs: 2.5, md: 3 },
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Course Title */}
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 700,
            height: "56px",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            lineHeight: 1.35,
            color: "text.primary",
            fontFamily: "'Poppins', 'Segoe UI', sans-serif",
            mb:-2
          }}
        >
          {course.Title}
        </Typography>

        {/* Course Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 1,
            height: "42px",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            lineHeight: 1.5,
          }}
        >
          {course.Description}
        </Typography>

        {/* Instructor Info */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1.5,
            bgcolor: "#f4f6ff",
            borderRadius: 3,
            border: "1px solid rgba(99,102,241,0.08)",
          }}
        >
          <Avatar
            src={course.InstructorAvatar}
            sx={{
              width: 40,
              height: 40,
              border: "2px solid",
              borderColor: "primary.light",
              boxShadow: "0 8px 20px rgba(99, 102, 241, 0.25)",
            }}
          >
            {course.InstructorName?.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                mb: 0.2,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {course.InstructorName}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "text.secondary",
                display: "block",
                fontSize: "0.75rem",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {course.InstructorMajor || "Giảng viên"}
            </Typography>
          </Box>
        </Box>

        {/* Course Stats */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-around",
            gap: 1,
            mt: 1,
            mb: 1,
            pb: 2,
            borderBottom: "2px solid",
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.2,
            }}
          >
            <People sx={{ fontSize: 20, color: "primary.main" }} />
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: "text.primary" }}
            >
              {course.EnrollmentCount || 0}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontSize: "0.65rem" }}
            >
              Học viên
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.2,
            }}
          >
            <Schedule sx={{ fontSize: 20, color: "primary.main" }} />
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: "text.primary" }}
            >
               {Math.trunc(course.Duration || 0)}h
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontSize: "0.65rem" }}
            >
              Thời lượng
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 0.2,
            }}
          >
            <Star sx={{ fontSize: 20, color: "warning.main" }} />
            <Typography
              variant="body2"
              sx={{ fontWeight: 700, color: "text.primary" }}
            >
              {course.ReviewCount || 0}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontSize: "0.65rem" }}
            >
              Đánh giá
            </Typography>
          </Box>
        </Box>

        {/* Action Button */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mt: "auto",
          }}
        >
          <Button
            className="view-button"
            variant="contained"
            endIcon={<ArrowForward />}
            onClick={handleViewDetails}
            sx={{
              borderRadius: 999,
              px: 3,
              py: 1.1,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              transition: "all 0.3s ease",
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
              boxShadow: "0 8px 20px rgba(102, 126, 234, 0.35)",
              "&:hover": {
                transform: "translateY(-1px)",
                boxShadow: "0 12px 28px rgba(102, 126, 234, 0.45)",
              },
            }}
          >
            Xem Chi Tiết
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
