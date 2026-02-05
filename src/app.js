/**
 * Auth Interface — ЭТАП 1–3
 * 
 * ЭТАП 1: Статический интерфейс
 * ЭТАП 2: Валидация форм и UI-состояния
 * ЭТАП 3: API-интеграция и финальная стабилизация
 * 
 * Этот модуль реализует:
 * - Клиентскую валидацию форм
 * - Отображение ошибок
 * - UI-состояния (idle / loading / error / success)
 * - API-интеграцию (login и register endpoints)
 * - Обработку серверных ошибок
 * - Маппинг серверных ошибок в UI
 * 
 * ЗАПРЕЩЕНО:
 * - навигация / редиректы
 * - управление сессией
 * - добавление новой функциональности
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

/** API endpoints (configurable) */
const API_CONFIG = {
  baseURL: '/api',
  loginEndpoint: '/api/login',
  registerEndpoint: '/api/register',
  timeout: 30000 // 30 seconds
};

// ============================================================================
// SELECTORS
// ============================================================================

const authCard = document.querySelector('[id="auth-card"]');
const loginForm = document.querySelector('#login-form');
const registerForm = document.querySelector('#register-form');
const tabButtons = document.querySelectorAll('.tab[data-tab]');
const tabPanels = document.querySelectorAll('.panel[data-panel]');

// ============================================================================
// VALIDATION RULES
// ============================================================================

/** Email validation pattern (simple but practical) */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Phone pattern: +7 (___) ___-__-__ or similar */
const PHONE_PATTERN = /^(?:\+7|8)(\d{3})\d{3}\d{2}\d{2}$/;

/** Password rules:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one number
 */
const PASSWORD_MIN_LENGTH = 8;

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate email format
 */
function validateEmail(email) {
  if (!email || !email.trim()) {
    return { valid: false, message: 'Email is required' };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { valid: false, message: 'Invalid email format' };
  }
  return { valid: true };
}

/**
 * Validate password
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one digit
 */
function validatePassword(password, field = 'password') {
  if (!password || !password.trim()) {
    return { valid: false, message: 'Password is required' };
  }
  if (password.length < PASSWORD_MIN_LENGTH) {
    return {
      valid: false,
      message: `Password must be at least ${PASSWORD_MIN_LENGTH} characters`
    };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain uppercase letter' };
  }
  if (!/\d/.test(password)) {
    return { valid: false, message: 'Password must contain a digit' };
  }
  return { valid: true };
}

/**
 * Validate full name (not empty, at least 2 words)
 */
function validateFullName(fullName) {
  if (!fullName || !fullName.trim()) {
    return { valid: false, message: 'Full name is required' };
  }
  if (fullName.trim().split(/\s+/).length < 2) {
    return { valid: false, message: 'Enter first and last name' };
  }
  return { valid: true };
}

/**
 * Validate phone number
 */
function validatePhone(phone) {
  if (!phone || !phone.trim()) {
    return { valid: false, message: 'Phone is required' };
  }
  if (!PHONE_PATTERN.test(phone.replace(/\D/g, ''))) {
    return { valid: false, message: 'Invalid phone format' };
  }
  return { valid: true };
}

/**
 * Validate date of birth (18+ age check)
 */
function validateDOB(dob) {
  if (!dob) {
    return { valid: false, message: 'Date of birth is required' };
  }
  const birthDate = new Date(dob);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    const actualAge = age - 1;
    if (actualAge < 18) {
      return { valid: false, message: 'Must be 18 or older' };
    }
  } else {
    if (age < 18) {
      return { valid: false, message: 'Must be 18 or older' };
    }
  }
  return { valid: true };
}

/**
 * Validate gender selection
 */
function validateGender(gender) {
  if (!gender || !gender.trim()) {
    return { valid: false, message: 'Select gender' };
  }
  return { valid: true };
}

/**
 * Validate password confirmation
 */
function validatePasswordConfirm(password, passwordConfirm) {
  if (!passwordConfirm || !passwordConfirm.trim()) {
    return { valid: false, message: 'Confirm password is required' };
  }
  if (password !== passwordConfirm) {
    return { valid: false, message: 'Passwords do not match' };
  }
  return { valid: true };
}

/**
 * Validate terms checkbox
 */
function validateTerms(checked) {
  if (!checked) {
    return { valid: false, message: 'Accept terms to continue' };
  }
  return { valid: true };
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Make API request with timeout
 */
async function apiRequest(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
    
    clearTimeout(timeoutId);
    
    // Parse response body
    let data = null;
    try {
      data = await response.json();
    } catch (e) {
      // Response was not JSON
      data = null;
    }
    
    return {
      status: response.status,
      ok: response.ok,
      data
    };
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    
    throw error;
  }
}

