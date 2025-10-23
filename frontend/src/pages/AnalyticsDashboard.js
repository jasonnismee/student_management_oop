import React, { useState, useEffect, useCallback } from 'react';
import { analyticsAPI } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsDashboard = ({ currentUser }) => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getSummary(currentUser.userId);
      setSummary(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser.userId]);

  useEffect(() => {
    if (currentUser?.userId) {
      loadAnalyticsData();
    }
  }, [currentUser, loadAnalyticsData]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Đang tải dữ liệu thống kê...</div>;
  }

  if (!summary) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Không có dữ liệu thống kê</div>;
  }

  // Chuẩn bị dữ liệu cho biểu đồ
  const chartData = {
    labels: summary.chartData?.labels || [],
    datasets: [
      {
        label: 'GPA Học Kỳ',
        data: summary.chartData?.gpaData || [],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        yAxisID: 'y',
      },
      {
        label: 'Số Môn Học',
        data: summary.chartData?.subjectCounts || [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        yAxisID: 'y1',
        type: 'bar',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        max: 10,
        title: {
          display: true,
          text: 'GPA'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        grid: {
          drawOnChartArea: false,
        },
        title: {
          display: true,
          text: 'Số Môn'
        }
      },
    },
  };

  // Đánh giá học lực
  const getAcademicPerformance = (gpa) => {
    if (gpa >= 9.0) return { level: 'Xuất sắc', color: '#28a745' };
    if (gpa >= 8.0) return { level: 'Giỏi', color: '#007bff' };
    if (gpa >= 7.0) return { level: 'Khá', color: '#ffc107' };
    if (gpa >= 5.0) return { level: 'Trung bình', color: '#fd7e14' };
    return { level: 'Yếu', color: '#dc3545' };
  };

  const performance = getAcademicPerformance(summary.overallGpa);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h2>📊 Thống Kê Học Tập</h2>

      {/* Overall Statistics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '20px', 
          borderRadius: '10px',
          textAlign: 'center',
          border: `3px solid ${performance.color}`
        }}>
          <h3>GPA Tổng thể</h3>
          <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: performance.color }}>
            {summary.overallGpa.toFixed(2)}
          </div>
          <div style={{ color: performance.color, fontWeight: 'bold' }}>
            {performance.level}
          </div>
          <small>Trên thang điểm 10</small>
        </div>

        <div style={{ 
          backgroundColor: '#e7f3ff', 
          padding: '20px', 
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <h3>Tổng Số Tín Chỉ</h3>
          <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#007bff' }}>
            {summary.totalCredits}
          </div>
          <small>Tích lũy</small>
        </div>

        <div style={{ 
          backgroundColor: '#fff3cd', 
          padding: '20px', 
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <h3>Số Học Kỳ</h3>
          <div style={{ fontSize: '2.5em', fontWeight: 'bold', color: '#ffc107' }}>
            {summary.semesterCount}
          </div>
          <small>Đã hoàn thành</small>
        </div>
      </div>

      {/* Biểu đồ */}
      {summary.chartData?.labels?.length > 0 && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '10px',
          marginBottom: '30px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3>📈 Tiến Độ Học Tập Theo Học Kỳ</h3>
          <Line data={chartData} options={chartOptions} />
        </div>
      )}

      {/* Phân tích và khuyến nghị */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '10px',
        marginBottom: '20px'
      }}>
        <h3>💡 Phân Tích Học Tập</h3>
        {summary.overallGpa >= 8.0 ? (
          <div style={{ color: '#28a745' }}>
            <strong>🎉 Xuất sắc!</strong> Bạn đang duy trì kết quả học tập rất tốt. 
            Hãy tiếp tục phát huy và thử thách bản thân với các môn học nâng cao.
          </div>
        ) : summary.overallGpa >= 7.0 ? (
          <div style={{ color: '#007bff' }}>
            <strong>👍 Tốt!</strong> Kết quả học tập của bạn ở mức khá. 
            Cố gắng cải thiện các môn điểm thấp để nâng cao GPA.
          </div>
        ) : summary.overallGpa >= 5.0 ? (
          <div style={{ color: '#ffc107' }}>
            <strong>⚠️ Cần cải thiện!</strong> Bạn cần tập trung hơn vào việc học. 
            Hãy dành thời gian ôn tập và tìm sự hỗ trợ khi cần.
          </div>
        ) : (
          <div style={{ color: '#dc3545' }}>
            <strong>🚨 Cần hành động ngay!</strong> Kết quả học tập đang ở mức báo động. 
            Hãy tìm sự hỗ trợ từ giảng viên và lập kế hoạch học tập cụ thể.
          </div>
        )}
      </div>

      {/* Thống kê chi tiết từng học kỳ */}
      <div>
        <h3>📋 Chi Tiết Theo Học Kỳ</h3>
        {summary.chartData?.labels?.length > 0 ? (
          <div style={{ display: 'grid', gap: '15px' }}>
            {summary.chartData.labels.map((label, index) => (
              <div key={index} style={{
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                backgroundColor: 'white'
              }}>
                <strong>{label}</strong>
                <div>GPA: <span style={{ color: '#007bff' }}>{summary.chartData.gpaData[index]}/10</span></div>
                <div>Số môn học: {summary.chartData.subjectCounts[index]}</div>
              </div>
            ))}
          </div>
        ) : (
          <p>Chưa có dữ liệu học kỳ để hiển thị</p>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;