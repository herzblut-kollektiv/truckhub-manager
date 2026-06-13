// ========================================
// 🚛 TruckHub Manager - Hauptlogik
// ========================================

const DB = {
    get(key) { return JSON.parse(localStorage.getItem(key)) || null; },
    set(key, value) { localStorage.setItem(key, JSON.stringify(value)); },
    remove(key) { localStorage.removeItem(key); }
};

const ROLES = {
    ceo: { name: '👑 CEO', level: 5 },
    manager: { name: '👔 Manager', level: 4 },
    disponent: { name: '📋 Disponent', level: 3 },
    erfahrener_fahrer: { name: '⭐ Erfahrener Fahrer', level: 2 },
    fahrer: { name: '🚛 Fahrer', level: 1 }
};

let currentUser = null;
let currentGame = 'ets2';
let currentJobFilter = 'all';

function initDemoData() {
    if (!DB.get('initialized')) {
        DB.set('speditionen', [{
            id: 1, name: 'TransEuropa Express', game: 'both',
            description: 'Die größte virtuelle Spedition Europas!',
            minKmPerWeek: 2000, owner: 'demo_user',
            createdAt: new Date().toISOString(),
            members: 7, totalKm: 45600, revenue: 125400
        }]);
        DB.set('drivers', [
            { id: 1, name: 'MaxTrucker', role: 'ceo', avatar: '👑', kmDriven: 3500, kmGoal: 2000, status: 'online', joinedAt: '2024-01-15' },
            { id: 2, name: 'LKW_Lisa', role: 'manager', avatar: '👔', kmDriven: 2800, kmGoal: 2000, status: 'online', joinedAt: '2024-02-01' },
            { id: 3, name: 'TruckBoy99', role: 'disponent', avatar: '📋', kmDriven: 1500, kmGoal: 2000, status: 'offline', joinedAt: '2024-02-15' },
            { id: 4, name: 'FernfahrerFrank', role: 'erfahrener_fahrer', avatar: '⭐', kmDriven: 2200, kmGoal: 2500, status: 'driving', joinedAt: '2024-03-01' },
            { id: 5, name: 'NeulingNina', role: 'fahrer', avatar: '🚛', kmDriven: 750, kmGoal: 2000, status: 'offline', joinedAt: '2024-06-01' },
            { id: 6, name: 'AutobahnAndi', role: 'fahrer', avatar: '🚛', kmDriven: 1800, kmGoal: 2000, status: 'online', joinedAt: '2024-04-10' },
            { id: 7, name: 'HighwayHanna', role: 'erfahrener_fahrer', avatar: '⭐', kmDriven: 2600, kmGoal: 2500, status: 'driving', joinedAt: '2024-03-20' }
        ]);
        DB.set('jobs', [
            { id: 1, start: 'Berlin', end: 'Paris', cargo: 'Elektronik', distance: 1050, pay: 18500, driver: 'FernfahrerFrank', status: 'progress', priority: 'high', game: 'ets2' },
            { id: 2, start: 'Hamburg', end: 'Madrid', cargo: 'Möbel', distance: 2300, pay: 32000, driver: '', status: 'open', priority: 'medium', game: 'ets2' },
            { id: 3, start: 'Wien', end: 'Rom', cargo: 'Lebensmittel', distance: 1200, pay: 15000, driver: 'AutobahnAndi', status: 'progress', priority: 'low', game: 'ets2' },
            { id: 4, start: 'Los Angeles', end: 'New York', cargo: 'Autoteile', distance: 4500, pay: 55000, driver: 'HighwayHanna', status: 'progress', priority: 'high', game: 'ats' },
            { id: 5, start: 'München', end: 'Warschau', cargo: 'Maschinen', distance: 850, pay: 12000, driver: '', status: 'open', priority: 'medium', game: 'ets2' },
            { id: 6, start: 'London', end: 'Stockholm', cargo: 'Textilien', distance: 1800, pay: 22000, driver: 'LKW_Lisa', status: 'done', priority: 'low', game: 'ets2' }
        ]);
        DB.set('activities', [
            { text: 'HighwayHanna hat den Auftrag LA → NY angenommen', icon: '📦', time: 'vor 5 Min' },
            { text: 'NeulingNina ist der Spedition beigetreten', icon: '👋', time: 'vor 15 Min' },
            { text: 'LKW_Lisa hat einen Auftrag abgeschlossen', icon: '✅', time: 'vor 1 Std' },
            { text: 'FernfahrerFrank fährt gerade Berlin → Paris', icon: '🚛', time: 'vor 2 Std' },
            { text: 'MaxTrucker hat einen neuen Auftrag erstellt', icon: '📋', time: 'vor 3 Std' }
        ]);
        DB.set('initialized', true);
    }
}

