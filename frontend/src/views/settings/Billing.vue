<template>
  <div class="billing-settings">
    <div class="settings-header">
      <h1>Billing & Subscription</h1>
      <p class="subtitle">Manage your subscription plan and payment methods</p>
    </div>

    <div class="billing-container">
      <!-- Current Plan Section -->
      <div class="billing-section">
        <h2>Current Plan</h2>
        <div class="plan-card">
          <div class="plan-header">
            <div class="plan-name">{{ currentPlan.name }}</div>
            <div class="plan-price">
              <span class="price">${{ currentPlan.price }}</span>
              <span class="period">/month</span>
            </div>
          </div>
          <div class="plan-details">
            <div
              class="plan-feature"
              v-for="(feature, index) in currentPlan.features"
              :key="index"
            >
              <i class="fas fa-check"></i>
              <span>{{ feature }}</span>
            </div>
          </div>
          <div class="plan-actions">
            <button
              class="btn primary"
              @click="showUpgradeModal = true"
            >
              <i class="fas fa-arrow-up"></i>
              Upgrade Plan
            </button>
          </div>
        </div>
      </div>

      <!-- Payment Methods Section -->
      <div class="billing-section">
        <div class="section-header">
          <h2>Payment Methods</h2>
          <button
            class="btn secondary"
            @click="showAddPaymentModal = true"
          >
            <i class="fas fa-plus"></i>
            Add Payment Method
          </button>
        </div>

        <div class="payment-methods">
          <div
            v-if="paymentMethods.length === 0"
            class="no-payment-methods"
          >
            <p>You don't have any payment methods yet.</p>
          </div>

          <div
            v-else
            class="payment-method-list"
          >
            <div
              v-for="(method, index) in paymentMethods"
              :key="index"
              class="payment-method-item"
            >
              <div class="payment-method-icon">
                <i :class="getCardIcon(method.type)"></i>
              </div>
              <div class="payment-method-details">
                <div class="payment-method-name">{{ method.type }} •••• {{ method.last4 }}</div>
                <div class="payment-method-expiry">Expires {{ method.expMonth }}/{{ method.expYear }}</div>
              </div>
              <div class="payment-method-actions">
                <span
                  v-if="method.isDefault"
                  class="default-badge"
                >Default</span>
                <button
                  v-if="!method.isDefault"
                  class="action-btn"
                  @click="setDefaultPaymentMethod(index)"
                  title="Set as Default"
                >
                  <i class="fas fa-star"></i>
                </button>
                <button
                  class="action-btn delete"
                  @click="removePaymentMethod(index)"
                  title="Remove"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Billing History Section -->
      <div class="billing-section">
        <h2>Billing History</h2>

        <div class="billing-history">
          <div
            v-if="invoices.length === 0"
            class="no-invoices"
          >
            <p>No billing history available yet.</p>
          </div>

          <div
            v-else
            class="invoice-list"
          >
            <table class="invoice-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(invoice, index) in invoices"
                  :key="index"
                >
                  <td>{{ formatDate(invoice.date) }}</td>
                  <td>{{ invoice.description }}</td>
                  <td>${{ invoice.amount.toFixed(2) }}</td>
                  <td>
                    <span :class="['status-badge', invoice.status]">
                      {{ formatStatus(invoice.status) }}
                    </span>
                  </td>
                  <td>
                    <div class="invoice-actions">
                      <button
                        class="action-btn"
                        @click="downloadInvoice(invoice)"
                        title="Download Invoice"
                      >
                        <i class="fas fa-download"></i>
                      </button>
                      <button
                        class="action-btn"
                        @click="viewInvoice(invoice)"
                        title="View Invoice"
                      >
                        <i class="fas fa-eye"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Upgrade Plan Modal -->
    <div
      v-if="showUpgradeModal"
      class="modal-overlay"
    >
      <div class="modal-container">
        <div class="modal-header">
          <h2>Upgrade Your Plan</h2>
          <button
            class="close-btn"
            @click="showUpgradeModal = false"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="plans-grid">
            <div
              v-for="(plan, index) in availablePlans"
              :key="index"
              :class="['plan-option', { 'current': plan.name === currentPlan.name }]"
            >
              <div class="plan-option-header">
                <div class="plan-option-name">{{ plan.name }}</div>
                <div class="plan-option-price">
                  <span class="price">${{ plan.price }}</span>
                  <span class="period">/month</span>
                </div>
              </div>
              <div class="plan-option-details">
                <div
                  class="plan-option-feature"
                  v-for="(feature, featureIndex) in plan.features"
                  :key="featureIndex"
                >
                  <i class="fas fa-check"></i>
                  <span>{{ feature }}</span>
                </div>
              </div>
              <div class="plan-option-actions">
                <button
                  v-if="plan.name === currentPlan.name"
                  class="btn secondary"
                  disabled
                >
                  Current Plan
                </button>
                <button
                  v-else
                  class="btn primary"
                  @click="changePlan(plan)"
                >
                  Select Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Payment Method Modal -->
    <div
      v-if="showAddPaymentModal"
      class="modal-overlay"
    >
      <div class="modal-container">
        <div class="modal-header">
          <h2>Add Payment Method</h2>
          <button
            class="close-btn"
            @click="showAddPaymentModal = false"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form
            @submit.prevent="addPaymentMethod"
            class="payment-form"
          >
            <div class="form-group">
              <label for="card-name">Name on Card</label>
              <input
                type="text"
                id="card-name"
                v-model="paymentForm.name"
                placeholder="Enter name on card"
                required
              />
            </div>
            <div class="form-group">
              <label for="card-number">Card Number</label>
              <input
                type="text"
                id="card-number"
                v-model="paymentForm.number"
                placeholder="Enter card number"
                required
              />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="card-expiry">Expiration Date</label>
                <div class="expiry-inputs">
                  <input
                    type="text"
                    id="card-expiry-month"
                    v-model="paymentForm.expMonth"
                    placeholder="MM"
                    maxlength="2"
                    required
                  />
                  <span class="expiry-separator">/</span>
                  <input
                    type="text"
                    id="card-expiry-year"
                    v-model="paymentForm.expYear"
                    placeholder="YY"
                    maxlength="2"
                    required
                  />
                </div>
              </div>
              <div class="form-group">
                <label for="card-cvc">CVC</label>
                <input
                  type="text"
                  id="card-cvc"
                  v-model="paymentForm.cvc"
                  placeholder="CVC"
                  maxlength="4"
                  required
                />
              </div>
            </div>
            <div class="form-group">
              <div class="checkbox-item">
                <input
                  type="checkbox"
                  id="make-default"
                  v-model="paymentForm.makeDefault"
                />
                <label for="make-default">Make this my default payment method</label>
              </div>
            </div>
            <div class="form-actions">
              <button
                type="button"
                class="btn secondary"
                @click="showAddPaymentModal = false"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="btn primary"
              >
                <i class="fas fa-plus"></i>
                Add Payment Method
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";

