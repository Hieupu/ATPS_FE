import React from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
} from '@mui/material';
import {
  EmojiEvents,
  TrendingUp,
  Stars,
  VerifiedUser,
} from '@mui/icons-material';

const achievements = [
  {
    id: 1,
    icon: <EmojiEvents sx={{ fontSize: 50, color: "#FFB300" }} />,
    title: "Top 10",
    subtitle: "Nền tảng học tập",
    description: "Việt Nam 2024",
    color: "#FFF8E1",
  },
  {
    id: 2,
    icon: <TrendingUp sx={{ fontSize: 50, color: "#2196F3" }} />,
    title: "95%",
    subtitle: "Tỷ lệ thành công",
    description: "Học viên hoàn thành khóa học",
    color: "#E3F2FD",
  },
  {
    id: 3,
    icon: <Stars sx={{ fontSize: 50, color: "#9C27B0" }} />,
    title: "4.8/5",
    subtitle: "Đánh giá trung bình",
    description: "Từ 500+ học viên",
    color: "#F3E5F5",
  },
  {
    id: 4,
    icon: <VerifiedUser sx={{ fontSize: 50, color: "#4CAF50" }} />,
    title: "ISO 9001",
    subtitle: "Chứng nhận",
    description: "Chất lượng quốc tế",
    color: "#E8F5E9",
  },
];

const AchievementsSection = () => {
  return (
    <Box sx={{ backgroundColor: "grey.50", py: 10 }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Chip 
            label="THÀNH TÍCH" 
            color="primary" 
            sx={{ mb: 2, fontWeight: 600 }} 
          />
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            Thành Tích & Giải Thưởng
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Được công nhận bởi các tổ chức uy tín
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {achievements.map((achievement) => (
            <Grid item xs={12} sm={6} md={3} key={achievement.id}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  border: "1px solid",
                  borderColor: "grey.200",
                  borderRadius: 3,
                  backgroundColor: achievement.color,
                  transition: "all 0.3s",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: 4,
                    borderColor: "primary.main",
                  },
                }}
              >
                <CardContent
                  sx={{
                    p: 4,
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box sx={{ mb: 2 }}>{achievement.icon}</Box>
                  
                  <Typography
                    variant="h3"
                    gutterBottom
                    sx={{ fontWeight: 700, color: "primary.main" }}
                  >
                    {achievement.title}
                  </Typography>
                  
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ fontWeight: 600, color: "text.primary" }}
                  >
                    {achievement.subtitle}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    {achievement.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ textAlign: "center", mt: 6 }}>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: "700px", mx: "auto" }}>
            ATPS tự hào là đối tác đào tạo của nhiều tổ chức giáo dục hàng đầu, 
            với cam kết mang đến chất lượng giảng dạy xuất sắc và trải nghiệm học tập tốt nhất.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default AchievementsSection;

