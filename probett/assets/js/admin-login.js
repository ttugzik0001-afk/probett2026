(function() {
  'use strict';

  var loginForm = document.getElementById('loginForm');
  var errorBlock = document.getElementById('authErrorBlock');

  function displayError(message) {
    console.error("Auth Error Logged:", message);
    if (errorBlock) {
      errorBlock.textContent = message;
      errorBlock.classList.add('is-visible');
    } else {
      alert(message);
    }
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      if (errorBlock) { 
        errorBlock.classList.remove('is-visible'); 
        errorBlock.textContent = '';
      }

      var emailField = document.getElementById('adminEmail');
      var passwordField = document.getElementById('adminPassword');
      
      if (!emailField || !passwordField) {
        displayError("Form elements missing from layout. Check input element IDs.");
        return;
      }

      var email = emailField.value.trim();
      var password = passwordField.value;

      if (!email || !password) {
        displayError("Please populate both the email and password fields.");
        return;
      }

      // --- LIVE SUPABASE SECURITY GATEWAY ---
      const dbClient = window.supabaseInstance || window.supabaseClient || window.supabase;
      
      if (!dbClient || typeof dbClient.auth === 'undefined') {
        displayError("Connection Failure: The database driver did not load into window scope yet.");
        return;
      }

      try {
        const { data, error } = await dbClient.auth.signInWithPassword({
          email: email,
          password: password
        });

        if (error) {
          if (error.message === "Email not confirmed" || error.message.includes("Email not confirmed")) {
            displayError("Please check your email inbox and click the confirmation link before logging in.");
          } else {
            displayError(error.message || "Invalid email or password configuration.");
          }
          return;
        }

        // Pass validation: step into live dashboard tracking records
        window.location.href = 'admin.html';

      } catch (err) {
        displayError('Network communication failure: ' + err.message);
      }
    });
  } else {
    console.error("Critical Layout Error: Form container element 'loginForm' not detected inside document structure.");
  }
})();