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
import {
  People,
  Schedule,
  Star,
  ArrowForward,
} from "@mui/icons-material";
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

  const formatPrice = (price) => {
    if (price == null || isNaN(price)) {
      return "0 ₫";
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // Sử dụng ảnh từ database mới
  const imageUrl = course.Image || courseImages[course.CourseID % courseImages.length];

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        borderRadius: 3,
        overflow: "hidden",
        position: "relative",
        "&:hover": {
          transform: "translateY(-12px)",
          boxShadow: "0 20px 60px rgba(102, 126, 234, 0.25)",
          "& .course-image": {
            transform: "scale(1.1)",
          },
          "& .view-button": {
            transform: "translateX(8px)",
          },
        },
      }}
    >
      {/* Course Image */}
      <Box sx={{ position: "relative", overflow: "hidden", height: 200 }}>
        <CardMedia
          component="img"
          className="course-image"
          height="200"
          image={imageUrl}
          alt={course.Title}
          sx={{
            objectFit: "cover",
            transition: "transform 0.4s ease",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
          }}
        >
          <Chip
            label={course.Level || "BEGINNER"}
            size="small"
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.95)",
              fontWeight: 600,
              backdropFilter: "blur(10px)",
              textTransform: 'capitalize'
            }}
          />
        </Box>
      </Box>

      <CardContent
        sx={{ flexGrow: 1, p: 3, display: "flex", flexDirection: "column" }}
      >
        {/* Course Title */}
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 700,
            mb: 2,
            height: "56px",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            lineHeight: 1.4,
            color: "text.primary",
          }}
        >
          {course.Title}
        </Typography>

        {/* Course Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 3,
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
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Avatar
            src={course.InstructorAvatar}
            sx={{
              width: 36,
              height: 36,
              mr: 1.5,
              border: "2px solid",
              borderColor: "primary.light",
            }}
          >
            {course.InstructorName?.charAt(0)}
          </Avatar>
          <Box>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "text.primary" }}
            >
              {course.InstructorName}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: 'block' }}
            >
              {course.InstructorMajor}
            </Typography>
          </Box>
        </Box>

        {/* Course Stats */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            mb: 3,
            pb: 3,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <People sx={{ fontSize: 18, color: "primary.main" }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {course.EnrollmentCount || 0}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Schedule sx={{ fontSize: 18, color: "primary.main" }} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {course.Duration || 0}h
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Star sx={{ fontSize: 18, color: "warning.main" }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {course.ReviewCount || 0}
            </Typography>
          </Box>
        </Box>

        {/* Price and Action */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: "auto",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {formatPrice(course.TuitionFee || course.MinFee)}
          </Typography>
          <Button
            className="view-button"
            variant="contained"
            endIcon={<ArrowForward />}
            onClick={handleViewDetails}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              transition: "transform 0.3s ease",
              textTransform: "none",
              fontWeight: 600,
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
            }}
          >
            View
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CourseCard;