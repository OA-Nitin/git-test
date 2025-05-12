import React, { useEffect, useState } from 'react';
import './DashboardModern.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  // Chart data
  const [chartType, setChartType] = useState('leads');

  const leadData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Lead Conversion',
        data: [65, 59, 80, 81, 56, 85],
        fill: true,
        backgroundColor: 'rgba(106, 17, 203, 0.1)',
        borderColor: 'rgba(106, 17, 203, 1)',
        tension: 0.4,
      },
      {
        label: 'Target',
        data: [70, 70, 75, 75, 80, 80],
        fill: false,
        borderColor: 'rgba(255, 99, 132, 1)',
        borderDash: [5, 5],
        tension: 0.4,
      }
    ],
  };

  const salesData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Sales Growth',
        data: [28, 35, 40, 42, 50, 65],
        backgroundColor: 'rgba(26, 115, 232, 0.8)',
        borderRadius: 6,
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 10,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#2c3e50',
        bodyColor: '#2c3e50',
        borderColor: '#e9ecef',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          labelPointStyle: () => ({
            pointStyle: 'circle',
            rotation: 0
          })
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: '#7f8c8d'
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#7f8c8d'
        }
      }
    }
  };

  // Dashboard statistics
  const [stats, setStats] = useState({
    totalSales: 125,
    activeLeads: 42,
    completedTasks: 78,
    pendingTasks: 15,
    recentActivity: [
      { id: 1, title: 'New sale recorded', subtitle: 'John Doe added a new sale', time: '2 hours ago', icon: 'dollar-sign', color: 'bg-purple' },
      { id: 2, title: 'Task completed', subtitle: 'Jane Smith completed a task', time: '3 hours ago', icon: 'check-circle', color: 'bg-green' },
      { id: 3, title: 'Lead converted', subtitle: 'Admin converted a lead to customer', time: '5 hours ago', icon: 'exchange-alt', color: 'bg-blue' },
      { id: 4, title: 'New task assigned', subtitle: 'Bob Johnson assigned a new task', time: '1 day ago', icon: 'tasks', color: 'bg-orange' },
    ],
    supportTickets: [
      { id: 1, title: 'Need help with invoice generation', status: 'Open', priority: 'High' },
      { id: 2, title: 'Email integration not working', status: 'In Progress', priority: 'Medium' },
    ]
  });

  useEffect(() => {
    document.title = "Dashboard - Occams Portal"; // Set title for Dashboard page
  }, []);

  return (
    <div className="main_content_iner">
      <div className="container-fluid p-0">
        <div className="dashboard-container">
          {/* Dashboard Header */}
          <div className="dashboard-header">
            <h1 className="dashboard-title">Dashboard</h1>
            <p className="dashboard-subtitle">Welcome back! Here's an overview of your business performance</p>
          </div>

          {/* Stats Grid */}
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-card-icon bg-purple">
                <i className="fas fa-dollar-sign"></i>
              </div>
              <div className="stat-card-value">{stats.totalSales}</div>
              <p className="stat-card-label">Total Sales</p>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon bg-blue">
                <i className="fas fa-user-check"></i>
              </div>
              <div className="stat-card-value">{stats.activeLeads}</div>
              <p className="stat-card-label">Active Leads</p>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon bg-green">
                <i className="fas fa-check-double"></i>
              </div>
              <div className="stat-card-value">{stats.completedTasks}</div>
              <p className="stat-card-label">Completed Tasks</p>
            </div>

            <div className="stat-card">
              <div className="stat-card-icon bg-orange">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-card-value">{stats.pendingTasks}</div>
              <p className="stat-card-label">Pending Tasks</p>
            </div>
          </div>

          <div className="row">
            {/* Chart Section */}
            <div className="col-lg-8 chart-section">
              <div className="modern-card">
                <div className="modern-card-header">
                  <h3 className="modern-card-title">Business Performance</h3>
                  <div className="chart-type-selector">
                    <button
                      className={`btn btn-sm ${chartType === 'leads' ? 'btn-primary' : 'btn-light'}`}
                      onClick={() => setChartType('leads')}
                    >
                      Lead Conversion
                    </button>
                    <button
                      className={`btn btn-sm ms-2 ${chartType === 'sales' ? 'btn-primary' : 'btn-light'}`}
                      onClick={() => setChartType('sales')}
                    >
                      Sales Growth
                    </button>
                  </div>
                </div>
                <div className="modern-card-body">
                  <div className="chart-container">
                    {chartType === 'leads' ? (
                      <Line data={leadData} options={chartOptions} />
                    ) : (
                      <Bar data={salesData} options={chartOptions} />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Support Section */}
            <div className="col-lg-4 support-section">
              <div className="modern-card">
                <div className="modern-card-header">
                  <h3 className="modern-card-title">Support Center</h3>
                </div>
                <div className="modern-card-body">
                  <div className="support-header">
                    <div className="support-header-icon">
                      <i className="fas fa-headset"></i>
                    </div>
                    <div className="support-header-content">
                      <h3>Need Help?</h3>
                      <p>Our support team is available 24/7</p>
                    </div>
                  </div>

                  <div className="support-action">
                    <a href="#" className="support-btn">
                      <i className="fas fa-comment-dots"></i>
                      Contact Support
                    </a>
                  </div>

                  <div className="ticket-list">
                    {stats.supportTickets.map(ticket => (
                      <div key={ticket.id} className="ticket-item">
                        <div className={`ticket-priority ${ticket.priority === 'High' ? 'priority-high' : 'priority-medium'}`}></div>
                        <div className="ticket-content">
                          <div className="ticket-title">{ticket.title}</div>
                          <div className="ticket-status">
                            Status:
                            <span className={`ticket-badge ${ticket.status === 'Open' ? 'badge-open' : 'badge-progress'}`}>
                              {ticket.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="row">
            <div className="col-12 activity-feed">
              <div className="modern-card">
                <div className="modern-card-header">
                  <h3 className="modern-card-title">Recent Activity</h3>
                  <button className="btn btn-sm btn-light">
                    View All
                  </button>
                </div>
                <div className="modern-card-body">
                  {stats.recentActivity.map(activity => (
                    <div key={activity.id} className="activity-item">
                      <div className={`activity-icon ${activity.color}`}>
                        <i className={`fas fa-${activity.icon}`}></i>
                      </div>
                      <div className="activity-content">
                        <h4 className="activity-title">{activity.title}</h4>
                        <p className="activity-subtitle">{activity.subtitle}</p>
                      </div>
                      <div className="activity-time">
                        {activity.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
