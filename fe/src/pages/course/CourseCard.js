import React from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  Rating,
  Avatar,
} from "@mui/material";
import {
  People,
  Schedule,
  Star,
  ArrowForward,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const CourseCard = ({ course }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/courses/${course.CourseID}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-8px)",
          boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
        },
      }}
    >
      {/* Course Image */}
      <CardMedia
        component="img"
        height="160"
        image={course.CourseImage || "/api/placeholder/400/200"}
        alt={course.Title}
        sx={{ objectFit: "cover" }}
      />

      <CardContent sx={{ flexGrow: 1, p: 3 }}>
        {/* Category Chip */}
        <Chip
          label={course.Category || "Programming"}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ mb: 2 }}
        />

        {/* Course Title */}
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 600,
            mb: 1,
            height: "48px",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {course.Title}
        </Typography>

        {/* Course Description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            height: "40px",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {course.Description}
        </Typography>

        {/* Instructor Info */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar
            src={course.InstructorAvatar}
            sx={{ width: 32, height: 32, mr: 1 }}
          >
            {course.InstructorName?.charAt(0)}
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {course.InstructorName}
          </Typography>
        </Box>

        {/* Course Stats */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <People sx={{ fontSize: 16, color: "text.secondary", mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {course.EnrollmentCount || 0}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Schedule sx={{ fontSize: 16, color: "text.secondary", mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {course.Duration}h
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Star sx={{ fontSize: 16, color: "warning.main", mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary">
              {course.AverageRating ? course.AverageRating.toFixed(1) : "N/A"}
            </Typography>
          </Box>
        </Box>

        {/* Price and Action */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
            {formatPrice(course.TuitionFee)}
          </Typography>
          <Button
            variant="outlined"
            endIcon={<ArrowForward />}
            onClick={handleViewDetails}
            sx={{ borderRadius: 2 }}
          >
            View
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CourseCard;