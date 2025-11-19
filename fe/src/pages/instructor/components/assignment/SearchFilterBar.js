import React from 'react';
import { Search, Filter } from 'lucide-react';

export default function SearchFilterBar({ 
  searchQuery, 
  setSearchQuery, 
  filters, 
  setFilters,
  courses = []
}) {
  return (
    <div style={styles.searchContainer}>
      <div style={styles.searchBox}>
        <Search size={20} color="#9CA3AF" />
        <input
          type="text"
          placeholder="Tìm kiếm bài tập, khóa học..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
      </div>
      
      <div style={styles.filterRow}>
        <div style={styles.filterLabel}>
          <Filter size={16} />
          <span>Lọc theo:</span>
        </div>
        
        <select 
          value={filters.type}
          onChange={(e) => setFilters({...filters, type: e.target.value})}
          style={styles.select}
        >
          <option value="all">Tất cả loại</option>
          <option value="quiz">Trắc nghiệm</option>
          <option value="audio">Nói</option>
          <option value="video">Nghe</option>
          <option value="document">Tài liệu</option>
        </select>

        <select 
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
          style={styles.select}
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="draft">Bản nháp</option>
          <option value="archived">Đã đóng</option>
        </select>

        <select 
          value={filters.course}
          onChange={(e) => setFilters({...filters, course: e.target.value})}
          style={styles.select}
        >
          <option value="all">Tất cả khóa học</option>
          {courses.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}

const styles = {
  searchContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #E5E7EB',
    marginBottom: '24px'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingBottom: '16px',
    borderBottom: '1px solid #E5E7EB',
    marginBottom: '16px'
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '15px',
    color: '#374151'
  },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap'
  },
  filterLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#374151',
    fontWeight: '500',
    fontSize: '15px'
  },
  select: {
    padding: '8px 16px',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    outline: 'none',
    fontSize: '14px',
    color: '#374151',
    cursor: 'pointer',
    backgroundColor: '#FFFFFF'
  }
};