// Current plan data
const currentPlan = reactive({
  name: "Professional",
  price: 49,
  features: [
    "Up to 1,000 scrapes per month",
    "10 preview sites",
    "Email support",
    "API access",
  ],
});

// Available plans
const availablePlans = [
  {
    name: "Starter",
    price: 19,
    features: [
      "Up to 100 scrapes per month",
      "3 preview sites",
      "Email support",
      "Basic analytics",
    ],
  },
  {
    name: "Professional",
    price: 49,
    features: [
      "Up to 1,000 scrapes per month",
      "10 preview sites",
      "Email support",
      "API access",
    ],
  },
  {
    name: "Business",
    price: 99,
    features: [
      "Up to 5,000 scrapes per month",
      "Unlimited preview sites",
      "Priority support",
      "Advanced analytics",
      "Team collaboration",
    ],
  },
];

// Payment methods
const paymentMethods = ref([
  {
    type: "Visa",
    last4: "4242",
    expMonth: "12",
    expYear: "24",
    isDefault: true,
  },
  {
    type: "Mastercard",
    last4: "5555",
    expMonth: "09",
    expYear: "25",
    isDefault: false,
  },
]);

// Invoices
const invoices = ref([
  {
    date: new Date("2023-05-01"),
    description: "Professional Plan - Monthly",
    amount: 49.0,
    status: "paid",
  },
  {
    date: new Date("2023-04-01"),
    description: "Professional Plan - Monthly",
    amount: 49.0,
    status: "paid",
  },
  {
    date: new Date("2023-03-01"),
    description: "Starter Plan - Monthly",
    amount: 19.0,
    status: "paid",
  },
]);

// Modals
const showUpgradeModal = ref(false);
const showAddPaymentModal = ref(false);

// Payment form
const paymentForm = reactive({
  name: "",
  number: "",
  expMonth: "",
  expYear: "",
  cvc: "",
  makeDefault: false,
});

// Methods
const getCardIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "visa":
      return "fab fa-cc-visa";
    case "mastercard":
      return "fab fa-cc-mastercard";
    case "amex":
      return "fab fa-cc-amex";
    case "discover":
      return "fab fa-cc-discover";
    default:
      return "fas fa-credit-card";
  }
};

const setDefaultPaymentMethod = (index: number) => {
  paymentMethods.value.forEach((method, i) => {
    method.isDefault = i === index;
  });
  alert("Default payment method updated");
};

const removePaymentMethod = (index: number) => {
  if (paymentMethods.value[index].isDefault) {
    alert(
      "You cannot remove your default payment method. Please set another payment method as default first."
    );
    return;
  }

  if (confirm("Are you sure you want to remove this payment method?")) {
    paymentMethods.value.splice(index, 1);
    alert("Payment method removed");
  }
};

const formatDate = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const downloadInvoice = (invoice: any) => {
  // In a real app, this would download the invoice PDF
  console.log("Downloading invoice:", invoice);
  alert(`Invoice for ${invoice.description} downloaded`);
};

