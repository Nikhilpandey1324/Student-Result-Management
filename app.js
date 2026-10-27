(() => {
  "use strict";

  const STORAGE_KEY = "gradebook-data-v1";
  const SESSION_KEY = "gradebook-session-v1";
  const ACCOUNTS_KEY = "gradebook-student-accounts-v1";
  const LAST_LOGIN_KEY = "gradebook-last-login-v1";
  const SIGNUP_NOTICE_KEY = "gradebook-signup-notice-v1";
  const PASSWORD_ITERATIONS = 120000;
  const EMAILJS_SDK_URL = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
  const PAGE = document.body.dataset.page || "login";
  const PAGE_FILES = {
    dashboard: "admin.html",
    students: "students.html",
    subjects: "subjects.html",
    results: "results.html",
    student: "student-dashboard.html",
    marksheet: "marksheet.html"
  };
  const DEFAULT_DATA = {
    students: [
      { id: "STU-2401", name: "Aarav Sharma", email: "aarav@school.edu", className: "Grade 10", section: "A", gender: "Male", phone: "98765 43210", status: "Active" },
      { id: "STU-2402", name: "Ananya Patel", email: "ananya@school.edu", className: "Grade 10", section: "A", gender: "Female", phone: "98765 12345", status: "Active" },
      { id: "STU-2403", name: "Kabir Verma", email: "kabir@school.edu", className: "Grade 9", section: "B", gender: "Male", phone: "98765 98765", status: "Active" },
      { id: "STU-2404", name: "Diya Singh", email: "diya@school.edu", className: "Grade 10", section: "B", gender: "Female", phone: "98765 24680", status: "Active" },
      { id: "STU-2405", name: "Ishaan Mehta", email: "ishaan@school.edu", className: "Grade 9", section: "A", gender: "Male", phone: "98765 13579", status: "Active" },
      { id: "STU-2406", name: "Mira Reddy", email: "mira@school.edu", className: "Grade 10", section: "A", gender: "Female", phone: "98765 11223", status: "Inactive" }
    ],
    subjects: [
      { id: "SUB-101", name: "Mathematics", code: "MATH10", className: "Grade 10", maxMarks: 100, passMarks: 35, teacher: "Ms. Rao" },
      { id: "SUB-102", name: "Science", code: "SCI10", className: "Grade 10", maxMarks: 100, passMarks: 35, teacher: "Mr. Kumar" },
      { id: "SUB-103", name: "English", code: "ENG10", className: "Grade 10", maxMarks: 100, passMarks: 35, teacher: "Ms. Das" },
      { id: "SUB-104", name: "Social Studies", code: "SST10", className: "Grade 10", maxMarks: 100, passMarks: 35, teacher: "Mr. Shah" },
      { id: "SUB-201", name: "Mathematics", code: "MATH09", className: "Grade 9", maxMarks: 100, passMarks: 35, teacher: "Ms. Rao" },
      { id: "SUB-202", name: "Science", code: "SCI09", className: "Grade 9", maxMarks: 100, passMarks: 35, teacher: "Mr. Kumar" }
    ],
    results: [
      { id: "RES-001", studentId: "STU-2401", subjectId: "SUB-101", exam: "Midterm Exam", marks: 88, date: "2026-09-18", published: true },
      { id: "RES-002", studentId: "STU-2401", subjectId: "SUB-102", exam: "Midterm Exam", marks: 76, date: "2026-09-18", published: true },
      { id: "RES-003", studentId: "STU-2401", subjectId: "SUB-103", exam: "Midterm Exam", marks: 92, date: "2026-09-19", published: true },
      { id: "RES-004", studentId: "STU-2401", subjectId: "SUB-104", exam: "Midterm Exam", marks: 81, date: "2026-09-19", published: true },
      { id: "RES-005", studentId: "STU-2402", subjectId: "SUB-101", exam: "Midterm Exam", marks: 95, date: "2026-09-18", published: true },
      { id: "RES-006", studentId: "STU-2402", subjectId: "SUB-102", exam: "Midterm Exam", marks: 89, date: "2026-09-18", published: true },
      { id: "RES-007", studentId: "STU-2402", subjectId: "SUB-103", exam: "Midterm Exam", marks: 94, date: "2026-09-19", published: true },
      { id: "RES-008", studentId: "STU-2402", subjectId: "SUB-104", exam: "Midterm Exam", marks: 91, date: "2026-09-19", published: true },
      { id: "RES-009", studentId: "STU-2403", subjectId: "SUB-201", exam: "Midterm Exam", marks: 72, date: "2026-09-18", published: true },
      { id: "RES-010", studentId: "STU-2403", subjectId: "SUB-202", exam: "Midterm Exam", marks: 68, date: "2026-09-18", published: true },
      { id: "RES-011", studentId: "STU-2404", subjectId: "SUB-101", exam: "Midterm Exam", marks: 83, date: "2026-09-18", published: false },
      { id: "RES-012", studentId: "STU-2404", subjectId: "SUB-102", exam: "Midterm Exam", marks: 79, date: "2026-09-18", published: false }
    ]
  };

  const clone = value => JSON.parse(JSON.stringify(value));
  const esc = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const loadAccounts = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "[]");
      if (!Array.isArray(saved)) throw new Error("Saved student accounts are invalid.");
      return saved.filter(account => account && typeof account.email === "string" && typeof account.studentId === "string" && typeof account.salt === "string" && typeof account.passwordHash === "string");
    } catch (error) {
      console.error("Could not load student accounts.", error);
      return [];
    }
  };
  const loadData = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return clone(DEFAULT_DATA);
      const parsed = JSON.parse(saved);
      if (!parsed || !Array.isArray(parsed.students) || !Array.isArray(parsed.subjects) || !Array.isArray(parsed.results)) throw new Error("Saved data is invalid.");
      return parsed;
    } catch (error) {
      console.error("Could not load Gradebook data.", error);
      return clone(DEFAULT_DATA);
    }
  };
  let data = loadData();
  let accounts = loadAccounts();
  let user = null;
  let search = "";
  let filter = "all";
  try {
    user = JSON.parse(localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY) || "null");
    if (!user || !["admin", "student"].includes(user.role) || (user.role === "student" && !user.id)) user = null;
  }
  catch (error) { console.error("Could not read the current session.", error); }

  const save = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); return true; }
    catch (error) { console.error("Could not save Gradebook data.", error); toast("Could not save changes in this browser."); return false; }
  };
  const saveAccounts = () => {
    try { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts)); return true; }
    catch (error) { console.error("Could not save student accounts.", error); toast("Could not save this account in the browser."); return false; }
  };
  const loadEmailJs = () => new Promise((resolve, reject) => {
    if (window.emailjs) { resolve(window.emailjs); return; }
    const existing = document.querySelector('script[data-emailjs-sdk="true"]');
    if (existing) {
      existing.addEventListener("load", () => window.emailjs ? resolve(window.emailjs) : reject(new Error("EmailJS SDK did not initialize.")), { once: true });
      existing.addEventListener("error", () => reject(new Error("Could not load the EmailJS SDK.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = EMAILJS_SDK_URL;
    script.async = true;
    script.dataset.emailjsSdk = "true";
    script.onload = () => window.emailjs ? resolve(window.emailjs) : reject(new Error("EmailJS SDK did not initialize."));
    script.onerror = () => reject(new Error("Could not load the EmailJS SDK."));
    document.head.appendChild(script);
  });
  const sendSignupNotification = async student => {
    const config = window.GRADEBOOK_EMAILJS_CONFIG;
    const configured = config && ["serviceId", "templateId", "publicKey"].every(key => {
      const value = config[key];
      return typeof value === "string" && value.trim() && !value.startsWith("YOUR_EMAILJS_");
    });
    if (!configured) return "not-configured";
    const emailjs = await loadEmailJs();
    await emailjs.send(config.serviceId, config.templateId, {
      student_name: student.name,
      student_email: student.email,
      student_id: student.id,
      student_class: `${student.className} · ${student.section}`
    }, { publicKey: config.publicKey });
    return "sent";
  };
  const setSession = (nextUser, remember) => {
    user = nextUser;
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
    (remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(user));
  };
  const passwordBytes = async (password, salt) => {
    if (!globalThis.crypto?.subtle) throw new Error("Secure password storage is unavailable. Open this app through localhost or HTTPS.");
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
    const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", salt, iterations: PASSWORD_ITERATIONS, hash: "SHA-256" }, key, 256);
    return new Uint8Array(bits);
  };
  const toBase64 = bytes => btoa(String.fromCharCode(...bytes));
  const fromBase64 = value => Uint8Array.from(atob(value), character => character.charCodeAt(0));
  const createPasswordRecord = async password => {
    const salt = crypto.getRandomValues(new Uint8Array(16));
    return { salt: toBase64(salt), passwordHash: toBase64(await passwordBytes(password, salt)) };
  };
  const verifyPassword = async (password, record) => {
    const actual = await passwordBytes(password, fromBase64(record.salt));
    const expected = fromBase64(record.passwordHash);
    return actual.length === expected.length && actual.every((byte, index) => byte === expected[index]);
  };
  const toast = message => {
    const root = document.getElementById("toast-root");
    if (!root) return;
    root.innerHTML = `<div class="toast">${esc(message)}</div>`;
    setTimeout(() => { root.innerHTML = ""; }, 2800);
  };
  const studentById = id => data.students.find(student => student.id === id);
  const subjectById = id => data.subjects.find(subject => subject.id === id);
  const initials = name => String(name || "?").split(/\s+/).slice(0, 2).map(part => part[0] || "").join("").toUpperCase();
  const grade = (marks, max) => {
    const percent = Number(marks) / Number(max || 100) * 100;
    if (percent >= 90) return "A+";
    if (percent >= 80) return "A";
    if (percent >= 70) return "B";
    if (percent >= 60) return "C";
    if (percent >= 50) return "D";
    return "F";
  };
  const avg = list => list.length ? list.reduce((sum, value) => sum + Number(value), 0) / list.length : 0;
  const dateText = value => value ? new Date(value + "T00:00:00").toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—";
  const person = student => `<div class="person"><span class="avatar">${esc(initials(student.name))}</span><span><strong>${esc(student.name)}</strong><small>${esc(student.email)}</small></span></div>`;
  const heading = (title, description, actions = "") => `<div class="page-heading"><div><h1>${title}</h1><p>${description}</p></div><div class="heading-actions">${actions}</div></div>`;
  const stat = (label, value, icon, note) => `<article class="stat-card"><div class="stat-top"><span>${label}</span><span class="stat-icon">${icon}</span></div><div class="stat-number">${value}</div><div class="stat-foot">${note}</div></article>`;
  const button = (action, text, primary = false) => `<button class="btn ${primary ? "btn-primary" : "btn-light"}" data-action="${action}">${text}</button>`;

  const loginPage = () => {
    const lastLogin = esc(localStorage.getItem(LAST_LOGIN_KEY) || "");
    return `<div class="login-page"><section class="login-story"><div class="brand"><span class="brand-mark">▦</span>Gradebook</div><div class="story-copy"><div class="eyebrow">A clearer view of student progress</div><h1>Every result.<br>One place.</h1><p>Manage student records, track academic performance, and give every student a clear view of their achievements.</p></div><div class="story-foot">© 2026 Gradebook · Student Result Management</div></section><section class="login-side"><div class="login-card"><div class="brand" style="margin-bottom:32px"><span class="brand-mark login-mark">▦</span>Gradebook</div><div class="auth-switch"><button class="auth-tab active" type="button" data-auth-mode="login">Sign in</button><button class="auth-tab" type="button" data-auth-mode="register">Create student account</button></div><section id="login-panel" class="auth-panel"><h2>Welcome back</h2><p class="login-sub">Sign in to continue to your account.</p><form id="login-form"><div class="field"><label for="login-email">Email or student ID</label><input id="login-email" name="email" value="${lastLogin}" type="text" placeholder="you@school.edu or STU-2401" required autocomplete="username"></div><div class="field"><label for="login-password">Password</label><input id="login-password" name="password" type="password" placeholder="Enter your password" required autocomplete="current-password"></div><label class="remember-option"><input name="remember" type="checkbox" checked><span>Remember me on this device</span></label><div class="login-error" id="login-error" role="alert"></div><button class="btn btn-primary full" type="submit">Sign in →</button></form><div class="login-note"><strong>Demo accounts</strong><br>Admin: admin@school.edu / admin123<br>Student: aarav@school.edu / student123</div></section><section id="register-panel" class="auth-panel" hidden><h2>Create a student account</h2><p class="login-sub">Choose a password. It will be stored as a one-way hash on this device.</p><form id="register-form"><div class="field"><label for="register-name">Full name</label><input id="register-name" name="name" type="text" required autocomplete="name"></div><div class="field"><label for="register-email">Email address</label><input id="register-email" name="email" type="email" required autocomplete="email"></div><div class="form-grid"><div class="field"><label for="register-class">Class / grade</label><input id="register-class" name="className" value="Grade 10" required></div><div class="field"><label for="register-section">Section</label><input id="register-section" name="section" value="A" required></div></div><div class="field"><label for="register-password">Create password</label><input id="register-password" name="password" type="password" minlength="8" required autocomplete="new-password"></div><div class="field"><label for="register-confirm">Confirm password</label><input id="register-confirm" name="confirmPassword" type="password" minlength="8" required autocomplete="new-password"></div><label class="remember-option"><input name="remember" type="checkbox" checked><span>Remember me on this device</span></label><div class="login-error" id="register-error" role="alert"></div><button class="btn btn-primary full" type="submit">Create account →</button></form><div class="login-note">Your student ID will be shown after account creation. Passwords are never emailed or saved as readable text.</div></section><p style="color:#9aa3b2;text-align:center;font-size:10px">Demo app · Accounts and marks are stored locally in this browser.</p></div></section></div>`;
  };

  const navigation = () => {
    const links = user.role === "admin"
      ? [["dashboard", "⌂", "Dashboard", "admin.html"], ["students", "♙", "Students", "students.html"], ["subjects", "▤", "Subjects", "subjects.html"], ["results", "◈", "Results", "results.html"]]
      : [["student", "▧", "My results", "student-dashboard.html"], ["marksheet", "▤", "Marksheet", "marksheet.html"]];
    const labels = links.map(([id, icon, label, href], index) => `${index === 0 ? `<div class="nav-label">${user.role === "admin" ? "Overview" : "Student portal"}</div>` : index === 1 && user.role === "admin" ? `<div class="nav-label">Management</div>` : ""}<a class="nav-link ${PAGE === id ? "active" : ""}" href="${href}"><span class="nav-icon">${icon}</span>${label}</a>`).join("");
    const name = user.role === "admin" ? "Administrator" : user.name;
    return `<div class="app-shell"><aside class="sidebar" id="sidebar"><div class="brand"><span class="brand-mark">▦</span>Gradebook</div>${labels}<div class="sidebar-bottom"><div class="term-card"><small>Academic year</small><strong>2026 – 2027</strong></div><div class="user-chip"><span class="avatar">${esc(initials(name))}</span><span class="user-info"><strong>${esc(name)}</strong><small>${user.role === "admin" ? "School administrator" : esc(user.id)}</small></span><button class="logout" data-action="logout" title="Sign out">↪</button></div></div></aside><div class="mobile-overlay" id="mobile-overlay"></div><main class="main"><header class="topbar"><button class="mobile-menu" data-action="menu">☰</button><div class="crumb">Gradebook <span style="padding:0 7px;color:#b1bac8">/</span><strong>${PAGE === "dashboard" ? "Dashboard" : PAGE === "student" ? "My results" : PAGE === "marksheet" ? "Marksheet" : PAGE[0].toUpperCase() + PAGE.slice(1)}</strong></div><div class="top-actions"><span class="top-date">${new Date().toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</span><span class="avatar">${esc(initials(name))}</span></div></header><section class="content" id="content"></section></main></div>`;
  };

  const dashboardPage = () => {
    const published = data.results.filter(result => result.published);
    const averages = data.students.map(student => avg(published.filter(result => result.studentId === student.id).map(result => result.marks))).filter(Boolean);
    const grades = { "A+": 0, A: 0, B: 0, C: 0, D: 0, F: 0 };
    published.forEach(result => { const subject = subjectById(result.subjectId); if (subject) grades[grade(result.marks, subject.maxMarks)] += 1; });
    const maxGrade = Math.max(1, ...Object.values(grades));
    const bars = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"].map((month, i) => `<div class="bar-group"><div class="bars"><span class="bar" style="height:${[55,74,62,88,70,96][i]}%"></span><span class="bar secondary" style="height:${[42,59,52,65,61,77][i]}%"></span></div><span class="bar-label">${month}</span></div>`).join("");
    const gradeRows = Object.entries(grades).map(([g, count]) => `<div class="grade-row"><span class="grade-name">${g}</span><div class="grade-track"><div class="grade-fill" style="width:${count / maxGrade * 100}%"></div></div><span class="grade-count">${count}</span></div>`).join("");
    const recent = [...data.results].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map(result => {
      const student = studentById(result.studentId), subject = subjectById(result.subjectId);
      return student && subject ? `<tr><td>${person(student)}</td><td>${esc(subject.name)}</td><td>${esc(result.exam)}</td><td><strong>${result.marks}</strong> / ${subject.maxMarks}</td><td><span class="badge ${result.published ? "badge-green" : "badge-amber"}">${result.published ? "Published" : "Draft"}</span></td></tr>` : "";
    }).join("");
    return `${heading("Good afternoon, Admin", "Here’s what’s happening at your school today.", button("add-result", "＋ Add result", true))}<div class="stats-grid">${stat("Total students", data.students.length, "♙", `${data.students.filter(s => s.status === "Active").length} active students`)}${stat("Subjects", data.subjects.length, "▤", "Across all grade levels")}${stat("Results recorded", data.results.length, "◈", `${published.length} published to students`)}${stat("Average score", `${avg(averages).toFixed(1)}%`, "↗", "Based on published results")}</div><div class="dashboard-grid"><article class="panel"><div class="panel-head"><div><h2>Academic performance</h2><p>Average marks by month</p></div><span class="badge badge-blue">2026–27</span></div><div class="panel-body"><div class="chart">${bars}</div><div class="legend"><span>Current year</span><span>Previous year</span></div></div></article><article class="panel"><div class="panel-head"><div><h2>Grade distribution</h2><p>Published marks by grade</p></div></div><div class="panel-body">${gradeRows}</div></article></div><article class="panel"><div class="panel-head"><div><h2>Recent results</h2><p>Latest entries across the school</p></div><a class="btn btn-light btn-small" href="results.html">View all results →</a></div><div class="table-wrap"><table><thead><tr><th>Student</th><th>Subject</th><th>Exam</th><th>Score</th><th>Status</th></tr></thead><tbody>${recent || `<tr><td colspan="5"><div class="empty">No results have been added yet.</div></td></tr>`}</tbody></table></div></article><div class="quick-grid"><a class="quick-card" href="students.html"><span class="quick-icon">♙</span><span><strong>Add a student</strong><small>Enroll a new student</small></span></a><a class="quick-card" href="subjects.html"><span class="quick-icon">▤</span><span><strong>Add a subject</strong><small>Set up a class subject</small></span></a><button class="quick-card" data-action="export-results"><span class="quick-icon">⇩</span><span><strong>Export results</strong><small>Download a CSV report</small></span></button></div>`;
  };

  const studentPage = () => {
    const student = studentById(user.id);
    if (!student) return `${heading("My results", "Your personal academic record.")}<article class="panel"><div class="empty">This student account is no longer active. Contact your administrator.</div></article>`;
    const results = data.results.filter(result => result.studentId === student.id && result.published);
    const exams = [...new Set(results.map(result => result.exam))];
    const exam = sessionStorage.getItem("gradebook-exam") || exams[0] || "";
    const examResults = results.filter(result => result.exam === exam);
    const total = examResults.reduce((sum, result) => sum + Number(result.marks), 0);
    const maximum = examResults.reduce((sum, result) => sum + Number(subjectById(result.subjectId)?.maxMarks || 0), 0);
    const overallTotal = results.reduce((sum, result) => sum + Number(result.marks), 0);
    const overallMaximum = results.reduce((sum, result) => sum + Number(subjectById(result.subjectId)?.maxMarks || 0), 0);
    const rows = examResults.map(result => {
      const subject = subjectById(result.subjectId);
      return subject ? `<tr><td><strong>${esc(subject.name)}</strong><small style="display:block;color:#8994a6;font-size:9px">${esc(subject.code)}</small></td><td>${result.marks}</td><td>${subject.maxMarks}</td><td>${Math.round(result.marks / subject.maxMarks * 100)}%</td><td><span class="badge ${grade(result.marks, subject.maxMarks) === "F" ? "badge-red" : "badge-green"}">${grade(result.marks, subject.maxMarks)}</span></td><td><div class="subject-score"><span style="width:${result.marks / subject.maxMarks * 100}%"></span></div></td></tr>` : "";
    }).join("");
    return `${heading("My results", "View your published marks and academic performance.", exams.length ? `<select class="inline-input" data-exam style="width:auto">${exams.map(item => `<option ${item === exam ? "selected" : ""}>${esc(item)}</option>`).join("")}</select>` : "")}<div class="result-hero"><div class="eyebrow">${esc(student.className)} · Section ${esc(student.section)}</div><h2>${esc(student.name)}</h2><p>Student ID: ${esc(student.id)} · ${exam ? `Viewing ${esc(exam)}` : "No published exams yet"}</p></div><div class="result-summary"><div class="summary-box"><small>Overall percentage</small><strong>${overallMaximum ? (overallTotal / overallMaximum * 100).toFixed(1) : "0.0"}%</strong></div><div class="summary-box"><small>Overall grade</small><strong>${overallMaximum ? grade(overallTotal / overallMaximum * 100, 100) : "—"}</strong></div><div class="summary-box"><small>Exam score</small><strong>${total} <small>/ ${maximum}</small></strong></div><div class="summary-box"><small>Subjects graded</small><strong>${examResults.length}</strong></div></div><article class="panel"><div class="panel-head"><div><h2>${esc(exam || "Published results")}</h2><p>Your subject-wise score breakdown</p></div>${examResults.length ? `<a class="btn btn-light btn-small" href="marksheet.html">⎙ Print marksheet</a>` : ""}</div><div class="table-wrap"><table><thead><tr><th>Subject</th><th>Marks</th><th>Maximum</th><th>Percentage</th><th>Grade</th><th>Progress</th></tr></thead><tbody>${rows || `<tr><td colspan="6"><div class="empty">${results.length ? "No marks are published for this exam." : "Your published results will appear here."}</div></td></tr>`}</tbody></table></div></article>`;
  };

  const listPage = type => {
    const isStudents = type === "students";
    const title = isStudents ? "Students" : "Subjects";
    const records = isStudents ? data.students : data.subjects;
    const classes = [...new Set(records.map(item => item.className))].sort();
    const filtered = records.filter(item => `${item.name} ${item.id || item.code} ${item.email || item.teacher || ""} ${item.className}`.toLowerCase().includes(search.toLowerCase()) && (filter === "all" || item.className === filter || item.status === filter));
    const rows = isStudents ? filtered.map(student => `<tr><td>${person(student)}</td><td>${esc(student.id)}</td><td>${esc(student.className)} · ${esc(student.section)}</td><td>${esc(student.phone || "—")}</td><td><span class="badge ${student.status === "Active" ? "badge-green" : "badge-amber"}">${esc(student.status)}</span></td><td><div class="table-actions"><button class="icon-btn" data-action="edit-student" data-id="${esc(student.id)}">✎</button><button class="icon-btn" data-action="delete-student" data-id="${esc(student.id)}">×</button></div></td></tr>`).join("") : filtered.map(subject => `<tr><td><strong>${esc(subject.name)}</strong><small style="display:block;color:#8994a6;font-size:9px">${esc(subject.code)}</small></td><td>${esc(subject.className)}</td><td>${esc(subject.teacher)}</td><td>${subject.maxMarks}</td><td>${subject.passMarks}</td><td><div class="table-actions"><button class="icon-btn" data-action="edit-subject" data-id="${esc(subject.id)}">✎</button><button class="icon-btn" data-action="delete-subject" data-id="${esc(subject.id)}">×</button></div></td></tr>`).join("");
    const columns = isStudents ? "<th>Student</th><th>Student ID</th><th>Class</th><th>Phone</th><th>Status</th><th>Actions</th>" : "<th>Subject</th><th>Class</th><th>Teacher</th><th>Max marks</th><th>Pass marks</th><th>Actions</th>";
    const options = classes.map(item => `<option value="${esc(item)}" ${filter === item ? "selected" : ""}>${esc(item)}</option>`).join("");
    return `${heading(title, isStudents ? "Manage student profiles, enrollment, and class details." : "Organize subjects, classes, and grading criteria.", button(isStudents ? "add-student" : "add-subject", isStudents ? "＋ Add student" : "＋ Add subject", true))}<article class="panel"><div class="panel-head"><div><h2>${isStudents ? "All students" : "Subject catalog"} <span class="badge badge-blue">${records.length}</span></h2><p>Search, filter, edit, or remove ${title.toLowerCase()}.</p></div><div class="toolbar"><input data-search placeholder="⌕  Search ${title.toLowerCase()}…" value="${esc(search)}"><select data-filter><option value="all">All classes</option>${options}${isStudents ? `<option value="Active" ${filter === "Active" ? "selected" : ""}>Active</option><option value="Inactive" ${filter === "Inactive" ? "selected" : ""}>Inactive</option>` : ""}</select></div></div><div class="table-wrap"><table><thead><tr>${columns}</tr></thead><tbody>${rows || `<tr><td colspan="6"><div class="empty">No ${title.toLowerCase()} match your search.</div></td></tr>`}</tbody></table></div><div class="table-foot"><span>Showing ${filtered.length} of ${records.length} ${title.toLowerCase()}</span><span>Saved in this browser</span></div></article>`;
  };

  const resultsPage = () => {
    const items = data.results.filter(result => {
      const student = studentById(result.studentId), subject = subjectById(result.subjectId);
      return `${student?.name || ""} ${student?.id || ""} ${subject?.name || ""} ${result.exam}`.toLowerCase().includes(search.toLowerCase()) && (filter === "all" || (filter === "published" ? result.published : !result.published));
    }).sort((a, b) => b.date.localeCompare(a.date));
    const rows = items.map(result => {
      const student = studentById(result.studentId), subject = subjectById(result.subjectId);
      if (!student || !subject) return "";
      return `<tr><td>${person(student)}</td><td>${esc(subject.name)}</td><td>${esc(result.exam)}</td><td>${result.marks} / ${subject.maxMarks}</td><td><span class="badge badge-blue">${grade(result.marks, subject.maxMarks)}</span></td><td>${dateText(result.date)}</td><td><span class="badge ${result.published ? "badge-green" : "badge-amber"}">${result.published ? "Published" : "Draft"}</span></td><td><div class="table-actions"><button class="icon-btn" data-action="toggle-result" data-id="${result.id}" title="Publish or unpublish">${result.published ? "◉" : "○"}</button><button class="icon-btn" data-action="edit-result" data-id="${result.id}" title="Edit">✎</button><button class="icon-btn" data-action="delete-result" data-id="${result.id}" title="Delete">×</button><button class="icon-btn" data-action="marksheet" data-id="${result.id}" title="View marksheet">▤</button></div></td></tr>`;
    }).join("");
    return `${heading("Results", "Enter marks, review grades, and publish results to students.", `${button("export-results", "⇩ Export CSV")}${button("add-result", "＋ Add result", true)}`)}<div class="notice">Published results are visible in each student’s portal. Draft results remain private.</div><article class="panel"><div class="panel-head"><div><h2>Exam results <span class="badge badge-blue">${data.results.length}</span></h2><p>Manage student marks and publication status.</p></div><div class="toolbar"><input data-search placeholder="⌕  Search student or subject…" value="${esc(search)}"><select data-filter><option value="all">All results</option><option value="published" ${filter === "published" ? "selected" : ""}>Published</option><option value="draft" ${filter === "draft" ? "selected" : ""}>Draft</option></select></div></div><div class="table-wrap"><table><thead><tr><th>Student</th><th>Subject</th><th>Exam</th><th>Marks</th><th>Grade</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead><tbody>${rows || `<tr><td colspan="8"><div class="empty">No results match your search.</div></td></tr>`}</tbody></table></div><div class="table-foot"><span>Showing ${items.length} of ${data.results.length} results</span><span>${data.results.filter(result => result.published).length} published</span></div></article>`;
  };

  const marksheetPage = () => {
    const resultId = sessionStorage.getItem("gradebook-result-id");
    const selected = data.results.find(result => result.id === resultId);
    const studentId = user.role === "student" ? user.id : selected?.studentId;
    const student = studentById(studentId);
    const exam = selected?.exam || sessionStorage.getItem("gradebook-exam") || data.results.find(result => result.studentId === studentId && result.published)?.exam;
    const results = data.results.filter(result => result.studentId === studentId && result.exam === exam && (user.role === "admin" || result.published));
    if (!student) return `${heading("Marksheet", "Select a result from the results page to print.")}<article class="panel"><div class="empty">No student result was selected. Open Results and use the marksheet icon.</div></article>`;
    const total = results.reduce((sum, result) => sum + Number(result.marks), 0);
    const maximum = results.reduce((sum, result) => sum + Number(subjectById(result.subjectId)?.maxMarks || 0), 0);
    const passed = results.every(result => { const subject = subjectById(result.subjectId); return subject && result.marks >= subject.passMarks; });
    const rows = results.map(result => {
      const subject = subjectById(result.subjectId);
      return subject ? `<tr><td>${esc(subject.name)}</td><td>${esc(subject.code)}</td><td>${result.marks}</td><td>${subject.maxMarks}</td><td>${Math.round(result.marks / subject.maxMarks * 100)}%</td><td>${grade(result.marks, subject.maxMarks)}</td><td>${result.marks >= subject.passMarks ? "Pass" : "Fail"}</td></tr>` : "";
    }).join("");
    return `<div class="marksheet-actions"><a class="btn btn-light" href="${user.role === "admin" ? "results.html" : "student-dashboard.html"}">← Back</a><button class="btn btn-primary" data-action="print">⎙ Print marksheet</button></div><article class="marksheet"><header class="marksheet-head"><h1>GRADEBOOK SCHOOL</h1><p>STUDENT ACADEMIC MARKSHEET · 2026–2027</p><h2>${esc(exam || "Examination")}</h2></header><div class="marksheet-info"><div><span>Student name:</span> <strong>${esc(student.name)}</strong></div><div><span>Student ID:</span> <strong>${esc(student.id)}</strong></div><div><span>Class:</span> <strong>${esc(student.className)} · Section ${esc(student.section)}</strong></div><div><span>Email:</span> <strong>${esc(student.email)}</strong></div></div><div class="table-wrap"><table><thead><tr><th>Subject</th><th>Code</th><th>Marks</th><th>Maximum</th><th>Percent</th><th>Grade</th><th>Status</th></tr></thead><tbody>${rows || `<tr><td colspan="7"><div class="empty">No marks available.</div></td></tr>`}</tbody></table></div><div class="marksheet-total"><strong>Total: ${total} / ${maximum}</strong><span style="float:right">Percentage: ${maximum ? (total / maximum * 100).toFixed(1) : "0.0"}% &nbsp; Grade: ${maximum ? grade(total / maximum * 100, 100) : "—"} &nbsp; Result: ${results.length ? passed ? "PASS" : "NEEDS IMPROVEMENT" : "—"}</span></div><p style="margin-top:32px;color:#78849a;font-size:10px">This is a computer-generated marksheet.</p></article>`;
  };

  const pageContent = () => {
    if (PAGE === "dashboard") return dashboardPage();
    if (PAGE === "students" || PAGE === "subjects") return listPage(PAGE);
    if (PAGE === "results") return resultsPage();
    if (PAGE === "student") return studentPage();
    if (PAGE === "marksheet") return marksheetPage();
    return "";
  };

  const render = () => {
    if (PAGE === "login") {
      if (user) {
        location.replace(user.role === "admin" ? "admin.html" : "student-dashboard.html");
        return;
      }
      document.getElementById("app").innerHTML = loginPage();
      return;
    }
    if (!user || (["dashboard", "students", "subjects", "results"].includes(PAGE) && user.role !== "admin") || (["student", "marksheet"].includes(PAGE) && !["student", "admin"].includes(user.role))) {
      location.replace("index.html");
      return;
    }
    document.getElementById("app").innerHTML = navigation();
    document.getElementById("content").innerHTML = pageContent();
    const signupNotice = sessionStorage.getItem(SIGNUP_NOTICE_KEY);
    if (signupNotice) {
      sessionStorage.removeItem(SIGNUP_NOTICE_KEY);
      setTimeout(() => toast(signupNotice), 0);
    }
  };

  const openModal = (title, markup) => {
    document.getElementById("modal-root").innerHTML = `<div class="modal-backdrop"><section class="modal" role="dialog" aria-modal="true"><header class="modal-head"><h2>${title}</h2><button class="close-btn" data-action="close">×</button></header><div class="modal-body">${markup}</div></section></div>`;
    document.querySelector(".modal-backdrop").addEventListener("click", event => { if (event.target === event.currentTarget) closeModal(); });
    document.querySelector(".modal input, .modal select")?.focus();
  };
  const closeModal = () => { document.getElementById("modal-root").innerHTML = ""; };
  const field = (label, name, value = "", type = "text", optional = false) => `<div class="field"><label for="field-${name}">${label}</label><input id="field-${name}" name="${name}" type="${type}" value="${esc(value)}" ${optional ? "" : "required"}></div>`;
  const selectField = (label, name, choices, value) => `<div class="field"><label for="field-${name}">${label}</label><select id="field-${name}" name="${name}" required>${choices.map(choice => `<option value="${esc(choice.value)}" ${String(choice.value) === String(value) ? "selected" : ""}>${esc(choice.label)}</option>`).join("")}</select></div>`;
  const studentForm = student => {
    const edit = Boolean(student);
    openModal(edit ? "Edit student" : "Add student", `<form id="student-form" data-id="${edit ? esc(student.id) : ""}"><div class="form-grid">${field("Full name", "name", student?.name || "")}${field("Email address", "email", student?.email || "", "email")}${field("Class / grade", "className", student?.className || "Grade 10")}${field("Section", "section", student?.section || "A")}${field("Phone number", "phone", student?.phone || "", "tel", true)}${selectField("Gender", "gender", ["Male", "Female", "Other"].map(v => ({ value: v, label: v })), student?.gender || "Male")}${selectField("Status", "status", ["Active", "Inactive"].map(v => ({ value: v, label: v })), student?.status || "Active")}</div><div class="modal-actions"><button type="button" class="btn btn-light" data-action="close">Cancel</button><button class="btn btn-primary">${edit ? "Save changes" : "Add student"}</button></div></form>`);
  };
  const subjectForm = subject => {
    const edit = Boolean(subject);
    openModal(edit ? "Edit subject" : "Add subject", `<form id="subject-form" data-id="${edit ? esc(subject.id) : ""}"><div class="form-grid">${field("Subject name", "name", subject?.name || "")}${field("Subject code", "code", subject?.code || "")}${field("Class / grade", "className", subject?.className || "Grade 10")}${field("Teacher", "teacher", subject?.teacher || "")}${field("Maximum marks", "maxMarks", subject?.maxMarks || 100, "number")}${field("Passing marks", "passMarks", subject?.passMarks || 35, "number")}</div><div class="modal-actions"><button type="button" class="btn btn-light" data-action="close">Cancel</button><button class="btn btn-primary">${edit ? "Save changes" : "Add subject"}</button></div></form>`);
  };
  const resultForm = result => {
    if (!data.students.length || !data.subjects.length) { toast("Add at least one student and subject first."); return; }
    const edit = Boolean(result);
    const currentStudent = studentById(result?.studentId) || data.students[0];
    let subjectList = data.subjects.filter(subject => subject.className === currentStudent.className);
    if (!subjectList.length) subjectList = data.subjects;
    openModal(edit ? "Edit result" : "Add result", `<form id="result-form" data-id="${edit ? esc(result.id) : ""}"><div class="form-grid">${selectField("Student", "studentId", data.students.map(student => ({ value: student.id, label: `${student.name} · ${student.id}` })), result?.studentId || currentStudent.id)}${selectField("Subject", "subjectId", subjectList.map(subject => ({ value: subject.id, label: `${subject.name} · ${subject.className}` })), result?.subjectId || subjectList[0].id)}${field("Exam name", "exam", result?.exam || "Midterm Exam")}${field("Marks obtained", "marks", result?.marks ?? "", "number")}${field("Exam date", "date", result?.date || new Date().toISOString().slice(0, 10), "date")}${selectField("Visibility", "published", [{ value: "false", label: "Draft — hidden from student" }, { value: "true", label: "Published — visible to student" }], String(result?.published || false))}</div><div id="form-error" class="login-error"></div><div class="modal-actions"><button type="button" class="btn btn-light" data-action="close">Cancel</button><button class="btn btn-primary">${edit ? "Save result" : "Add result"}</button></div></form>`);
    document.querySelector('#result-form [name="studentId"]').addEventListener("change", event => {
      const selectedStudent = studentById(event.target.value);
      const matching = data.subjects.filter(subject => subject.className === selectedStudent.className);
      const select = document.querySelector('#result-form [name="subjectId"]');
      select.innerHTML = (matching.length ? matching : data.subjects).map(subject => `<option value="${esc(subject.id)}">${esc(subject.name)} · ${esc(subject.className)}</option>`).join("");
    });
  };
  const nextId = (prefix, items) => {
    let n = 1;
    while (items.some(item => item.id === `${prefix}-${String(n).padStart(3, "0")}`)) n += 1;
    return `${prefix}-${String(n).padStart(3, "0")}`;
  };
  const deleteItem = (key, id, label) => {
    if (!confirm(`Delete this ${label}? This action cannot be undone.`)) return;
    data[key] = data[key].filter(item => item.id !== id);
    if (key === "students") data.results = data.results.filter(result => result.studentId !== id);
    if (key === "subjects") data.results = data.results.filter(result => result.subjectId !== id);
    save(); render(); toast(`${label[0].toUpperCase()}${label.slice(1)} deleted.`);
  };
  const exportCsv = () => {
    const lines = [["Student ID", "Student", "Class", "Subject", "Exam", "Marks", "Max marks", "Grade", "Date", "Status"]];
    data.results.forEach(result => {
      const student = studentById(result.studentId), subject = subjectById(result.subjectId);
      if (student && subject) lines.push([student.id, student.name, student.className, subject.name, result.exam, result.marks, subject.maxMarks, grade(result.marks, subject.maxMarks), result.date, result.published ? "Published" : "Draft"]);
    });
    const csv = lines.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url; link.download = "gradebook-results.csv"; document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
    toast("Results CSV exported.");
  };

  document.addEventListener("click", event => {
    const authMode = event.target.closest("[data-auth-mode]");
    if (authMode) {
      const register = authMode.dataset.authMode === "register";
      document.getElementById("login-panel").hidden = register;
      document.getElementById("register-panel").hidden = !register;
      document.querySelectorAll(".auth-tab").forEach(tab => tab.classList.toggle("active", tab === authMode));
      return;
    }
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const id = target.dataset.id;
    switch (target.dataset.action) {
      case "logout": sessionStorage.removeItem(SESSION_KEY); localStorage.removeItem(SESSION_KEY); location.href = "index.html"; break;
      case "menu": document.getElementById("sidebar")?.classList.toggle("open"); document.getElementById("mobile-overlay")?.classList.toggle("open"); break;
      case "close": closeModal(); break;
      case "add-student": studentForm(); break;
      case "edit-student": studentForm(data.students.find(item => item.id === id)); break;
      case "delete-student": deleteItem("students", id, "student"); break;
      case "add-subject": subjectForm(); break;
      case "edit-subject": subjectForm(data.subjects.find(item => item.id === id)); break;
      case "delete-subject": deleteItem("subjects", id, "subject"); break;
      case "add-result": resultForm(); break;
      case "edit-result": resultForm(data.results.find(item => item.id === id)); break;
      case "delete-result": deleteItem("results", id, "result"); break;
      case "toggle-result": {
        const result = data.results.find(item => item.id === id);
        if (result) { result.published = !result.published; save(); render(); toast(result.published ? "Result published." : "Result returned to draft."); }
        break;
      }
      case "export-results": exportCsv(); break;
      case "marksheet":
        sessionStorage.setItem("gradebook-result-id", id);
        location.href = PAGE_FILES.marksheet;
        break;
      case "print": window.print(); break;
    }
  });
  document.addEventListener("input", event => {
    if (!event.target.matches("[data-search]")) return;
    const caret = event.target.selectionStart;
    search = event.target.value;
    render();
    const input = document.querySelector("[data-search]");
    if (input) { input.focus(); input.setSelectionRange(caret, caret); }
  });
  document.addEventListener("change", event => {
    if (event.target.matches("[data-filter]")) { filter = event.target.value; render(); }
    if (event.target.matches("[data-exam]")) { sessionStorage.setItem("gradebook-exam", event.target.value); render(); }
  });
  document.addEventListener("submit", event => {
    if (event.target.id === "login-form") {
      event.preventDefault();
      void (async () => {
        const form = new FormData(event.target);
        const loginId = String(form.get("email")).trim().toLowerCase();
        const password = String(form.get("password"));
        const remember = form.get("remember") === "on";
        const error = document.getElementById("login-error");
        let nextUser = null;
        if (loginId === "admin@school.edu" && password === "admin123") {
          nextUser = { role: "admin", name: "Administrator" };
        } else {
          const account = accounts.find(item => item.email.toLowerCase() === loginId || item.studentId.toLowerCase() === loginId);
          if (account) {
            const student = studentById(account.studentId);
            if (student?.status === "Active" && await verifyPassword(password, account)) {
              nextUser = { role: "student", name: student.name, id: student.id };
            }
          } else {
            const student = data.students.find(item => item.email.toLowerCase() === loginId && item.status === "Active");
            if (student && password === "student123") nextUser = { role: "student", name: student.name, id: student.id };
          }
        }
        if (!nextUser) {
          error.textContent = "Email/student ID or password is incorrect.";
          return;
        }
        try {
          setSession(nextUser, remember);
          localStorage.setItem(LAST_LOGIN_KEY, loginId.includes("@") ? loginId : (studentById(nextUser.id)?.email || loginId));
        } catch (storageError) {
          console.error("Could not save the sign-in session.", storageError);
          error.textContent = "Could not save your sign-in on this device. Check browser storage settings.";
          return;
        }
        location.href = nextUser.role === "admin" ? "admin.html" : "student-dashboard.html";
      })().catch(error => {
        console.error("Student sign-in failed.", error);
        const message = document.getElementById("login-error");
        if (message) message.textContent = "Could not verify this account. Open the app through localhost or HTTPS and try again.";
      });
    }
    if (event.target.id === "register-form") {
      event.preventDefault();
      void (async () => {
        const form = new FormData(event.target);
        const name = String(form.get("name")).trim();
        const email = String(form.get("email")).trim().toLowerCase();
        const className = String(form.get("className")).trim();
        const section = String(form.get("section")).trim();
        const password = String(form.get("password"));
        const confirmPassword = String(form.get("confirmPassword"));
        const error = document.getElementById("register-error");
        if (data.students.some(student => student.email.toLowerCase() === email)) {
          error.textContent = "An account with this email already exists. Please sign in instead.";
          return;
        }
        if (password.length < 8) {
          error.textContent = "Use a password with at least 8 characters.";
          return;
        }
        if (password !== confirmPassword) {
          error.textContent = "The passwords do not match.";
          return;
        }
        try {
          const student = {
            id: nextId("STU", data.students),
            name,
            email,
            className,
            section,
            gender: "",
            phone: "",
            status: "Active"
          };
          const passwordRecord = await createPasswordRecord(password);
          data.students.unshift(student);
          accounts.push({ studentId: student.id, email, ...passwordRecord });
          if (!save()) {
            data.students = data.students.filter(item => item.id !== student.id);
            accounts = accounts.filter(item => item.studentId !== student.id);
            return;
          }
          if (!saveAccounts()) {
            data.students = data.students.filter(item => item.id !== student.id);
            accounts = accounts.filter(item => item.studentId !== student.id);
            save();
            return;
          }
          let emailStatus = "not-configured";
          try {
            emailStatus = await sendSignupNotification(student);
          } catch (emailError) {
            console.error("Could not send the student signup notification.", emailError);
            emailStatus = "failed";
          }
          const remember = form.get("remember") === "on";
          setSession({ role: "student", name: student.name, id: student.id }, remember);
          localStorage.setItem(LAST_LOGIN_KEY, student.email);
          const notice = emailStatus === "sent"
            ? "Account created. Signup notification sent to the administrator."
            : emailStatus === "not-configured"
              ? "Account created. EmailJS is not configured, so no notification was sent."
              : "Account created, but the EmailJS notification could not be sent.";
          sessionStorage.setItem(SIGNUP_NOTICE_KEY, notice);
          location.href = "student-dashboard.html";
        } catch (registrationError) {
          console.error("Could not create the student account.", registrationError);
          error.textContent = registrationError.message.includes("Secure password storage")
            ? registrationError.message
            : "Could not create the account. Check browser storage and try again.";
        }
      })();
    }
    if (event.target.id === "student-form") {
      event.preventDefault();
      const id = event.target.dataset.id, record = Object.fromEntries(new FormData(event.target).entries());
      if (data.students.some(item => item.email.toLowerCase() === record.email.toLowerCase() && item.id !== id)) { toast("A student with that email already exists."); return; }
      if (id) Object.assign(studentById(id), record);
      else data.students.unshift({ ...record, id: nextId("STU", data.students) });
      save(); closeModal(); render(); toast(id ? "Student updated." : "Student added.");
    }
    if (event.target.id === "subject-form") {
      event.preventDefault();
      const id = event.target.dataset.id, record = Object.fromEntries(new FormData(event.target).entries());
      record.maxMarks = Number(record.maxMarks); record.passMarks = Number(record.passMarks);
      if (record.maxMarks < 1 || record.passMarks < 0 || record.passMarks > record.maxMarks) { toast("Passing marks cannot exceed maximum marks."); return; }
      if (data.subjects.some(item => item.code.toLowerCase() === record.code.toLowerCase() && item.id !== id)) { toast("A subject with that code already exists."); return; }
      if (id) Object.assign(subjectById(id), record);
      else data.subjects.unshift({ ...record, id: nextId("SUB", data.subjects) });
      save(); closeModal(); render(); toast(id ? "Subject updated." : "Subject added.");
    }
    if (event.target.id === "result-form") {
      event.preventDefault();
      const id = event.target.dataset.id, record = Object.fromEntries(new FormData(event.target).entries());
      const subject = subjectById(record.subjectId);
      record.marks = Number(record.marks); record.published = record.published === "true";
      const error = document.getElementById("form-error");
      if (!subject) { error.textContent = "Select a valid subject."; return; }
      if (record.marks < 0 || record.marks > Number(subject.maxMarks)) { error.textContent = `Marks must be between 0 and ${subject.maxMarks}.`; return; }
      if (data.results.some(item => item.studentId === record.studentId && item.subjectId === record.subjectId && item.exam.toLowerCase() === record.exam.toLowerCase() && item.id !== id)) { error.textContent = "A result for this student, subject, and exam already exists."; return; }
      if (id) Object.assign(data.results.find(item => item.id === id), record);
      else data.results.unshift({ ...record, id: nextId("RES", data.results) });
      save(); closeModal(); render(); toast(id ? "Result updated." : "Result added.");
    }
  });

  render();
})();