function showLoginModal() {
    document.getElementById('login-modal').classList.remove('hidden');
}

function hideLoginModal() {
    document.getElementById('login-modal').classList.add('hidden');
}

function loginWith(provider) {
    const names = { discord: 'Discord', twitch: 'Twitch', steam: 'Steam' };
    showToast('🔄 Verbinde mit ' + names[provider] + '...', 'info');
    setTimeout(function() {
        currentUser = {
            id: 'user_' + Date.now(),
            name: 'MaxTrucker',
            avatar: 'https://ui-avatars.com/api/?name=Max+Trucker&background=4CAF50&color=fff',
            provider: provider,
            role: 'ceo'
        };
        DB.set('currentUser', currentUser);
        hideLoginModal();
        showDashboard();
        showToast('✅ Erfolgreich über ' + names[provider] + ' eingeloggt!', 'success');
    }, 1000);
}

function logout() {
    currentUser = null;
    DB.remove('currentUser');
    document.getElementById('dashboard').classList.add('hidden');
    document.getElementById('landing-page').classList.remove('hidden');
    showToast('👋 Erfolgreich ausgeloggt!', 'info');
}

function showDashboard() {
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('login-modal').classList.add('hidden');
    document.getElementById('dashboard').classList.remove('hidden');
    document.getElementById('user-name').textContent = currentUser.name;
    document.getElementById('user-avatar').src = currentUser.avatar;
    document.getElementById('user-role').textContent = ROLES[currentUser.role].name;
    showSection('overview');
}

function showSection(section, event) {
    document.querySelectorAll('.section').forEach(function(s) { s.classList.add('hidden'); });
    document.getElementById('section-' + section).classList.remove('hidden');
    document.querySelectorAll('.sidebar-nav a').forEach(function(a) { a.classList.remove('active'); });
    if (event && event.target) {
        const link = event.target.closest('a');
        if (link) link.classList.add('active');
    }
    const titles = {
        overview: '📊 Übersicht', spedition: '🏢 Spedition', drivers: '👥 Fahrer',
        jobs: '📦 Aufträge', roles: '🛡️ Rollen', stats: '📊 Statistiken'
    };
    document.getElementById('page-title').textContent = titles[section];
    if (section === 'overview') loadOverview();
    if (section === 'spedition') loadSpeditionen();
    if (section === 'drivers') loadDrivers();
    if (section === 'jobs') loadJobs();
    if (section === 'stats') loadStats();
}

