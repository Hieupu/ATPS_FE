import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Chip,
  Divider,
  Rating,
  Paper,
} from '@mui/material';
import {
  School,
  Work,
  LocationOn,
  Email,
  Phone,
  Star,
  Groups,
} from '@mui/icons-material';

const StatCard = ({ icon, label, value }) => (
  <Paper 
    elevation={0} 
    sx={{ 
      p: 2, 
      textAlign: 'center',
      bgcolor: 'background.default',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2
    }}
  >
    <Box sx={{ color: 'primary.main', mb: 1 }}>
      {icon}
    </Box>
    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
      {value}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
  </Paper>
);

const InstructorInfo = ({ instructor }) => {
  console.log("instructor", instructor);
  
  // Tính toán stats từ dữ liệu thực tế
  const instructorStats = {
    totalStudents: instructor.TotalStudents ? `${instructor.TotalStudents}+` : '0',
    totalCourses: instructor.TotalCourses || 0,
    rating: instructor.ReviewCount > 0 ? 4.8 : 0, // Có thể tính từ reviews nếu có
    reviews: instructor.ReviewCount || 0,
    experience: '5 năm' // Có thể lấy từ InstructorCV hoặc tính toán
  };

  // Tạo skills từ chuyên môn và công việc
  const getSkills = () => {
    const baseSkills = ['Listening', 'Reading', 'Speaking', 'Writing'];
    if (instructor.InstructorMajor) {
      return [...baseSkills, instructor.InstructorMajor, 'IELTS Academic', 'IELTS General'];
    }
    return baseSkills;
  };

  const skills = getSkills();

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 4 }}>
        Giới thiệu giảng viên
      </Typography>

      <Grid container spacing={4}>
        {/* Instructor Profile */}
        <Grid item xs={12} md={4}>
          <Card sx={{ position: 'sticky', top: 100 }}>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <Avatar
                src={instructor.InstructorAvatar}
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto', 
                  mb: 2,
                  border: '4px solid',
                  borderColor: 'primary.main'
                }}
                alt={instructor.InstructorName}
              >
                {instructor.InstructorName?.charAt(0)}
              </Avatar>
              
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                {instructor.InstructorName}
              </Typography>
              
              <Typography variant="body1" color="primary.main" sx={{ mb: 2 }}>
                {instructor.InstructorJob}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <Rating 
                  value={instructorStats.rating} 
                  precision={0.1} 
                  readOnly 
                />
                <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                  {instructorStats.rating > 0 ? `${instructorStats.rating} (${instructorStats.reviews} đánh giá)` : 'Chưa có đánh giá'}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Contact Info */}
              <Box sx={{ textAlign: 'left' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <School sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    Chuyên ngành: <strong>{instructor.InstructorMajor}</strong>
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <Work sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    Kinh nghiệm: <strong>{instructorStats.experience}</strong>
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    Địa chỉ: <strong>{instructor.InstructorAddress}</strong>
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <Groups sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    Học viên: <strong>{instructorStats.totalStudents}</strong>
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Work sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    Loại: <strong>
                      {instructor.InstructorType === 'fulltime' ? 'Toàn thời gian' : 
                       instructor.InstructorType === 'parttime' ? 'Bán thời gian' : 
                       instructor.InstructorType}
                    </strong>
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Instructor Details */}
        <Grid item xs={12} md={8}>
          {/* Statistics */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            <Grid item xs={6} sm={3}>
              <StatCard
                icon={<Groups fontSize="large" />}
                label="Học viên"
                value={instructorStats.totalStudents}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard
                icon={<School fontSize="large" />}
                label="Khóa học"
                value={instructorStats.totalCourses}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard
                icon={<Star fontSize="large" />}
                label="Đánh giá"
                value={instructorStats.rating > 0 ? instructorStats.rating : 'N/A'}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <StatCard
                icon={<Work fontSize="large" />}
                label="Kinh nghiệm"
                value={instructorStats.experience}
              />
            </Grid>
          </Grid>

          {/* About Instructor */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Giới thiệu
              </Typography>
              <Typography variant="body1" paragraph>
                {instructor.InstructorCV || 
                 `Giảng viên ${instructor.InstructorName} với hơn ${instructorStats.experience} kinh nghiệm trong lĩnh vực ${instructor.InstructorMajor}. Với phương pháp giảng dạy nhiệt tình và dễ hiểu, thầy/cô đã giúp hàng ngàn học viên đạt được mục tiêu học tập.`}
              </Typography>
              {instructor.InstructorCV && (
                <Typography variant="body1">
                  Luôn cập nhật những xu hướng công nghệ mới nhất và áp dụng vào giảng dạy, mang đến cho học viên những kiến thức thực tế và hữu ích nhất.
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Skills */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Chuyên môn
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {skills.map((skill, index) => (
                  <Chip
                    key={index}
                    label={skill}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Teaching Philosophy */}
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Phương pháp giảng dạy
              </Typography>
              <Box component="ul" sx={{ pl: 2 }}>
                <Typography component="li" variant="body1" paragraph>
                  <strong>Học qua thực hành:</strong> Tập trung vào các bài tập và đề thi thực tế
                </Typography>
                <Typography component="li" variant="body1" paragraph>
                  <strong>Hỗ trợ 1-1:</strong> Giải đáp thắc mắc chi tiết cho từng học viên
                </Typography>
                <Typography component="li" variant="body1" paragraph>
                  <strong>Cập nhật xu hướng:</strong> Luôn theo sát các thay đổi trong đề thi IELTS
                </Typography>
                <Typography component="li" variant="body1">
                  <strong>Lộ trình rõ ràng:</strong> Xây dựng lộ trình học tập phù hợp với từng trình độ học viên
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InstructorInfo;