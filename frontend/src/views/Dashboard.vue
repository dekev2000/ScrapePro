<template>
  <div class="dashboard">
    <div class="dashboard-header">
      <h1>Dashboard</h1>
      <p class="welcome-text">Welcome back, {{ authStore.user?.name || 'User' }}! Here's what's happening today.</p>

      <router-link
        to="/dashboard/scrape-builder"
        class="new-scrape-btn"
      >
        <i class="fas fa-plus"></i>
        New Scrape
      </router-link>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stats-card">
        <div class="stats-content">
          <div class="stats-header">
            <h3>Total Scrapes</h3>
            <div class="stats-icon scrapes-icon">
              <i class="fas fa-globe"></i>
            </div>
          </div>

          <div class="stats-value">{{ dashboardStats.totalScrapes.count }}</div>

          <div class="stats-trend up">
            <i class="fas fa-arrow-up"></i>
            <span>{{ dashboardStats.totalScrapes.change }}% from last week</span>
          </div>
        </div>
      </div>

      <div class="stats-card">
        <div class="stats-content">
          <div class="stats-header">
            <h3>Preview Sites</h3>
            <div class="stats-icon preview-icon">
              <i class="fas fa-desktop"></i>
            </div>
          </div>

          <div class="stats-value">{{ dashboardStats.previewSites.count }}</div>

          <div class="stats-trend up">
            <i class="fas fa-arrow-up"></i>
            <span>{{ dashboardStats.previewSites.change }}% from last week</span>
          </div>
        </div>
      </div>

      <div class="stats-card">
        <div class="stats-content">
          <div class="stats-header">
            <h3>Active Clients</h3>
            <div class="stats-icon clients-icon">
              <i class="fas fa-users"></i>
            </div>
          </div>

          <div class="stats-value">{{ dashboardStats.activeClients.count }}</div>

          <div class="stats-trend up">
            <i class="fas fa-arrow-up"></i>
            <span>{{ dashboardStats.activeClients.change }}% from last week</span>
          </div>
        </div>
      </div>

      <div class="stats-card">
        <div class="stats-content">
          <div class="stats-header">
            <h3>Revenue</h3>
            <div class="stats-icon revenue-icon">
              <i class="fas fa-euro-sign"></i>
            </div>
          </div>

          <div class="stats-value">€{{ dashboardStats.revenue.amount }}</div>

          <div class="stats-trend up">
            <i class="fas fa-arrow-up"></i>
            <span>{{ dashboardStats.revenue.change }}% from last week</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Activity Charts -->
    <div class="activity-section">
      <div class="chart-card">
        <div class="card-header">
          <h2>Scraping Activity</h2>

          <div class="time-filters">
            <button
              :class="['filter-btn', { active: activityTimeframe === 'day' }]"
              @click="setActivityTimeframe('day')"
            >
              Day
            </button>
            <button
              :class="['filter-btn', { active: activityTimeframe === 'week' }]"
              @click="setActivityTimeframe('week')"
            >
              Week
            </button>
            <button
              :class="['filter-btn', { active: activityTimeframe === 'month' }]"
              @click="setActivityTimeframe('month')"
            >
              Month
            </button>
          </div>
        </div>

        <div class="chart-container">
          <!-- This would be a chart component in a real app -->
          <div class="placeholder-chart">
            <div
              class="chart-line"
              style="height: 45%"
            ></div>
            <div
              class="chart-line"
              style="height: 60%"
            ></div>
            <div
              class="chart-line"
              style="height: 75%"
            ></div>
            <div
              class="chart-line"
              style="height: 55%"
            ></div>
            <div
              class="chart-line"
              style="height: 80%"
            ></div>
            <div
              class="chart-line"
              style="height: 30%"
            ></div>
            <div
              class="chart-line"
              style="height: 20%"
            ></div>
          </div>

          <div class="chart-legend">
            <div class="legend-item">
              <div class="legend-color scrapes"></div>
              <span>Scrapes</span>
            </div>
            <div class="legend-item">
              <div class="legend-color previews"></div>
              <span>Preview Sites</span>
            </div>
          </div>
        </div>
      </div>

      <div class="activity-card">
        <div class="card-header">
          <h2>Recent Activity</h2>
        </div>

        <div class="activity-list">
          <div class="activity-item">
            <div class="activity-icon scrape-icon">
              <i class="fas fa-globe"></i>
            </div>
            <div class="activity-content">
              <h4>New scrape started</h4>
              <p>Scrape initiated for GlobalTech</p>
              <span class="activity-time">Just now</span>
            </div>
          </div>

          <div class="activity-item">
            <div class="activity-icon activity-preview-icon">
              <i class="fas fa-desktop"></i>
            </div>
            <div class="activity-content">
              <h4>Preview site published</h4>
              <p>Preview for Innovate Inc. is now live</p>
              <span class="activity-time">30 min ago</span>
            </div>
          </div>

          <div class="activity-item">
            <div class="activity-icon message-icon">
              <i class="fas fa-comment-alt"></i>
            </div>
            <div class="activity-content">
              <h4>Client feedback received</h4>
              <p>Mark Johnson provided feedback on preview</p>
              <span class="activity-time">1 hour ago</span>
            </div>
          </div>

          <div class="activity-item">
            <div class="activity-icon complete-icon">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="activity-content">
              <h4>Scrape completed</h4>
              <p>Scrape for TechSolutions completed</p>
              <span class="activity-time">2 hours ago</span>
            </div>
          </div>

          <div class="activity-item">
            <div class="activity-icon client-icon">
              <i class="fas fa-user-plus"></i>
            </div>
            <div class="activity-content">
              <h4>New client registered</h4>
              <p>Sarah Williams from DigitalCorp signed up</p>
              <span class="activity-time">5 hours ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Tables -->
    <div class="tables-section">
      <div class="table-card recent-scrapes">
        <div class="card-header">
          <h2>Recent Scrapes</h2>
          <router-link
            to="/dashboard/scrapes"
            class="view-all"
          >View All</router-link>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <!-- Table rows would be populated dynamically in a real app -->
            <tr>
              <td>GlobalTech</td>
              <td><span class="status in-progress">In Progress</span></td>
              <td>Today</td>
              <td class="actions">
                <router-link
                  to="/dashboard/scrapes/view/1"
                  class="action-btn"
                ><i class="fas fa-eye"></i></router-link>
                <router-link
                  to="/dashboard/scrapes/edit/1"
                  class="action-btn"
                ><i class="fas fa-edit"></i></router-link>
                <button class="action-btn delete-btn"><i class="fas fa-trash"></i></button>
              </td>
            </tr>
            <tr>
              <td>TechSolutions</td>
              <td><span class="status completed">Completed</span></td>
              <td>Yesterday</td>
              <td class="actions">
                <router-link
                  to="/dashboard/scrapes/view/2"
                  class="action-btn"
                ><i class="fas fa-eye"></i></router-link>
                <router-link
                  to="/dashboard/scrapes/edit/2"
                  class="action-btn"
                ><i class="fas fa-edit"></i></router-link>
                <button class="action-btn delete-btn"><i class="fas fa-trash"></i></button>
              </td>
            </tr>
            <tr>
              <td>DigitalCorp</td>
              <td><span class="status completed">Completed</span></td>
              <td>May 15, 2023</td>
              <td class="actions">
                <router-link
                  to="/dashboard/scrapes/view/3"
                  class="action-btn"
                ><i class="fas fa-eye"></i></router-link>
                <router-link
                  to="/dashboard/scrapes/edit/3"
                  class="action-btn"
                ><i class="fas fa-edit"></i></router-link>
                <button class="action-btn delete-btn"><i class="fas fa-trash"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-card preview-sites">
        <div class="card-header">
          <h2>Preview Sites</h2>
          <router-link
            to="/dashboard/preview-sites"
            class="view-all"
          >View All</router-link>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Preview</th>
            </tr>
          </thead>
          <tbody>
            <!-- Table rows would be populated dynamically in a real app -->
            <tr>
              <td>Innovate Inc.</td>
              <td>
                <router-link
                  to="/dashboard/preview-sites/view/1"
                  class="preview-btn"
                >
                  <i class="fas fa-external-link-alt"></i>
                  Open Preview
                </router-link>
              </td>
            </tr>
            <tr>
              <td>TechSolutions</td>
              <td>
                <router-link
                  to="/dashboard/preview-sites/view/2"
                  class="preview-btn"
                >
                  <i class="fas fa-external-link-alt"></i>
                  Open Preview
                </router-link>
              </td>
            </tr>
            <tr>
              <td>GlobalTech</td>
              <td>
                <router-link
                  to="/dashboard/preview-sites/view/3"
                  class="preview-btn"
                >
                  <i class="fas fa-external-link-alt"></i>
                  Open Preview
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="dashboard-footer">
      <button
        class="refresh-btn"
        @click="fetchDashboardData"
      >
        <i class="fas fa-sync"></i>
        Refresh Dashboard
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "../stores/auth";

