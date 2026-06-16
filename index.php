<?php
session_start();
if (isset($_SESSION['aether_session_token'])) {
    header("Location: dashboard.php");
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IT Wall to Wall Asset Inventory - Sign In</title>
  <meta name="description" content="Sign in to the IT Wall to Wall Asset Inventory monitoring system.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    /* =============================================
       CONCENTRIX OFFICIAL BRAND COLORS LOGIN PAGE
       Blue: #003D5B | Turquoise: #25E2CC
       ============================================= */
    *, *::before, *::after {
      margin: 0; padding: 0; box-sizing: border-box;
    }

    :root {
      /* Official Concentrix Brand Colors */
      --cnx-blue:        #003D5B;   /* Concentrix Blue (official) */
      --cnx-blue-deep:   #002535;   /* Deeper navy */
      --cnx-blue-light:  #005070;   /* Lighter navy */
      --cnx-teal:        #25E2CC;   /* Concentrix Turquoise (official) */
      --cnx-teal-dark:   #1ABCAA;   /* Turquoise hover */
      --cnx-teal-faint:  #E0FAF7;   /* Turquoise very light tint */
      --cnx-white:       #FFFFFF;
      --cnx-panel-bg:    #F3FBFA;   /* Right panel: teal-tinted off-white */
      --cnx-gray-50:     #EAF5F4;
      --cnx-gray-100:    #D0ECEB;
      --cnx-gray-200:    #A8D8D5;
      --cnx-gray-400:    #5B8F8C;
      --cnx-gray-600:    #2E5F5C;
      --cnx-gray-800:    #002535;
      --cnx-error:       #C62828;
      --font: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      --radius: 10px;
      --transition: all 0.22s cubic-bezier(.4,0,.2,1);
    }

    html, body {
      height: 100%;
      font-family: var(--font);
      -webkit-font-smoothing: antialiased;
      background: var(--cnx-blue-deep);
      overflow: hidden;
    }

    /* =============================================
       FULL-PAGE SPLIT LAYOUT
       ============================================= */
    .page-wrapper {
      display: flex;
      height: 100vh;
      width: 100vw;
      overflow: hidden;
    }

    /* =============================================
       LEFT PANEL - Brand Identity
       ============================================= */
    .left-panel {
      flex: 1.1;
      background: linear-gradient(155deg, #002535 0%, #003D5B 45%, #005070 80%, #002D48 100%);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      padding: 60px 56px;
      position: relative;
      overflow: hidden;
    }

    /* Concentric circles — Concentrix signature motif */
    .circles-decor {
      position: absolute;
      top: 50%;
      right: -120px;
      transform: translateY(-50%);
      width: 600px;
      height: 600px;
      pointer-events: none;
    }

    .circle-ring {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      border-radius: 50%;
    }

    .circle-ring:nth-child(1) { width: 140px; height: 140px; border: 2px solid rgba(37,226,204,0.65); }
    .circle-ring:nth-child(2) { width: 240px; height: 240px; border: 1.5px solid rgba(37,226,204,0.35); }
    .circle-ring:nth-child(3) { width: 350px; height: 350px; border: 1.5px solid rgba(37,226,204,0.18); }
    .circle-ring:nth-child(4) { width: 460px; height: 460px; border: 1px solid rgba(37,226,204,0.08); }
    .circle-ring:nth-child(5) { width: 580px; height: 580px; border: 1px solid rgba(255,255,255,0.04); }

    /* Pulsing turquoise center dot */
    .accent-dot {
      position: absolute;
      width: 14px;
      height: 14px;
      background: var(--cnx-teal);
      border-radius: 50%;
      top: 50%;
      right: -124px;
      transform: translateY(-50%);
      box-shadow: 0 0 28px rgba(37,226,204,0.9);
      animation: pulse-dot 3s ease-in-out infinite;
    }

    @keyframes pulse-dot {
      0%, 100% { transform: translateY(-50%) scale(1);   box-shadow: 0 0 28px rgba(37,226,204,0.9); }
      50%       { transform: translateY(-50%) scale(1.5); box-shadow: 0 0 55px rgba(37,226,204,1); }
    }

    /* Top-right turquoise glow */
    .glow-blob {
      position: absolute;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(37,226,204,0.15) 0%, rgba(37,226,204,0.04) 55%, transparent 70%);
      top: -90px;
      right: 10px;
      border-radius: 50%;
      pointer-events: none;
    }

    /* Bottom-left blue glow */
    .glow-blob-2 {
      position: absolute;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(37,226,204,0.08) 0%, transparent 70%);
      bottom: -70px;
      left: -50px;
      border-radius: 50%;
      pointer-events: none;
    }

    .left-content {
      position: relative;
      z-index: 2;
      max-width: 480px;
    }

    /* Logo area */
    .brand-logo-wrap {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 56px;
    }

    .brand-logo-img {
      width: 52px;
      height: 52px;
      object-fit: contain;
      filter: brightness(0) invert(1);
    }

    .brand-logo-text {
      font-size: 18px;
      font-weight: 700;
      color: rgba(255,255,255,0.92);
      letter-spacing: -0.3px;
    }

    /* Main headline */
    .left-headline {
      font-size: 40px;
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.2;
      letter-spacing: -1px;
      margin-bottom: 20px;
    }

    .left-headline .highlight {
      color: var(--cnx-teal);
    }

    .left-subtitle {
      font-size: 15px;
      color: rgba(255,255,255,0.60);
      line-height: 1.7;
      margin-bottom: 48px;
      font-weight: 400;
    }

    /* Feature list */
    .feature-list {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .feature-icon {
      width: 34px;
      height: 34px;
      background: rgba(37,226,204,0.10);
      border: 1px solid rgba(37,226,204,0.40);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: var(--cnx-teal);
    }

    .feature-text {
      font-size: 14px;
      color: rgba(255,255,255,0.70);
      font-weight: 400;
    }

    /* Left panel footer */
    .left-footer {
      position: absolute;
      bottom: 32px;
      left: 56px;
      right: 56px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .left-footer-copy {
      font-size: 12px;
      color: rgba(255,255,255,0.28);
    }

    .cnx-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      color: rgba(255,255,255,0.35);
      font-weight: 500;
    }

    .cnx-badge-dot {
      width: 6px;
      height: 6px;
      background: var(--cnx-teal);
      border-radius: 50%;
      box-shadow: 0 0 6px rgba(37,226,204,0.8);
    }

    /* =============================================
       RIGHT PANEL - Login Form
       ============================================= */
    .right-panel {
      width: 480px;
      flex-shrink: 0;
      background: var(--cnx-panel-bg);
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 56px 52px;
      position: relative;
      overflow-y: auto;
      box-shadow: -8px 0 40px rgba(0,37,53,0.20);
    }

    /* Animated Blue → Turquoise → Blue top stripe */
    .right-panel::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0;
      height: 5px;
      background: linear-gradient(90deg, #003D5B 0%, #25E2CC 50%, #003D5B 100%);
      background-size: 200% 100%;
      animation: stripe-slide 4s linear infinite;
    }

    @keyframes stripe-slide {
      0%   { background-position: 0% 0%; }
      100% { background-position: 200% 0%; }
    }

    .form-section-label {
      font-size: 11px;
      font-weight: 700;
      color: var(--cnx-blue);
      letter-spacing: 2px;
      text-transform: uppercase;
      margin-bottom: 10px;
    }

    .form-title {
      font-size: 28px;
      font-weight: 800;
      color: var(--cnx-blue-deep);
      letter-spacing: -0.6px;
      margin-bottom: 6px;
    }

    .form-subtitle {
      font-size: 14px;
      color: var(--cnx-gray-400);
      margin-bottom: 36px;
      line-height: 1.5;
    }

    /* Alert */
    .alert-banner {
      display: none;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 22px;
      font-size: 13px;
      font-weight: 500;
    }
    .alert-danger {
      background: #FFF3F3;
      border: 1px solid #FFBABA;
      color: var(--cnx-error);
    }

    /* Form groups */
    .form-group {
      margin-bottom: 20px;
    }

    .form-label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: var(--cnx-blue);
      margin-bottom: 7px;
      letter-spacing: 0.1px;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon-left {
      position: absolute;
      left: 14px;
      color: var(--cnx-gray-400);
      pointer-events: none;
    }

    .input-field {
      width: 100%;
      padding: 13px 14px 13px 42px;
      background: #FFFFFF;
      border: 1.5px solid var(--cnx-gray-100);
      border-radius: 8px;
      color: var(--cnx-gray-800);
      font-size: 14px;
      font-family: var(--font);
      outline: none;
      transition: var(--transition);
      box-shadow: 0 1px 4px rgba(0,61,91,0.06);
    }

    .input-field::placeholder { color: var(--cnx-gray-400); }

    .input-field:focus {
      background: #FFFFFF;
      border-color: var(--cnx-teal);
      box-shadow: 0 0 0 3px rgba(37,226,204,0.22);
    }

    .btn-toggle-password {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      color: var(--cnx-gray-400);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      transition: color 0.15s;
    }
    .btn-toggle-password:hover { color: var(--cnx-blue); }

    /* Form meta row */
    .form-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 28px;
    }

    .remember-me {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      color: var(--cnx-gray-600);
      cursor: pointer;
      user-select: none;
    }

    .remember-me input[type="checkbox"] {
      width: 16px;
      height: 16px;
      accent-color: var(--cnx-blue);
      cursor: pointer;
    }

    .forgot-link {
      font-size: 13px;
      color: var(--cnx-blue);
      text-decoration: none;
      font-weight: 600;
      transition: color 0.15s;
    }
    .forgot-link:hover { color: var(--cnx-teal-dark); }

    /* CTA Button — Official Concentrix Blue → Turquoise */
    .btn-primary {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, var(--cnx-blue) 0%, var(--cnx-teal) 100%);
      border: none;
      border-radius: 8px;
      color: #FFFFFF;
      font-size: 15px;
      font-weight: 700;
      font-family: var(--font);
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      transition: var(--transition);
      box-shadow: 0 4px 20px rgba(37,226,204,0.30);
      letter-spacing: 0.3px;
      position: relative;
      overflow: hidden;
    }

    .btn-primary::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, var(--cnx-teal) 0%, var(--cnx-blue) 100%);
      opacity: 0;
      transition: opacity 0.22s ease;
    }

    .btn-primary:hover::after { opacity: 1; }

    .btn-primary span, .btn-primary .spinner {
      position: relative; z-index: 1;
    }

    .btn-primary:hover {
      box-shadow: 0 8px 30px rgba(37,226,204,0.50);
      transform: translateY(-1px);
    }

    .btn-primary:active {
      transform: translateY(0);
      box-shadow: 0 2px 10px rgba(0,61,91,0.25);
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2.5px solid rgba(255,255,255,0.35);
      border-top-color: #FFF;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
      display: none;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    /* Sign up link */
    .signup-redirect {
      text-align: center;
      margin-top: 28px;
      font-size: 13.5px;
      color: var(--cnx-gray-400);
    }

    .signup-redirect a {
      color: var(--cnx-blue);
      font-weight: 700;
      text-decoration: none;
      margin-left: 4px;
      transition: color 0.15s;
    }

    .signup-redirect a:hover { color: var(--cnx-teal-dark); }

    /* Right panel footer */
    .right-footer {
      position: absolute;
      bottom: 24px;
      left: 52px;
      right: 52px;
      text-align: center;
      font-size: 11.5px;
      color: var(--cnx-gray-400);
    }

    /* Responsive */
    @media (max-width: 860px) {
      .left-panel { display: none; }
      .right-panel { width: 100%; padding: 40px 28px; }
    }
  </style>
</head>
<body>

  <div class="page-wrapper">

    <!-- ========================
         LEFT PANEL
         ======================== -->
    <div class="left-panel">
      <!-- Background decor -->
      <div class="glow-blob"></div>
      <div class="glow-blob-2"></div>
      <div class="circles-decor">
        <div class="circle-ring"></div>
        <div class="circle-ring"></div>
        <div class="circle-ring"></div>
        <div class="circle-ring"></div>
        <div class="circle-ring"></div>
      </div>
      <div class="accent-dot"></div>

      <div class="left-content">
        <!-- Brand Logo -->
        <div class="brand-logo-wrap">
          <img src="logo.png" alt="Logo" class="brand-logo-img">
          <span class="brand-logo-text">Concentrix UP 2 IT Operations</span>
        </div>

        <!-- Headline -->
        <h1 class="left-headline">
       IT Wall to Wall Monitoring and Inventory System<br>
          <span class="highlight">Efficient. Reliable.</span>
        </h1>
        <p class="left-subtitle">
          A centralized platform to track, manage, and monitor all IT assets across every station — in real time.
        </p>

        <!-- Feature list -->
        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <span class="feature-text">Real-time asset inventory tracking per station</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <span class="feature-text">Role-based secure access control</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            </div>
            <span class="feature-text">Exportable CSV reports and live data grid</span>
          </div>
        </div>
      </div>

      <!-- Left footer -->
      <div class="left-footer">
        <span class="left-footer-copy">© 2026 Wall to Wall IT Systems</span>
        <div class="cnx-badge">
          <span class="cnx-badge-dot"></span>
          Created by Dominic Carreon (IT Representative)
        </div>
      </div>
    </div>

    <!-- ========================
         RIGHT PANEL (Login Form)
         ======================== -->
    <div class="right-panel">

      <div class="form-section-label">Secure Portal</div>
      <h2 class="form-title">Welcome back</h2>
      <p class="form-subtitle">Sign in to your account to continue to the dashboard.</p>

      <!-- Error Alert -->
      <div class="alert-banner alert-danger" id="login-error-alert">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span id="login-error-message">Invalid credentials. Please try again.</span>
      </div>

      <!-- Login Form -->
      <form id="login-form" autocomplete="off">

        <div class="form-group">
          <label for="email" class="form-label">Email or Username</label>
          <div class="input-wrapper">
            <svg class="input-icon-left" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <input
              type="text"
              id="email"
              class="input-field"
              placeholder="Enter email or username"
              required
              autocomplete="username"
            >
          </div>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <div class="input-wrapper">
            <svg class="input-icon-left" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input
              type="password"
              id="password"
              class="input-field"
              placeholder="Enter your password"
              required
              autocomplete="current-password"
            >
            <button type="button" class="btn-toggle-password" id="toggle-password-btn" title="Toggle visibility">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>

        <div class="form-actions">
          <label class="remember-me">
            <input type="checkbox" id="remember-me">
            <span>Remember me</span>
          </label>
          <a href="#" class="forgot-link" id="forgot-password-link">Forgot password?</a>
        </div>

        <button type="submit" class="btn-primary" id="btn-login-submit">
          <span class="btn-text">Sign In</span>
          <div class="spinner" id="login-spinner"></div>
        </button>

      </form>

      <!-- Sign-up redirect -->
      <div class="signup-redirect">
        Don't have an account?
        <a href="signup.php">Create one now</a>
      </div>

      <div class="right-footer">
        Secure login &nbsp;·&nbsp; Privacy Policy &nbsp;·&nbsp; Help
      </div>

    </div>
  </div>

  <script src="app.js"></script>
</body>
</html>
