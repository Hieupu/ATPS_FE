import React, { useState } from 'react';
import AssignmentCard from './AssignmentCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './style/AssignmentList.css';

export default function AssignmentList({
  assignments = [],
  onEdit,
  onViewSubmissions,
  onDelete,
  itemsPerPage = 6,
   onViewDetail
}) {
  const [currentPage, setCurrentPage] = useState(1);

  // Tính toán phân trang
  const totalPages = Math.ceil(assignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAssignments = assignments.slice(startIndex, endIndex);

  // Xử lý chuyển trang
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      // Scroll to top khi chuyển trang
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrevPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // Tạo danh sách số trang để hiển thị
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Số trang tối đa hiển thị

    if (totalPages <= maxVisible) {
      // Nếu tổng số trang ít, hiển thị tất cả
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Luôn hiển thị trang đầu
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      // Thêm dấu ... nếu cần
      if (start > 2) {
        pages.push('...');
      }

      // Thêm các trang ở giữa
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Thêm dấu ... nếu cần
      if (end < totalPages - 1) {
        pages.push('...');
      }

      // Luôn hiển thị trang cuối
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (!assignments.length) {
    return (
      <div className="assignment-list-empty">
        <p>Chưa có bài tập nào</p>
      </div>
    );
  }

  return (
    <div className="assignment-list-container">
      {/* Hiển thị thông tin tổng quan */}
      <div className="assignment-list-header">
        <p className="assignment-list-info">
          Hiển thị {startIndex + 1}-{Math.min(endIndex, assignments.length)} trong tổng số {assignments.length} bài tập
        </p>
      </div>

      {/* Danh sách bài tập */}
      <div className="assignment-list">
        {currentAssignments.map((assignment) => (
          <AssignmentCard
            key={assignment.AssignmentID}
            assignment={assignment}
            onEdit={onEdit}
            onViewDetail={onViewDetail}
            onViewSubmissions={onViewSubmissions}
            onDelete={onDelete}
          />
        ))}
      </div>

      {/* Phân trang */}
      {totalPages > 1 && (
        <div className="pagination-container">
          {/* Nút Previous */}
          <button
            className={`pagination-button ${currentPage === 1 ? 'pagination-button-disabled' : ''}`}
            onClick={goToPrevPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft size={20} />
            <span>Trước</span>
          </button>

          {/* Số trang */}
          <div className="pagination-numbers">
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="pagination-ellipsis">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  className={`pagination-number ${currentPage === page ? 'pagination-number-active' : ''}`}
                  onClick={() => goToPage(page)}
                >
                  {page}
                </button>
              )
            ))}
          </div>

          {/* Nút Next */}
          <button
            className={`pagination-button ${currentPage === totalPages ? 'pagination-button-disabled' : ''}`}
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            <span>Sau</span>
            <ChevronRight size={20} />
          </button>
        </div>
      )}
    </div>
  );
}