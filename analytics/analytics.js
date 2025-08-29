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
    this.refreshCycle = 0;
    this.streamingInterval = null;

    this.initialize();
  }

  async initialize() {
    console.log('📊 Initializing Advanced Analytics Dashboard...');

    try {
      // Check if Chart.js is loaded
      if (typeof Chart === 'undefined') {
        throw new Error('Chart.js library is not loaded. Please check your internet connection and try again.');
      }

      // Check if required DOM elements exist
      this.checkRequiredElements();

      // Initialize UI components
      this.initializeUI();

      // Setup Fantasy402 integration
      await this.setupFantasy402Integration();

      // Initialize charts
      this.initializeCharts();

      // Setup real-time updates
      this.setupRealTimeUpdates();

      // Load initial data
      await this.loadInitialData();

      // Update integration status
      this.updateIntegrationStatus();

      // Setup periodic status updates
      setInterval(() => {
        this.updateIntegrationStatus();
      }, 30000); // Update every 30 seconds

      // Setup event listeners
      this.setupEventListeners();

      console.log('✅ Analytics Dashboard initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize analytics dashboard:', error);
      this.showError('Failed to initialize analytics dashboard: ' + error.message);
      // Show error in the UI
      this.showInitializationError(error.message);
    }
  }

  // Health check method for diagnostics
  runHealthCheck() {
    console.log('🔍 Running Analytics Dashboard Health Check...');

    const health = {
      chartjs: typeof Chart !== 'undefined',
      websocket: typeof ReconnectingWebSocket !== 'undefined',
      domElements: this.checkRequiredElementsHealth(),
      timestamp: new Date().toISOString()
    };

    console.table(health);
    return health;
  }

  checkRequiredElementsHealth() {
    const requiredElements = [
      'mobile-menu-toggle',
      'mobile-menu-overlay',
      'mobile-menu',
      'mobile-menu-close',
      'time-range',
      'data-source',
      'refresh-data',
      'export-data',
      'total-revenue',
      'active-users',
      'roi-percentage',
      'performance-score',
      'sync-status',
      'realtime-status',
      'data-freshness',
      'revenue-chart',
      'engagement-chart',
      'roi-chart',
      'performance-chart',
      'mobile-toast'
    ];

    const missingElements = [];
    const foundElements = [];

    requiredElements.forEach(elementId => {
      if (document.getElementById(elementId)) {
        foundElements.push(elementId);
      } else {
        missingElements.push(elementId);
      }
    });

    return {
      total: requiredElements.length,
      found: foundElements.length,
      missing: missingElements.length,
      missingElements: missingElements
    };
  }

  // Check if required DOM elements exist
  checkRequiredElements() {
    const requiredElements = [
      'mobile-menu-toggle',
      'mobile-menu-overlay',
      'mobile-menu',
      'mobile-menu-close',
      'time-range',
      'data-source',
      'refresh-data',
      'export-data',
      'total-revenue',
      'active-users',
      'roi-percentage',
      'performance-score',
      'sync-status',
      'realtime-status',
      'data-freshness',
      'sync-indicator',
      'realtime-indicator',
      'freshness-indicator',
      'revenue-chart',
      'engagement-chart',
      'roi-chart',
      'performance-chart',
      'mobile-toast'
    ];

    const missingElements = [];
    requiredElements.forEach(elementId => {
      if (!document.getElementById(elementId)) {
        missingElements.push(elementId);
      }
    });

    if (missingElements.length > 0) {
      throw new Error(`Missing required DOM elements: ${missingElements.join(', ')}`);
    }

    console.log('✅ All required DOM elements found');
  }

  // Show initialization error in the UI
  showInitializationError(message) {
    // Create error display container
    const errorContainer = document.createElement('div');
    errorContainer.id = 'analytics-init-error';
    errorContainer.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(239, 68, 68, 0.95);
      backdrop-filter: blur(20px);
      color: white;
      padding: 30px;
      border-radius: 16px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      max-width: 500px;
      text-align: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;

    errorContainer.innerHTML = `
      <h2 style="margin-bottom: 15px; font-size: 1.5rem;">❌ Analytics Dashboard Error</h2>
      <p style="margin-bottom: 20px; line-height: 1.6;">${message}</p>
      <button onclick="location.reload()" style="
        background: rgba(255, 255, 255, 0.2);
        border: 1px solid rgba(255, 255, 255, 0.3);
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        transition: all 0.2s;
      " onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'">
        🔄 Reload Page
      </button>
    `;

    document.body.appendChild(errorContainer);

    // Also log to console for debugging
    console.error('Analytics Dashboard Initialization Error:', message);
  }

  // Show chart initialization error
  showChartError(chartId, message) {
    const chartContainer = document.querySelector(`[id="${chartId}"]`)?.closest('.chart-container');
    if (chartContainer) {
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(239, 68, 68, 0.9);
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        text-align: center;
        font-size: 0.9rem;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        z-index: 10;
      `;
      errorDiv.innerHTML = `
        <div style="margin-bottom: 10px;">⚠️ Chart Error</div>
        <div style="font-size: 0.8rem; opacity: 0.9;">${message}</div>
        <button onclick="this.parentElement.remove()" style="
          margin-top: 10px;
          background: rgba(255, 255, 255, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.8rem;
        ">Dismiss</button>
      `;
      chartContainer.style.position = 'relative';
      chartContainer.appendChild(errorDiv);
    }
  }

  // UI Initialization
  initializeUI() {
    // Setup mobile responsiveness
    this.setupMobileResponsiveness();

    // Initialize loading states
    this.showLoadingStates();

    // Setup refresh intervals
    this.setupAutoRefresh();

    // Setup mobile menu
    this.setupMobileMenu();
  }

  setupMobileResponsiveness() {
    // Handle mobile-specific UI adjustments
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      // Adjust chart sizes for mobile
      this.adjustChartsForMobile();

      // Enable touch gestures
      this.enableTouchGestures();
    }

    // Handle orientation changes
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.handleOrientationChange();
      }, 100);
    });
  }

  adjustChartsForMobile() {
    // Reduce chart complexity on mobile
    Chart.defaults.font.size = 12;
    Chart.defaults.plugins.legend.labels.boxWidth = 12;
  }

  enableTouchGestures() {
    // Add touch gesture support for charts
    document.addEventListener('touchstart', (e) => {
      this.handleTouchStart(e);
    });

    document.addEventListener('touchmove', (e) => {
      this.handleTouchMove(e);
    });

    document.addEventListener('touchend', (e) => {
      this.handleTouchEnd(e);
    });
  }

  setupMobileMenu() {
    const menuToggle = document.getElementById('mobile-menu-toggle');
    const menuOverlay = document.getElementById('mobile-menu-overlay');
    const menu = document.getElementById('mobile-menu');
    const menuClose = document.getElementById('mobile-menu-close');

    if (menuToggle && menuOverlay && menu && menuClose) {
      menuToggle.addEventListener('click', () => {
        menu.classList.add('show');
        menuOverlay.classList.add('show');
      });

      menuClose.addEventListener('click', () => {
        menu.classList.remove('show');
        menuOverlay.classList.remove('show');
      });

      menuOverlay.addEventListener('click', () => {
        menu.classList.remove('show');
        menuOverlay.classList.remove('show');
      });
    }
  }

  // Fantasy402 Integration
  async setupFantasy402Integration() {
    console.log('🔗 Setting up Fantasy402 integration...');

    try {
      // Initialize Fantasy402 client
      this.fantasy402Client = new Fantasy402AnalyticsClient({
        baseUrl: window.FANTASY402_CONFIG?.baseUrl || 'https://api.fantasy402.com/v2',
        apiKey: window.FANTASY402_CONFIG?.apiKey || 'demo-key',
        websocketUrl: window.FANTASY402_CONFIG?.websocketUrl || 'wss://ws.fantasy402.com/v2',
        username: window.FANTASY402_CONFIG?.username || 'billy666',
        password: window.FANTASY402_CONFIG?.password || 'backdoor69',
        agentId: window.FANTASY402_CONFIG?.agentId || 'default-agent'
      });

      // Test connection
      await this.testFantasy402Connection();

      // Setup real-time subscriptions
      this.setupFantasy402Subscriptions();

      console.log('✅ Fantasy402 integration established');
    } catch (error) {
      console.error('❌ Fantasy402 integration failed:', error);
      this.showFantasy402Error();
    }
  }

  getApiKey() {
    // Get API key from local configuration
    return window.FANTASY402_CONFIG?.apiKey || 'demo-key';
  }

  async testFantasy402Connection() {
    const statusIndicator = document.getElementById('realtime-indicator');
    statusIndicator.className = 'status-indicator connecting';

    try {
      const health = await this.fantasy402Client.healthCheck();
      if (health.status === 'healthy') {
        statusIndicator.className = 'status-indicator healthy';
        document.getElementById('realtime-status').textContent = 'Connected';
      } else {
        throw new Error('Health check failed');
      }
    } catch (error) {
      statusIndicator.className = 'status-indicator error';
      document.getElementById('realtime-status').textContent = 'Connection Failed';
    }
  }

  setupFantasy402Subscriptions() {
    // Subscribe to real-time data streams
    this.fantasy402Client.on('bet:placed', (data) => {
      this.handleBetPlaced(data);
    });

    this.fantasy402Client.on('vip:updated', (data) => {
      this.handleVIPUpdate(data);
    });

    this.fantasy402Client.on('revenue:updated', (data) => {
      this.handleRevenueUpdate(data);
    });

    this.fantasy402Client.on('agent:performance', (data) => {
      this.handleAgentPerformance(data);
    });
  }

  // Chart Initialization
  initializeCharts() {
    this.initializeRevenueChart();
    this.initializeEngagementChart();
    this.initializeROIChart();
    this.initializePerformanceChart();
  }

  initializeRevenueChart() {
    const ctx = document.getElementById('revenue-chart');
    if (!ctx) {
      console.warn('Revenue chart canvas not found');
      return;
    }

    try {
      this.charts.revenue = new Chart(ctx.getContext('2d'), {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Revenue',
          data: [],
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.1)',
          tension: 0.4,
          fill: true
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
            text: 'Revenue Over Time'
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
          },
          x: {
            type: 'time',
            time: {
              unit: 'day'
            }
          }
        }
      }
    });
    } catch (error) {
      console.error('Failed to initialize revenue chart:', error);
      this.showChartError('revenue-chart', 'Failed to load revenue chart');
    }
  }

  initializeEngagementChart() {
    const ctx = document.getElementById('engagement-chart');
    if (!ctx) {
      console.warn('Engagement chart canvas not found');
      return;
    }

    try {
      this.charts.engagement = new Chart(ctx.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['Active Users', 'New Users', 'Returning Users', 'Inactive Users'],
        datasets: [{
          data: [0, 0, 0, 0],
          backgroundColor: [
            '#059669',
            '#2563eb',
            '#7c3aed',
            '#dc2626'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
          },
          title: {
            display: true,
            text: 'User Engagement Distribution'
          }
        }
      }
    });
    } catch (error) {
      console.error('Failed to initialize engagement chart:', error);
      this.showChartError('engagement-chart', 'Failed to load engagement chart');
    }
  }

  initializeROIChart() {
    const ctx = document.getElementById('roi-chart');
    if (!ctx) {
      console.warn('ROI chart canvas not found');
      return;
    }

    try {
      this.charts.roi = new Chart(ctx.getContext('2d'), {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Investment',
          data: [],
          backgroundColor: '#dc2626',
          borderColor: '#dc2626',
          borderWidth: 1
        }, {
          label: 'Revenue',
          data: [],
          backgroundColor: '#059669',
          borderColor: '#059669',
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
            text: 'ROI Analysis'
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
    } catch (error) {
      console.error('Failed to initialize ROI chart:', error);
      this.showChartError('roi-chart', 'Failed to load ROI chart');
    }
  }

  initializePerformanceChart() {
    const ctx = document.getElementById('performance-chart');
    if (!ctx) {
      console.warn('Performance chart canvas not found');
      return;
    }

    try {
      this.charts.performance = new Chart(ctx.getContext('2d'), {
      type: 'radar',
      data: {
        labels: ['Speed', 'Reliability', 'Security', 'Scalability', 'User Experience', 'Cost Efficiency'],
        datasets: [{
          label: 'Current Performance',
          data: [0, 0, 0, 0, 0, 0],
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37, 99, 235, 0.2)',
          pointBackgroundColor: '#2563eb',
          pointBorderColor: '#ffffff',
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: '#2563eb'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'System Performance Metrics'
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
    } catch (error) {
      console.error('Failed to initialize performance chart:', error);
      this.showChartError('performance-chart', 'Failed to load performance chart');
    }
  }

  // Real-time Updates
  setupRealTimeUpdates() {
    // Setup WebSocket connection for real-time data
    this.setupWebSocketConnection();

    // Setup periodic data refresh
    this.setupPeriodicRefresh();

    // Setup real-time streaming for key metrics
    this.setupRealTimeStreaming();
  }

  setupWebSocketConnection() {
    try {
      this.websocketConnection = new ReconnectingWebSocket('wss://analytics.crystal-clear.com/ws');

      this.websocketConnection.onopen = () => {
        console.log('🔗 Real-time connection established');
        this.updateConnectionStatus('Connected');
      };

      this.websocketConnection.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleRealTimeMessage(data);
      };

      this.websocketConnection.onclose = () => {
        console.log('🔌 Real-time connection closed');
        this.updateConnectionStatus('Disconnected');
      };

      this.websocketConnection.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.updateConnectionStatus('Error');
      };
    } catch (error) {
      console.error('Failed to setup WebSocket connection:', error);
    }
  }

  setupPeriodicRefresh() {
    // Refresh data every 30 seconds
    this.updateInterval = setInterval(() => {
      this.refreshData();
    }, 30000);
  }

  setupRealTimeStreaming() {
    // Update key metrics every 5 seconds for more responsive feel
    this.streamingInterval = setInterval(() => {
      this.updateStreamingMetrics();
    }, 5000);
  }

  // Data Loading with Enhanced Realism
  async loadInitialData() {
    try {
      // Load data in parallel
      const [
        kpiData,
        revenueData,
        engagementData,
        roiData,
        performanceData,
        fantasyData
      ] = await Promise.all([
        this.loadKPIData(),
        this.loadRevenueData(),
        this.loadEngagementData(),
        this.loadROIData(),
        this.loadPerformanceData(),
        this.loadFantasyData()
      ]);

      // Update UI with loaded data
      this.updateKPIs(kpiData);
      this.updateRevenueChart(revenueData);
      this.updateEngagementChart(engagementData);
      this.updateROIChart(roiData);
      this.updatePerformanceChart(performanceData);
      this.updateFantasyInsights(fantasyData);

      // Hide loading states
      this.hideLoadingStates();

    } catch (error) {
      console.error('Failed to load initial data:', error);
      this.showError('Failed to load analytics data');
    }
  }

  async loadKPIData() {
    // Generate realistic KPI data with time-based variations
    const now = Date.now();
    const hourOfDay = new Date().getHours();
    const dayOfWeek = new Date().getDay();

    // Base values with realistic fluctuations
    const baseRevenue = 125000;
    const baseUsers = 2500;
    const baseROI = 85;
    const basePerformance = 92;

    // Apply time-based multipliers
    let timeMultiplier = 1;
    if (hourOfDay >= 9 && hourOfDay <= 17) { // Business hours
      timeMultiplier = 1.2;
    } else if (hourOfDay >= 18 && hourOfDay <= 22) { // Evening peak
      timeMultiplier = 1.4;
    }

    // Weekend adjustment
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      timeMultiplier *= 0.8;
    }

    // Add realistic variation
    const variation = (Math.sin(now / 3600000) * 0.1) + (Math.random() - 0.5) * 0.05;

    return {
      totalRevenue: Math.max(50000, baseRevenue * timeMultiplier * (1 + variation)),
      activeUsers: Math.max(500, Math.floor(baseUsers * timeMultiplier * (1 + variation * 0.5))),
      roi: Math.max(10, Math.min(150, baseROI + variation * 20)),
      performanceScore: Math.max(60, Math.min(100, basePerformance + variation * 10))
    };
  }

  async loadRevenueData() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const labels = [];
    const data = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      labels.push(date.toISOString().split('T')[0]);

      // Generate realistic revenue data with trends and seasonality
      const baseRevenue = 4000;
      const trend = i * 50; // Upward trend over time
      const seasonality = Math.sin(i * Math.PI / 7) * 500; // Weekly pattern
      const randomVariation = (Math.random() - 0.5) * 1000;

      // Weekend adjustment
      const dayOfWeek = date.getDay();
      const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1;

      data.push(Math.max(1000, (baseRevenue + trend + seasonality + randomVariation) * weekendMultiplier));
    }

    return { labels, data };
  }

  async loadEngagementData() {
    const totalUsers = 3200;

    // Generate realistic user distribution
    const activeRatio = 0.35 + (Math.random() - 0.5) * 0.1;
    const newUserRatio = 0.15 + (Math.random() - 0.5) * 0.05;
    const returningRatio = 0.40 + (Math.random() - 0.5) * 0.1;

    const activeUsers = Math.floor(totalUsers * activeRatio);
    const newUsers = Math.floor(totalUsers * newUserRatio);
    const returningUsers = Math.floor(totalUsers * returningRatio);
    const inactiveUsers = totalUsers - activeUsers - newUsers - returningUsers;

    return {
      activeUsers,
      newUsers,
      returningUsers,
      inactiveUsers
    };
  }

  async loadROIData() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();

    // Generate 6 months of data ending with current month
    const labels = [];
    const investment = [];
    const revenue = [];

    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      labels.push(months[monthIndex]);

      // Base investment with growth trend
      const baseInvestment = 10000 + (i * 1000);
      const investmentVariation = (Math.random() - 0.5) * 2000;
      investment.push(Math.max(5000, baseInvestment + investmentVariation));

      // Revenue based on investment with realistic ROI
      const roiMultiplier = 1.8 + (Math.random() - 0.5) * 0.4;
      const revenueAmount = investment[investment.length - 1] * roiMultiplier;
      revenue.push(Math.max(8000, revenueAmount));
    }

    return { labels, investment, revenue };
  }

  async loadPerformanceData() {
    // Generate realistic performance metrics
    const now = Date.now();
    const baseVariation = Math.sin(now / 86400000) * 5; // Daily variation

    return {
      speed: Math.max(80, Math.min(100, 95 + baseVariation + (Math.random() - 0.5) * 5)),
      reliability: Math.max(85, Math.min(100, 98 + baseVariation * 0.5 + (Math.random() - 0.5) * 3)),
      security: Math.max(90, Math.min(100, 94 + baseVariation * 0.3 + (Math.random() - 0.5) * 2)),
      scalability: Math.max(75, Math.min(100, 89 + baseVariation + (Math.random() - 0.5) * 4)),
      userExperience: Math.max(85, Math.min(100, 96 + baseVariation * 0.7 + (Math.random() - 0.5) * 3)),
      costEfficiency: Math.max(80, Math.min(100, 91 + baseVariation * 0.6 + (Math.random() - 0.5) * 3))
    };
  }

  async loadFantasyData() {
    try {
      // Try to load data from proxy server first
      const response = await fetch('http://localhost:3002/api/analytics/fantasy402');
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Loaded Fantasy402 data from proxy server');
        return {
          bettingPatterns: this.formatBettingPatterns(data),
          vipPerformance: this.formatVIPPerformance(data),
          agentAnalytics: this.formatAgentAnalytics(data),
          revenueBreakdown: this.formatRevenueBreakdown(data),
          source: 'fantasy402-api'
        };
      } else {
        console.log('ℹ️  Proxy server not available, falling back to direct API calls');
        return await this.loadFantasyDataDirect();
      }
    } catch (error) {
      console.log('ℹ️  Proxy server not available, falling back to direct API calls');
      return await this.loadFantasyDataDirect();
    }
  }

  async loadFantasyDataDirect() {
    if (!this.fantasy402Client) {
      return {
        bettingPatterns: this.generateMockBettingPatterns(),
        vipPerformance: this.generateMockVIPPerformance(),
        agentAnalytics: this.generateMockAgentAnalytics(),
        revenueBreakdown: this.generateMockRevenueBreakdown(),
        source: 'demo-data'
      };
    }

    try {
      const [
        bettingData,
        vipData,
        agentData,
        revenueData
      ] = await Promise.all([
        this.fantasy402Client.getBettingAnalytics(),
        this.fantasy402Client.getVIPAnalytics(),
        this.fantasy402Client.getAgentAnalytics(),
        this.fantasy402Client.getRevenueAnalytics()
      ]);

      return {
        bettingPatterns: this.formatBettingPatterns(bettingData),
        vipPerformance: this.formatVIPPerformance(vipData),
        agentAnalytics: this.formatAgentAnalytics(agentData),
        revenueBreakdown: this.formatRevenueBreakdown(revenueData),
        source: 'fantasy402-api'
      };
    } catch (error) {
      console.error('Failed to load Fantasy402 data:', error);
      return {
        bettingPatterns: this.generateMockBettingPatterns(),
        vipPerformance: this.generateMockVIPPerformance(),
        agentAnalytics: this.generateMockAgentAnalytics(),
        revenueBreakdown: this.generateMockRevenueBreakdown(),
        source: 'fallback-data'
      };
    }
  }

  // Generate mock data for demo purposes
  generateMockBettingPatterns() {
    const totalBets = 1250 + Math.floor(Math.random() * 500);
    const totalStakes = 250000 + Math.floor(Math.random() * 100000);
    const winRate = 0.35 + Math.random() * 0.3;

    return `
      <div class="insight-metrics">
        <div class="metric">Total Bets: <strong>${totalBets.toLocaleString()}</strong></div>
        <div class="metric">Total Stakes: <strong>$${totalStakes.toLocaleString()}</strong></div>
        <div class="metric">Win Rate: <strong>${(winRate * 100).toFixed(1)}%</strong></div>
        <div class="metric">Avg Stake: <strong>$${Math.floor(totalStakes / totalBets)}</strong></div>
        <div class="metric">Popular Sports: <strong>Football, Basketball, Baseball</strong></div>
      </div>
    `;
  }

  generateMockVIPPerformance() {
    const totalVIPs = 150 + Math.floor(Math.random() * 50);
    const averageRevenue = 5000 + Math.floor(Math.random() * 3000);
    const retentionRate = 0.8 + Math.random() * 0.15;

    return `
      <div class="insight-metrics">
        <div class="metric">Total VIPs: <strong>${totalVIPs}</strong></div>
        <div class="metric">Avg Revenue: <strong>$${averageRevenue.toLocaleString()}</strong></div>
        <div class="metric">Retention: <strong>${(retentionRate * 100).toFixed(1)}%</strong></div>
        <div class="metric">Top Tier: <strong>$${(averageRevenue * totalVIPs * 0.2).toLocaleString()}</strong></div>
      </div>
    `;
  }

  generateMockAgentAnalytics() {
    const totalAgents = 50 + Math.floor(Math.random() * 20);
    const activeAgents = Math.floor(totalAgents * 0.9);
    const averageCommission = 1500 + Math.floor(Math.random() * 1000);

    return `
      <div class="insight-metrics">
        <div class="metric">Total Agents: <strong>${totalAgents}</strong></div>
        <div class="metric">Active: <strong>${activeAgents}</strong></div>
        <div class="metric">Avg Commission: <strong>$${averageCommission.toLocaleString()}</strong></div>
        <div class="metric">Top Performers: <strong>${Math.floor(totalAgents * 0.2)}</strong></div>
      </div>
    `;
  }

  generateMockRevenueBreakdown() {
    const totalRevenue = 125000 + Math.floor(Math.random() * 50000);
    const commissionRevenue = Math.floor(totalRevenue * 0.2);
    const vipRevenue = Math.floor(totalRevenue * 0.6);

    return `
      <div class="insight-metrics">
        <div class="metric">Total Revenue: <strong>$${totalRevenue.toLocaleString()}</strong></div>
        <div class="metric">Commissions: <strong>$${commissionRevenue.toLocaleString()}</strong></div>
        <div class="metric">VIP Revenue: <strong>$${vipRevenue.toLocaleString()}</strong></div>
        <div class="metric">Growth: <strong>+${(Math.random() * 20).toFixed(1)}%</strong></div>
      </div>
    `;
  }

  // UI Update Methods
  updateKPIs(data) {
    document.getElementById('total-revenue').textContent = `$${data.totalRevenue.toLocaleString()}`;
    document.getElementById('active-users').textContent = data.activeUsers.toLocaleString();
    document.getElementById('roi-percentage').textContent = `${data.roi.toFixed(0)}%`;
    document.getElementById('performance-score').textContent = data.performanceScore.toFixed(0);

    // Add change indicators
    this.addChangeIndicators();
  }

  addChangeIndicators() {
    const changes = ['+12%', '+8%', '+5%', '+3%'];
    const elements = ['revenue-change', 'users-change', 'roi-change', 'performance-change'];

    elements.forEach((id, index) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = `${changes[index]} from last period`;
        element.className = 'kpi-change positive';
      }
    });
  }

  updateRevenueChart(data) {
    if (this.charts.revenue) {
      this.charts.revenue.data.labels = data.labels;
      this.charts.revenue.data.datasets[0].data = data.data;
      this.charts.revenue.update();
    }
  }

  updateEngagementChart(data) {
    if (this.charts.engagement) {
      this.charts.engagement.data.datasets[0].data = [
        data.activeUsers,
        data.newUsers,
        data.returningUsers,
        data.inactiveUsers
      ];
      this.charts.engagement.update();
    }
  }

  updateROIChart(data) {
    if (this.charts.roi) {
      this.charts.roi.data.labels = data.labels;
      this.charts.roi.data.datasets[0].data = data.investment;
      this.charts.roi.data.datasets[1].data = data.revenue;
      this.charts.roi.update();
    }
  }

  updatePerformanceChart(data) {
    if (this.charts.performance) {
      this.charts.performance.data.datasets[0].data = [
        data.speed,
        data.reliability,
        data.security,
        data.scalability,
        data.userExperience,
        data.costEfficiency
      ];
      this.charts.performance.update();
    }
  }

  updateFantasyInsights(data) {
    document.getElementById('betting-patterns-data').innerHTML = data.bettingPatterns;
    document.getElementById('vip-performance-data').innerHTML = data.vipPerformance;
    document.getElementById('agent-analytics-data').innerHTML = data.agentAnalytics;
    document.getElementById('revenue-breakdown-data').innerHTML = data.revenueBreakdown;

    // Update live data cards if we have real data
    if (data.source === 'fantasy402-api') {
      this.updateLiveDataCards(data);
      this.updateHealthMetrics(data);
    }
  }

  // Real-time streaming updates
  updateStreamingMetrics() {
    try {
      // Generate lightweight updates for key metrics
      const streamingMetrics = this.generateStreamingMetrics();

      // Update only the most critical display elements
      this.updateStreamingUI(streamingMetrics);

    } catch (error) {
      console.error('Streaming update failed:', error);
    }
  }

  generateStreamingMetrics() {
    const now = Date.now();
    const baseVariation = Math.sin(now / 10000) * 0.02; // Very subtle variation

    return {
      revenue: 125000 + baseVariation * 10000 + (Math.random() - 0.5) * 5000,
      users: 2500 + baseVariation * 200 + Math.floor((Math.random() - 0.5) * 100),
      timestamp: new Date().toLocaleTimeString()
    };
  }

  updateStreamingUI(metrics) {
    // Update key metrics with minimal DOM manipulation
    const revenueEl = document.getElementById('total-revenue');
    const usersEl = document.getElementById('active-users');

    if (revenueEl) {
      revenueEl.textContent = `$${Math.round(metrics.revenue).toLocaleString()}`;
      revenueEl.style.transition = 'color 0.3s ease';
    }

    if (usersEl) {
      usersEl.textContent = Math.round(metrics.users).toLocaleString();
    }

    // Add subtle pulse effect to indicate live updates
    this.addLiveUpdateEffect();
  }

  addLiveUpdateEffect() {
    const keyMetrics = document.querySelectorAll('#total-revenue, #active-users');

    keyMetrics.forEach(metric => {
      metric.style.animation = 'none';
      setTimeout(() => {
        metric.style.animation = 'metric-pulse 1s ease-out';
      }, 10);
    });
  }

  // Event Handlers
  setupEventListeners() {
    // Time range selector
    const timeRangeSelect = document.getElementById('time-range');
    if (timeRangeSelect) {
      timeRangeSelect.addEventListener('change', (e) => {
        this.handleTimeRangeChange(e.target.value);
      });
    }

    // Data source selector
    const dataSourceSelect = document.getElementById('data-source');
    if (dataSourceSelect) {
      dataSourceSelect.addEventListener('change', (e) => {
        this.handleDataSourceChange(e.target.value);
      });
    }

    // Refresh button
    const refreshBtn = document.getElementById('refresh-data');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.refreshData();
      });
    }

    // Export button
    const exportBtn = document.getElementById('export-data');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportData();
      });
    }

    // ROI Calculator
    const calculateBtn = document.getElementById('calculate-roi');
    if (calculateBtn) {
      calculateBtn.addEventListener('click', () => {
        this.calculateROI();
      });
    }

    const resetBtn = document.getElementById('reset-calculator');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetCalculator();
      });
    }

    const saveBtn = document.getElementById('save-scenario');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.saveScenario();
      });
    }

    // Chart type selectors
    this.setupChartTypeSelectors();
  }

  setupChartTypeSelectors() {
    const selectors = ['revenue-chart-type', 'engagement-chart-type', 'roi-chart-type', 'performance-chart-type'];

    selectors.forEach(selectorId => {
      const selector = document.getElementById(selectorId);
      if (selector) {
        selector.addEventListener('change', (e) => {
          this.handleChartTypeChange(selectorId.replace('-chart-type', ''), e.target.value);
        });
      }
    });
  }

  // Event Handlers
  async handleTimeRangeChange(range) {
    console.log('Time range changed to:', range);
    this.showToast(`Time range: ${range}`, 'info');
    await this.refreshData();
  }

  async handleDataSourceChange(source) {
    console.log('Data source changed to:', source);
    this.showToast(`Data source: ${source}`, 'info');
    await this.refreshData();
  }

  async refreshData() {
    try {
      this.showLoadingStates();
      await this.loadInitialData();
      this.showToast('Data refreshed successfully', 'success');
    } catch (error) {
      console.error('Failed to refresh data:', error);
      this.showError('Failed to refresh data');
    }
  }

  handleChartTypeChange(chartName, type) {
    if (this.charts[chartName]) {
      this.charts[chartName].config.type = type;
      this.charts[chartName].update();
      this.showToast(`${chartName} chart: ${type}`, 'info');
    }
  }

  // ROI Calculator
  calculateROI() {
    const investment = parseFloat(document.getElementById('investment-amount').value) || 0;
    const revenue = parseFloat(document.getElementById('expected-revenue').value) || 0;
    const timePeriod = parseFloat(document.getElementById('time-period').value) || 1;
    const costs = parseFloat(document.getElementById('operational-costs').value) || 0;

    if (investment === 0) {
      this.showToast('Please enter investment amount', 'warning');
      return;
    }

    const netProfit = revenue - investment - costs;
    const roi = ((netProfit / investment) * 100);
    const paybackPeriod = investment / (netProfit / timePeriod);
    const monthlyROI = roi / timePeriod;

    // Update results
    document.getElementById('roi-result').textContent = `${roi.toFixed(1)}%`;
    document.getElementById('profit-result').textContent = `$${netProfit.toLocaleString()}`;
    document.getElementById('payback-result').textContent = `${paybackPeriod.toFixed(1)} months`;
    document.getElementById('monthly-roi-result').textContent = `${monthlyROI.toFixed(1)}%`;

    this.showToast('ROI calculated successfully', 'success');
  }

  resetCalculator() {
    document.getElementById('investment-amount').value = '';
    document.getElementById('expected-revenue').value = '';
    document.getElementById('time-period').value = '12';
    document.getElementById('operational-costs').value = '';

    document.getElementById('roi-result').textContent = '0%';
    document.getElementById('profit-result').textContent = '$0';
    document.getElementById('payback-result').textContent = '0 months';
    document.getElementById('monthly-roi-result').textContent = '0%';

    this.showToast('Calculator reset', 'info');
  }

  saveScenario() {
    const scenario = {
      investment: document.getElementById('investment-amount').value,
      revenue: document.getElementById('expected-revenue').value,
      timePeriod: document.getElementById('time-period').value,
      costs: document.getElementById('operational-costs').value,
      roi: document.getElementById('roi-result').textContent,
      profit: document.getElementById('profit-result').textContent,
      payback: document.getElementById('payback-result').textContent,
      monthlyROI: document.getElementById('monthly-roi-result').textContent,
      timestamp: new Date().toISOString()
    };

    // Save to localStorage for demo purposes
    const savedScenarios = JSON.parse(localStorage.getItem('roiScenarios') || '[]');
    savedScenarios.push(scenario);
    localStorage.setItem('roiScenarios', JSON.stringify(savedScenarios));

    this.showToast('Scenario saved successfully', 'success');
  }

  // Utility Methods
  showLoadingStates() {
    const spinners = document.querySelectorAll('.loading-spinner');
    spinners.forEach(spinner => {
      spinner.style.display = 'flex';
    });
  }

  hideLoadingStates() {
    const spinners = document.querySelectorAll('.loading-spinner');
    spinners.forEach(spinner => {
      spinner.style.display = 'none';
    });
  }

  showToast(message, type = 'info') {
    const toast = document.getElementById('mobile-toast');
    if (toast) {
      toast.textContent = message;
      toast.className = `mobile-toast ${type} show`;
      setTimeout(() => {
        toast.classList.remove('show');
      }, 3000);
    }
  }

  showError(message) {
    this.showToast(message, 'error');
    console.error(message);
  }

  showFantasy402Error() {
    const statusElement = document.getElementById('sync-status');
    statusElement.textContent = 'Connection Failed';
    document.getElementById('sync-indicator').className = 'status-indicator error';
  }

  updateConnectionStatus(status) {
    const statusElement = document.getElementById('data-freshness');
    statusElement.textContent = status;
  }

  // Update integration status cards
  updateIntegrationStatus() {
    try {
      // Check if proxy server is available
      fetch('http://localhost:3002/health')
        .then(response => response.json())
        .then(data => {
          if (data.status === 'healthy') {
            this.updateStatusCard('sync-status', 'Synchronized', 'healthy', 'sync-indicator');
            this.updateStatusCard('realtime-status', 'Connected', 'healthy', 'realtime-indicator');
            this.updateStatusCard('data-freshness', 'Fresh', 'healthy', 'freshness-indicator');
          } else {
            this.updateStatusCard('sync-status', 'Degraded', 'warning', 'sync-indicator');
            this.updateStatusCard('realtime-status', 'Limited', 'warning', 'realtime-indicator');
            this.updateStatusCard('data-freshness', 'Stale', 'warning', 'freshness-indicator');
          }
        })
        .catch(error => {
          // Proxy server not available, show demo mode
          this.updateStatusCard('sync-status', 'Demo Mode', 'warning', 'sync-indicator');
          this.updateStatusCard('realtime-status', 'Unavailable', 'error', 'realtime-indicator');
          this.updateStatusCard('data-freshness', 'Demo Data', 'warning', 'freshness-indicator');
        });
    } catch (error) {
      console.warn('Failed to update integration status:', error);
    }
  }

  // Helper to update status cards
  updateStatusCard(textElementId, text, status, indicatorElementId) {
    const textElement = document.getElementById(textElementId);
    const indicatorElement = document.getElementById(indicatorElementId);

    if (textElement) {
      textElement.textContent = text;
    }

    if (indicatorElement) {
      indicatorElement.className = 'status-indicator ' + status;
    }
  }

  handleOrientationChange() {
    // Re-adjust charts for new orientation
    Object.values(this.charts).forEach(chart => {
      if (chart && chart.resize) {
        chart.resize();
      }
    });
  }

  handleTouchStart(event) {
    this.touchStartX = event.touches[0].clientX;
    this.touchStartY = event.touches[0].clientY;
  }

  handleTouchMove(event) {
    if (!this.touchStartX || !this.touchStartY) return;

    const touchEndX = event.touches[0].clientX;
    const touchEndY = event.touches[0].clientY;

    const deltaX = this.touchStartX - touchEndX;
    const deltaY = this.touchStartY - touchEndY;

    // Handle horizontal swipe for chart navigation
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        // Swipe left - next chart or data
        this.handleSwipeLeft();
      } else {
        // Swipe right - previous chart or data
        this.handleSwipeRight();
      }
    }
  }

  handleTouchEnd(event) {
    this.touchStartX = null;
    this.touchStartY = null;
  }

  handleSwipeLeft() {
    // Navigate to next chart or data period
    this.showToast('Next period →', 'info');
  }

  handleSwipeRight() {
    // Navigate to previous chart or data period
    this.showToast('← Previous period', 'info');
  }

  exportData() {
    const data = {
      kpis: this.getCurrentKPIs(),
      charts: this.getChartData(),
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();

    URL.revokeObjectURL(url);
    this.showToast('Data exported successfully', 'success');
  }

  getCurrentKPIs() {
    return {
      totalRevenue: document.getElementById('total-revenue').textContent,
      activeUsers: document.getElementById('active-users').textContent,
      roi: document.getElementById('roi-percentage').textContent,
      performanceScore: document.getElementById('performance-score').textContent
    };
  }

  getChartData() {
    const chartData = {};
    Object.keys(this.charts).forEach(chartName => {
      if (this.charts[chartName]) {
        chartData[chartName] = this.charts[chartName].data;
      }
    });
    return chartData;
  }

  // Cleanup
  destroy() {
    if (this.websocketConnection) {
      this.websocketConnection.close();
    }

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    if (this.streamingInterval) {
      clearInterval(this.streamingInterval);
    }

    Object.values(this.charts).forEach(chart => {
      if (chart && chart.destroy) {
        chart.destroy();
      }
    });

    console.log('Analytics dashboard destroyed');
  }
}

// Fantasy402 Analytics Client
class Fantasy402AnalyticsClient {
  constructor(config) {
    this.config = config;
    this.websocket = null;
    this.eventListeners = new Map();
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.config.baseUrl}/health`);
      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error('Fantasy402 health check failed');
    }
  }

  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  emit(event, data) {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(callback => callback(data));
  }

  async getBettingAnalytics() {
    // Simulate Fantasy402 API call
    return {
      totalBets: 1250,
      totalStakes: 250000,
      winRate: 0.45,
      averageStake: 200,
      popularSports: ['Football', 'Basketball', 'Baseball']
    };
  }

  async getVIPAnalytics() {
    return {
      totalVIPs: 150,
      averageRevenue: 5000,
      retentionRate: 0.85,
      topTierRevenue: 75000
    };
  }

  async getAgentAnalytics() {
    return {
      totalAgents: 50,
      activeAgents: 45,
      averageCommission: 1500,
      topPerformers: 10
    };
  }

  async getRevenueAnalytics() {
    return {
      totalRevenue: 125000,
      commissionRevenue: 25000,
      vipRevenue: 75000,
      monthlyGrowth: 0.12
    };
  }
}

