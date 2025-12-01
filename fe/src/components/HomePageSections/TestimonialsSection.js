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
  IconButton,
} from '@mui/material';
import { Star, Facebook } from '@mui/icons-material';

const testimonials = [
  {
    id: 1,
    name: "Nguyễn Hoàng Phương Nghi",
    avatar: "https://i.pravatar.cc/150?img=1",
    date: "Tháng 11, 2024",
    rating: 5,
    content: "Trước khi học ATPS, em từng gặp nhiều khó khăn trong việc tổ chức tài liệu học tập và nội dung vì học ở kỳ trong tâm câu hỏi và hay bị bí idea. Lúc mẹ đăng kí cho em học em thấy, chút xíu tại thấy ATPS seems very organized. Nhờ vào các tính năng như progress tracking và bài tập có feedback chi tiết...",
    course: "Lập trình Web Full Stack",
    facebookUrl: "#"
  },
  {
    id: 2,
    name: "Nguyễn Phương Huỳnh",
    avatar: "https://i.pravatar.cc/150?img=5",
    date: "Tháng 10, 2024",
    rating: 5,
    content: "Review ATPS thôi nào! Cháu nạp card 14 cú đi học à, hoàn toàn không có sponsor từ trung tâm bài nhà 😂 Kết quả: Listening: +1.5 (7.5 to 9.0) Reading: +1.0 (8.0 to 9.0) Writing: +1.0 (6.0 to 7.0)... Platform rất tiện lợi, học mọi lúc mọi nơi!",
    course: "Data Science & AI",
    facebookUrl: "#"
  },
  {
    id: 3,
    name: "Trần Bảo Ngọc",
    avatar: "https://i.pravatar.cc/150?img=10",
    date: "Tháng 11, 2024",
    rating: 5,
    content: "Dạ em xin review cô @amealaday_w_np ngắn gọn bằng 3 chữ: giỏi, chu đáo, nhiệt tình. Nhà em có khá quan trọng trong việc giải đáp thắc mắc của học viên, nên tụi em không phải lo quá nhiều về việc... Chương trình học có hệ thống, từ cơ bản đến nâng cao!",
    course: "UI/UX Design",
    facebookUrl: "#"
  },
  {
    id: 4,
    name: "Lê Đình Bảo Trân",
    avatar: "https://i.pravatar.cc/150?img=8",
    date: "Tháng 09, 2024",
    rating: 5,
    content: "ATPS đã đồng hành cùng em ngay từ những bước chân đầu tiên trong hành trình chinh phục IELTS. Từ những khuyết điểm về ngữ pháp, phát âm,... của em đã được cải thiện rất nhiều. Nhờ vào lộ trình học rõ ràng và giảng viên tận tâm.",
    course: "Digital Marketing",
    facebookUrl: "#"
  },
  {
    id: 5,
    name: "Nguyễn Ngọc Lan Chi",
    avatar: "https://i.pravatar.cc/150?img=9",
    date: "Tháng 10, 2024",
    rating: 5,
    content: "Học phương pháp Linear thinking cô gì thú vị với cách học truyền thống??? Đó gì đổi với mình thì kỹ năng khó nhất là Reading. Mình đã bị dưới khi có quá nhiều đoạn văn trong bài, và luôn... Giờ đã tiến bộ rất nhiều nhờ ATPS!",
    course: "Mobile App Development",
    facebookUrl: "#"
  },
  {
    id: 6,
    name: "Đinh Văn Thái Bảo",
    avatar: "https://i.pravatar.cc/150?img=12",
    date: "Tháng 09, 2024",
    rating: 5,
    content: "🌈 Thi IELTS gấp, nhưng chưa thì làn nào, đều em đành chọn học ở ATPS IELTS Định Lực - 24A Bàu Cát 2 - Tân Bình, lớp cuối tuần để không ảnh hưởng công việc. Mình được Thầy Hoàng Định... Hệ thống bài tập phong phú, feedback nhanh chóng!",
    course: "Blockchain & Crypto",
    facebookUrl: "#"
  },
];

const TestimonialsSection = () => {
  return (
    <Box sx={{ backgroundColor: "grey.50", py: 10 }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Chip 
            label="ĐÁNH GIÁ TỪ HỌC VIÊN" 
            color="primary" 
            sx={{ mb: 2, fontWeight: 600 }} 
          />
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            Học viên nói gì khi học tại ATPS
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            <Box component="span" sx={{ color: "primary.main", fontWeight: 700 }}>
              300+ đánh giá
            </Box>{" "}
            từ học viên và phụ huynh
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {testimonials.map((testimonial) => (
            <Grid item xs={12} md={6} key={testimonial.id}>
              <Card
                elevation={0}
                sx={{
                  height: "100%",
                  border: "1px solid",
                  borderColor: "grey.200",
                  borderRadius: 3,
                  position: "relative",
                  transition: "all 0.3s",
                  "&:hover": {
                    borderColor: "primary.main",
                    transform: "translateY(-4px)",
                    boxShadow: 3,
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Quote icon */}
                  <Typography
                    variant="h2"
                    sx={{
                      position: "absolute",
                      top: 16,
                      left: 16,
                      color: "grey.200",
                      fontFamily: "Georgia, serif",
                      lineHeight: 1,
                      fontWeight: 700,
                      fontSize: "4rem",
                    }}
                  >
                    "
                  </Typography>

                  {/* Header */}
                  <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2, position: "relative", zIndex: 1 }}>
                    <Avatar
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      sx={{ width: 56, height: 56, mr: 2 }}
                    />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1rem" }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {testimonial.date}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", mt: 0.5 }}>
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            sx={{ fontSize: 16, color: "warning.main" }}
                          />
                        ))}
                      </Box>
                    </Box>
                    <IconButton
                      size="small"
                      href={testimonial.facebookUrl}
                      target="_blank"
                      sx={{ color: "#1877F2" }}
                    >
                      <Facebook />
                    </IconButton>
                  </Box>

                  {/* Content */}
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ 
                      mb: 2, 
                      lineHeight: 1.7,
                      fontSize: "0.95rem",
                    }}
                  >
                    {testimonial.content}
                  </Typography>

                  {/* Course tag */}
                  <Chip
                    label={testimonial.course}
                    size="small"
                    sx={{
                      backgroundColor: "primary.light",
                      color: "primary.main",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default TestimonialsSection;