/**
 * Submit login form to API
 */
async function submitLogin(email, password) {
  const payload = { email, password };
  
  const result = await apiRequest(API_CONFIG.loginEndpoint, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  
  return result;
}

/**
 * Submit register form to API
 */
async function submitRegister(formData) {
  const result = await apiRequest(API_CONFIG.registerEndpoint, {
    method: 'POST',
    body: JSON.stringify(formData)
  });
  
  return result;
}

/**
 * Handle API response and return errors if any
 * Server error format expected:
 * - { errors: { field: "message", ... } } for field errors
 * - { message: "error" } for general error
 * - { message: "success" } for success message
 */
function parseAPIError(response) {
  const errors = {};
  
  if (!response.ok && response.data) {
    // Server returned error response
    if (response.data.errors && typeof response.data.errors === 'object') {
      // Field-level errors
      Object.assign(errors, response.data.errors);
      return {
        fieldErrors: errors,
        generalError: null
      };
    } else if (response.data.message) {
      // General error message
      return {
        fieldErrors: {},
        generalError: response.data.message
      };
    }
  }
  
  // Generic error
  return {
    fieldErrors: {},
    generalError: 'An unexpected error occurred. Please try again.'
  };
}

// ============================================================================
// UI STATE MANAGEMENT
// ============================================================================

/**
 * Set UI state of auth card
 * @param {string} state - 'idle' | 'loading' | 'error' | 'success'
 */
function setUIState(state) {
  authCard.dataset.state = state;
}

/**
 * Get current UI state
 */
function getUIState() {
  return authCard.dataset.state || 'idle';
}

/**
 * Set buttons disabled state
 */
function setButtonsDisabled(form, disabled) {
  const buttons = form.querySelectorAll('button[type="submit"], button[type="button"]');
  buttons.forEach(btn => {
    btn.disabled = disabled;
  });
}

/**
 * Display error message for a field
 */
function displayFieldError(form, fieldName, message) {
  const input = form.querySelector(`[name="${fieldName}"]`);
  const errorEl = input.parentElement.querySelector('.field-error');
  
  if (errorEl) {
    errorEl.textContent = message;
    errorEl.setAttribute('aria-live', 'polite');
  }
  
  input.classList.add('input-error');
}

/**
 * Clear error for a field
 */
function clearFieldError(form, fieldName) {
  const input = form.querySelector(`[name="${fieldName}"]`);
  const errorEl = input.parentElement.querySelector('.field-error');
  
  if (errorEl) {
    errorEl.textContent = '';
  }
  
  input.classList.remove('input-error');
  input.classList.remove('input-success');
}

/**
 * Clear all errors in form
 */
function clearFormErrors(form) {
  const inputs = form.querySelectorAll('input, select, textarea');
  const errorEls = form.querySelectorAll('.field-error');
  
  inputs.forEach(input => {
    input.classList.remove('input-error');
    input.classList.remove('input-success');
  });
  
  errorEls.forEach(el => {
    el.textContent = '';
  });
}

/**
 * Display status message
 */
function displayStatusMessage(form, message, type = 'error') {
  const statusEl = form.querySelector('.status-message');
  if (statusEl) {
    statusEl.textContent = message;
    statusEl.setAttribute('aria-live', 'polite');
    statusEl.className = `status-message is-${type}`;
    
    if (type === 'loading') {
      const spinner = document.createElement('span');
      spinner.className = 'loading-indicator';
      statusEl.appendChild(spinner);
    }
  }
}

/**
 * Clear status message
 */
function clearStatusMessage(form) {
  const statusEl = form.querySelector('.status-message');
  if (statusEl) {
    statusEl.textContent = '';
    statusEl.className = 'status-message';
  }
}

// ============================================================================
// LOGIN FORM VALIDATION & HANDLERS
// ============================================================================

/**
 * Validate login form
 * @returns {boolean} true if valid, false otherwise
 */
function validateLoginForm() {
  const email = loginForm.querySelector('[name="email"]').value;
  const password = loginForm.querySelector('[name="password"]').value;
  
  clearFormErrors(loginForm);
  
  let isValid = true;
  
  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    displayFieldError(loginForm, 'email', emailValidation.message);
    isValid = false;
  }
  
  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    displayFieldError(loginForm, 'password', passwordValidation.message);
    isValid = false;
  }
  
  return isValid;
}

/**
 * Handle login form submit
 */