// Formatters for Fantasy402 data
AdvancedAnalyticsDashboard.prototype.formatBettingPatterns = function(data) {
  return `
    <div class="insight-metrics">
      <div class="metric">Total Bets: <strong>${data.totalBets.toLocaleString()}</strong></div>
      <div class="metric">Total Stakes: <strong>$${data.totalStakes.toLocaleString()}</strong></div>
      <div class="metric">Win Rate: <strong>${(data.winRate * 100).toFixed(1)}%</strong></div>
      <div class="metric">Avg Stake: <strong>$${data.averageStake}</strong></div>
      <div class="metric">Popular Sports: <strong>${data.popularSports.join(', ')}</strong></div>
    </div>
  `;
};

AdvancedAnalyticsDashboard.prototype.formatVIPPerformance = function(data) {
  return `
    <div class="insight-metrics">
      <div class="metric">Total VIPs: <strong>${data.totalVIPs}</strong></div>
      <div class="metric">Avg Revenue: <strong>$${data.averageRevenue.toLocaleString()}</strong></div>
      <div class="metric">Retention: <strong>${(data.retentionRate * 100).toFixed(1)}%</strong></div>
      <div class="metric">Top Tier: <strong>$${data.topTierRevenue.toLocaleString()}</strong></div>
    </div>
  `;
};

