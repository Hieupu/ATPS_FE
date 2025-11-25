import React from 'react';
import {
  Container,
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Avatar,
  CardMedia,
  Skeleton,
  Rating
} from '@mui/material';
import { ArrowForward, Groups, Schedule, StarBorder } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const courseImages = [
  "https://wp-s3-edilume-test-bucket.s3.ap-southeast-1.amazonaws.com/wp-content/uploads/2022/12/31183122/IELTS_new_thumbnail.png",
  "https://top-courses.org/wp-content/uploads/2022/07/IELTS-TEST_Speaking-and-Writing.jpg",
  "https://www.focusedu.org/wp-content/uploads/2021/03/Top-Reasons-Why-IELTS-Coaching-Is-Important.jpg",
];

const PopularCoursesSection = ({ 
  popularCourses, 
  loadingCourses, 
  onViewAllCourses, 
  onViewCourseDetails 
}) => {
  const navigate = useNavigate();

  const handleViewAllCourses = onViewAllCourses || (() => navigate('/courses'));
  const handleViewCourseDetails = onViewCourseDetails || ((courseId) => navigate(`/courses/${courseId}`));

  const getCourseImage = (course, index) => {
    return course.Image || courseImages[index % courseImages.length];
  };

  const getInstructorName = (course) => {
    return course.InstructorName || course.instructorName || 'Giảng viên';
  };

  const getInstructorAvatar = (course) => {
    return course.InstructorAvatar || course.instructorAvatar;
  };

  const formatStudentsCount = (count) => {
    if (!count) return '0';
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };

  return (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #f8faff 0%, #f0f4ff 100%)',
      py: { xs: 6, md: 10 },
      position: 'relative',
      overflow: 'hidden',
      '&::before': {
        content: '""',
        position: 'absolute',
        top: -100,
        right: -100,
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
      }
    }}>
      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ 
          textAlign: 'center',
          mb: { xs: 4, md: 8 },
          position: 'relative',
          zIndex: 1
        }}>
          <Typography 
            variant="h3" 
            component="h2" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              color: '#1a237e',
              fontSize: { xs: '2rem', md: '2.5rem' },
              mb: 2
            }}
          >
            Khoá học nổi bật
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              fontWeight: 400,
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.6,
              fontSize: { xs: '1rem', md: '1.125rem' }
            }}
          >
            Các khóa học được thiết kế bởi những giảng viên giàu kinh nghiệm
          </Typography>
        </Box>

        {/* Courses Grid */}
        {loadingCourses ? (
          <Grid container spacing={3}>
            {[...Array(3)].map((_, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card 
                  sx={{ 
                    borderRadius: 3, 
                    overflow: 'hidden', 
                    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <Skeleton variant="rectangular" height={200} />
                  <CardContent sx={{ p: 3 }}>
                    <Skeleton variant="text" height={28} sx={{ mb: 2 }} />
                    <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
                    <Skeleton variant="text" height={20} width="80%" />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                      <Skeleton variant="circular" width={40} height={40} />
                      <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 2 }} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : popularCourses && popularCourses.length > 0 ? (
          <Grid container spacing={3}>
            {popularCourses.slice(0, 3).map((course, index) => (
              <Grid item xs={12} md={4} key={course.CourseID || course.courseId || index}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    borderRadius: 3,
                    overflow: "hidden",
                    cursor: "pointer",
                    border: '1px solid rgba(102, 126, 234, 0.1)',
                    boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
                    background: 'white',
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 16px 40px rgba(102, 126, 234, 0.15)",
                      borderColor: 'rgba(102, 126, 234, 0.2)',
                    }
                  }}
                  onClick={() => handleViewCourseDetails(course.CourseID || course.courseId)}
                >
                  {/* Course Image */}
                  <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={getCourseImage(course, index)}
                      alt={course.Title || course.title}
                      sx={{ 
                        objectFit: "cover",
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)'
                        }
                      }}
                      onError={(e) => {
                        e.target.src = courseImages[index % courseImages.length];
                      }}
                    />
                    <Chip 
                      label={(course.Level || course.level || "BEGINNER").toUpperCase()} 
                      size="small"
                      sx={{ 
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        background: 'rgba(255,255,255,0.95)',
                        backdropFilter: 'blur(10px)',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        color: '#667eea',
                        border: '1px solid rgba(102, 126, 234, 0.2)'
                      }}
                    />
                  </Box>
                  
             <CardContent sx={{ 
  flexGrow: 1, 
  p: 2.5, 
  display: 'flex', 
  flexDirection: 'column',
  gap: 1.5, // Sử dụng gap để kiểm soát khoảng cách đồng đều
  '&:last-child': { pb: 2.5 }
}}>
  {/* Course Title */}
  <Typography 
    variant="h6" 
    sx={{ 
      fontWeight: 700, 
      minHeight: '40px', // Giảm min-height
      lineHeight: 1, // Giảm line-height
      overflow: 'hidden',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      color: '#1a237e',
      fontSize: '1.05rem' // Giảm font size nhẹ
    }}
  >
    {course.Title || course.title || 'Khóa học'}
  </Typography>
  
  {/* Course Description */}
  <Typography 
    variant="body2" 
    color="text.secondary" 
    sx={{ 
      minHeight: '40px', // Giảm min-height
      lineHeight: 1.5, // Giảm line-height
      overflow: 'hidden',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical',
      fontSize: '0.8rem' // Giảm font size
    }}
  >
    {course.Description || course.description || 'Mô tả khóa học'}
  </Typography>

  {/* Course Stats */}
  <Box sx={{ 
    display: 'flex', 
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 1,
    py: 0.5 // Thêm padding vertical nhẹ
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Rating 
        value={parseFloat(course.Rating || course.rating) || 4.8} 
        readOnly 
        size="small"
        precision={0.1}
        sx={{ fontSize: '16px' }} // Giảm size rating
        emptyIcon={<StarBorder sx={{ fontSize: 16, color: '#ddd' }} />}
      />
      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a237e', fontSize: '0.8rem' }}>
        {parseFloat(course.Rating || course.rating || 4.8).toFixed(1)}
      </Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Groups sx={{ fontSize: 14, color: '#667eea' }} /> {/* Giảm icon size */}
      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
        {formatStudentsCount(course.Students || course.students)} học viên
      </Typography>
    </Box>
 <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
  <Schedule sx={{ fontSize: 14, color: '#667eea' }} />
  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
    {Math.ceil((course.Duration || course.duration || 0) / 1.5)} buổi học
  </Typography>
</Box>

  </Box>
  
  {/* Instructor & Price */}
  <Box sx={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    mt: 'auto',
    pt: 1.5, // Giảm padding top
    borderTop: '1px solid rgba(0,0,0,0.06)'
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Avatar 
        src={getInstructorAvatar(course)}
        sx={{ 
          width: 32, // Giảm kích thước avatar
          height: 32, 
          mr: 1,
          border: '2px solid #667eea',
          fontSize: '0.8rem'
        }}
      >
        {getInstructorName(course).charAt(0)}
      </Avatar>
      <Box>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1, fontSize: '0.7rem' }}>
          Giảng viên
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2, fontSize: '0.8rem' }}>
          {getInstructorName(course)}
        </Typography>
      </Box>
    </Box>
    
  </Box>
</CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            py: 8,
            background: 'white',
            borderRadius: 3,
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 2px 16px rgba(0,0,0,0.08)'
          }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              Chưa có khóa học nổi bật
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Các khóa học nổi bật sẽ xuất hiện tại đây
            </Typography>
          </Box>
        )}

        {/* View All Button */}
        {popularCourses && popularCourses.length > 0 && (
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              variant="outlined"
              endIcon={<ArrowForward />}
              onClick={handleViewAllCourses}
              sx={{ 
                borderRadius: 2,
                px: 4,
                py: 1.5,
                fontWeight: 600,
                borderColor: '#667eea',
                color: '#667eea',
                textTransform: 'none',
                fontSize: '1rem',
                minWidth: 200,
                '&:hover': {
                  background: 'rgba(102, 126, 234, 0.04)',
                  borderColor: '#5568d3',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              Xem tất cả khóa học
            </Button>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default PopularCoursesSection;