function loadOverview() {
    const drivers = DB.get('drivers') || [];
    const jobs = DB.get('jobs') || [];
    const activities = DB.get('activities') || [];
    const speditionen = DB.get('speditionen') || [];
    const openJobs = jobs.filter(function(j) { return j.status === 'open'; }).length;
    const activeDrivers = drivers.filter(function(d) { return d.status !== 'offline'; }).length;
    const totalRevenue = speditionen.reduce(function(sum, s) { return sum + (s.revenue || 0); }, 0);
    const myDriver = drivers.find(function(d) { return d.name === (currentUser && currentUser.name); }) || drivers[0];
    if (myDriver) {
        const remaining = Math.max(0, myDriver.kmGoal - myDriver.kmDriven);
        const progress = Math.min(100, (myDriver.kmDriven / myDriver.kmGoal * 100));
        document.getElementById('stat-km-remaining').textContent = remaining.toLocaleString() + ' km';
        document.getElementById('km-progress').style.width = progress + '%';
    }
    document.getElementById('stat-jobs-open').textContent = openJobs;
    document.getElementById('stat-drivers').textContent = activeDrivers;
    document.getElementById('stat-revenue').textContent = '€ ' + totalRevenue.toLocaleString();
    const tableBody = document.getElementById('driver-progress-table');
    tableBody.innerHTML = drivers.map(function(driver) {
        const rem = Math.max(0, driver.kmGoal - driver.kmDriven);
        const prog = Math.min(100, (driver.kmDriven / driver.kmGoal * 100));
        const color = prog >= 100 ? '#27ae60' : prog >= 50 ? '#f39c12' : '#e74c3c';
        const statusDot = driver.status === 'online' ? '#27ae60' : driver.status === 'driving' ? '#f39c12' : '#888';
        return '<tr><td><div style="display:flex;align-items:center;gap:10px;"><span>' + driver.avatar + '</span><span>' + driver.name + '</span><span style="width:8px;height:8px;border-radius:50%;background:' + statusDot + '"></span></div></td><td><span class="role-badge" style="font-size:11px;">' + (ROLES[driver.role] ? ROLES[driver.role].name : driver.role) + '</span></td><td>' + driver.kmDriven.toLocaleString() + ' km</td><td>' + driver.kmGoal.toLocaleString() + ' km</td><td style="color:' + color + ';font-weight:bold;">' + rem.toLocaleString() + ' km</td><td><div class="progress-bar" style="width:150px;"><div class="progress" style="width:' + prog + '%;background:' + color + ';"></div></div><span style="font-size:11px;color:#888;">' + Math.round(prog) + '%</span></td></tr>';
    }).join('');
    document.getElementById('activity-feed').innerHTML = activities.map(function(act) {
        return '<div class="activity-item"><div class="activity-icon" style="background:rgba(76,175,80,0.2);">' + act.icon + '</div><span>' + act.text + '</span><span class="activity-time">' + act.time + '</span></div>';
    }).join('');
}

function showCreateSpedition() { document.getElementById('create-spedition-form').classList.remove('hidden'); }
function hideCreateSpedition() { document.getElementById('create-spedition-form').classList.add('hidden'); }

function createSpedition() {
    const name = document.getElementById('spedition-name').value.trim();
    const game = document.getElementById('spedition-game').value;
    const desc = document.getElementById('spedition-desc').value.trim();
    const minKm = parseInt(document.getElementById('spedition-min-km').value) || 2000;
    if (!name) { showToast('❌ Bitte gib einen Namen ein!', 'error'); return; }
    const speditionen = DB.get('speditionen') || [];
    speditionen.push({
        id: Date.now(), name: name, game: game, description: desc,
        minKmPerWeek: minKm, owner: currentUser.name,
        createdAt: new Date().toISOString(),
        members: 1, totalKm: 0, revenue: 0
    });
    DB.set('speditionen', speditionen);
    hideCreateSpedition();
    loadSpeditionen();
    showToast('✅ Spedition "' + name + '" erstellt!', 'success');
    document.getElementById('spedition-name').value = '';
    document.getElementById('spedition-desc').value = '';
}

function loadSpeditionen() {
    const speditionen = DB.get('speditionen') || [];
    const list = document.getElementById('spedition-list');
    if (speditionen.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:#888;padding:40px;">Noch keine Spedition!</p>';
        return;
    }
    list.innerHTML = speditionen.map(function(s) {
        const gameLabel = s.game === 'ets2' ? '🇪🇺 ETS2' : s.game === 'ats' ? '🇺🇸 ATS' : '🌍 Beide';
        return '<div class="spedition-card"><div class="spedition-header"><div><h3>' + s.name + '</h3><span style="color:#888;font-size:13px;">' + gameLabel + ' · ' + s.owner + '</span></div><button class="btn-danger btn-small" onclick="confirmDeleteSpedition(' + s.id + ', \'' + s.name + '\')">🗑️ Löschen</button></div><p style="color:#aaa;margin:10px 0;">' + (s.description || 'Keine Beschreibung') + '</p><div class="spedition-stats"><span>👥 ' + s.members + ' Mitglieder</span><span>🛣️ ' + s.totalKm.toLocaleString() + ' km</span><span>💰 € ' + s.revenue.toLocaleString() + '</span><span>📏 Min. ' + s.minKmPerWeek.toLocaleString() + ' km/Woche</span></div></div>';
    }).join('');
}