// State
const activityTimeframe = ref("week");
const isLoading = ref(true);
const dashboardStats = ref({
  totalScrapes: { count: 1245, change: 12 },
  previewSites: { count: 342, change: 8 },
  activeClients: { count: 56, change: 5 },
  revenue: { amount: 28450, change: 18 },
});
const authStore = useAuthStore();

// Methods
const setActivityTimeframe = (timeframe: string) => {
  activityTimeframe.value = timeframe;
  // In a real app, you would fetch new data based on the timeframe
};

const fetchDashboardData = async () => {
  try {
    isLoading.value = true;
    // In a real app, this would make an API call to your backend
    // const response = await axios.get('/api/analytics/dashboard');
    // dashboardStats.value = response.data.data;

    // For now, we'll use the mockup data
    setTimeout(() => {
      isLoading.value = false;
    }, 500);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    isLoading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  fetchDashboardData();
});
</script>

<style scoped>
.dashboard {
  width: 100%;
  padding: 20px;
  box-sizing: border-box;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 20px;
  position: relative;
}

.dashboard-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.welcome-text {
  color: #6b7280;
  position: absolute;
  top: 30px;
  left: 0;
  margin: 0;
}

.new-scrape-btn {
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
}

.new-scrape-btn i {
  margin-right: 8px;
}