async function handleLoginSubmit(e) {
  e.preventDefault();
  
  if (!validateLoginForm()) {
    setUIState('error');
    displayStatusMessage(loginForm, 'Please fix the errors above', 'error');
    return;
  }
  
  setUIState('loading');
  displayStatusMessage(loginForm, 'Signing in...', 'loading');
  setButtonsDisabled(loginForm, true);
  
  try {
    const email = loginForm.querySelector('[name="email"]').value;
    const password = loginForm.querySelector('[name="password"]').value;
    
    const response = await submitLogin(email, password);
    
    if (response.ok) {
      // Success
      setUIState('success');
      displayStatusMessage(
        loginForm,
        response.data?.message || 'Successfully signed in!',
        'success'
      );
      
      // Clear form after success
      setTimeout(() => {
        clearFormErrors(loginForm);
        clearStatusMessage(loginForm);
        loginForm.reset();
        setUIState('idle');
        setButtonsDisabled(loginForm, false);
      }, 1500);
    } else {
      // Error response from server
      const { fieldErrors, generalError } = parseAPIError(response);
      
      if (Object.keys(fieldErrors).length > 0) {
        // Display field errors
        clearFormErrors(loginForm);
        Object.entries(fieldErrors).forEach(([field, message]) => {
          displayFieldError(loginForm, field, message);
        });
        setUIState('error');
        displayStatusMessage(loginForm, 'Please check the errors above', 'error');
      } else if (generalError) {
        // Display general error
        setUIState('error');
        displayStatusMessage(loginForm, generalError, 'error');
      } else {
        setUIState('error');
        displayStatusMessage(loginForm, 'Sign in failed. Please try again.', 'error');
      }
      
      setButtonsDisabled(loginForm, false);
    }
  } catch (error) {
    // Network or other error
    setUIState('error');
    const errorMessage = error.message === 'Request timeout'
      ? 'Request timed out. Please check your connection and try again.'
      : 'Network error. Please check your connection and try again.';
    displayStatusMessage(loginForm, errorMessage, 'error');
    setButtonsDisabled(loginForm, false);
  }
}

// ============================================================================
// REGISTER FORM VALIDATION & HANDLERS
// ============================================================================

/**
 * Validate register form
 * @returns {boolean} true if valid, false otherwise
 */
function validateRegisterForm() {
  const fullName = registerForm.querySelector('[name="fullName"]').value;
  const email = registerForm.querySelector('[name="email"]').value;
  const phone = registerForm.querySelector('[name="phone"]').value;
  const dob = registerForm.querySelector('[name="dob"]').value;
  const gender = registerForm.querySelector('[name="gender"]').value;
  const password = registerForm.querySelector('[name="password"]').value;
  const passwordConfirm = registerForm.querySelector('[name="passwordConfirm"]').value;
  const terms = registerForm.querySelector('[name="terms"]').checked;
  
  clearFormErrors(registerForm);
  
  let isValid = true;
  
  // Validate full name
  const fullNameValidation = validateFullName(fullName);
  if (!fullNameValidation.valid) {
    displayFieldError(registerForm, 'fullName', fullNameValidation.message);
    isValid = false;
  }
  
  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    displayFieldError(registerForm, 'email', emailValidation.message);
    isValid = false;
  }
  
  // Validate phone
  const phoneValidation = validatePhone(phone);
  if (!phoneValidation.valid) {
    displayFieldError(registerForm, 'phone', phoneValidation.message);
    isValid = false;
  }
  
  // Validate DOB
  const dobValidation = validateDOB(dob);
  if (!dobValidation.valid) {
    displayFieldError(registerForm, 'dob', dobValidation.message);
    isValid = false;
  }
  
  // Validate gender
  const genderValidation = validateGender(gender);
  if (!genderValidation.valid) {
    displayFieldError(registerForm, 'gender', genderValidation.message);
    isValid = false;
  }
  
  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    displayFieldError(registerForm, 'password', passwordValidation.message);
    isValid = false;
  }
  
  // Validate password confirmation
  const passwordConfirmValidation = validatePasswordConfirm(password, passwordConfirm);
  if (!passwordConfirmValidation.valid) {
    displayFieldError(registerForm, 'passwordConfirm', passwordConfirmValidation.message);
    isValid = false;
  }
  
  // Validate terms
  const termsValidation = validateTerms(terms);
  if (!termsValidation.valid) {
    displayFieldError(registerForm, 'terms', termsValidation.message);
    isValid = false;
  }
  
  return isValid;
}

/**
 * Handle register form submit
 */