function confirmDeleteSpedition(id, name) {
    const modal = document.createElement('div');
    modal.className = 'confirm-modal';
    modal.innerHTML = '<div class="confirm-content"><h3>⚠️ Spedition löschen?</h3><p>"<strong>' + name + '</strong>" wirklich löschen?</p><div class="confirm-actions"><button class="btn-danger" onclick="deleteSpeditionConfirmed(' + id + ')">🗑️ Ja</button><button class="btn-secondary" onclick="this.closest(\'.confirm-modal\').remove()">Abbrechen</button></div></div>';
    document.body.appendChild(modal);
}

function deleteSpeditionConfirmed(id) {
    let speditionen = DB.get('speditionen') || [];
    speditionen = speditionen.filter(function(s) { return s.id !== id; });
    DB.set('speditionen', speditionen);
    const modal = document.querySelector('.confirm-modal');
    if (modal) modal.remove();
    loadSpeditionen();
    showToast('🗑️ Spedition gelöscht!', 'success');
}

function showAddDriver() { document.getElementById('add-driver-form').classList.remove('hidden'); }
function hideAddDriver() { document.getElementById('add-driver-form').classList.add('hidden'); }

function addDriver() {
    const username = document.getElementById('driver-username').value.trim();
    const role = document.getElementById('driver-role').value;
    const kmGoal = parseInt(document.getElementById('driver-km-goal').value) || 2000;
    if (!username) { showToast('❌ Benutzername eingeben!', 'error'); return; }
    const drivers = DB.get('drivers') || [];
    if (drivers.find(function(d) { return d.name.toLowerCase() === username.toLowerCase(); })) {
        showToast('❌ Fahrer existiert bereits!', 'error'); return;
    }
    const avatars = { fahrer: '🚛', erfahrener_fahrer: '⭐', disponent: '📋', manager: '👔' };
    drivers.push({
        id: Date.now(), name: username, role: role,
        avatar: avatars[role] || '🚛',
        kmDriven: 0, kmGoal: kmGoal, status: 'offline',
        joinedAt: new Date().toISOString().split('T')[0]
    });
    DB.set('drivers', drivers);
    hideAddDriver();
    loadDrivers();
    showToast('✅ ' + username + ' hinzugefügt!', 'success');
    document.getElementById('driver-username').value = '';
}

function loadDrivers() {
    const drivers = DB.get('drivers') || [];
    const list = document.getElementById('drivers-list');
    list.innerHTML = drivers.map(function(d) {
        const colors = { online: '#27ae60', driving: '#f39c12', offline: '#888' };
        const texts = { online: 'Online', driving: 'Fährt', offline: 'Offline' };
        let roleOptions = '';
        for (const k in ROLES) {
            roleOptions += '<option value="' + k + '"' + (d.role === k ? ' selected' : '') + '>' + ROLES[k].name + '</option>';
        }
        return '<div class="driver-card"><div class="driver-info"><div class="driver-avatar">' + d.avatar + '</div><div><strong>' + d.name + '</strong><div style="font-size:12px;color:#888;"><span style="color:' + colors[d.status] + ';">● ' + texts[d.status] + '</span> · Seit ' + d.joinedAt + '</div></div></div><div style="display:flex;align-items:center;gap:15px;flex-wrap:wrap;"><div style="text-align:right;"><div style="font-size:14px;">' + d.kmDriven.toLocaleString() + ' / ' + d.kmGoal.toLocaleString() + ' km</div><div class="progress-bar" style="width:120px;margin-top:5px;"><div class="progress" style="width:' + Math.min(100, d.kmDriven/d.kmGoal*100) + '%"></div></div></div><select onchange="changeDriverRole(' + d.id + ', this.value)" style="background:var(--darker);color:var(--light);border:1px solid rgba(255,255,255,0.1);padding:5px;border-radius:5px;font-size:12px;">' + roleOptions + '</select><button class="btn-danger btn-small" onclick="removeDriver(' + d.id + ', \'' + d.name + '\')">✕</button></div></div>';
    }).join('');
}

function changeDriverRole(id, newRole) {
    const drivers = DB.get('drivers') || [];
    const driver = drivers.find(function(d) { return d.id === id; });
    if (driver) {
        const avatars = { ceo: '👑', manager: '👔', disponent: '📋', erfahrener_fahrer: '⭐', fahrer: '🚛' };
        driver.role = newRole;
        driver.avatar = avatars[newRole] || '🚛';
        DB.set('drivers', drivers);
        loadDrivers();
        showToast('✅ ' + driver.name + ' ist jetzt ' + ROLES[newRole].name, 'success');
    }
}