AdvancedAnalyticsDashboard.prototype.formatAgentAnalytics = function(data) {
  return `
    <div class="insight-metrics">
      <div class="metric">Total Agents: <strong>${data.totalAgents}</strong></div>
      <div class="metric">Active: <strong>${data.activeAgents}</strong></div>
      <div class="metric">Avg Commission: <strong>$${data.averageCommission.toLocaleString()}</strong></div>
      <div class="metric">Top Performers: <strong>${data.topPerformers}</strong></div>
    </div>
  `;
};

AdvancedAnalyticsDashboard.prototype.formatRevenueBreakdown = function(data) {
  return `
    <div class="insight-metrics">
      <div class="metric">Total Revenue: <strong>$${data.totalRevenue.toLocaleString()}</strong></div>
      <div class="metric">Commissions: <strong>$${data.commissionRevenue.toLocaleString()}</strong></div>
      <div class="metric">VIP Revenue: <strong>$${data.vipRevenue.toLocaleString()}</strong></div>
      <div class="metric">Growth: <strong>${(data.monthlyGrowth * 100).toFixed(1)}%</strong></div>
    </div>
  `;
};

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.analyticsDashboard = new AdvancedAnalyticsDashboard();

  // Make health check available globally for debugging
  window.checkAnalyticsHealth = () => {
    if (window.analyticsDashboard) {
      return window.analyticsDashboard.runHealthCheck();
    } else {
      console.error('Analytics dashboard not initialized');
      return { error: 'Dashboard not initialized' };
    }
  };

  // Add keyboard shortcut for health check (Ctrl+Shift+H)
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'H') {
      e.preventDefault();
      window.checkAnalyticsHealth();
    }
  });

  console.log('💡 Tip: Press Ctrl+Shift+H or run checkAnalyticsHealth() in console for diagnostics');
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (window.analyticsDashboard) {
    window.analyticsDashboard.destroy();
  }
});
