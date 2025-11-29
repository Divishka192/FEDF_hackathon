// Simple async-localStorage service to simulate a backend.
// All functions return Promises to mimic real API calls.
const KEY_USERS = 'seam_users';
const KEY_EVENTS = 'seam_events';
const KEY_REQUESTS = 'seam_requests';
const KEY_CURRENT = 'seam_current_user';

const wait = (ms = 250) => new Promise(res => setTimeout(res, ms));

const uid = (prefix = '') => `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2,8)}`;

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const seedIfEmpty = () => {
  if (!read(KEY_USERS, []).length) {
    const teacher = { id: uid('u_'), name: 'Alice Teacher', email: 'teacher@example.com', password: 'password', role: 'teacher' };
    const student = { id: uid('u_'), name: 'Bob Student', email: 'student@example.com', password: 'password', role: 'student' };
    write(KEY_USERS, [teacher, student]);
  }
  if (!read(KEY_EVENTS, []).length) {
    const users = read(KEY_USERS, []);
    const teacher = users.find(u => u.role === 'teacher');
    if (teacher) {
      const e1 = { id: uid('e_'), title: 'Robotics Meetup', description: 'Build & test', date: new Date(Date.now()+86400000).toISOString(), location: 'Lab 1', maxAttendees: 20, createdBy: teacher.id, attendees: [], completed: false, allowRequests: true };
      const e2 = { id: uid('e_'), title: 'Art Workshop', description: 'Watercolors', date: new Date(Date.now()+3*86400000).toISOString(), location: 'Studio', maxAttendees: 15, createdBy: teacher.id, attendees: [], completed: false, allowRequests: true };
      write(KEY_EVENTS, [e1, e2]);
    }
  }
};
seedIfEmpty();

export const storage = {
  // auth
  register: async ({ name, email, password, role = 'student' }) => {
    await wait(300);
    const users = read(KEY_USERS, []);
    if (users.some(u => u.email === email)) throw new Error('Email already registered');
    const user = { id: uid('u_'), name, email, password, role };
    users.push(user);
    write(KEY_USERS, users);
    write(KEY_CURRENT, { id: user.id, name: user.name, email: user.email, role: user.role });
    return { user };
  },
  login: async ({ email, password }) => {
    await wait(200);
    const users = read(KEY_USERS, []);
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) throw new Error('Invalid credentials');
    write(KEY_CURRENT, { id: user.id, name: user.name, email: user.email, role: user.role });
    return { user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  },
  logout: () => {
    localStorage.removeItem(KEY_CURRENT);
  },
  getCurrentUser: () => {
    return read(KEY_CURRENT, null);
  },

  // events
  getEvents: async () => {
    await wait(150);
    return read(KEY_EVENTS, []);
  },
  getEvent: async (id) => {
    await wait(120);
    return read(KEY_EVENTS, []).find(e => e.id === id);
  },
  createEvent: async (payload) => {
    await wait(200);
    const events = read(KEY_EVENTS, []);
    const ev = { ...payload, id: uid('e_'), attendees: [], completed: false };
    events.push(ev);
    write(KEY_EVENTS, events);
    return ev;
  },
  updateEvent: async (id, patch) => {
    await wait(200);
    const events = read(KEY_EVENTS, []);
    const idx = events.findIndex(e => e.id === id);
    if (idx === -1) throw new Error('Event not found');
    events[idx] = { ...events[idx], ...patch };
    write(KEY_EVENTS, events);
    return events[idx];
  },
  deleteEvent: async (id) => {
    await wait(150);
    let events = read(KEY_EVENTS, []);
    events = events.filter(e => e.id !== id);
    write(KEY_EVENTS, events);
  },

  // join requests
  createRequest: async (activityId, studentId) => {
    await wait(200);
    const events = read(KEY_EVENTS, []);
    const ev = events.find(e => e.id === activityId);
    if (!ev) throw new Error('Activity not found');
    if (!ev.allowRequests) throw new Error('Requests are not allowed for this activity');

    const requests = read(KEY_REQUESTS, []);
    if (requests.some(r => r.activity === activityId && r.student === studentId)) throw new Error('Request already submitted');

    const jr = { id: uid('r_'), activity: activityId, student: studentId, status: 'pending', requestedAt: new Date().toISOString(), respondedAt: null, respondedBy: null, note: '' };
    requests.push(jr);
    write(KEY_REQUESTS, requests);
    return jr;
  },
  getRequestsForActivity: async (activityId) => {
    await wait(150);
    return read(KEY_REQUESTS, []).filter(r => r.activity === activityId);
  },
  getMyRequests: async (studentId) => {
    await wait(150);
    return read(KEY_REQUESTS, []).filter(r => r.student === studentId);
  },
  approveRequest: async (requestId, teacherId) => {
    await wait(200);
    const requests = read(KEY_REQUESTS, []);
    const r = requests.find(x => x.id === requestId);
    if (!r) throw new Error('Request not found');
    if (r.status !== 'pending') throw new Error('Already processed');
    r.status = 'approved';
    r.respondedAt = new Date().toISOString();
    r.respondedBy = teacherId;
    write(KEY_REQUESTS, requests);

    // add to attendees
    const events = read(KEY_EVENTS, []);
    const ev = events.find(e => e.id === r.activity);
    if (ev && !ev.attendees.includes(r.student)) {
      ev.attendees.push(r.student);
      write(KEY_EVENTS, events);
    }
    return r;
  },
  rejectRequest: async (requestId, teacherId, note = '') => {
    await wait(150);
    const requests = read(KEY_REQUESTS, []);
    const r = requests.find(x => x.id === requestId);
    if (!r) throw new Error('Request not found');
    if (r.status !== 'pending') throw new Error('Already processed');
    r.status = 'rejected';
    r.respondedAt = new Date().toISOString();
    r.respondedBy = teacherId;
    r.note = note;
    write(KEY_REQUESTS, requests);
    return r;
  },
  // utility for resetting (not used by UI)
  _resetAll: () => {
    localStorage.removeItem(KEY_USERS);
    localStorage.removeItem(KEY_EVENTS);
    localStorage.removeItem(KEY_REQUESTS);
    localStorage.removeItem(KEY_CURRENT);
  }
};