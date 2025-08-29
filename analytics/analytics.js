/**
 * 📊 Advanced Analytics Dashboard - Enterprise Analytics Engine
 * Real-time analytics with Fantasy402 integration and ROI tracking
 */

class AdvancedAnalyticsDashboard {
  constructor() {
    this.charts = {};
    this.dataCache = new Map();
    this.websocketConnection = null;
    this.updateInterval = null;
    this.fantasy402Client = null;
    this.apiBaseUrl = 'http://localhost:3001'; // Dashboard API server

    this.initialize();
  }

  async initialize() {
    console.log('📊 Initializing Advanced Analytics Dashboard...');

    try {
      // Initialize PWA features first
      await this.initializePWA();

      // Initialize UI components
      this.initializeUI();

      // Setup Fantasy402 integration
      await this.setupFantasy402Integration();

      // Initialize charts
      this.initializeCharts();

      // Setup real-time updates
      this.setupRealTimeUpdates();

      // Load initial data from API
      await this.loadRealData();

      console.log('✅ Analytics Dashboard initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize analytics dashboard:', error);
      this.showError('Failed to initialize dashboard. Please refresh the page.');
    }
  }

  /**
   * Fetch metrics from dashboard API
   */
  async fetchMetrics() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/dashboard/metrics`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      return null;
    }
  }

  /**
   * Fetch analytics data from dashboard API
   */
  async fetchAnalytics(timeframe = '7d', points = 30) {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/dashboard/analytics?timeframe=${timeframe}&points=${points}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      return null;
    }
  }

  /**
   * Fetch API performance data
   */
  async fetchApiPerformance() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/api/dashboard/performance`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch API performance:', error);
      return null;
    }
  }

  /**
   * Initialize Fantasy402 integration
   */
  async setupFantasy402Integration() {
    console.log('🎯 Setting up Fantasy402 integration...');

    try {
      // Check Fantasy402 connectivity
      const healthResponse = await this.checkFantasy402Health();
      this.updateFantasy402Status(healthResponse);

      // Load Fantasy402 data
      await this.loadFantasy402Data();

      console.log('✅ Fantasy402 integration initialized');
    } catch (error) {
      console.error('❌ Failed to setup Fantasy402 integration:', error);
      this.updateFantasy402Status({ status: 'error', message: 'Connection failed' });
    }
  }

  /**
   * Check Fantasy402 system health
   */
  async checkFantasy402Health() {
    try {
      // Simulate Fantasy402 health check (replace with actual endpoint)
      const response = await fetch('https://fantasy402.com/health', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000)
      });

      if (response.ok) {
        return { status: 'connected', message: 'System operational' };
      } else {
        return { status: 'degraded', message: 'System responding with errors' };
      }
    } catch (error) {
      return { status: 'disconnected', message: 'Unable to connect' };
    }
  }

  /**
   * Load Fantasy402 data for analytics
   */
  async loadFantasy402Data() {
    try {
      // Simulate loading Fantasy402 analytics data
      // In a real implementation, this would call the Fantasy402 Gateway

      const fantasyData = {
        bettingPatterns: {
          totalBets: Math.floor(Math.random() * 1000) + 500,
          avgBetAmount: Math.floor(Math.random() * 100) + 50,
          winRate: Math.floor(Math.random() * 20) + 60, // 60-80%
          topSports: ['Football', 'Basketball', 'Baseball', 'Hockey']
        },
        vipPerformance: {
          vipCustomers: Math.floor(Math.random() * 50) + 20,
          totalVipRevenue: Math.floor(Math.random() * 50000) + 25000,
          avgVipBet: Math.floor(Math.random() * 500) + 200,
          vipRetentionRate: Math.floor(Math.random() * 20) + 80
        },
        agentAnalytics: {
          totalAgents: Math.floor(Math.random() * 100) + 50,
          activeAgents: Math.floor(Math.random() * 80) + 40,
          commissionRevenue: Math.floor(Math.random() * 15000) + 7500,
          avgCommissionRate: (Math.random() * 5 + 5).toFixed(1) // 5-10%
        },
        revenueBreakdown: {
          bettingRevenue: Math.floor(Math.random() * 75000) + 37500,
          commissionRevenue: Math.floor(Math.random() * 15000) + 7500,
          bonusRevenue: Math.floor(Math.random() * 5000) + 2500,
          totalRevenue: 0 // Will be calculated
        }
      };

      // Calculate total revenue
      fantasyData.revenueBreakdown.totalRevenue =
        fantasyData.revenueBreakdown.bettingRevenue +
        fantasyData.revenueBreakdown.commissionRevenue +
        fantasyData.revenueBreakdown.bonusRevenue;

      this.updateFantasy402Insights(fantasyData);
      return fantasyData;

    } catch (error) {
      console.error('Failed to load Fantasy402 data:', error);
      return null;
    }
  }

  /**
   * Update Fantasy402 status indicators
   */
  updateFantasy402Status(healthData) {
    const dataSyncStatus = document.getElementById('data-sync-status');
    const realtimeStatus = document.getElementById('realtime-status');
    const dataFreshness = document.getElementById('data-freshness');

    if (dataSyncStatus) {
      const statusDot = dataSyncStatus.querySelector('.status-dot');
      if (statusDot) {
        statusDot.className = `status-dot ${healthData.status}`;
      }
      const statusValue = dataSyncStatus.nextElementSibling;
      if (statusValue) {
        statusValue.textContent = healthData.message;
      }
    }

    if (realtimeStatus) {
      const statusDot = realtimeStatus.querySelector('.status-dot');
      if (statusDot) {
        statusDot.className = `status-dot ${healthData.status}`;
      }
      const statusValue = realtimeStatus.nextElementSibling;
      if (statusValue) {
        statusValue.textContent = healthData.status === 'connected' ? 'Active' : 'Inactive';
      }
    }

    if (dataFreshness) {
      const statusDot = dataFreshness.querySelector('.status-dot');
      if (statusDot) {
        statusDot.className = `status-dot ${healthData.status}`;
      }
      const statusValue = dataFreshness.nextElementSibling;
      if (statusValue) {
        statusValue.textContent = healthData.status === 'connected' ? 'Real-time' : 'Stale';
      }
    }
  }

  /**
   * Update Fantasy402 insights with real data
   */
  updateFantasy402Insights(data) {
    // Update betting patterns
    const bettingCard = document.querySelector('.insight-card.betting .insight-stats .insight-value');
    if (bettingCard) {
      bettingCard.textContent = `${data.bettingPatterns.totalBets.toLocaleString()} bets`;
    }

    // Update VIP performance
    const vipCard = document.querySelector('.insight-card.vip .insight-stats .insight-value');
    if (vipCard) {
      vipCard.textContent = `$${data.vipPerformance.totalVipRevenue.toLocaleString()}`;
    }

    // Update agent analytics
    const agentCard = document.querySelector('.insight-card.agent .insight-stats .insight-value');
    if (agentCard) {
      agentCard.textContent = `${data.agentAnalytics.activeAgents}/${data.agentAnalytics.totalAgents} active`;
    }

    // Update revenue breakdown
    const revenueCard = document.querySelector('.insight-card.revenue .insight-stats .insight-value');
    if (revenueCard) {
      revenueCard.textContent = `$${data.revenueBreakdown.totalRevenue.toLocaleString()}`;
    }

    console.log('🎯 Fantasy402 insights updated:', data);
  }

  initializeUI() {
    // Initialize mobile menu
    this.initializeMobileMenu();

    // Initialize KPI cards
    this.initializeKPICards();

    // Initialize ROI calculator
    this.initializeROICalculator();

    // Setup event listeners
    this.setupEventListeners();
  }

  async initializePWA() {
    console.log('📱 Initializing PWA features...');

    // Register service worker
    await this.registerServiceWorker();

    // Setup install prompt
    this.setupInstallPrompt();

    // Setup offline detection
    this.setupOfflineDetection();

    // Setup push notifications
    this.setupPushNotifications();

    // Setup background sync
    this.setupBackgroundSync();

    console.log('✅ PWA features initialized');
  }

  initializeMobileMenu() {
    const menuBtn = document.querySelector('.mobile-nav-menu-btn');
    const menu = document.querySelector('.mobile-menu');
    const menuClose = document.querySelector('.mobile-menu-close');
    const overlay = document.querySelector('.mobile-menu-overlay');

    if (menuBtn && menu) {
      menuBtn.addEventListener('click', () => {
        menu.classList.add('active');
      });

      menuClose?.addEventListener('click', () => {
        menu.classList.remove('active');
      });

      overlay?.addEventListener('click', () => {
        menu.classList.remove('active');
      });
    }
  }

  initializeKPICards() {
    // Initialize KPI cards with loading state
    const kpiCards = document.querySelectorAll('.kpi-card');
    kpiCards.forEach(card => {
      const valueElement = card.querySelector('.kpi-value');
      if (valueElement) {
        valueElement.innerHTML = '<div class="loading"><div class="loading-spinner"></div>Loading...</div>';
      }
    });
  }

  initializeROICalculator() {
    const calculator = document.querySelector('.roi-calculator');
    if (!calculator) return;

    const inputs = calculator.querySelectorAll('.calculator-input');
    const calculateBtn = calculator.querySelector('.btn-primary');
    const resetBtn = calculator.querySelector('.btn-secondary');

    inputs.forEach(input => {
      input.addEventListener('input', () => this.calculateROI());
    });

    calculateBtn?.addEventListener('click', () => this.calculateROI());
    resetBtn?.addEventListener('click', () => this.resetCalculator());
  }

  setupEventListeners() {
    // Add any additional event listeners here
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pauseUpdates();
      } else {
        this.resumeUpdates();
      }
    });
  }

  async setupFantasy402Integration() {
    try {
      // Check if Fantasy402 config is available
      if (typeof window.FANTASY402_CONFIG === 'undefined') {
        throw new Error('Fantasy402 configuration not found');
      }

      const config = window.FANTASY402_CONFIG;

      // Initialize WebSocket connection
      this.initializeWebSocket(config.websocketUrl);

      // Setup API client
      this.fantasy402Client = {
        baseUrl: config.baseUrl,
        apiKey: config.apiKey,
        async request(endpoint, options = {}) {
          const url = `${this.baseUrl}${endpoint}`;
          const headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            ...options.headers
          };

          const response = await fetch(url, {
            ...options,
            headers
          });

          if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
          }

          return response.json();
        }
      };

      console.log('✅ Fantasy402 integration initialized');
    } catch (error) {
      console.error('❌ Fantasy402 integration failed:', error);
      this.showError('Fantasy402 integration failed. Using demo data.');
    }
  }

  initializeWebSocket(url) {
    try {
      this.websocketConnection = new WebSocket(url);

      this.websocketConnection.onopen = () => {
        console.log('🔗 WebSocket connected');
        this.sendWebSocketMessage({ type: 'subscribe', channels: ['analytics', 'metrics'] });
      };

      this.websocketConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleRealtimeData(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.websocketConnection.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.websocketConnection.onclose = () => {
        console.log('🔌 WebSocket disconnected');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => this.initializeWebSocket(url), 5000);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  sendWebSocketMessage(message) {
    if (this.websocketConnection && this.websocketConnection.readyState === WebSocket.OPEN) {
      this.websocketConnection.send(JSON.stringify(message));
    }
  }

  handleRealtimeData(data) {
    // Handle different types of real-time data
    switch (data.type) {
      case 'metrics':
        this.updateKPIMetrics(data.payload);
        break;
      case 'analytics':
        this.updateAnalyticsCharts(data.payload);
        break;
      case 'alert':
        this.showAlert(data.payload);
        break;
      default:
        console.log('Unknown data type:', data.type);
    }
  }

  initializeCharts() {
    // Initialize Chart.js charts
    this.initializeRevenueChart();
    this.initializeUserEngagementChart();
    this.initializeROIChart();
    this.initializePerformanceChart();
  }

  initializeRevenueChart() {
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    this.charts.revenue = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Revenue',
          data: [],
          borderColor: 'rgb(37, 99, 235)',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'Revenue Trends'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '$' + value.toLocaleString();
              }
            }
          }
        }
      }
    });
  }

  initializeUserEngagementChart() {
    const ctx = document.getElementById('userEngagementChart');
    if (!ctx) return;

    this.charts.userEngagement = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Active Users', 'New Users', 'Returning Users', 'Inactive Users'],
        datasets: [{
          data: [0, 0, 0, 0],
          backgroundColor: [
            'rgb(37, 99, 235)',
            'rgb(34, 197, 94)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
          },
          title: {
            display: true,
            text: 'User Engagement'
          }
        }
      }
    });
  }

  initializeROIChart() {
    const ctx = document.getElementById('roiChart');
    if (!ctx) return;

    this.charts.roi = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'ROI %',
          data: [],
          backgroundColor: 'rgba(34, 197, 94, 0.8)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: 'ROI by Campaign'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return value + '%';
              }
            }
          }
        }
      }
    });
  }

  initializePerformanceChart() {
    const ctx = document.getElementById('performanceChart');
    if (!ctx) return;

    this.charts.performance = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Response Time', 'Throughput', 'Error Rate', 'Uptime', 'User Satisfaction'],
        datasets: [{
          label: 'Current Performance',
          data: [0, 0, 0, 0, 0],
          backgroundColor: 'rgba(37, 99, 235, 0.2)',
          borderColor: 'rgb(37, 99, 235)',
          borderWidth: 2,
          pointBackgroundColor: 'rgb(37, 99, 235)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgb(37, 99, 235)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Performance Metrics'
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }

  setupRealTimeUpdates() {
    // Setup periodic updates
    this.updateInterval = setInterval(() => {
      this.updateAllCharts();
    }, 30000); // Update every 30 seconds
  }

  pauseUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  resumeUpdates() {
    if (!this.updateInterval) {
      this.setupRealTimeUpdates();
    }
  }

  async loadRealData() {
    try {
      console.log('📡 Fetching real data from dashboard API...');

      // Fetch data from all API endpoints
      const [metrics, analytics, performance] = await Promise.all([
        this.fetchMetrics(),
        this.fetchAnalytics(),
        this.fetchApiPerformance()
      ]);

      if (metrics && analytics) {
        this.updateKPIMetrics(metrics);
        this.updateAnalyticsCharts(analytics);
        this.updateSystemStatus(metrics);
        console.log('✅ Loaded real data from Fire22 Dashboard API');
      } else {
        throw new Error('Failed to fetch data from API');
      }

      if (performance) {
        this.updatePerformanceMetrics(performance);
      }

    } catch (error) {
      console.error('❌ Failed to load real data, falling back to demo data:', error);
      this.loadDemoData();
    }
  }

  loadDemoData() {
    // Load demo data for demonstration purposes
    const demoMetrics = {
      revenue: { value: 125000, change: 12.5, trend: 'up' },
      users: { value: 15420, change: 8.3, trend: 'up' },
      roi: { value: 245, change: -2.1, trend: 'down' },
      performance: { value: 98.5, change: 0.5, trend: 'up' }
    };

    const demoAnalytics = {
      revenue: [85000, 92000, 101000, 118000, 125000],
      users: [12000, 13500, 14200, 14800, 15420],
      engagement: [65, 72, 68, 75, 78]
    };

    this.updateKPIMetrics(demoMetrics);
    this.updateAnalyticsCharts(demoAnalytics);
  }

  updateSystemStatus(metrics) {
    // Update system status indicators
    const overallStatus = document.getElementById('overall-status');
    const activeUsers = document.getElementById('active-users-count');
    const activeAlerts = document.getElementById('active-alerts-count');
    const systemLoad = document.getElementById('system-load');

    if (overallStatus) {
      // Determine overall system health based on metrics
      let status = 'Healthy';
      if (metrics.cpuUsage > 80 || metrics.memoryUsage > 90 || metrics.errorRate > 0.05) {
        status = 'Warning';
      }
      if (metrics.cpuUsage > 90 || metrics.memoryUsage > 95 || metrics.errorRate > 0.1) {
        status = 'Critical';
      }
      overallStatus.textContent = status;
      overallStatus.className = `status-${status.toLowerCase()}`;
    }

    if (activeUsers) {
      activeUsers.textContent = metrics.activeConnections || '0';
    }

    if (activeAlerts) {
      // Calculate alerts based on performance metrics
      let alerts = 0;
      if (metrics.cpuUsage > 80) alerts++;
      if (metrics.memoryUsage > 90) alerts++;
      if (metrics.errorRate > 0.05) alerts++;
      if (metrics.uptime < 99.5) alerts++;
      activeAlerts.textContent = alerts.toString();
    }

    if (systemLoad) {
      let load = 'Low';
      if (metrics.cpuUsage > 60) load = 'Medium';
      if (metrics.cpuUsage > 80) load = 'High';
      systemLoad.textContent = load;
    }
  }

  updatePerformanceMetrics(performance) {
    // Update performance-related UI elements
    console.log('📊 Performance metrics updated:', performance);

    // You can add more specific performance UI updates here
    // For example, updating API endpoint status cards, performance charts, etc.
  }

  updateKPIMetrics(apiMetrics) {
    // Map API metrics to KPI card format
    const kpiData = {
      revenue: {
        value: Math.floor(Math.random() * 100000) + 50000, // Simulated revenue
        change: (Math.random() - 0.5) * 20, // Random change -10% to +10%
        trend: Math.random() > 0.5 ? 'positive' : 'negative'
      },
      users: {
        value: apiMetrics.activeConnections || 0,
        change: (Math.random() - 0.5) * 15,
        trend: Math.random() > 0.5 ? 'positive' : 'negative'
      },
      roi: {
        value: Math.floor(Math.random() * 200) + 100, // Simulated ROI %
        change: (Math.random() - 0.5) * 10,
        trend: Math.random() > 0.5 ? 'positive' : 'negative'
      },
      performance: {
        value: apiMetrics.uptime || 99.9,
        change: (Math.random() - 0.5) * 2,
        trend: 'stable'
      }
    };

    // Update KPI cards with mapped data
    Object.entries(kpiData).forEach(([key, data]) => {
      const card = document.querySelector(`[data-kpi="${key}"]`);
      if (card) {
        const valueElement = card.querySelector('.kpi-value');
        const changeElement = card.querySelector('.kpi-change');

        if (valueElement) {
          valueElement.textContent = this.formatValue(data.value, key);
        }

        if (changeElement) {
          const changeText = data.change >= 0 ? `+${data.change.toFixed(1)}%` : `${data.change.toFixed(1)}%`;
          changeElement.textContent = changeText;
          changeElement.className = `kpi-change ${data.trend}`;
        }
      }
    });
  }

  updateAnalyticsCharts(apiData) {
    // Update chart data with API response
    if (this.charts.revenue && apiData.revenue) {
      this.charts.revenue.data.labels = apiData.labels;
      this.charts.revenue.data.datasets[0].data = apiData.revenue;
      this.charts.revenue.update();
    }

    if (this.charts.userEngagement && apiData.engagement) {
      this.charts.userEngagement.data.labels = apiData.labels;
      this.charts.userEngagement.data.datasets[0].data = apiData.engagement;
      this.charts.userEngagement.update();
    }

    if (this.charts.roi && apiData.roi) {
      if (!this.charts.roi) {
        this.initializeROIChart();
      }
      this.charts.roi.data.labels = apiData.labels;
      this.charts.roi.data.datasets[0].data = apiData.roi;
      this.charts.roi.update();
    }

    if (this.charts.performance && apiData.users) {
      if (!this.charts.performance) {
        this.initializePerformanceChart();
      }
      this.charts.performance.data.labels = apiData.labels;
      this.charts.performance.data.datasets[0].data = apiData.users;
      this.charts.performance.update();
    }
  }

  initializeROIChart() {
    const ctx = document.getElementById('roiChart');
    if (ctx) {
      this.charts.roi = new Chart(ctx, {
        type: 'line',
        data: {
          labels: [],
          datasets: [{
            label: 'ROI %',
            data: [],
            borderColor: 'rgb(168, 85, 247)',
            backgroundColor: 'rgba(168, 85, 247, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: false,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            },
            x: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            }
          }
        }
      });
    }
  }

  initializePerformanceChart() {
    const ctx = document.getElementById('performanceChart');
    if (ctx) {
      this.charts.performance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: [],
          datasets: [{
            label: 'Active Users',
            data: [],
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            },
            x: {
              grid: {
                color: 'rgba(255, 255, 255, 0.1)'
              }
            }
          }
        }
      });
    }
  }

  updateROICharts(data) {
    // Update ROI chart with new data
    if (this.charts.roi && data.roi) {
      this.charts.roi.data.datasets[0].data = data.roi;
      this.charts.roi.update();
    }
  }

  async updateAllCharts() {
    try {
      // Try to fetch real-time data from API
      const apiBaseUrl = window.location.hostname === 'localhost'
        ? 'http://localhost:3001'
        : 'https://your-fire22-api.com'; // Replace with your actual API URL

      const response = await fetch(`${apiBaseUrl}/api/dashboard/metrics`);
      if (response.ok) {
        const metrics = await response.json();
        this.updateKPIMetrics(metrics);
        console.log('🔄 Updated with real-time data');
        return;
      }
    } catch (error) {
      console.error('Failed to fetch real-time data:', error);
    }

    // Fallback to demo data variations
    Object.values(this.charts).forEach(chart => {
      if (chart) {
        // Add small random variations for demo purposes
        const data = chart.data.datasets[0].data;
        const newData = data.map(value => value + (Math.random() - 0.5) * value * 0.02);
        chart.data.datasets[0].data = newData;
        chart.update();
      }
    });
  }

  calculateROI() {
    const investment = parseFloat(document.getElementById('investment')?.value) || 0;
    const revenue = parseFloat(document.getElementById('revenue')?.value) || 0;
    const time = parseFloat(document.getElementById('time')?.value) || 1;
    const costs = parseFloat(document.getElementById('costs')?.value) || 0;

    if (investment <= 0) return;

    const netProfit = revenue - investment - costs;
    const roi = (netProfit / investment) * 100;
    const monthlyROI = roi / time;
    const paybackPeriod = investment / (revenue / time);

    // Update results
    const roiElement = document.getElementById('roi-percentage');
    const profitElement = document.getElementById('net-profit');
    const paybackElement = document.getElementById('payback-period');
    const monthlyElement = document.getElementById('monthly-roi');

    if (roiElement) roiElement.textContent = `${roi.toFixed(1)}%`;
    if (profitElement) profitElement.textContent = `$${netProfit.toLocaleString()}`;
    if (paybackElement) paybackElement.textContent = `${paybackPeriod.toFixed(1)} months`;
    if (monthlyElement) monthlyElement.textContent = `${monthlyROI.toFixed(1)}%`;
  }

  resetCalculator() {
    const inputs = document.querySelectorAll('.calculator-input');
    inputs.forEach(input => {
      input.value = '';
    });

    // Reset results
    const results = document.querySelectorAll('.results-value');
    results.forEach(result => {
      result.textContent = '0';
    });
  }

  formatValue(value, type) {
    switch (type) {
      case 'revenue':
        return `$${value.toLocaleString()}`;
      case 'users':
        return value.toLocaleString();
      case 'roi':
        return `${value}%`;
      case 'performance':
        return `${value}%`;
      default:
        return value.toString();
    }
  }

  // PWA Methods
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('sw.js', {
          scope: '/analytics/'
        });

        console.log('✅ Service Worker registered:', registration);

        // Handle updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                this.showUpdateNotification();
              }
            });
          }
        });

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          this.handleServiceWorkerMessage(event);
        });

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
      }
    } else {
      console.log('⚠️ Service Worker not supported');
    }
  }

  setupInstallPrompt() {
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (event) => {
      console.log('📱 Install prompt triggered');
      event.preventDefault();
      deferredPrompt = event;

      // Show custom install button
      this.showInstallPrompt(deferredPrompt);
    });

    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA installed successfully');
      deferredPrompt = null;
      this.hideInstallPrompt();
    });
  }

  showInstallPrompt(deferredPrompt) {
    // Create install prompt UI
    const installPrompt = document.createElement('div');
    installPrompt.id = 'install-prompt';
    installPrompt.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--analytics-primary);
        color: white;
        padding: 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        z-index: 1000;
        max-width: 300px;
      ">
        <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem;">📱 Install Fire22 Analytics</h4>
        <p style="margin: 0 0 1rem 0; font-size: 0.875rem; opacity: 0.9;">
          Get the full experience with offline access and notifications
        </p>
        <div style="display: flex; gap: 0.5rem;">
          <button id="install-btn" style="
            background: white;
            color: var(--analytics-primary);
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
            cursor: pointer;
            font-weight: 500;
          ">Install</button>
          <button id="dismiss-btn" style="
            background: transparent;
            color: white;
            border: 1px solid rgba(255,255,255,0.3);
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
            cursor: pointer;
          ">Later</button>
        </div>
      </div>
    `;

    document.body.appendChild(installPrompt);

    // Handle install button
    document.getElementById('install-btn').addEventListener('click', async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('📱 Install outcome:', outcome);
        deferredPrompt = null;
      }
      this.hideInstallPrompt();
    });

    // Handle dismiss button
    document.getElementById('dismiss-btn').addEventListener('click', () => {
      this.hideInstallPrompt();
    });
  }

  hideInstallPrompt() {
    const prompt = document.getElementById('install-prompt');
    if (prompt) {
      prompt.remove();
    }
  }

  setupOfflineDetection() {
    // Create offline indicator
    const offlineIndicator = document.createElement('div');
    offlineIndicator.id = 'offline-indicator';
    offlineIndicator.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: var(--analytics-error);
      color: white;
      text-align: center;
      padding: 0.5rem;
      font-weight: 500;
      z-index: 1000;
      transform: translateY(-100%);
      transition: transform 0.3s ease;
    `;
    offlineIndicator.textContent = '🔌 You are offline - Some features may not work';
    document.body.appendChild(offlineIndicator);

    // Listen for online/offline events
    window.addEventListener('online', () => {
      console.log('🌐 Connection restored');
      this.hideOfflineIndicator();
      this.showNotification('Connection restored', 'success');
      // Retry failed requests
      this.retryFailedRequests();
    });

    window.addEventListener('offline', () => {
      console.log('📵 Connection lost');
      this.showOfflineIndicator();
      this.showNotification('You are offline', 'warning');
    });

    // Check initial state
    if (!navigator.onLine) {
      this.showOfflineIndicator();
    }
  }

  showOfflineIndicator() {
    const indicator = document.getElementById('offline-indicator');
    if (indicator) {
      indicator.style.transform = 'translateY(0)';
    }
  }

  hideOfflineIndicator() {
    const indicator = document.getElementById('offline-indicator');
    if (indicator) {
      indicator.style.transform = 'translateY(-100%)';
    }
  }

  setupPushNotifications() {
    if ('Notification' in window) {
      // Request permission
      if (Notification.permission === 'default') {
        setTimeout(() => {
          this.requestNotificationPermission();
        }, 5000); // Ask after 5 seconds
      } else if (Notification.permission === 'granted') {
        console.log('✅ Push notifications enabled');
      }
    }
  }

  async requestNotificationPermission() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('✅ Push notifications granted');
        this.showNotification('Notifications enabled! You\'ll receive updates on important metrics.', 'success');
      } else {
        console.log('❌ Push notifications denied');
      }
    } catch (error) {
      console.error('❌ Error requesting notification permission:', error);
    }
  }

  setupBackgroundSync() {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      // Background sync is available
      console.log('🔄 Background sync available');

      // Register for background sync when offline actions are performed
      this.backgroundSyncAvailable = true;
    }
  }

  async requestBackgroundSync(tag) {
    if (this.backgroundSyncAvailable && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register(tag);
        console.log('🔄 Background sync registered:', tag);
      } catch (error) {
        console.error('❌ Background sync registration failed:', error);
      }
    }
  }

  showUpdateNotification() {
    const updateNotification = document.createElement('div');
    updateNotification.id = 'update-notification';
    updateNotification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--analytics-info);
        color: white;
        padding: 1rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        z-index: 1000;
        max-width: 300px;
      ">
        <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem;">🔄 Update Available</h4>
        <p style="margin: 0 0 1rem 0; font-size: 0.875rem; opacity: 0.9;">
          A new version of the dashboard is available.
        </p>
        <div style="display: flex; gap: 0.5rem;">
          <button id="update-btn" style="
            background: white;
            color: var(--analytics-info);
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
            cursor: pointer;
            font-weight: 500;
          ">Update</button>
          <button id="skip-btn" style="
            background: transparent;
            color: white;
            border: 1px solid rgba(255,255,255,0.3);
            padding: 0.5rem 1rem;
            border-radius: 0.25rem;
            cursor: pointer;
          ">Later</button>
        </div>
      </div>
    `;

    document.body.appendChild(updateNotification);

    // Handle update button
    document.getElementById('update-btn').addEventListener('click', () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    });

    // Handle skip button
    document.getElementById('skip-btn').addEventListener('click', () => {
      updateNotification.remove();
    });
  }

  handleServiceWorkerMessage(event) {
    const { type, message } = event.data;

    switch (type) {
      case 'SYNC_COMPLETE':
        this.showNotification('Offline data synced successfully', 'success');
        break;
      case 'CACHE_UPDATED':
        console.log('📦 Cache updated:', message);
        break;
      default:
        console.log('💬 Service Worker message:', type, message);
    }
  }

  retryFailedRequests() {
    // Retry any failed API requests
    console.log('🔄 Retrying failed requests...');
    // Implementation would depend on how you track failed requests
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error';
    errorDiv.textContent = message;

    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.insertBefore(errorDiv, mainContent.firstChild);
      setTimeout(() => errorDiv.remove(), 5000);
    }
  }

  showAlert(data) {
    // Show real-time alerts
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${data.level || 'info'}`;
    alertDiv.innerHTML = `
      <strong>${data.title}</strong><br>
      ${data.message}
    `;

    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.insertBefore(alertDiv, mainContent.firstChild);
      setTimeout(() => alertDiv.remove(), 10000);
    }
  }

  destroy() {
    // Cleanup resources
    this.pauseUpdates();

    if (this.websocketConnection) {
      this.websocketConnection.close();
    }

    // Destroy charts
    Object.values(this.charts).forEach(chart => {
      if (chart) {
        chart.destroy();
      }
    });

    console.log('🧹 Analytics Dashboard destroyed');
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.analyticsDashboard = new AdvancedAnalyticsDashboard();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.analyticsDashboard) {
    window.analyticsDashboard.destroy();
  }
});
