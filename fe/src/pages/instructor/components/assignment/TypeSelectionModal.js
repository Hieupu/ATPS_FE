import React from 'react';
import { BookOpen, Mic, Volume2, FileText } from 'lucide-react';

export default function TypeSelectionModal({ show, onClose, onSelectType }) {
  if (!show) return null;

  const items = [
    { icon: BookOpen, title: 'Trắc nghiệm', desc: 'Tạo câu hỏi trắc nghiệm', type: 'quiz' },
    { icon: Mic,      title: 'Nói',         desc: 'Học viên ghi âm trả lời', type: 'audio' },
    { icon: Volume2,  title: 'Nghe',        desc: 'Upload audio/video với câu hỏi', type: 'video' },
    { icon: FileText, title: 'Tài liệu',    desc: 'Bài tập đọc và viết', type: 'document' },
  ];

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <div style={s.header}>
          <div>
            <h2 style={s.title}>Tạo Bài Tập Mới</h2>
            <p style={s.subtitle}>Chọn loại bài tập bạn muốn tạo</p>
          </div>
          <button style={s.closeButton} onClick={onClose}>×</button>
        </div>

        <div style={s.grid}>
          {items.map((it, i) => {
            const Icon = it.icon;
            return (
              <button key={i} style={s.card} onClick={() => onSelectType(it.type)}>
                <div style={s.iconWrap}><Icon size={32} color="#111827" /></div>
                <div style={s.cardTitle}>{it.title}</div>
                <div style={s.cardDesc}>{it.desc}</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const s = {
  overlay:{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000},
  modal:{background:'#fff',borderRadius:16,padding:24,width:'min(720px,94vw)',boxShadow:'0 20px 25px -5px rgba(0,0,0,0.1)'},
  header:{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16},
  title:{margin:0,fontSize:24,fontWeight:700,color:'#111827'},
  subtitle:{margin:0,fontSize:14,color:'#6B7280'},
  closeButton:{background:'transparent',border:'none',fontSize:28,color:'#6B7280',cursor:'pointer'},
  grid:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16},
  card:{textAlign:'left',padding:20,border:'2px solid #E5E7EB',borderRadius:12,background:'#fff',cursor:'pointer'},
  iconWrap:{marginBottom:12},
  cardTitle:{fontSize:18,fontWeight:600,color:'#111827',marginBottom:6},
  cardDesc:{fontSize:14,color:'#6B7280'}
};