function removeDriver(id, name) {
    if (confirm('"' + name + '" wirklich entfernen?')) {
        let drivers = DB.get('drivers') || [];
        drivers = drivers.filter(function(d) { return d.id !== id; });
        DB.set('drivers', drivers);
        loadDrivers();
        showToast('🗑️ ' + name + ' entfernt.', 'info');
    }
}

function showCreateJob() {
    document.getElementById('create-job-form').classList.remove('hidden');
    updateJobDriverSelect();
}

function hideCreateJob() { document.getElementById('create-job-form').classList.add('hidden'); }

function updateJobDriverSelect() {
    const drivers = DB.get('drivers') || [];
    const select = document.getElementById('job-driver');
    select.innerHTML = '<option value="">-- Wählen --</option>' + drivers.map(function(d) {
        return '<option value="' + d.name + '">' + d.avatar + ' ' + d.name + '</option>';
    }).join('');
}

function createJob() {
    const start = document.getElementById('job-start').value.trim();
    const end = document.getElementById('job-end').value.trim();
    const cargo = document.getElementById('job-cargo').value.trim();
    const distance = parseInt(document.getElementById('job-distance').value) || 0;
    const pay = parseInt(document.getElementById('job-pay').value) || 0;
    const driver = document.getElementById('job-driver').value;
    const priority = document.getElementById('job-priority').value;
    if (!start || !end) { showToast('❌ Start und Ziel eingeben!', 'error'); return; }
    const jobs = DB.get('jobs') || [];
    jobs.push({
        id: Date.now(), start: start, end: end, cargo: cargo,
        distance: distance, pay: pay, driver: driver || '',
        status: driver ? 'progress' : 'open',
        priority: priority, game: currentGame,
        createdAt: new Date().toISOString()
    });
    DB.set('jobs', jobs);
    hideCreateJob();
    loadJobs();
    showToast('✅ Auftrag ' + start + ' → ' + end + ' erstellt!', 'success');
    ['job-start','job-end','job-cargo','job-distance','job-pay'].forEach(function(id) {
        document.getElementById(id).value = '';
    });
}

function filterJobs(filter, event) {
    currentJobFilter = filter;
    document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
    if (event && event.target) event.target.classList.add('active');
    loadJobs();
}

function loadJobs() {
    const jobs = DB.get('jobs') || [];
    const list = document.getElementById('jobs-list');
    let filtered = currentJobFilter === 'all' ? jobs : jobs.filter(function(j) { return j.status === currentJobFilter; });
    if (filtered.length === 0) {
        list.innerHTML = '<p style="text-align:center;color:#888;padding:30px;">Keine Aufträge.</p>';
        return;
    }
    list.innerHTML = filtered.map(function(job) {
        const statusClass = 'status-' + job.status;
        const statusText = job.status === 'open' ? '🟢 Offen' : job.status === 'progress' ? '🟡 Aktiv' : '✅ Erledigt';
        const gameIcon = job.game === 'ets2' ? '🇪🇺' : '🇺🇸';
        let buttons = '';
        if (job.status === 'open') buttons += '<button class="btn-primary btn-small" onclick="acceptJob(' + job.id + ')">Annehmen</button>';
        if (job.status === 'progress') buttons += '<button class="btn-primary btn-small" style="background:#27ae60;" onclick="completeJob(' + job.id + ')">✅ Fertig</button>';
        return '<div class="job-card priority-' + job.priority + '"><div><div class="job-route">' + gameIcon + ' ' + job.start + ' → ' + job.end + '</div><div class="job-details"><span>📦 ' + (job.cargo || '-') + '</span><span>🛣️ ' + job.distance.toLocaleString() + ' km</span><span>💰 € ' + job.pay.toLocaleString() + '</span><span>👤 ' + (job.driver || 'Frei') + '</span></div></div><div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;"><span class="job-status ' + statusClass + '">' + statusText + '</span>' + buttons + '<button class="btn-danger btn-small" onclick="deleteJob(' + job.id + ')">🗑️</button></div></div>';
    }).join('');
}

