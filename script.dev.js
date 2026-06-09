// GET GUEST NAME FROM URL PARAMETER
function getGuestName() {
  const urlParams = new URLSearchParams(window.location.search);
  const guestName = urlParams.get('to');
  const guestNameElement = document.getElementById('guest-name');

  if (guestName) {
    guestNameElement.textContent = decodeURIComponent(guestName);
  } else {
    guestNameElement.textContent = 'Guest';
  }
}

// Call on page load
getGuestName();

// OPENING ANIMATION & LOGIC
function openInvitation() {
  const cover = document.getElementById('opening-layer');
  const mainContent = document.getElementById('main-content');
  const music = document.getElementById('background-music');
  const musicControl = document.getElementById('music-control');

  // Slide up cover
  cover.classList.add('closed');

  // Show main content immediately
  mainContent.style.display = 'block';

  // Play background music
  if (music) {
    music.play().then(() => {
      musicControl.style.display = 'flex';
      musicControl.classList.add('playing');
    }).catch(error => {
      console.log("Autoplay blocked. User interaction needed.");
      // Even if blocked, show the control so user can play manually
      musicControl.style.display = 'flex';
      musicControl.classList.add('paused');
    });
  }

  // Unlock scroll here
  document.body.style.overflowY = 'auto';
}

function toggleMusic(event) {
  if (event) event.stopPropagation();

  const music = document.getElementById('background-music');
  const musicControl = document.getElementById('music-control');
  const musicIcon = document.getElementById('music-icon');

  if (!music) return;

  if (music.paused) {
    music.play();
    musicControl.classList.remove('paused');
    musicControl.classList.add('playing');
    musicIcon.className = 'fas fa-compact-disc';
  } else {
    music.pause();
    musicControl.classList.remove('playing');
    musicControl.classList.add('paused');
    musicIcon.className = 'fas fa-circle-pause';
  }
}

// SCROLL REVEAL ANIMATION (Intersection Observer)
document.addEventListener('DOMContentLoaded', () => {
  const observerOptions = {
    threshold: 0.15 // Trigger when 15% of element is visible
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  const fadeElements = document.querySelectorAll('.fade-up');
  fadeElements.forEach(el => observer.observe(el));

  // Check RSVP status on load
  checkRSVPVisibility();
});

// RSVP LOGIC
// CONFIGURATION: Replace this URL with your Google Apps Script Web App URL
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbygjDm05fpVONsnOO8doQDCFU9z62-fNTrMtMlShrg6XyZMpZSKecoGcsI6FfgzHjH_Cw/exec';

function checkRSVPVisibility() {
  const urlParams = new URLSearchParams(window.location.search);
  const guestName = urlParams.get('to');
  const rsvpContainer = document.getElementById('rsvp-action-container');
  const confirmedMessage = document.getElementById('rsvp-confirmed-message');

  if (!guestName) {
    // No guest name? Hide button (already hidden by default style)
    return;
  }

  // Check if already confirmed locally
  const isConfirmed = localStorage.getItem('rsvp_confirmed_' + guestName);

  if (isConfirmed) {
    rsvpContainer.style.display = 'none';
    confirmedMessage.style.display = 'block';
  } else {
    rsvpContainer.style.display = 'block';
    confirmedMessage.style.display = 'none';
  }
}

function submitRSVP(status) {
  const urlParams = new URLSearchParams(window.location.search);
  const guestName = urlParams.get('to');

  if (!guestName) return;

  // Determine which button was clicked based on status
  const btnId = status === 'Hadir' ? 'btn-rsvp-hadir' : 'btn-rsvp-tidak';
  const otherBtnId = status === 'Hadir' ? 'btn-rsvp-tidak' : 'btn-rsvp-hadir';

  const btn = document.getElementById(btnId);
  const otherBtn = document.getElementById(otherBtnId);

  const originalText = btn.innerHTML;

  // Show loading state
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
  btn.disabled = true;
  otherBtn.disabled = true;

  // Prepare data
  const data = new FormData();
  data.append('kategori', 'RSVP'); // Add category
  data.append('nama', guestName);
  data.append('status', status);
  data.append('tanggal', new Date().toLocaleString());

  fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: data })
    .then(response => {
      console.log('Success!', response);
      completeRSVP(guestName);
    })
    .catch(error => {
      console.error('Error!', error.message);
      alert('Sorry, an error occurred. Please try again.');
      btn.innerHTML = originalText;
      btn.disabled = false;
      otherBtn.disabled = false;
    });
}

function completeRSVP(guestName) {
  // Save state locally
  localStorage.setItem('rsvp_confirmed_' + guestName, 'true');

  // Update UI
  const rsvpContainer = document.getElementById('rsvp-action-container');
  const confirmedMessage = document.getElementById('rsvp-confirmed-message');

  rsvpContainer.style.display = 'none';
  confirmedMessage.style.display = 'block';

  // Optional: Auto-scroll to message
  confirmedMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// WISHES LOGIC
function submitWish() {
  const nameInput = document.getElementById('wish-name');
  const messageInput = document.getElementById('wish-message');
  const btn = document.getElementById('btn-send-wish');

  const originalText = btn.innerHTML;

  if (!nameInput.value || !messageInput.value) {
    alert('Please fill in your name and wish.');
    return;
  }

  // Show loading
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
  btn.disabled = true;

  const data = new FormData();
  data.append('kategori', 'Ucapan');
  data.append('nama', nameInput.value);
  data.append('pesan', messageInput.value);
  data.append('tanggal', new Date().toLocaleString());

  fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: data })
    .then(response => {
      alert('Thank you for your wishes and prayers!');
      btn.innerHTML = originalText;
      btn.disabled = false;

      // Clear form
      nameInput.value = '';
      messageInput.value = '';

      // Reload wishes to show the new one
      loadWishes();
    })
    .catch(error => {
      console.error('Error!', error.message);
      alert('Sorry, an error occurred while sending your wish.');
      btn.innerHTML = originalText;
      btn.disabled = false;
    });
}

// FETCH & DISPLAY WISHES
function loadWishes() {
  const displayContainer = document.getElementById('wishes-display');
  if (!displayContainer) return;

  fetch(GOOGLE_SCRIPT_URL) // doGet will be called
    .then(response => response.json())
    .then(data => {
      if (data.length === 0) {
        displayContainer.innerHTML = '<div style="text-align:center; padding:20px; color:#999;">No wishes yet. Be the first to leave one!</div>';
        return;
      }

      // Sort: newest first
      data.reverse();

      displayContainer.innerHTML = '';
      data.forEach(wish => {
        const card = document.createElement('div');
        card.className = 'wish-card';
        card.innerHTML = `
          <div class="wish-name"><i class="fas fa-user-circle"></i> ${wish.nama}</div>
          <div class="wish-message">"${wish.pesan}"</div>
          <div class="wish-time">${wish.tanggal}</div>
        `;
        displayContainer.appendChild(card);
      });
    })
    .catch(error => {
      console.error('Error loading wishes:', error);
      displayContainer.innerHTML = '<div style="text-align:center; padding:20px; color:red;">Failed to load wishes. Please refresh the page.</div>';
    });
}

// PRE-FILL WISH NAME IF AVAILABLE
function prefillWishName() {
  const urlParams = new URLSearchParams(window.location.search);
  const guestName = urlParams.get('to');
  if (guestName) {
    const nameInput = document.getElementById('wish-name');
    if (nameInput) nameInput.value = guestName;
  }
}

// CALL PREFILL & LOAD WISHES ON LOAD
document.addEventListener('DOMContentLoaded', () => {
  prefillWishName();
  loadWishes(); // Load wishes from GS
});
