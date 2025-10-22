import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Avatar,
} from "@mui/material";
import { TrendingUp, Star } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const PopularCourses = ({ courses }) => {
  const navigate = useNavigate();

  if (!courses.length) return null;

  return (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <TrendingUp sx={{ color: "primary.main", mr: 1, fontSize: 32 }} />
        <Typography variant="h4" component="h2" sx={{ fontWeight: 700 }}>
          Popular Courses
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {courses.map((course) => (
          <Grid item xs={12} md={6} lg={4} key={course.CourseID}>
            <Card
              sx={{
                display: "flex",
                height: 140,
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                },
              }}
              onClick={() => navigate(`/courses/${course.CourseID}`)}
            >
              <CardMedia
                component="img"
                sx={{ width: 120, objectFit: "cover" }}
                image={course.CourseImage || "/api/placeholder/120/140"}
                alt={course.Title}
              />
              <CardContent sx={{ flex: 1, p: 2 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    fontSize: "1rem",
                    mb: 1,
                    height: "40px",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {course.Title}
                </Typography>
                
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <Avatar
                    src={course.InstructorAvatar}
                    sx={{ width: 24, height: 24, mr: 1 }}
                  />
                  <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                    {course.InstructorName}
                  </Typography>
                </Box>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Chip
                    label={`${course.EnrollmentCount} students`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Star sx={{ fontSize: 16, color: "warning.main", mr: 0.5 }} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {course.AverageRating?.toFixed(1) || "N/A"}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PopularCourses;