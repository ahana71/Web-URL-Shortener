let isSignup = false;
let currentUser = sessionStorage.getItem('username') || null;

const textarea = document.getElementById('longUrl');
textarea.addEventListener('input', function () {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 300) + 'px';
});

document.getElementById('shortenForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const longUrl = textarea.value.trim();
  if (!longUrl) return;

  const res = await fetch('/api/shorten', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      longUrl,
      ...(currentUser ? { username: currentUser } : {})
    })
  });

  const data = await res.json();
  const resultBox = document.getElementById('shortenedUrl');

  if (data.shortUrl) {
    resultBox.innerHTML = `
      <p>Short URL: <a href="${data.shortUrl}" target="_blank">${data.shortUrl}</a></p>
      ${data.warning ? `<p style="color:#d9534f; margin-top:10px;">Note: This link will not be saved since you are not logged in.</p>` : ''}
    `;
  } else {
    resultBox.textContent = 'Something went wrong.';
  }
});

const authBtn = document.getElementById('authBtn');
const modal = document.getElementById('authModal');
const confirmPass = document.getElementById('confirmPassword');
const authMessage = document.getElementById('authMessage');

authBtn.addEventListener('click', () => {
  modal.style.display = 'flex';
});

function closeModal() {
  modal.style.display = 'none';
  authMessage.innerHTML = '';
}

function toggleMode() {
  isSignup = !isSignup;
  document.getElementById('modalTitle').innerText = isSignup ? 'Sign Up' : 'Sign In';
  confirmPass.style.display = isSignup ? 'block' : 'none';
  document.querySelector('.toggle-auth').innerText = isSignup ? 'Switch to Sign In' : 'Switch to Sign Up';
  authMessage.innerHTML = '';
}

async function submitAuth() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value.trim();
  const confirm = document.getElementById('confirmPassword').value.trim();
  authMessage.innerHTML = '';

  if (!username || !password || (isSignup && !confirm)) {
    authMessage.innerHTML = `<div class="error" style="margin-bottom:10px;">Please fill all fields.</div>`;
    return;
  }

  if (isSignup && password !== confirm) {
    authMessage.innerHTML = `<div class="error" style="margin-bottom:10px;">Passwords do not match</div>`;
    return;
  }

  const body = isSignup
    ? { username, password, confirmPassword: confirm }
    : { username, password };

  const endpoint = isSignup ? '/auth/signup' : '/auth/login';
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await res.json();

  if (data.success) {
    currentUser = username;
    sessionStorage.setItem('username', username);

    document.getElementById('authBtn').style.display = 'none';
    document.getElementById('userBox').style.display = 'flex';
    document.getElementById('displayUsername').innerText = username;

    if (isSignup) {
      authMessage.innerHTML = `<div class="success" style="margin-bottom:10px;">Username created successfully</div>`;
      setTimeout(() => closeModal(), 1500);
    } else {
      closeModal();
    }
  } else {
    const msg = data.message || 'Failed.';
    let displayMsg = '';

    if (!isSignup) {
      displayMsg = msg.includes("not exist") ? "User does not exist"
        : msg.includes("incorrect") ? "Wrong password"
        : msg;
    } else {
      displayMsg = msg.includes("exists") ? "Username already exists" : msg;
    }

    authMessage.innerHTML = `<div class="error" style="margin-bottom:10px;">${displayMsg}</div>`;
  }
}

const arrow = document.getElementById('dropdownArrow');
const dropdown = document.getElementById('dropdownContent');
const pillBox = document.getElementById('pillBox');

if (arrow && dropdown && pillBox) {
  arrow.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('show');
  });

  document.addEventListener('click', (event) => {
    if (!pillBox.contains(event.target)) {
      dropdown.classList.remove('show');
    }
  });
}

function logout() {
  currentUser = null;
  sessionStorage.removeItem('username');
  document.getElementById('authBtn').style.display = 'inline-block';
  document.getElementById('userBox').style.display = 'none';
}

window.addEventListener('DOMContentLoaded', () => {
  const storedUser = sessionStorage.getItem('username');
  if (storedUser) {
    currentUser = storedUser;
    document.getElementById('authBtn').style.display = 'none';
    document.getElementById('userBox').style.display = 'flex';
    document.getElementById('displayUsername').innerText = storedUser;
  } else {
    document.getElementById('authBtn').style.display = 'inline-block';
    document.getElementById('userBox').style.display = 'none';
  }
});