const viewInvoice = (invoice: any) => {
  // In a real app, this would open the invoice in a new tab
  console.log("Viewing invoice:", invoice);
  alert(`Viewing invoice for ${invoice.description}`);
};

const changePlan = (plan: any) => {
  if (confirm(`Are you sure you want to change to the ${plan.name} plan?`)) {
    currentPlan.name = plan.name;
    currentPlan.price = plan.price;
    currentPlan.features = [...plan.features];
    showUpgradeModal.value = false;
    alert(`Your plan has been updated to ${plan.name}`);
  }
};

const addPaymentMethod = () => {
  // In a real app, this would call an API to add the payment method
  console.log("Adding payment method:", paymentForm);

  // Validate card number (simple validation for demo)
  if (paymentForm.number.length < 13 || paymentForm.number.length > 19) {
    alert("Please enter a valid card number");
    return;
  }

  // Add the new payment method
  const newMethod = {
    type: detectCardType(paymentForm.number),
    last4: paymentForm.number.slice(-4),
    expMonth: paymentForm.expMonth,
    expYear: paymentForm.expYear,
    isDefault: paymentForm.makeDefault,
  };

  // If this is set as default, update other methods
  if (newMethod.isDefault) {
    paymentMethods.value.forEach((method) => {
      method.isDefault = false;
    });
  }

  paymentMethods.value.push(newMethod);

  // Reset form and close modal
  paymentForm.name = "";
  paymentForm.number = "";
  paymentForm.expMonth = "";
  paymentForm.expYear = "";
  paymentForm.cvc = "";
  paymentForm.makeDefault = false;
  showAddPaymentModal.value = false;

  alert("Payment method added successfully");
};

const detectCardType = (number: string) => {
  // Simple detection based on first digit
  const firstDigit = number.charAt(0);
  if (firstDigit === "4") return "Visa";
  if (firstDigit === "5") return "Mastercard";
  if (firstDigit === "3") return "Amex";
  if (firstDigit === "6") return "Discover";
  return "Card";
};
</script>

<style scoped>
.billing-settings {
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

.billing-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.billing-section {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.billing-section h2 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h2 {
  margin: 0;
}

.plan-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.plan-name {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.plan-price {
  display: flex;
  align-items: baseline;
}

.price {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.period {
  font-size: 14px;
  color: #6b7280;
  margin-left: 4px;
}

.plan-details {
  padding: 16px;
}

.plan-feature {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.plan-feature i {
  color: #10b981;
}

.plan-actions {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
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

/* Payment methods styles */
.payment-methods {
  margin-top: 16px;
}

.no-payment-methods {
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 6px;
  text-align: center;
  color: #6b7280;
}

.payment-method-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 12px;
}

.payment-method-icon {
  font-size: 24px;
  margin-right: 16px;
}

.payment-method-icon .fa-cc-visa {
  color: #1a1f71;
}

.payment-method-icon .fa-cc-mastercard {
  color: #eb001b;
}

.payment-method-icon .fa-cc-amex {
  color: #006fcf;
}

.payment-method-icon .fa-cc-discover {
  color: #ff6000;
}

.payment-method-details {
  flex: 1;
}

.payment-method-name {
  font-weight: 500;
  color: #111827;
  margin-bottom: 4px;
}

.payment-method-expiry {
  font-size: 14px;
  color: #6b7280;
}

.payment-method-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.default-badge {
  padding: 4px 8px;
  background-color: #e0e7ff;
  color: #4f46e5;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
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

/* Invoice styles */
.no-invoices {
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 6px;
  text-align: center;
  color: #6b7280;
}

.invoice-table {
  width: 100%;
  border-collapse: collapse;
}

.invoice-table th,
.invoice-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.invoice-table th {
  background-color: #f9fafb;
  font-weight: 600;
  color: #374151;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.paid {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.pending {
  background-color: #fef3c7;
  color: #92400e;
}

.status-badge.failed {
  background-color: #fee2e2;
  color: #b91c1c;
}

.invoice-actions {
  display: flex;
  gap: 8px;
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
  width: 600px;
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

/* Plans grid */
.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.plan-option {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
}

.plan-option:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.plan-option.current {
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.2);
}

.plan-option-header {
  padding: 16px;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.plan-option-name {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 8px;
}

.plan-option-price {
  display: flex;
  align-items: baseline;
}

.plan-option-details {
  padding: 16px;
}

.plan-option-feature {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
}

.plan-option-feature i {
  color: #10b981;
}

.plan-option-actions {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: center;
}

/* Payment form */
.payment-form {
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

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row .form-group {
  flex: 1;
}

.expiry-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.expiry-inputs input {
  width: 50px;
  text-align: center;
}

.expiry-separator {
  color: #6b7280;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 16px;
  }

  .plans-grid {
    grid-template-columns: 1fr;
  }
}
</style>