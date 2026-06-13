// ========================================
// 🚛 TruckHub Manager - Hauptlogik
// ========================================

// ========== DATENBANK (LocalStorage) ==========
const DB = {
    get(key) { return JSON.parse(localStorage.getItem(key)) || null; },
    set(key, value) { localStorage.setItem(key, JSON.stringify(value)); },
    remove(key) { localStorage.removeItem(key); }
};

// ========== ROLLEN ==========
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

// ========== DEMO DATEN ==========
function initDemoData() {
    if (!DB.get('initialized')) {
        DB.set('speditionen', [{
            id: 1,
            name: 'TransEuropa Express',
            game: 'both',
            description: 'Die größte virtuelle Spedition Europas!',
            minKmPerWeek: 2000,
            owner: 'demo_user',
            createdAt: new Date().toISOString(),
            members: 7,
            totalKm: 45600,
            revenue: 125400
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
            { text: 'HighwayHanna hat den Auftrag LA → NY angenommen', icon: '📦', 