async function handleRegisterSubmit(e) {
  e.preventDefault();
  
  if (!validateRegisterForm()) {
    setUIState('error');
    displayStatusMessage(registerForm, 'Please fix the errors above', 'error');
    return;
  }
  
  setUIState('loading');
  displayStatusMessage(registerForm, 'Creating account...', 'loading');
  setButtonsDisabled(registerForm, true);
  
  try {
    const fullName = registerForm.querySelector('[name="fullName"]').value;
    const email = registerForm.querySelector('[name="email"]').value;
    const phone = registerForm.querySelector('[name="phone"]').value;
    const dob = registerForm.querySelector('[name="dob"]').value;
    const gender = registerForm.querySelector('[name="gender"]').value;
    const password = registerForm.querySelector('[name="password"]').value;
    
    const formData = { fullName, email, phone, dob, gender, password };
    
    const response = await submitRegister(formData);
    
    if (response.ok) {
      // Success
      setUIState('success');
      displayStatusMessage(
        registerForm,
        response.data?.message || 'Account created successfully!',
        'success'
      );
      
      // Clear form after success
      setTimeout(() => {
        clearFormErrors(registerForm);
        clearStatusMessage(registerForm);
        registerForm.reset();
        setUIState('idle');
        setButtonsDisabled(registerForm, false);
      }, 1500);
    } else {
      // Error response from server
      const { fieldErrors, generalError } = parseAPIError(response);
      
      if (Object.keys(fieldErrors).length > 0) {
        // Display field errors
        clearFormErrors(registerForm);
        Object.entries(fieldErrors).forEach(([field, message]) => {
          displayFieldError(registerForm, field, message);
        });
        setUIState('error');
        displayStatusMessage(registerForm, 'Please check the errors above', 'error');
      } else if (generalError) {
        // Display general error
        setUIState('error');
        displayStatusMessage(registerForm, generalError, 'error');
      } else {
        setUIState('error');
        displayStatusMessage(registerForm, 'Registration failed. Please try again.', 'error');
      }
      
      setButtonsDisabled(registerForm, false);
    }
  } catch (error) {
    // Network or other error
    setUIState('error');
    const errorMessage = error.message === 'Request timeout'
      ? 'Request timed out. Please check your connection and try again.'
      : 'Network error. Please check your connection and try again.';
    displayStatusMessage(registerForm, errorMessage, 'error');
    setButtonsDisabled(registerForm, false);
  }
}

/**
 * Handle register cancel button
 */
function handleRegisterCancel(e) {
  e.preventDefault();
  clearFormErrors(registerForm);
  clearStatusMessage(registerForm);
  registerForm.reset();
  setUIState('idle');
  switchTab('login');
}

// ============================================================================
// TAB SWITCHING
// ============================================================================

/**
 * Switch to a tab
 */
function switchTab(tabName) {
  // Update tab buttons
  tabButtons.forEach(btn => {
    const isActive = btn.dataset.tab === tabName;
    btn.setAttribute('aria-selected', isActive);
    btn.classList.toggle('is-active', isActive);
  });
  
  // Update tab panels
  tabPanels.forEach(panel => {
    const isActive = panel.dataset.panel === tabName;
    panel.hidden = !isActive;
  });
  
  // Clear previous state
  setUIState('idle');
  clearStatusMessage(loginForm);
  clearStatusMessage(registerForm);
}

/**
 * Handle tab button click
 */
function handleTabClick(e) {
  const tabName = e.target.dataset.tab;
  if (tabName) {
    switchTab(tabName);
  }
}

// ============================================================================
// INPUT HANDLERS (clear errors on input)
// ============================================================================

/**
 * Clear field error on input change
 */
function handleFieldInput(form, fieldName) {
  const input = form.querySelector(`[name="${fieldName}"]`);
  if (input) {
    input.addEventListener('input', () => {
      clearFieldError(form, fieldName);
      // Clear status message if not loading
      if (getUIState() !== 'loading') {
        clearStatusMessage(form);
      }
    });
  }
}

/**
 * Setup input handlers for a form
 */
function setupFormInputHandlers(form, fields) {
  fields.forEach(fieldName => {
    handleFieldInput(form, fieldName);
  });
}

// ============================================================================
// EVENT LISTENERS SETUP
// ============================================================================

function initializeApp() {
  // Tab switching
  tabButtons.forEach(btn => {
    btn.addEventListener('click', handleTabClick);
  });
  
  // Login form
  loginForm.addEventListener('submit', handleLoginSubmit);
  setupFormInputHandlers(loginForm, ['email', 'password']);
  
  // Register form
  registerForm.addEventListener('submit', handleRegisterSubmit);
  const registerCancelBtn = registerForm.querySelector('[data-purpose="register-cancel"]');
  if (registerCancelBtn) {
    registerCancelBtn.addEventListener('click', handleRegisterCancel);
  }
  setupFormInputHandlers(registerForm, [
    'fullName', 'email', 'phone', 'dob', 'gender', 'password', 'passwordConfirm', 'terms'
  ]);
  
  // Initialize UI state
  setUIState('idle');
}

// ============================================================================
// INITIALIZE
// ============================================================================

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}
