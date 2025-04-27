<template>
  <div class="team-settings">
    <div class="settings-header">
      <h1>Team Management</h1>
      <p class="subtitle">Manage your team members and their permissions</p>
    </div>

    <div class="team-container">
      <div class="team-actions">
        <button
          class="btn primary"
          @click="showInviteModal = true"
        >
          <i class="fas fa-user-plus"></i>
          Invite Team Member
        </button>
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Search team members..."
          />
        </div>
      </div>

      <div class="team-list">
        <table class="team-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="member in filteredMembers"
              :key="member.id"
            >
              <td class="member-info">
                <div class="member-avatar">
                  {{ getInitials(member.name) }}
                </div>
                <div class="member-name">{{ member.name }}</div>
              </td>
              <td>{{ member.email }}</td>
              <td>
                <select
                  v-model="member.role"
                  @change="updateMemberRole(member)"
                  :disabled="member.isOwner || !canManageRoles"
                >
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
              </td>
              <td>
                <span :class="['status-badge', member.status]">
                  {{ formatStatus(member.status) }}
                </span>
              </td>
              <td>
                <div class="member-actions">
                  <button
                    v-if="member.status === 'pending'"
                    class="action-btn"
                    @click="resendInvite(member)"
                    title="Resend Invite"
                  >
                    <i class="fas fa-paper-plane"></i>
                  </button>
                  <button
                    v-if="!member.isOwner && canManageTeam"
                    class="action-btn delete"
                    @click="removeMember(member)"
                    title="Remove Member"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="team-info">
        <div class="info-card">
          <h3>Team Roles</h3>
          <div class="role-info">
            <div class="role-item">
              <h4>Owner</h4>
              <p>Full access to all features and settings. Can manage team members and billing.</p>
            </div>
            <div class="role-item">
              <h4>Admin</h4>
              <p>Can manage most settings and features. Can invite team members but cannot change the owner.</p>
            </div>
            <div class="role-item">
              <h4>Editor</h4>
              <p>Can create and edit scraping jobs and preview sites. Cannot access billing or team settings.</p>
            </div>
            <div class="role-item">
              <h4>Viewer</h4>
              <p>Read-only access to scraping jobs and preview sites. Cannot make any changes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Invite Modal -->
    <div
      v-if="showInviteModal"
      class="modal-overlay"
    >
      <div class="modal-container">
        <div class="modal-header">
          <h2>Invite Team Member</h2>
          <button
            class="close-btn"
            @click="showInviteModal = false"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form
            @submit.prevent="sendInvite"
            class="invite-form"
          >
            <div class="form-group">
              <label for="invite-email">Email Address</label>
              <input
                type="email"
                id="invite-email"
                v-model="inviteForm.email"
                placeholder="Enter email address"
                required
              />
            </div>
            <div class="form-group">
              <label for="invite-role">Role</label>
              <select
                id="invite-role"
                v-model="inviteForm.role"
                required
              >
                <option value="admin">Admin</option>
                <option value="editor">Editor</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>
            <div class="form-group">
              <label for="invite-message">Message (Optional)</label>
              <textarea
                id="invite-message"
                v-model="inviteForm.message"
                placeholder="Add a personal message to the invitation email"
                rows="3"
              ></textarea>
            </div>
            <div class="form-actions">
              <button
                type="button"
                class="btn secondary"
                @click="showInviteModal = false"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn primary"
              >
                <i class="fas fa-paper-plane"></i>
                Send Invitation
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from "vue";

// Mock team members data
const teamMembers = ref([
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    role: "owner",
    status: "active",
    isOwner: true,
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "admin",
    status: "active",
    isOwner: false,
  },
  {
    id: 3,
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    role: "editor",
    status: "active",
    isOwner: false,
  },
  {
    id: 4,
    name: "Alice Williams",
    email: "alice.williams@example.com",
    role: "viewer",
    status: "active",
    isOwner: false,
  },
  {
    id: 5,
    name: "Charlie Brown",
    email: "charlie.brown@example.com",
    role: "editor",
    status: "pending",
    isOwner: false,
  },
]);

// Current user role (for permission checks)
const currentUserRole = ref("owner");

// Computed permissions
const canManageTeam = computed(() => {
  return ["owner", "admin"].includes(currentUserRole.value);
});

