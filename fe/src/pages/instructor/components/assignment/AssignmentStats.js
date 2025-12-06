import React from 'react';
import { BookOpen, Mic, Volume2, FileText } from 'lucide-react';

export default function AssignmentStats({ stats }) {
  const statItems = [
    { 
      icon: BookOpen, 
      title: 'Trắc nghiệm', 
      desc: 'Các câu hỏi trắc nghiệm', 
      count: stats.quiz || 0 
    },
    { 
      icon: Mic, 
      title: ' Bài Nói', 
      desc: 'Ghi âm', 
      count: stats.audio || 0 
    },
    { 
      icon: Volume2, 
      title: 'Bài Nghe', 
      desc: 'Âm thanh và câu hỏi', 
      count: stats.video || 0 
    },
    { 
      icon: FileText, 
      title: 'Tài Liệu', 
      desc: 'Đọc & Viết', 
      count: stats.document || 0 
    }
  ];

  return (
    <div style={styles.statsGrid}>
      {statItems.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} style={styles.statCard}>
            <div style={styles.statContent}>
              <div style={styles.iconWrapper}>
                <Icon size={24} color="#374151" />
              </div>
              <h3 style={styles.statTitle}>{stat.title}</h3>
              <p style={styles.statDesc}>{stat.desc}</p>
              <p style={styles.statCount}>{stat.count}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const styles = {
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
    marginBottom: '32px'
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '1px solid #E5E7EB'
  },
  statContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center'
  },
  iconWrapper: {
    width: '48px',
    height: '48px',
    backgroundColor: '#F3F4F6',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px'
  },
  statTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '4px'
  },
  statDesc: {
    fontSize: '14px',
    color: '#6B7280',
    marginBottom: '12px'
  },
  statCount: {
    fontSize: '32px',
    fontWeight: 'bold',
    color: '#111827'
  }
};
