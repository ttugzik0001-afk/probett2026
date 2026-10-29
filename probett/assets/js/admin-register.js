(function() {
  'use strict';

  var step1 = document.getElementById('registerStep1');
  var step2 = document.getElementById('registerStep2');
  var regForm = document.getElementById('registerForm');
  var pinForm = document.getElementById('pinForm');
  
  var regError = document.getElementById('regErrorBlock');
  var pinError = document.getElementById('pinErrorBlock');
  var pinTimerDisplay = document.getElementById('pinTimer');

  var countdownInterval;
  var sessionDuration = 25 * 60; // 25 minutes runtime tracking

  function startSessionTimer() {
    var timer = sessionDuration, minutes, seconds;
    countdownInterval = setInterval(function () {
      minutes = parseInt(timer / 60, 10);
      seconds = parseInt(timer % 60, 10);

      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;

      pinTimerDisplay.textContent = minutes + ":" + seconds;

      if (--timer < 0) {
        clearInterval(countdownInterval);
        alert('Your registration validation window has expired. Please restart the registration process.');
        window.location.reload();
      }
    }, 1000);
  }

  // --- STAGE 1: LOCAL PROFILE CREATION ATTEMPTS ---
  if (regForm) {
    regForm.addEventListener('submit', function(e) {
      e.preventDefault();
      regError.textContent = '';
      regError.classList.remove('is-visible');

      var email = document.getElementById('regEmail').value.trim();
      var password = document.getElementById('regPassword').value;
      var confirmPassword = document.getElementById('regConfirmPassword').value;

      if (!email || !password || !confirmPassword) {
        regError.textContent = 'Please fill out all registration fields.';
        regError.classList.add('is-visible');
        return;
      }

      if (password.length < 6) {
        regError.textContent = 'Password must be at least 6 characters long.';
        regError.classList.add('is-visible');
        return;
      }

      if (password !== confirmPassword) {
        regError.textContent = 'Passwords do not match.';
        regError.classList.add('is-visible');
        return;
      }

      // Progress Validation: Shift interface display blocks smoothly
      step1.style.display = 'none';
      step2.style.display = 'block';
      startSessionTimer();
    });
  }

  // --- STAGE 2: LIVE BACKEND SECURE CODE VERIFICATION GATEWAY ---
  if (pinForm) {
    pinForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      pinError.textContent = '';
      pinError.classList.remove('is-visible');

      var pin = document.getElementById('masterPin').value.trim();

      if (!pin) {
        pinError.textContent = 'Security PIN required to proceed.';
        pinError.classList.add('is-visible');
        return;
      }

      // Dynamic Extraction Layer matching the global window namespace mappings
      const dbClient = window.supabaseInstance || window.supabaseClient || window.supabase;

      if (!dbClient || typeof dbClient.rpc !== 'function') {
        pinError.textContent = 'Connection error: Supabase client pipeline missing from scope window.';
        pinError.classList.add('is-visible');
        return;
      }

      try {
        // 1. Fire Remote Procedure Call to check code parameters safely behind the scenes
        const { data: isValidPin, error: rpcError } = await dbClient.rpc('verify_system_registration_pin', {
          input_pin: pin
        });

        if (rpcError) {
          pinError.textContent = 'Verification Pipeline Error: ' + rpcError.message;
          pinError.classList.add('is-visible');
          return;
        }

        if (!isValidPin) {
          pinError.textContent = 'Invalid Confirmation Code. System Registration Access Denied.';
          pinError.classList.add('is-visible');
          return;
        }

        // 2. PIN verified successfully: Deploy user parameters to Supabase Auth tables
        var email = document.getElementById('regEmail').value.trim();
        var password = document.getElementById('regPassword').value;

        const { data: authData, error: authError } = await dbClient.auth.signUp({
          email: email,
          password: password
        });

        if (authError) {
          pinError.textContent = authError.message;
          pinError.classList.add('is-visible');
          return;
        }

        clearInterval(countdownInterval);
        alert('Operator registration authorized and created successfully!');
        window.location.href = 'admin-login.html';

      } catch (err) {
        pinError.textContent = 'Network communication failure: ' + err.message;
        pinError.classList.add('is-visible');
      }
    });
  }
})();