const canManageRoles = computed(() => {
  return ["owner", "admin"].includes(currentUserRole.value);
});

// Search functionality
const searchQuery = ref("");

const filteredMembers = computed(() => {
  if (!searchQuery.value) {
    return teamMembers.value;
  }

  const query = searchQuery.value.toLowerCase();
  return teamMembers.value.filter((member) => {
    return (
      member.name.toLowerCase().includes(query) ||
      member.email.toLowerCase().includes(query) ||
      member.role.toLowerCase().includes(query)
    );
  });
});

// Invite modal
const showInviteModal = ref(false);
const inviteForm = reactive({
  email: "",
  role: "editor",
  message: "",
});

// Methods
const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
};

const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const updateMemberRole = (member: any) => {
  // In a real app, this would call an API to update the member's role
  console.log(`Updating ${member.name}'s role to ${member.role}`);
  alert(`${member.name}'s role updated to ${formatRole(member.role)}`);
};

const formatRole = (role: string) => {
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const resendInvite = (member: any) => {
  // In a real app, this would call an API to resend the invitation
  console.log(`Resending invitation to ${member.email}`);
  alert(`Invitation resent to ${member.email}`);
};

const removeMember = (member: any) => {
  if (
    confirm(`Are you sure you want to remove ${member.name} from the team?`)
  ) {
    // In a real app, this would call an API to remove the member
    console.log(`Removing ${member.name} from the team`);
    const index = teamMembers.value.findIndex((m) => m.id === member.id);
    if (index !== -1) {
      teamMembers.value.splice(index, 1);
    }
    alert(`${member.name} has been removed from the team`);
  }
};

const sendInvite = () => {
  // In a real app, this would call an API to send the invitation
  console.log("Sending invitation:", inviteForm);

  // Add the new member to the list
  const newMember = {
    id: teamMembers.value.length + 1,
    name: inviteForm.email.split("@")[0], // Use part of email as name until they accept
    email: inviteForm.email,
    role: inviteForm.role,
    status: "pending",
    isOwner: false,
  };

  teamMembers.value.push(newMember);

  // Reset form and close modal
  inviteForm.email = "";
  inviteForm.role = "editor";
  inviteForm.message = "";
  showInviteModal.value = false;

  alert(`Invitation sent to ${newMember.email}`);
};
</script>

<style scoped>
.team-settings {
  width: 100%;
  padding: 20px;
}

.settings-header {
  margin-bottom: 24px;
}

.settings-header h1 {
  margin-bottom: 8px;
  font-size: 24px;
  font-weight: 600;
  color: #111827;
}

.subtitle {
  color: #6b7280;
  font-size: 16px;
}

.team-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.team-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s;
}

.btn.primary {
  background-color: #4f46e5;
  color: white;
}

.btn.primary:hover {
  background-color: #4338ca;
}

.btn.secondary {
  background-color: #e5e7eb;
  color: #374151;
}

.btn.secondary:hover {
  background-color: #d1d5db;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 12px;
  width: 300px;
}

.search-box i {
  color: #9ca3af;
  margin-right: 8px;
}

.search-box input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 14px;
}

.team-list {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.team-table {
  width: 100%;
  border-collapse: collapse;
}

.team-table th,
.team-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.team-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.member-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #4f46e5;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.member-name {
  font-weight: 500;
  color: #111827;
}

.team-table select {
  padding: 6px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: white;
  font-size: 14px;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.pending {
  background-color: #fef3c7;
  color: #92400e;
}

.member-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background-color: #e5e7eb;
  color: #374151;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: #d1d5db;
}

.action-btn.delete {
  color: #ef4444;
}

.action-btn.delete:hover {
  background-color: #fee2e2;
}

.team-info {
  margin-top: 24px;
}

.info-card {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px;
}

.info-card h3 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 8px;
}

.role-info {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.role-item h4 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 500;
  color: #111827;
}

.role-item p {
  margin: 0;
  font-size: 14px;
  color: #4b5563;
  line-height: 1.5;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 500px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.close-btn {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  font-size: 18px;
}

.close-btn:hover {
  color: #111827;
}

.modal-body {
  padding: 16px;
}

.invite-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .team-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }

  .search-box {
    width: 100%;
  }

  .role-info {
    grid-template-columns: 1fr;
  }
}
</style>