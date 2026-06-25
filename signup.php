<?php
session_start();
if (isset($_SESSION['aether_session_token'])) {
    header("Location: home.php");
    exit;
}
session_write_close();
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>IT Wall to Wall Asset Inventory - Create Account</title>
  <meta name="description" content="Create an account to access the IT Wall to Wall Asset Inventory monitoring system.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    /* =============================================
       CONCENTRIX OFFICIAL BRAND COLORS - SIGN UP
       Blue: #003D5B | Turquoise: #25E2CC
       ============================================= */
    *, *::before, *::after {
      margin: 0; padding: 0; box-sizing: border-box;
    }

    :root {
      /* Official Concentrix Brand Colors */
      --cnx-blue:        #003D5B;
      --cnx-blue-deep:   #002535;
      --cnx-blue-light:  #005070;
      --cnx-teal:        #25E2CC;
      --cnx-teal-dark:   #1ABCAA;
      --cnx-teal-faint:  #E0FAF7;
      --cnx-white:       #FFFFFF;
      --cnx-panel-bg:    #F3FBFA;
      --cnx-gray-50:     #EAF5F4;
      --cnx-gray-100:    #D0ECEB;
      --cnx-gray-200:    #A8D8D5;
      --cnx-gray-400:    #5B8F8C;
      --cnx-gray-600:    #2E5F5C;
      --cnx-gray-800:    #002535;
      --cnx-error:       #C62828;
      --cnx-success:     #1A6B3C;
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

    /* Concentric circles — Concentrix signature motif with animated wave ripple */
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
      animation: circle-pulse-wave 4s cubic-bezier(0.25, 0.8, 0.25, 1) infinite;
      transform-origin: center;
      will-change: transform, opacity;
    }

    .circle-ring:nth-child(1) { width: 140px; height: 140px; border: 2.5px solid rgba(37,226,204,0.7); animation-delay: 0s; }
    .circle-ring:nth-child(2) { width: 240px; height: 240px; border: 2px solid rgba(37,226,204,0.45); animation-delay: 0.4s; }
    .circle-ring:nth-child(3) { width: 350px; height: 350px; border: 1.5px solid rgba(37,226,204,0.28); animation-delay: 0.8s; }
    .circle-ring:nth-child(4) { width: 460px; height: 460px; border: 1.2px solid rgba(37,226,204,0.18); animation-delay: 1.2s; }
    .circle-ring:nth-child(5) { width: 580px; height: 580px; border: 1px solid rgba(255,255,255,0.06); animation-delay: 1.6s; }

    @keyframes circle-pulse-wave {
      0% {
        transform: translate(-50%, -50%) scale(0.92);
        opacity: 0.3;
        box-shadow: 0 0 0 rgba(37, 226, 204, 0);
      }
      50% {
        transform: translate(-50%, -50%) scale(1.06);
        opacity: 1;
        border-color: rgba(37, 226, 204, 0.85);
        box-shadow: 0 0 30px rgba(37, 226, 204, 0.2);
      }
      100% {
        transform: translate(-50%, -50%) scale(0.92);
        opacity: 0.3;
        box-shadow: 0 0 0 rgba(37, 226, 204, 0);
      }
    }

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
      animation: pulse-dot 4s cubic-bezier(0.25, 0.8, 0.25, 1) infinite;
    }

    @keyframes pulse-dot {
      0%, 100% { transform: translateY(-50%) scale(1);   box-shadow: 0 0 28px rgba(37,226,204,0.9); opacity: 0.7; }
      50%       { transform: translateY(-50%) scale(1.4); box-shadow: 0 0 55px rgba(37,226,204,1); opacity: 1; }
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
      border-radius: 50%;
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
       RIGHT PANEL - Sign Up Form
       ============================================= */
    .right-panel {
      width: 500px;
      flex-shrink: 0;
      background: var(--cnx-panel-bg);
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 48px 52px;
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
      font-size: 26px;
      font-weight: 800;
      color: var(--cnx-blue-deep);
      letter-spacing: -0.6px;
      margin-bottom: 6px;
    }

    .form-subtitle {
      font-size: 14px;
      color: var(--cnx-gray-400);
      margin-bottom: 28px;
      line-height: 1.5;
    }

    /* Alerts */
    .alert-banner {
      display: none;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      border-radius: 8px;
      margin-bottom: 18px;
      font-size: 13px;
      font-weight: 500;
    }
    .alert-danger {
      background: #FFF3F3;
      border: 1px solid #FFBABA;
      color: var(--cnx-error);
    }
    .alert-success {
      background: #F0FFF8;
      border: 1px solid #9AE6C4;
      color: var(--cnx-success);
    }

    /* Form groups */
    .form-group {
      margin-bottom: 16px;
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
      padding: 12px 14px 12px 42px;
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

    /* CTA Button — Official Concentrix Blue → Turquoise */
    .btn-primary {
      width: 100%;
      padding: 13px;
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
      margin-top: 6px;
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

    /* Sign in redirect link */
    .signin-redirect {
      text-align: center;
      margin-top: 22px;
      font-size: 13.5px;
      color: var(--cnx-gray-400);
    }

    .signin-redirect a {
      color: var(--cnx-blue);
      font-weight: 700;
      text-decoration: none;
      margin-left: 4px;
      transition: color 0.15s;
    }

    .signin-redirect a:hover { color: var(--cnx-teal-dark); }

    /* Right panel footer */
    .right-footer {
      position: absolute;
      bottom: 20px;
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
          Join the platform and get instant access to real-time asset monitoring across every station.
        </p>

        <!-- Feature list -->
        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <span class="feature-text">Multi-user secure access per site</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
            </div>
            <span class="feature-text">Full dashboard access after registration</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <span class="feature-text">Password-protected, always private</span>
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
         RIGHT PANEL (Sign Up Form)
         ======================== -->
    <div class="right-panel">

      <div class="form-section-label">New Account</div>
      <h2 class="form-title">Create your account</h2>
      <p class="form-subtitle">Fill in your details below to get started.</p>

      <!-- Error Alert -->
      <div class="alert-banner alert-danger" id="signup-error-alert">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span id="signup-error-message"></span>
      </div>

      <!-- Success Alert -->
      <div class="alert-banner alert-success" id="signup-success-alert">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        <span id="signup-success-message"></span>
      </div>

      <!-- Registration Form -->
      <form id="signup-form" autocomplete="off">

        <!-- Username -->
        <div class="form-group">
          <label for="signup-username" class="form-label">Username</label>
          <div class="input-wrapper">
            <svg class="input-icon-left" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <input
              type="text"
              id="signup-username"
              class="input-field"
              placeholder="e.g. janesmith"
              required
              autocomplete="username"
            >
          </div>
        </div>

        <!-- Email -->
        <div class="form-group">
          <label for="signup-email" class="form-label">Email Address</label>
          <div class="input-wrapper">
            <svg class="input-icon-left" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <input
              type="email"
              id="signup-email"
              class="input-field"
              placeholder="e.g. firstname.lastname@concentrix.com"
              required
              autocomplete="email"
              pattern="[a-zA-Z0-9_-]+\.[a-zA-Z0-9._-]+@[cC][oO][nN][cC][eE][nN][tT][rR][iI][xX]\.[cC][oO][mM]"
              title="Please enter your Concentrix SSO email in the format: fullname.surname@concentrix.com"
            >
          </div>
          <span style="font-size: 11px; color: var(--cnx-gray-400); margin-top: 4px; display: block; font-weight: 500;">
            Must be your Concentrix SSO account (e.g. firstname.lastname@concentrix.com).
          </span>
        </div>

        <!-- Password -->
        <div class="form-group">
          <label for="signup-password" class="form-label">Password</label>
          <div class="input-wrapper">
            <svg class="input-icon-left" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input
              type="password"
              id="signup-password"
              class="input-field"
              placeholder="Min. 6 characters"
              required
              autocomplete="new-password"
            >
            <button type="button" class="btn-toggle-password" id="toggle-signup-pwd-btn" title="Toggle visibility">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>

        <!-- Confirm Password -->
        <div class="form-group">
          <label for="signup-confirm-password" class="form-label">Confirm Password</label>
          <div class="input-wrapper">
            <svg class="input-icon-left" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input
              type="password"
              id="signup-confirm-password"
              class="input-field"
              placeholder="Repeat your password"
              required
              autocomplete="new-password"
            >
            <button type="button" class="btn-toggle-password" id="toggle-confirm-pwd-btn" title="Toggle visibility">
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
        </div>

        <button type="submit" class="btn-primary" id="btn-signup-submit">
          <span class="btn-text">Create Account</span>
          <div class="spinner" id="signup-spinner"></div>
        </button>

      </form>

      <!-- Sign in redirect -->
      <div class="signin-redirect">
        Already have an account?
        <a href="index.php">Sign In</a>
      </div>

      <div class="right-footer">
        Secure registration &nbsp;·&nbsp; Privacy Policy &nbsp;·&nbsp; Help
      </div>

    </div>
  </div>

  <script src="app.js?v=1.3"></script>
</body>
</html>
