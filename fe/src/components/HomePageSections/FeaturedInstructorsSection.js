import React from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  Skeleton,
} from '@mui/material';
import { School, People } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const FeaturedInstructorsSection = ({ instructors = [], loading = false }) => {
  const navigate = useNavigate();

  // Ensure instructors is always an array
  const instructorsList = Array.isArray(instructors) ? instructors : [];

  return (
    <Container maxWidth="lg" sx={{ my: 10 }}>
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Chip label="GIẢNG VIÊN" color="primary" sx={{ mb: 2, fontWeight: 600 }} />
        <Typography
          variant="h3"
          component="h2"
          gutterBottom
          sx={{ fontWeight: 700 }}
        >
          Giảng Viên Nổi Bật
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Học từ những chuyên gia hàng đầu trong lĩnh vực
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {loading ? (
          // Loading skeleton
          [1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Card elevation={0} sx={{ border: "1px solid", borderColor: "grey.200", borderRadius: 3 }}>
                <CardContent sx={{ textAlign: "center", p: 3 }}>
                  <Skeleton variant="circular" width={100} height={100} sx={{ mx: "auto", mb: 2 }} />
                  <Skeleton variant="text" height={30} sx={{ mb: 1 }} />
                  <Skeleton variant="text" height={20} sx={{ mb: 2 }} />
                  <Skeleton variant="rectangular" height={40} />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : instructorsList.length === 0 ? (
          <Grid item xs={12}>
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Chưa có giảng viên nào
              </Typography>
            </Box>
          </Grid>
        ) : (
          instructorsList.slice(0, 4).map((instructor) => (
            <Grid item xs={12} sm={6} md={3} key={instructor.InstructorID}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  border: "1px solid",
                  borderColor: "grey.200",
                  borderRadius: 3,
                  transition: "all 0.3s",
                  cursor: "pointer",
                  "&:hover": {
                    borderColor: "primary.main",
                    transform: "translateY(-8px)",
                    boxShadow: 4,
                  },
                }}
                onClick={() => navigate(`/instructors/${instructor.InstructorID}`)}
              >
                <CardContent sx={{ textAlign: "center", p: 3 }}>
                  <Avatar
                    src={instructor.ProfilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(instructor.FullName || instructor.Name || 'Instructor')}&size=200&background=5E72E4&color=fff`}
                    alt={instructor.FullName || instructor.Name}
                    sx={{
                      width: 100,
                      height: 100,
                      mx: "auto",
                      mb: 2,
                      border: "4px solid",
                      borderColor: "primary.light",
                    }}
                  />
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 600, fontSize: "1.1rem" }}
                  >
                    {instructor.FullName || instructor.Name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: "40px" }}>
                    {instructor.Major || "Chuyên gia"}
                  </Typography>
                  
                  <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mb: 2 }}>
                    <Box sx={{ textAlign: "center" }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, mb: 0.5 }}>
                        <School sx={{ fontSize: 18, color: "primary.main" }} />
                        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                          {instructor.TotalCourses || 0}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Khóa học
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: "center" }}>
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, mb: 0.5 }}>
                        <People sx={{ fontSize: 18, color: "primary.main" }} />
                        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                          {instructor.TotalStudents || 0}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Học viên
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/instructors/${instructor.InstructorID}`);
                    }}
                  >
                    Xem chi tiết
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {!loading && instructorsList.length > 4 && (
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/instructors')}
            sx={{ px: 4 }}
          >
            Xem tất cả giảng viên
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default FeaturedInstructorsSection;

