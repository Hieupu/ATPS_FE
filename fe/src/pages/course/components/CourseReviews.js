import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Rating,
  Avatar,
  Divider,
  Chip,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Pagination,
} from '@mui/material';
import {
  Star,
  Person,
  CalendarToday,
  ThumbUp,
} from '@mui/icons-material';

// Mock data - Thay thế bằng API thực tế
const mockReviews = [
  {
    id: 1,
    user: { name: 'Nguyễn Văn A', avatar: '' },
    rating: 5,
    comment: 'Khóa học rất tuyệt vời! Giảng viên giải thích dễ hiểu, nội dung thực tế. Mình đã học được rất nhiều kiến thức bổ ích.',
    date: '2024-01-15',
    likes: 24,
    isLiked: false
  },
  {
    id: 2,
    user: { name: 'Trần Thị B', avatar: '' },
    rating: 4,
    comment: 'Nội dung khóa học khá tốt, nhưng có một số phần nên cập nhật thêm. Support rất nhiệt tình!',
    date: '2024-01-10',
    likes: 18,
    isLiked: true
  },
  {
    id: 3,
    user: { name: 'Lê Văn C', avatar: '' },
    rating: 5,
    comment: 'Hoàn toàn xứng đáng với số tiền bỏ ra. Mình đã apply được kiến thức vào công việc ngay lập tức.',
    date: '2024-01-08',
    likes: 32,
    isLiked: false
  }
];

const ReviewCard = ({ review, onLike }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Avatar sx={{ width: 48, height: 48 }}>
            <Person />
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            {/* Review Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {review.user.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating value={review.rating} size="small" readOnly />
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(review.date)}
                  </Typography>
                </Box>
              </Box>
              
              <Chip 
                icon={<Star sx={{ color: 'gold' }} />} 
                label={review.rating} 
                size="small" 
                variant="outlined"
              />
            </Box>

            {/* Review Content */}
            <Typography variant="body1" paragraph sx={{ mb: 2 }}>
              {review.comment}
            </Typography>

            {/* Review Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                startIcon={<ThumbUp sx={{ color: review.isLiked ? 'primary.main' : 'inherit' }} />}
                onClick={() => onLike(review.id)}
                variant={review.isLiked ? "contained" : "outlined"}
              >
                Hữu ích ({review.likes})
              </Button>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const ReviewStats = ({ reviews }) => {
  const totalReviews = reviews.length;
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
  
  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(review => review.rating === stars).length,
    percentage: (reviews.filter(review => review.rating === stars).length / totalReviews) * 100
  }));

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                {averageRating.toFixed(1)}
              </Typography>
              <Rating value={averageRating} precision={0.1} readOnly size="large" />
              <Typography variant="body2" color="text.secondary">
                {totalReviews} đánh giá
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {ratingDistribution.map(({ stars, count, percentage }) => (
                <Box key={stars} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ minWidth: 80 }}>
                    {stars} sao
                  </Typography>
                  <Box sx={{ flex: 1, bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
                    <Box 
                      sx={{ 
                        bgcolor: 'primary.main', 
                        height: '100%', 
                        borderRadius: 1,
                        width: `${percentage}%` 
                      }} 
                    />
                  </Box>
                  <Typography variant="body2" sx={{ minWidth: 40, textAlign: 'right' }}>
                    {count}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

const CourseReviews = ({ courseId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [newReview, setNewReview] = useState({ rating: 0, comment: '' });
  const reviewsPerPage = 5;

  useEffect(() => {
    // Simulate API call
    const fetchReviews = async () => {
      setLoading(true);
      try {
        // Thay thế bằng API call thực tế
        // const response = await getCourseReviewsApi(courseId);
        // setReviews(response.reviews);
        
        setTimeout(() => {
          setReviews(mockReviews);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setLoading(false);
      }
    };

    fetchReviews();
  }, [courseId]);

  const handleLike = (reviewId) => {
    setReviews(prev => prev.map(review => 
      review.id === reviewId 
        ? { 
            ...review, 
            likes: review.isLiked ? review.likes - 1 : review.likes + 1,
            isLiked: !review.isLiked 
          }
        : review
    ));
  };

  const handleSubmitReview = () => {
    if (newReview.rating === 0 || !newReview.comment.trim()) {
      alert('Vui lòng chọn số sao và nhập nội dung đánh giá');
      return;
    }

    const review = {
      id: reviews.length + 1,
      user: { name: 'Bạn', avatar: '' },
      rating: newReview.rating,
      comment: newReview.comment,
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      isLiked: false
    };

    setReviews(prev => [review, ...prev]);
    setNewReview({ rating: 0, comment: '' });
  };

  const paginatedReviews = reviews.slice(
    (page - 1) * reviewsPerPage,
    page * reviewsPerPage
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Đánh giá khóa học
      </Typography>

      {/* Review Statistics */}
      <ReviewStats reviews={reviews} />

      {/* Add Review Form */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Thêm đánh giá của bạn
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Chọn số sao:
            </Typography>
            <Rating
              value={newReview.rating}
              onChange={(event, newValue) => {
                setNewReview(prev => ({ ...prev, rating: newValue }));
              }}
              size="large"
            />
          </Box>

          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Chia sẻ trải nghiệm của bạn về khóa học..."
            value={newReview.comment}
            onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <Button 
            variant="contained" 
            onClick={handleSubmitReview}
            disabled={!newReview.rating || !newReview.comment.trim()}
          >
            Gửi đánh giá
          </Button>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Tất cả đánh giá ({reviews.length})
        </Typography>

        {paginatedReviews.length === 0 ? (
          <Alert severity="info">
            Chưa có đánh giá nào cho khóa học này.
          </Alert>
        ) : (
          <>
            {paginatedReviews.map(review => (
              <ReviewCard 
                key={review.id} 
                review={review} 
                onLike={handleLike}
              />
            ))}
            
            {/* Pagination */}
            {reviews.length > reviewsPerPage && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <Pagination
                  count={Math.ceil(reviews.length / reviewsPerPage)}
                  page={page}
                  onChange={(event, value) => setPage(value)}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default CourseReviews;