function acceptJob(id) {
    const jobs = DB.get('jobs') || [];
    const job = jobs.find(function(j) { return j.id === id; });
    if (job) {
        job.status = 'progress';
        job.driver = (currentUser && currentUser.name) || 'Du';
        DB.set('jobs', jobs);
        loadJobs();
        showToast('✅ Auftrag angenommen!', 'success');
    }
}

function completeJob(id) {
    const jobs = DB.get('jobs') || [];
    const job = jobs.find(function(j) { return j.id === id; });
    if (job) {
        job.status = 'done';
        DB.set('jobs', jobs);
        if (job.driver) {
            const drivers = DB.get('drivers') || [];
            const driver = drivers.find(function(d) { return d.name === job.driver; });
            if (driver) {
                driver.kmDriven += job.distance;
                DB.set('drivers', drivers);
            }
        }
        loadJobs();
        showToast('🎉 +' + job.distance + ' km gefahren!', 'success');
    }
}

function deleteJob(id) {
    if (confirm('Auftrag löschen?')) {
        let jobs = DB.get('jobs') || [];
        jobs = jobs.filter(function(j) { return j.id !== id; });
        DB.set('jobs', jobs);
        loadJobs();
        showToast('🗑️ Auftrag gelöscht.', 'info');
    }
}

function loadStats() {
    const drivers = DB.get('drivers') || [];
    const jobs = DB.get('jobs') || [];
    const content = document.getElementById('stats-content');
    const totalKm = drivers.reduce(function(sum, d) { return sum + d.kmDriven; }, 0);
    const totalJobs = jobs.length;
    const completedJobs = jobs.filter(function(j) { return j.status === 'done'; }).length;
    const totalRevenue = jobs.filter(function(j) { return j.status === 'done'; }).reduce(function(sum, j) { return sum + j.pay; }, 0);
    const sortedDrivers = drivers.slice().sort(function(a, b) { return b.kmDriven - a.kmDriven; });
    let rankingRows = '';
    sortedDrivers.forEach(function(d, i) {
        const perc = Math.round(d.kmDriven / d.kmGoal * 100);
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1);
        rankingRows += '<tr><td>' + medal + '</td><td>' + d.avatar + ' ' + d.name + '</td><td><strong>' + d.kmDriven.toLocaleString() + ' km</strong></td><td>' + d.kmGoal.toLocaleString() + ' km</td><td><div class="progress-bar" style="width:100px;display:inline-block;vertical-align:middle;"><div class="progress" style="width:' + Math.min(100, perc) + '%"></div></div> ' + perc + '%</td></tr>';
    });
    content.innerHTML = '<div class="stats-grid" style="margin-bottom:25px;"><div class="stat-card"><i class="fas fa-road"></i><div class="stat-info"><h3>' + totalKm.toLocaleString() + ' km</h3><p>Gesamt</p></div></div><div class="stat-card"><i class="fas fa-clipboard-list"></i><div class="stat-info"><h3>' + totalJobs + '</h3><p>Aufträge</p></div></div><div class="stat-card"><i class="fas fa-check-circle"></i><div class="stat-info"><h3>' + completedJobs + '</h3><p>Erledigt</p></div></div><div class="stat-card"><i class="fas fa-euro-sign"></i><div class="stat-info"><h3>€ ' + totalRevenue.toLocaleString() + '</h3><p>Verdient</p></div></div></div><h3 style="margin-bottom:15px;">🏆 Fahrer-Ranking</h3><table class="data-table"><thead><tr><th>#</th><th>Fahrer</th><th>Gefahren</th><th>Ziel</th><th>Erfüllung</th></tr></thead><tbody>' + rankingRows + '</tbody></table>';
}

function switchGame(game) {
    currentGame = game;
    const name = game === 'ets2' ? 'Euro Truck Simulator 2' : 'American Truck Simulator';
    showToast('🎮 ' + name, 'info');
}

function showToast(message, type) {
    type = type || 'info';
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 3000);
}

document.addEventListener('DOMContentLoaded', function() {
    initDemoData();
    const savedUser = DB.get('currentUser');
    if (savedUser) {
        currentUser = savedUser;
        showDashboard();
    }
});
