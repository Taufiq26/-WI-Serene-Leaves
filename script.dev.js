// GET GUEST NAME FROM URL PARAMETER
function getGuestName() {
  const urlParams = new URLSearchParams(window.location.search);
  const guestName = urlParams.get('to');
  const guestNameElement = document.getElementById('guest-name');

  if (guestName) {
    guestNameElement.textContent = decodeURIComponent(guestName);
  } else {
    guestNameElement.textContent = 'Tamu Undangan';
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

// COUNTDOWN TIMER
function startCountdown() {
  // Jan 31, 2026, 08:00 WIB
  const targetDate = new Date('2026-12-31T08:00:00+07:00');
  const targetTime = targetDate.getTime();
  const title = document.getElementById('countdown-title');
  const yearsBox = document.querySelector('.box-years');
  const monthsBox = document.querySelector('.box-months');

  const timer = setInterval(function () {
    const now = new Date();
    const nowTime = now.getTime();
    let distance = targetTime - nowTime;
    let isPast = false;

    if (distance < 0) {
      isPast = true;
      distance = nowTime - targetTime; // Count UP
      if (title) title.textContent = "Bahagia Bersama";
      if (yearsBox) yearsBox.style.display = 'flex';
      if (monthsBox) monthsBox.style.display = 'flex';
    }

    // Calculation logic for years, months, days, etc.
    // For countdown, we use simpler math for D/H/M/S. 
    // For count-up (Marriage age), we want calendar-accurate Y/M/D.
    let years, months, days, hours, minutes, seconds;

    if (isPast) {
      // COUNTER UP (Anniversary Mode)
      // This is a more complex calculation to get accurate month differences
      let startDate = targetDate;
      let endDate = now;

      years = endDate.getFullYear() - startDate.getFullYear();
      months = endDate.getMonth() - startDate.getMonth();
      days = endDate.getDate() - startDate.getDate();

      if (days < 0) {
        months--;
        // Get days in previous month
        let prevMonth = new Date(endDate.getFullYear(), endDate.getMonth(), 0).getDate();
        days += prevMonth;
      }
      if (months < 0) {
        years--;
        months += 12;
      }

      hours = endDate.getHours() - startDate.getHours();
      minutes = endDate.getMinutes() - startDate.getMinutes();
      seconds = endDate.getSeconds() - startDate.getSeconds();

      if (seconds < 0) {
        minutes--;
        seconds += 60;
      }
      if (minutes < 0) {
        hours--;
        minutes += 60;
      }
      if (hours < 0) {
        days--; // This could rarely make days negative if not careful, but broadly works for this UI
        hours += 24;
      }
    } else {
      // COUNTDOWN (Simple mode)
      years = 0;
      months = 0;
      days = Math.floor(distance / (1000 * 60 * 60 * 24));
      hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      seconds = Math.floor((distance % (1000 * 60)) / 1000);
    }

    // Render
    const update = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val < 10 ? '0' + val : val;
    };

    if (isPast) {
      update('years', years);
      update('months', months);
    }
    update('days', days);
    update('hours', hours);
    update('minutes', minutes);
    update('seconds', seconds);

  }, 1000);
}

// Start countdown immediately
startCountdown();

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
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxWmOgAd7NmblO28vksx5EGVcG9lPGFILIZAolj8Yuyi8ckPuO_Y8sK4ZSW-Noip1Jy3w/exec';

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
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Menyimpan...';
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
      alert('Maaf, terjadi kesalahan. Silakan coba lagi.');
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
    alert('Mohon isi nama dan ucapan Anda.');
    return;
  }

  // Show loading
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
  btn.disabled = true;

  const data = new FormData();
  data.append('kategori', 'Ucapan');
  data.append('nama', nameInput.value);
  data.append('pesan', messageInput.value);
  data.append('tanggal', new Date().toLocaleString());

  fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: data })
    .then(response => {
      alert('Terima kasih atas ucapan dan doa Anda!');
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
      alert('Maaf, terjadi kesalahan saat mengirim ucapan.');
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
        displayContainer.innerHTML = '<div style="text-align:center; padding:20px; color:#999;">Belum ada ucapan. Jadilah yang pertama!</div>';
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
      displayContainer.innerHTML = '<div style="text-align:center; padding:20px; color:red;">Gagal memuat ucapan. Silakan segarkan halaman.</div>';
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