.new-scrape-btn:hover {
  background-color: #4338ca;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
  margin-top: 40px;
  width: 100%;
}

.stats-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.stats-content {
  display: flex;
  flex-direction: column;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.stats-header h3 {
  font-size: 16px;
  font-weight: 500;
  color: #6b7280;
  margin: 0;
}

.stats-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.scrapes-icon {
  background-color: #e0e7ff;
  color: #4f46e5;
}

.preview-icon {
  background-color: #dcfce7;
  color: #10b981;
}

.clients-icon {
  background-color: #dbeafe;
  color: #3b82f6;
}

.revenue-icon {
  background-color: #fef3c7;
  color: #f59e0b;
}

.stats-value {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
}

.stats-trend {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.stats-trend.up {
  color: #10b981;
}

.stats-trend.down {
  color: #ef4444;
}

.stats-trend i {
  margin-right: 4px;
}

/* Activity Section */
.activity-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
  width: 100%;
}

.chart-card,
.activity-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.time-filters {
  display: flex;
  background-color: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}

.filter-btn {
  background: none;
  border: none;
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #6b7280;
}

.filter-btn.active {
  background-color: #4f46e5;
  color: white;
}

.chart-container {
  height: 300px;
  position: relative;
}

/* Placeholder chart (would be replaced with a real chart component) */
.placeholder-chart {
  height: 80%;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.chart-line {
  width: 40px;
  background-color: #818cf8;
  border-radius: 4px 4px 0 0;
}

.chart-legend {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin: 0 10px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  margin-right: 8px;
}

.legend-color.scrapes {
  background-color: #818cf8;
}

.legend-color.previews {
  background-color: #34d399;
}

/* Activity List */
.activity-list {
  max-height: 300px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
}

.scrape-icon {
  background-color: #e0e7ff;
  color: #4f46e5;
}

.activity-preview-icon {
  background-color: #dcfce7;
  color: #10b981;
}

.message-icon {
  background-color: #fef3c7;
  color: #f59e0b;
}

.complete-icon {
  background-color: #d1fae5;
  color: #059669;
}

.client-icon {
  background-color: #dbeafe;
  color: #3b82f6;
}

.activity-content {
  flex-grow: 1;
}

.activity-content h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px;
}

.activity-content p {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
}

.activity-time {
  font-size: 12px;
  color: #9ca3af;
}

/* Tables Section */
.tables-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
  width: 100%;
}

.table-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.view-all {
  color: #4f46e5;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 10px 16px;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 500;
  color: #6b7280;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
}

.data-table tr:last-child td {
  border-bottom: none;
}

.status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status.in-progress {
  background-color: #dbeafe;
  color: #3b82f6;
}

.status.completed {
  background-color: #d1fae5;
  color: #059669;
}

.status.pending {
  background-color: #fef3c7;
  color: #f59e0b;
}

.status.failed {
  background-color: #fee2e2;
  color: #ef4444;
}

.actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 14px;
}

.action-btn:hover {
  color: #4b5563;
}

.preview-btn {
  background-color: #f3f4f6;
  border: none;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 13px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.preview-btn i {
  margin-right: 6px;
}

.dashboard-footer {
  display: flex;
  justify-content: flex-end;
  width: 100%;
}

.refresh-btn {
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.refresh-btn i {
  margin-right: 8px;
}

/* Responsive */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .activity-section,
  .tables-section {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .welcome-text {
    position: static;
    margin: 8px 0 16px;
  }

  .new-scrape-btn {
    margin-top: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>