import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

const faqs = [
  {
    question: "Làm sao để đăng ký khóa học tại ATPS?",
    answer: "Bạn có thể đăng ký bằng cách: (1) Tạo tài khoản miễn phí, (2) Chọn khóa học phù hợp, (3) Nhấn 'Đăng ký ngay', (4) Hoàn tất thanh toán. Hệ thống sẽ tự động cấp quyền truy cập ngay sau khi thanh toán thành công."
  },
  {
    question: "ATPS hỗ trợ những phương thức thanh toán nào?",
    answer: "Chúng tôi chấp nhận: Chuyển khoản ngân hàng, Ví điện tử (Momo, ZaloPay), Thẻ tín dụng/ghi nợ quốc tế (Visa, Mastercard). Tất cả giao dịch đều được mã hóa và bảo mật tuyệt đối."
  },
  {
    question: "Có được hoàn tiền nếu không hài lòng với khóa học?",
    answer: "Có! Chúng tôi có chính sách hoàn tiền 100% trong vòng 7 ngày đầu tiên nếu bạn chưa hoàn thành quá 20% khóa học và chưa tải tài liệu. Sau thời gian này, hoàn tiền theo tỷ lệ % chưa học."
  },
  {
    question: "Tôi có thể học theo lịch trình linh hoạt không?",
    answer: "Hoàn toàn được! ATPS cung cấp 2 chế độ: (1) Tự học - bạn có toàn quyền kiểm soát thời gian và tốc độ học, (2) Lớp học trực tuyến - theo lịch cố định với giảng viên. Tài liệu và video có sẵn 24/7."
  },
  {
    question: "Sau khi hoàn thành khóa học, tôi có nhận được chứng chỉ không?",
    answer: "Có! Sau khi hoàn thành 100% bài học, bài tập và đạt điểm tối thiểu 70% trong bài kiểm tra cuối khóa, bạn sẽ nhận được chứng chỉ điện tử có thể chia sẻ trên LinkedIn và CV."
  },
  {
    question: "Làm sao để liên hệ với giảng viên khi cần hỗ trợ?",
    answer: "Bạn có thể: (1) Chat trực tiếp trong khóa học, (2) Đặt câu hỏi trong diễn đàn thảo luận, (3) Đăng ký buổi 1-1 với giảng viên (nếu có), (4) Liên hệ bộ phận hỗ trợ 24/7 qua email hoặc hotline."
  },
  {
    question: "Tôi có thể truy cập khóa học trên thiết bị di động không?",
    answer: "Có! ATPS được tối ưu hóa cho mọi thiết bị: Desktop, Laptop, Tablet và Smartphone. Bạn có thể học mọi lúc mọi nơi với trải nghiệm mượt mà. Ứng dụng mobile đang trong quá trình phát triển."
  },
  {
    question: "Có giảm giá cho nhóm học viên không?",
    answer: "Có! Chúng tôi có chương trình ưu đãi: Nhóm 3-5 người giảm 10%, nhóm 6-10 người giảm 15%, nhóm trên 10 người giảm 20%. Liên hệ team sales để được tư vấn gói doanh nghiệp."
  },
];

const FAQSection = () => {
  const [expanded, setExpanded] = useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Container maxWidth="md" sx={{ my: 10 }}>
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Chip label="HỖ TRỢ" color="primary" sx={{ mb: 2, fontWeight: 600 }} />
        <Typography
          variant="h3"
          component="h2"
          gutterBottom
          sx={{ fontWeight: 700 }}
        >
          Câu hỏi thường gặp
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Giải đáp mọi thắc mắc của bạn về ATPS
        </Typography>
      </Box>

      <Box>
        {faqs.map((faq, index) => (
          <Accordion
            key={index}
            expanded={expanded === `panel${index}`}
            onChange={handleChange(`panel${index}`)}
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "grey.200",
              borderRadius: "8px !important",
              mb: 2,
              "&:before": {
                display: "none",
              },
              "&.Mui-expanded": {
                margin: "0 0 16px 0",
                borderColor: "primary.main",
              },
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                "&.Mui-expanded": {
                  minHeight: 56,
                },
                "& .MuiAccordionSummary-content.Mui-expanded": {
                  margin: "12px 0",
                },
              }}
            >
              <Typography sx={{ fontWeight: 600, fontSize: "1rem" }}>
                {faq.question}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ lineHeight: 1.7 }}
              >
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Container>
  );
};

export default FAQSection;

