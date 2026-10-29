/* assets/js/admin.js - Operational Dashboard Control Engine */

let allRsvps = [];
let currentFilter = 'all';
let pinCountdownInterval = null;

// Central dictionary for labels
const RELATIONSHIP_LABELS = {
  groom_family: "Groom's family",
  bride_family: "Bride's family",
  groom_friend: "Groom's friend",
  bride_friend: "Bride's friend",
  fhi_member:   "Member of FHI",
  invitee:      "Invitee",
  minister:     "Minister",
  official:     "Official"
};

function relationshipLabel(key) {
  if (!key) return '—';
  return RELATIONSHIP_LABELS[key] || key;
}

document.addEventListener('DOMContentLoaded', async () => {
  // Live Account Check Protocol
  await verifySecureSession();
  await fetchLiveRsvpData();

  setupFilterControls();
  setupPinGeneratorButton();
  setupLogoutButton();
});

async function verifySecureSession() {
  const db = window.supabaseInstance || window.supabaseClient || window.supabase;
  if (!db || typeof db.auth === 'undefined') {
    window.location.href = 'admin-login.html';
    return;
  }
  const { data: { session }, error } = await db.auth.getSession();
  if (error || !session) {
    window.location.href = 'admin-login.html';
    return;
  }
  const adminUserEmail = document.getElementById('adminUserEmail');
  if (adminUserEmail) adminUserEmail.textContent = session.user.email;
}

async function fetchLiveRsvpData() {
  const tableBody = document.getElementById('guestTableBody');
  const db = window.supabaseInstance || window.supabaseClient || window.supabase;
  
  try {
    const { data, error } = await db.from('rsvp_responses').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    allRsvps = data || [];
    renderRsvpTable(allRsvps);
    updateStatsCounters(allRsvps);
    updateRelationshipSummary(allRsvps);
  } catch (err) {
    if (tableBody) tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 24px; color: #a03333;">Failed to communicate with tables: ${err.message}</td></tr>`;
  }
}

function renderRsvpTable(records) {
  const tableBody = document.getElementById('guestTableBody');
  if (!tableBody) return;

  const filtered = records.filter(r => {
    if (currentFilter === 'all') return true;
    return r.attending === currentFilter;
  });

  if (filtered.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 32px; color: var(--choco-300);">No guest responses matching this selection scope.</td></tr>`;
    return;
  }

  tableBody.innerHTML = filtered.map(r => `
    <tr>
      <td style="font-weight: 400; color: var(--choco);">${escapeHtml(r.first_name || '')} ${escapeHtml(r.last_name || '')}</td>
      <td>${escapeHtml(r.email || '—')}</td>
      <td>
        <span class="status-dot ${r.attending === 'yes' ? 'status-dot--yes' : 'status-dot--no'}">
          ${r.attending === 'yes' ? 'Attending' : 'Declined'}
        </span>
      </td>
      <td>${escapeHtml(relationshipLabel(r.relationship))}</td>
      <td style="max-width: 240px; font-size: 0.85rem; color: var(--choco-400); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;" title="${escapeHtml(r.note || '')}">${escapeHtml(r.note || '—')}</td>
    </tr>
  `).join('');
}

function updateStatsCounters(records) {
  const total = records.length;
  const attendingCount = records.filter(r => r.attending === 'yes').length;
  const declinedCount  = records.filter(r => r.attending === 'no').length;

  const cTotal     = document.getElementById('countTotal');
  const cAttending = document.getElementById('countAttending');
  const cDeclined  = document.getElementById('countDeclined');

  if (cTotal)     cTotal.textContent     = total;
  if (cAttending) cAttending.textContent = attendingCount;
  if (cDeclined)  cDeclined.textContent  = declinedCount;
}

function updateRelationshipSummary(records) {
  const summaryBody = document.getElementById('relationshipSummaryBody');
  if (!summaryBody) return;

  // Initialize all categories to zero
  const counts = {
    groom_family: 0,
    bride_family: 0,
    groom_friend: 0,
    bride_friend: 0,
    fhi_member:   0,
    invitee:      0,
    minister:     0,
    official:     0
  };

  // Aggregate counts (only for attending guests)
  records.forEach(r => {
    if (r.attending === 'yes' && r.relationship && counts.hasOwnProperty(r.relationship)) {
      counts[r.relationship]++;
    }
  });

  // Render rows
  summaryBody.innerHTML = Object.keys(counts).map(key => `
    <tr>
      <td style="font-weight: 400; color: var(--choco);">${relationshipLabel(key)}</td>
      <td><span class="status-pill status-pill--yes">${counts[key]}</span></td>
    </tr>
  `).join('');
}

function setupFilterControls() {
  document.querySelectorAll('.filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.getAttribute('data-filter');
      renderRsvpTable(allRsvps);
    });
  });
}

function setupPinGeneratorButton() {
  const btn = document.getElementById('generatePinBtn');
  if (btn) btn.addEventListener('click', generateSecurityPin);
}

async function generateSecurityPin() {
  clearInterval(pinCountdownInterval);
  const wrapper = document.getElementById('generatedPinWrapper');
  const valDisplay = document.getElementById('displayPinValue');
  const timerDisplay = document.getElementById('displayPinTimer');
  const db = window.supabaseInstance || window.supabaseClient || window.supabase;

  const randomPin = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    const { error } = await db.from('system_secrets').update({ secret_value: randomPin }).eq('secret_type', 'registration_master_pin');
    if (error) throw error;

    if (valDisplay) valDisplay.textContent = randomPin;
    if (wrapper) wrapper.style.display = 'flex';

    let timeLeft = 25 * 60;
    pinCountdownInterval = setInterval(() => {
      timeLeft--;
      if (timeLeft <= 0) {
        clearInterval(pinCountdownInterval);
        if (valDisplay) valDisplay.textContent = 'EXPIRED';
        if (timerDisplay) timerDisplay.textContent = '00:00';
      } else {
        const mins = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        if (timerDisplay) timerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }
    }, 1000);
  } catch (err) {
    alert('Failed to synchronize PIN: ' + err.message);
  }
}

function setupLogoutButton() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (confirm("Close dashboard window?")) {
        const db = window.supabaseInstance || window.supabaseClient || window.supabase;
        if (db && typeof db.auth !== 'undefined') await db.auth.signOut();
        window.location.href = 'admin-login.html';
      }
    });
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
}