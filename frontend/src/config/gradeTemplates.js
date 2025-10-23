// src/config/gradeTemplates.js

export const gradeTemplates = [
  {
    id: '10-10-10-70',
    name: '10% - 10% - 10% - 70%',
    weights: [10, 10, 10, 70],
    labels: ['Điểm thành phần 1 (10%)', 'Điểm thành phần 2 (10%)', 'Điểm thành phần 3 (10%)', 'Điểm thành phần 4 (70%)'],
    fields: 4
  },
  {
    id: '10-10-30-50',
    name: '10% - 10% - 30% - 50%', 
    weights: [10, 10, 30, 50],
    labels: ['Điểm thành phần 1 (10%)', 'Điểm thành phần 2 (10%)', 'Điểm thành phần 3 (30%)', 'Điểm thành phần 4 (50%)'],
    fields: 4
  },
  {
    id: '10-10-20-60',
    name: '10% - 10% - 20% - 60%',
    weights: [10, 10, 20, 60],
    labels: ['Điểm thành phần 1 (10%)', 'Điểm thành phần 2 (10%)', 'Điểm thành phần 3 (20%)', 'Điểm thành phần 4 (60%)'],
    fields: 4
  },
  {
    id: '10-20-20-50',
    name: '10% - 20% - 20% - 50%',
    weights: [10, 20, 20, 50],
    labels: ['Điểm thành phần 1 (10%)', 'Điểm thành phần 2 (20%)', 'Điểm thành phần 3 (20%)', 'Điểm thành phần 4 (50%)'],
    fields: 4
  },
  {
    id: '10-30-60',
    name: '10% - 30% - 60%',
    weights: [10, 30, 60],
    labels: ['Điểm thành phần 1 (10%)', 'Điểm thành phần 2 (30%)', 'Điểm thành phần 3 (60%)'],
    fields: 3
  },
  {
    id: '10-20-70',
    name: '10% - 20% - 70%',
    weights: [10, 20, 70],
    labels: ['Điểm thành phần 1 (10%)', 'Điểm thành phần 2 (20%)', 'Điểm thành phần 3 (70%)'],
    fields: 3
  },
  {
    id: '10-10-80',
    name: '10% - 10% - 80%',
    weights: [10, 10, 80],
    labels: ['Điểm thành phần 1 (10%)', 'Điểm thành phần 2 (10%)', 'Điểm thành phần 3 (80%)'],
    fields: 3
  }
];

// Hàm tính điểm trung bình theo template
export const calculateAverage = (scores, template) => {
  if (!scores || !template) return 0;
  
  let total = 0;
  let totalWeight = 0;
  
  for (let i = 0; i < template.fields; i++) {
    const score = scores[i];
    const weight = template.weights[i];
    
    if (score !== null && score !== undefined && score !== '') {
      total += parseFloat(score) * weight;
      totalWeight += weight;
    }
  }
  
  return totalWeight > 0 ? (total / totalWeight).toFixed(1) : 0;
};

// Hàm lấy template theo ID - THÊM FUNCTION NÀY
export const getTemplateById = (id) => {
  return gradeTemplates.find(template => template.id === id);
};