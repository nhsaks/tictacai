document.addEventListener('DOMContentLoaded', function () {
  // DOM Elements
  const welcomeScreen = document.getElementById('welcome-screen');
  const memberGate = document.getElementById('member-gate');
  const userInfo = document.getElementById('user-info');
  const emailSection = document.getElementById('email-section');
  const loginMessage = document.getElementById('login-message');
  const userEmail = document.getElementById('user-email');
  const startBtn = document.getElementById('start-btn');
  const sendOtpBtn = document.getElementById('send-otp-btn');
  const googleLoginBtn = document.getElementById('google-login-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const emailInput = document.getElementById('email');
  const otpInputSection = document.getElementById('otp-input-section');
  const otpInput = document.getElementById('otp');
  const verifyOtpBtn = document.getElementById('verify-otp-btn');
  const toastMessage = document.getElementById('toast-message');
  const toastElement = document.getElementById('toast');

  // Firebase Authentication
  const auth = firebase.auth();

  // Firebase Realtime Database
  const database = firebase.database();

  // Function to show toast messages
  function showToast(message) {
    toastMessage.textContent = message;
    const toast = new bootstrap.Toast(toastElement);
    toast.show();
  }

  // Function to register user in the database
  async function registerUser(user) {
    const userRef = database.ref(`users/${user.uid}`);
    const snapshot = await userRef.once('value');

    // Check if the user is already registered
    if (!snapshot.exists()) {
      // Register the user
      await userRef.set({
        email: user.email,
        displayName: user.displayName || 'Anonymous',
        createdAt: firebase.database.ServerValue.TIMESTAMP,
      });
      console.log('User registered in the database.');
    } else {
      console.log('User already exists in the database.');
    }
  }

  // Show Member Gate when "Get Started" is clicked
  startBtn.addEventListener('click', () => {
    welcomeScreen.classList.add('hidden');
    memberGate.classList.remove('hidden');
  });

  // Send Login Link
  sendOtpBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    if (!email) {
      alert('Please enter a valid email address.');
      return;
    }

    try {
      // Check if the user is already registered
      const methods = await auth.fetchSignInMethodsForEmail(email);
      if (methods.length === 0) {
        alert('You are not registered. Please register first.');
        return;
      }

      // Send login link
      const actionCodeSettings = {
        url: window.location.href,
        handleCodeInApp: true,
      };
      await auth.sendSignInLinkToEmail(email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      emailSection.classList.add('hidden');
      loginMessage.classList.remove('hidden');
    } catch (error) {
      console.error('Error sending login link:', error);
      alert(`Error: ${error.message}`);
    }
  });

  // Verify OTP
  verifyOtpBtn.addEventListener('click', async () => {
    const email = window.localStorage.getItem('emailForSignIn');

    if (!email) {
      alert('No email found. Please try again.');
      return;
    }

    try {
      if (auth.isSignInWithEmailLink(window.location.href)) {
        const result = await auth.signInWithEmailLink(email, window.location.href);
        const user = result.user;

        // Register the user in the database
        await registerUser(user);

        // Display user info
        displayUserInfo(user);
      }
    } catch (error) {
      console.error('Error verifying login link:', error);
      alert(`Error: ${error.message}`);
    }
  });

  // Google Sign-In
  googleLoginBtn.addEventListener('click', async () => {
    const provider = new firebase.auth.GoogleAuthProvider();

    try {
      const result = await auth.signInWithPopup(provider);
      const user = result.user;

      // Register the user in the database
      await registerUser(user);

      // Display user info
      displayUserInfo(user);
    } catch (error) {
      console.error('Error during Google Sign-In:', error);
      alert(`Error: ${error.message}`);
    }
  });

  // Logout
  logoutBtn.addEventListener('click', async () => {
    try {
      await auth.signOut();
      userInfo.classList.add('hidden');
      welcomeScreen.classList.remove('hidden');
    } catch (error) {
      console.error('Error during logout:', error);
      alert(`Error: ${error.message}`);
    }
  });

  // Display User Info
  function displayUserInfo(user) {
    userEmail.textContent = `Logged in as: ${user.email}`;
    memberGate.classList.add('hidden');
    userInfo.classList.remove('hidden');
  }
});
