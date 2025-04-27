<template>
  <div class="home">
    <nav class="navbar">
      <div class="container">
        <div class="navbar-brand">
          <router-link
            to="/"
            class="navbar-logo"
          >
            <img
              src="@/assets/logo.svg"
              alt="Logo"
            />
            <span>ScrapePro</span>
          </router-link>
        </div>

        <div class="navbar-links">
          <router-link
            to="/"
            class="nav-link"
          >Home</router-link>
          <router-link
            to="/features"
            class="nav-link"
          >Features</router-link>
          <router-link
            to="/pricing"
            class="nav-link"
          >Pricing</router-link>
        </div>

        <div class="navbar-auth">
          <router-link
            to="/auth/login"
            class="auth-button login"
          >Login</router-link>
          <router-link
            to="/auth/register"
            class="auth-button register"
          >Register</router-link>
        </div>
      </div>
    </nav>

    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1>Transform Your Web Data Collection</h1>
          <p>Powerful, reliable web scraping with beautiful preview sites. Get the data you need, presented the way you want.</p>
          <div class="hero-buttons">
            <router-link
              to="/auth/register"
              class="btn btn-primary"
            >Get Started</router-link>
            <a
              href="#features"
              class="btn btn-outline"
            >Learn More</a>
          </div>
        </div>
        <div class="hero-image">
          <img
            src="@/assets/hero-image.svg"
            alt="ScrapePro Dashboard"
          />
        </div>
      </div>
    </section>

    <section
      id="features"
      class="features"
    >
      <div class="container">
        <h2 class="section-title">Why Choose ScrapePro?</h2>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-bolt"></i>
            </div>
            <h3>Powerful Scraping</h3>
            <p>Extract data from any website with our robust scraping engine, designed to handle complex sites and anti-scraping measures.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-desktop"></i>
            </div>
            <h3>Beautiful Preview Sites</h3>
            <p>Present scraped data in customizable, responsive preview sites that impress clients and stakeholders.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-tools"></i>
            </div>
            <h3>Visual Builder</h3>
            <p>No coding required. Design scrapes and preview sites with our intuitive visual builder tools.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-clock"></i>
            </div>
            <h3>Scheduled Scraping</h3>
            <p>Set it and forget it. Schedule recurring scrapes and automatically update your preview sites.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-shield-alt"></i>
            </div>
            <h3>Enterprise Security</h3>
            <p>Your data is protected with enterprise-grade security and compliance measures.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <h3>Advanced Analytics</h3>
            <p>Gain insights from your data with built-in analytics and visualization tools.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="cta">
      <div class="container">
        <h2>Ready to transform your data collection?</h2>
        <p>Join thousands of businesses that rely on ScrapePro for their web data needs.</p>
        <a
          href="/auth/register"
          class="btn btn-primary"
        >Get Started Free</a>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
// No imports needed
</script>

<style scoped>
.home {
  min-height: 100vh;
  overflow-x: hidden;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Navbar styles */
.navbar {
  position: relative;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.navbar .container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 70px;
}

.navbar-brand {
  display: flex;
  align-items: center;
}

.navbar-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #333;
  font-weight: 600;
  font-size: 1.25rem;
}

.navbar-logo img {
  height: 30px;
  margin-right: 0.5rem;
}

.navbar-links {
  display: flex;
  margin: 0 1rem;
}

.nav-link {
  color: #555;
  text-decoration: none;
  padding: 0.5rem 1rem;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #4c6ef5;
}

.navbar-auth {
  display: flex;
  align-items: center;
}

.auth-button {
  padding: 0.5rem 1.25rem;
  border-radius: 4px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
}

.auth-button.login {
  color: #4c6ef5;
  margin-right: 0.75rem;
}

.auth-button.login:hover {
  background-color: rgba(76, 110, 245, 0.1);
}

.auth-button.register {
  background-color: #4c6ef5;
  color: white;
}

.auth-button.register:hover {
  background-color: #3a56d4;
}

/* Hero section */
.hero {
  padding: 6rem 0 4rem;
  background-color: #f8fafc;
}

.hero .container {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.hero-content {
  flex: 1;
}

.hero-content h1 {
  font-size: 3rem;
  line-height: 1.2;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: #1e293b;
}

.hero-content p {
  font-size: 1.25rem;
  line-height: 1.6;
  color: #64748b;
  margin-bottom: 2rem;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 0.375rem;
  font-weight: 500;
  text-align: center;
  transition: all 0.2s;
}

.btn-primary {
  background-color: #4c6ef5;
  color: white;
  border: 1px solid #4c6ef5;
}

.btn-primary:hover {
  background-color: #3a56d4;
}

.btn-outline {
  background-color: transparent;
  color: #4c6ef5;
  border: 1px solid #4c6ef5;
}

.btn-outline:hover {
  background-color: rgba(76, 110, 245, 0.05);
}

.hero-image {
  flex: 1;
  display: flex;
  justify-content: center;
}

.hero-image img {
  max-width: 100%;
  height: auto;
}

.section-title {
  text-align: center;
  font-size: 2.25rem;
  margin-bottom: 3rem;
  color: #1e293b;
}

.features {
  padding: 5rem 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background-color: white;
  border-radius: 0.5rem;
  padding: 2rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: transform 0.2s, box-shadow 0.2s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.feature-icon {
  width: 60px;
  height: 60px;
  background-color: rgba(76, 110, 245, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: #4c6ef5;
  font-size: 1.5rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  margin-bottom: 1rem;
  color: #1e293b;
}

.feature-card p {
  color: #64748b;
  line-height: 1.6;
}

.cta {
  background-color: #4c6ef5;
  color: white;
  padding: 5rem 0;
  text-align: center;
}

.cta h2 {
  font-size: 2.25rem;
  color: white;
  margin-bottom: 1rem;
}

.cta p {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.cta .btn-primary {
  background-color: white;
  color: #4c6ef5;
  border-color: white;
  font-size: 1.125rem;
  padding: 0.875rem 2rem;
}

.cta .btn-primary:hover {
  background-color: rgba(255, 255, 255, 0.9);
}

@media (max-width: 992px) {
  .hero .container {
    flex-direction: column;
    text-align: center;
  }

  .hero-content h1 {
    font-size: 2.5rem;
  }

  .hero-buttons {
    justify-content: center;
  }

  .features-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .navbar-links {
    display: none;
  }
}
</style>