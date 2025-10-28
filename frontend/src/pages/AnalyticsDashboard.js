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

const AnalyticsDashboard = ({ currentUser, refreshTrigger }) => { // 🆕 THÊM refreshTrigger prop
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
  }, [currentUser, loadAnalyticsData, refreshTrigger]); // 🆕 THÊM refreshTrigger vào dependency

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
        tension: 0.3,
        fill: true,
      },
      {
        label: 'Số Môn Học',
        data: summary.chartData?.subjectCounts || [],
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        yAxisID: 'y1',
        type: 'bar',
        barPercentage: 0.6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 15,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 10,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        max: 10,
        min: 0,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        title: {
          display: true,
          text: 'GPA',
          font: {
            weight: 'bold'
          }
        },
        ticks: {
          stepSize: 1
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
          text: 'Số Môn',
          font: {
            weight: 'bold'
          }
        }
      },
    },
  };

  // Đánh giá học lực
  const getAcademicPerformance = (gpa) => {
    if (gpa >= 9.0) return { level: 'Xuất sắc', color: '#28a745', icon: '🏆', bgColor: '#d4edda' };
    if (gpa >= 8.0) return { level: 'Giỏi', color: '#007bff', icon: '⭐', bgColor: '#cce7ff' };
    if (gpa >= 7.0) return { level: 'Khá', color: '#ffc107', icon: '📈', bgColor: '#fff3cd' };
    if (gpa >= 5.0) return { level: 'Trung bình', color: '#fd7e14', icon: '📊', bgColor: '#ffe5d0' };
    return { level: 'Yếu', color: '#dc3545', icon: '📉', bgColor: '#f8d7da' };
  };

  const performance = getAcademicPerformance(summary.overallGpa);

  // Phân tích chi tiết và khuyến nghị
  const getDetailedAnalysis = (gpa) => {
    if (gpa >= 9.0) {
      return {
        title: "🎉 THÀNH TÍCH XUẤT SẮC",
        description: "Bạn đang thể hiện sự xuất sắc trong học tập!",
        details: [
          "✓ Duy trì được kết quả học tập ổn định và vượt trội",
          "✓ Có khả năng tự học và nghiên cứu tốt",
          "✓ Quản lý thời gian hiệu quả"
        ],
        recommendations: [
          "Tiếp tục phát huy và thử thách bản thân với các môn học nâng cao",
          "Tham gia các hoạt động nghiên cứu khoa học",
          "Hỗ trợ và chia sẻ kinh nghiệm với bạn bè"
        ],
        color: '#28a745'
      };
    } else if (gpa >= 8.0) {
      return {
        title: "⭐ KẾT QUẢ TỐT",
        description: "Bạn có kết quả học tập rất tốt!",
        details: [
          "✓ Nắm vững kiến thức cơ bản và nâng cao",
          "✓ Có phương pháp học tập hiệu quả",
          "✓ Tham gia tích cực vào các hoạt động học tập"
        ],
        recommendations: [
          "Tập trung vào các môn điểm còn thấp để cải thiện GPA",
          "Phát triển kỹ năng mềm và tham gia ngoại khóa",
          "Đặt mục tiêu đạt học lực xuất sắc"
        ],
        color: '#007bff'
      };
    } else if (gpa >= 7.0) {
      return {
        title: "📈 TIẾN BỘ KHÁ",
        description: "Bạn đang có kết quả học tập khá tốt!",
        details: [
          "✓ Đáp ứng được yêu cầu cơ bản của chương trình",
          "✓ Có tiềm năng phát triển thêm",
          "✓ Cần củng cố một số môn học"
        ],
        recommendations: [
          "Tăng cường thời gian ôn tập các môn quan trọng",
          "Tìm kiếm sự hỗ trợ từ giảng viên khi cần",
          "Lập kế hoạch học tập chi tiết hơn"
        ],
        color: '#ffc107'
      };
    } else if (gpa >= 5.0) {
      return {
        title: "⚠️ CẦN CẢI THIỆN",
        description: "Kết quả học tập cần được cải thiện!",
        details: [
          "✓ Đạt yêu cầu tối thiểu của chương trình",
          "✓ Cần tập trung nhiều hơn vào việc học",
          "✓ Có nguy cơ không đạt một số môn"
        ],
        recommendations: [
          "Đánh giá lại phương pháp học tập hiện tại",
          "Dành nhiều thời gian hơn cho việc ôn tập",
          "Tham khảo ý kiến từ cố vấn học tập"
        ],
        color: '#fd7e14'
      };
    } else {
      return {
        title: "🚨 CẢNH BÁO HỌC TẬP",
        description: "Cần hành động ngay để cải thiện kết quả!",
        details: [
          "✗ Kết quả học tập đang ở mức báo động",
          "✗ Nguy cơ không hoàn thành chương trình",
          "✗ Cần sự hỗ trợ khẩn cấp"
        ],
        recommendations: [
          "Gặp ngay cố vấn học tập để được tư vấn",
          "Lập kế hoạch học tập cụ thể và chi tiết",
          "Tìm sự hỗ trợ từ bạn bè và giảng viên"
        ],
        color: '#dc3545'
      };
    }
  };

  const analysis = getDetailedAnalysis(summary.overallGpa);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h2 style={{ marginBottom: '30px', color: '#333', textAlign: 'center' }}>📊 Thống Kê Học Tập</h2>

      {/* Overall Statistics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '25px', 
        marginBottom: '40px' 
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '25px', 
          borderRadius: '15px',
          textAlign: 'center',
          border: `3px solid ${performance.color}`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s ease'
        }}>
          <div style={{ fontSize: '2em', marginBottom: '10px' }}>{performance.icon}</div>
          <h3 style={{ marginBottom: '15px', color: '#555' }}>GPA Tổng thể</h3>
          <div style={{ fontSize: '3em', fontWeight: 'bold', color: performance.color, marginBottom: '10px' }}>
            {summary.overallGpa.toFixed(2)}
          </div>
          <div style={{ 
            color: performance.color, 
            fontWeight: 'bold', 
            fontSize: '1.1em',
            padding: '5px 15px',
            backgroundColor: `${performance.color}15`,
            borderRadius: '20px',
            display: 'inline-block'
          }}>
            {performance.level}
          </div>
          <div style={{ marginTop: '10px', color: '#666', fontSize: '0.9em' }}>Trên thang điểm 10</div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '25px', 
          borderRadius: '15px',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '3px solid #007bff'
        }}>
          <div style={{ fontSize: '2em', marginBottom: '10px' }}>📚</div>
          <h3 style={{ marginBottom: '15px', color: '#555' }}>Tổng Số Tín Chỉ</h3>
          <div style={{ fontSize: '3em', fontWeight: 'bold', color: '#007bff', marginBottom: '15px' }}>
            {summary.totalCredits}
          </div>
          <div style={{ color: '#666', fontSize: '0.9em' }}>Tín chỉ tích lũy</div>
        </div>

        <div style={{ 
          backgroundColor: 'white', 
          padding: '25px', 
          borderRadius: '15px',
          textAlign: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          border: '3px solid #ffc107'
        }}>
          <div style={{ fontSize: '2em', marginBottom: '10px' }}>🎓</div>
          <h3 style={{ marginBottom: '15px', color: '#555' }}>Số Học Kỳ</h3>
          <div style={{ fontSize: '3em', fontWeight: 'bold', color: '#ffc107', marginBottom: '15px' }}>
            {summary.semesterCount}
          </div>
          <div style={{ color: '#666', fontSize: '0.9em' }}>Học kỳ đã hoàn thành</div>
        </div>
      </div>

      {/* Biểu đồ */}
      {summary.chartData?.labels?.length > 0 && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '15px',
          marginBottom: '30px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginBottom: '25px', textAlign: 'center', color: '#333' }}>📈 Tiến Độ Học Tập Theo Học Kỳ</h3>
          <div style={{ height: '400px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Phân tích và khuyến nghị - THIẾT KẾ LẠI */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '30px', 
        borderRadius: '15px',
        marginBottom: '30px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        borderLeft: `6px solid ${analysis.color}`
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '20px',
          paddingBottom: '15px',
          borderBottom: `2px solid ${analysis.color}20`
        }}>
          <div style={{
            backgroundColor: analysis.color,
            color: 'white',
            padding: '12px',
            borderRadius: '10px',
            marginRight: '15px',
            fontSize: '1.5em'
          }}>
            💡
          </div>
          <div>
            <h3 style={{ 
              margin: 0, 
              color: analysis.color,
              fontSize: '1.4em'
            }}>
              {analysis.title}
            </h3>
            <p style={{ 
              margin: '5px 0 0 0', 
              color: '#666',
              fontSize: '1em'
            }}>
              {analysis.description}
            </p>
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '25px',
          marginBottom: '25px'
        }}>
          {/* Đánh giá chi tiết */}
          <div style={{
            backgroundColor: `${analysis.color}08`,
            padding: '20px',
            borderRadius: '12px',
            border: `1px solid ${analysis.color}20`
          }}>
            <h4 style={{ 
              color: analysis.color, 
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📋 ĐÁNH GIÁ CHI TIẾT
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {analysis.details.map((detail, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '8px',
                  backgroundColor: 'white',
                  borderRadius: '6px'
                }}>
                  <span style={{ 
                    color: detail.startsWith('✓') ? '#28a745' : '#dc3545',
                    fontWeight: 'bold'
                  }}>
                    {detail.startsWith('✓') ? '✓' : '✗'}
                  </span>
                  <span style={{ 
                    color: '#333',
                    lineHeight: '1.4'
                  }}>
                    {detail.substring(1)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Khuyến nghị */}
          <div style={{
            backgroundColor: `${analysis.color}08`,
            padding: '20px',
            borderRadius: '12px',
            border: `1px solid ${analysis.color}20`
          }}>
            <h4 style={{ 
              color: analysis.color, 
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              🎯 KHUYẾN NGHỊ HÀNH ĐỘNG
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {analysis.recommendations.map((recommendation, index) => (
                <div key={index} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '12px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  borderLeft: `3px solid ${analysis.color}`
                }}>
                  <div style={{
                    backgroundColor: analysis.color,
                    color: 'white',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    flexShrink: 0
                  }}>
                    {index + 1}
                  </div>
                  <span style={{ 
                    color: '#333',
                    lineHeight: '1.5'
                  }}>
                    {recommendation}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Thông tin bổ sung */}
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '15px 20px',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            color: '#6c757d',
            fontSize: '0.9em'
          }}>
            <span>💪</span>
            <span>
              <strong>Lời khuyên:</strong> Duy trì thói quen học tập đều đặn và đừng ngần ngại tìm kiếm sự hỗ trợ khi cần thiết.
            </span>
          </div>
        </div>
      </div>

      {/* Thống kê chi tiết từng học kỳ - THIẾT KẾ LẠI */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '30px', 
        borderRadius: '15px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '25px',
          paddingBottom: '15px',
          borderBottom: '2px solid #f0f0f0'
        }}>
          <div style={{
            backgroundColor: '#6f42c1',
            color: 'white',
            padding: '10px 15px',
            borderRadius: '8px',
            marginRight: '15px',
            fontSize: '1.2em'
          }}>
            📋
          </div>
          <h3 style={{ 
            margin: 0, 
            color: '#333',
            fontSize: '1.4em'
          }}>
            Chi Tiết Theo Học Kỳ
          </h3>
        </div>

        {summary.chartData?.labels?.length > 0 ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '20px' 
          }}>
            {summary.chartData.labels.map((label, index) => {
              const semesterGPA = summary.chartData.gpaData[index];
              const semesterPerformance = getAcademicPerformance(semesterGPA);
              const subjectCount = summary.chartData.subjectCounts[index];
              
              return (
                <div key={index} style={{
                  backgroundColor: 'white',
                  padding: '25px',
                  borderRadius: '12px',
                  border: `2px solid ${semesterPerformance.color}30`,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Header với ribbon effect */}
                  <div style={{
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    backgroundColor: semesterPerformance.color,
                    color: 'white',
                    padding: '5px 15px',
                    borderRadius: '0 0 0 8px',
                    fontSize: '0.8em',
                    fontWeight: 'bold'
                  }}>
                    {semesterPerformance.icon} {semesterPerformance.level}
                  </div>

                  {/* Tên học kỳ */}
                  <h4 style={{ 
                    margin: '0 0 15px 0',
                    color: '#333',
                    fontSize: '1.2em',
                    fontWeight: '600',
                    paddingRight: '80px'
                  }}>
                    {label}
                  </h4>

                  {/* Thông tin chính */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '15px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      textAlign: 'center',
                      padding: '15px',
                      backgroundColor: `${semesterPerformance.color}10`,
                      borderRadius: '8px',
                      border: `1px solid ${semesterPerformance.color}20`
                    }}>
                      <div style={{ 
                        fontSize: '0.9em', 
                        color: '#666',
                        marginBottom: '5px'
                      }}>
                        Điểm GPA
                      </div>
                      <div style={{ 
                        fontSize: '1.8em', 
                        fontWeight: 'bold',
                        color: semesterPerformance.color
                      }}>
                        {semesterGPA}
                      </div>
                      <div style={{ 
                        fontSize: '0.8em', 
                        color: '#999'
                      }}>
                        /10
                      </div>
                    </div>

                    <div style={{
                      textAlign: 'center',
                      padding: '15px',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{ 
                        fontSize: '0.9em', 
                        color: '#666',
                        marginBottom: '5px'
                      }}>
                        Số Môn
                      </div>
                      <div style={{ 
                        fontSize: '1.8em', 
                        fontWeight: 'bold',
                        color: '#007bff'
                      }}>
                        {subjectCount}
                      </div>
                      <div style={{ 
                        fontSize: '0.8em', 
                        color: '#999'
                      }}>
                        môn học
                      </div>
                    </div>
                  </div>

                  {/* Progress bar đánh giá */}
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '5px',
                      fontSize: '0.8em',
                      color: '#666'
                    }}>
                      <span>Mức độ hoàn thành</span>
                      <span>{Math.min(100, (semesterGPA / 10) * 100).toFixed(0)}%</span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '6px',
                      backgroundColor: '#e9ecef',
                      borderRadius: '3px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${Math.min(100, (semesterGPA / 10) * 100)}%`,
                        height: '100%',
                        backgroundColor: semesterPerformance.color,
                        borderRadius: '3px',
                        transition: 'width 0.5s ease'
                      }}></div>
                    </div>
                  </div>

                  {/* Đánh giá nhanh */}
                  <div style={{
                    padding: '12px',
                    backgroundColor: `${semesterPerformance.color}08`,
                    borderRadius: '8px',
                    border: `1px solid ${semesterPerformance.color}20`
                  }}>
                    <div style={{ 
                      fontSize: '0.85em',
                      color: semesterPerformance.color,
                      textAlign: 'center',
                      fontWeight: '500'
                    }}>
                      {semesterGPA >= 8.0 ? '🎯 Mục tiêu hoàn thành xuất sắc' :
                       semesterGPA >= 7.0 ? '📈 Tiến bộ ổn định' :
                       semesterGPA >= 5.0 ? '🔄 Cần cải thiện' :
                       '⚠️ Cần tập trung cao độ'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ 
            textAlign: 'center', 
            padding: '50px', 
            color: '#666',
            backgroundColor: '#f8f9fa',
            borderRadius: '10px'
          }}>
            <div style={{ fontSize: '3em', marginBottom: '15px' }}>📊</div>
            <p style={{ fontSize: '1.1em', marginBottom: '10px' }}>Chưa có dữ liệu học kỳ để hiển thị</p>
            <p style={{ color: '#999', fontSize: '0.9em' }}>
              Hãy thêm học kỳ và nhập điểm để xem thống kê chi tiết
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;