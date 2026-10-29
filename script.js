/* SkillSync UI prototype. All results below are predefined sample data.
   The uploaded file is never read, parsed or sent anywhere. */

// ---------- Sample data ----------
const SAMPLE_PROFILE = {
  name: "Aarav Sharma (sample)",
  title: "B.Tech Computer Science student, aspiring software developer",
  skills: ["Python", "SQL", "HTML", "CSS", "JavaScript", "Git"],
  education: [
    "B.Tech, Computer Science and Engineering <small>(2022 to 2026, sample)</small>",
    "Higher secondary, Science stream <small>(2020 to 2022, sample)</small>"
  ],
  experience: [
    "Web development intern, sample startup <small>(2 months)</small>",
    "Teaching assistant, Python lab <small>(1 semester)</small>"
  ],
  projects: [
    "Student attendance tracker built with Python and SQLite",
    "Personal portfolio website using HTML, CSS and JavaScript",
    "Library book search tool with SQL queries"
  ]
};

const SAMPLE_JOBS = [
  { title: "Python Developer", score: 78,
    matched: ["Python", "SQL", "Git"], missing: ["REST APIs", "Unit testing"],
    why: "Your Python and SQL projects line up with backend work. Adding APIs and tests would close the main gaps." },
  { title: "Frontend Developer", score: 72,
    matched: ["HTML", "CSS", "JavaScript", "Git"], missing: ["React", "Unit testing"],
    why: "Your portfolio site shows solid web basics. Learning a framework like React is the next step." },
  { title: "Data Analyst", score: 65,
    matched: ["Python", "SQL"], missing: ["Data visualisation", "Statistics"],
    why: "SQL and Python are core analyst tools. Charting and statistics skills would make you more competitive." }
];

const SAMPLE_ROADMAP = [
  { stage: "Learn", cls: "learn", intro: "Build the missing foundations.",
    items: ["REST API basics: HTTP methods, status codes and JSON",
            "React fundamentals: components, props and state",
            "Unit testing with pytest",
            "Data visualisation with Matplotlib",
            "Descriptive statistics for analysis"] },
  { stage: "Practise", cls: "practise", intro: "Apply each topic in small exercises.",
    items: ["Write pytest tests for your attendance tracker",
            "Rebuild one portfolio page as React components",
            "Chart a public CSV dataset with Matplotlib",
            "Call a public API from JavaScript and show the results"] },
  { stage: "Build", cls: "build", intro: "Finish projects you can show in interviews.",
    items: ["A Python task-management API with tests",
            "A React dashboard that uses your own API",
            "A data dashboard from a sales or sports dataset"] }
];

// ---------- Settings and state ----------
const ALLOWED_EXTENSIONS = ["pdf", "docx"];
const MAX_FILE_SIZE_MB = 5;
const ANALYSIS_DELAY_MS = 1800;
let selectedFile = null;
let analysisDone = false;

// ---------- Element references ----------
const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const fileChip = document.getElementById("file-chip");
const fileNameLabel = document.getElementById("file-name");
const removeFileButton = document.getElementById("remove-file");
const messageBox = document.getElementById("message");
const analyseButton = document.getElementById("analyse-btn");
const analyseLabel = document.getElementById("analyse-label");
const spinner = document.getElementById("spinner");
const resetButton = document.getElementById("reset-btn");
const resultsArea = document.getElementById("results");
const emptyHint = document.getElementById("empty-hint");
const navLinks = document.querySelectorAll(".nav a");

// ---------- Helpers ----------
/** Show a message in the upload card. type: "error" | "success" | "info". */
function showMessage(text, type) {
  messageBox.textContent = text;
  messageBox.className = "message " + type;
  messageBox.hidden = false;
}
function hideMessage() { messageBox.hidden = true; }

/** Create an element with a class and text. */
function makeElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}
function renderTags(container, skills, className) {
  container.innerHTML = "";
  skills.forEach((skill, index) => {
    const colour = className || "c" + (index % 4);
    container.appendChild(makeElement("span", "tag " + colour, skill));
  });
}
function renderList(container, htmlItems) {
  container.innerHTML = "";
  htmlItems.forEach(html => {
    const item = document.createElement("li");
    item.innerHTML = html; // Only trusted, hard-coded sample strings are used here.
    container.appendChild(item);
  });
}

// ---------- File selection and validation ----------
/** Returns an error string, or "" when the file is acceptable. */
function validateFile(file) {
  const extension = file.name.split(".").pop().toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return "That file type is not supported. Please choose a PDF or DOCX resume.";
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return "That file is larger than " + MAX_FILE_SIZE_MB + " MB. Please choose a smaller resume.";
  }
  if (file.size === 0) return "That file is empty. Please choose a different resume.";
  return "";
}

function handleFileSelected(file) {
  if (!file) return;
  const problem = validateFile(file);
  if (problem) {
    clearFile();
    showMessage(problem, "error");
    return;
  }
  selectedFile = file;
  fileNameLabel.textContent = file.name;
  fileChip.hidden = false;
  analyseButton.disabled = false;
  showMessage("File selected. Choose Analyse Resume to continue.", "info");
}

function clearFile() {
  selectedFile = null;
  fileInput.value = "";
  fileChip.hidden = true;
  fileNameLabel.textContent = "";
  analyseButton.disabled = true;
}

fileInput.addEventListener("change", () => handleFileSelected(fileInput.files[0]));
removeFileButton.addEventListener("click", () => { clearFile(); hideMessage(); });

// Keyboard access for the drop zone (label with tabindex)
dropZone.addEventListener("keydown", event => {
  if (event.key === "Enter" || event.key === " ") { event.preventDefault(); fileInput.click(); }
});
// Drag and drop
["dragenter", "dragover"].forEach(name => dropZone.addEventListener(name, event => {
  event.preventDefault(); dropZone.classList.add("dragover");
}));
["dragleave", "drop"].forEach(name => dropZone.addEventListener(name, event => {
  event.preventDefault(); dropZone.classList.remove("dragover");
}));
dropZone.addEventListener("drop", event => {
  const files = event.dataTransfer.files;
  if (files.length > 1) { showMessage("Please drop one resume at a time.", "error"); return; }
  handleFileSelected(files[0]);
});
// Stop the browser opening a file dropped outside the zone
["dragover", "drop"].forEach(name => window.addEventListener(name, event => event.preventDefault()));

// ---------- Analyse (simulated) ----------
analyseButton.addEventListener("click", () => {
  if (!selectedFile) { showMessage("Please select a resume first.", "error"); return; }
  analyseButton.disabled = true;
  spinner.hidden = false;
  analyseLabel.textContent = "Analysing sample…";
  hideMessage();

  // Brief delay only to demonstrate a loading state; nothing is processed.
  setTimeout(() => {
    renderResults();
    spinner.hidden = true;
    analyseLabel.textContent = "Analyse Resume";
    analyseButton.disabled = false;
    showMessage("Sample analysis ready. These results are predefined demo data; your file was not read.", "success");
    document.getElementById("analysis").scrollIntoView({ behavior: "smooth" });
  }, ANALYSIS_DELAY_MS);
});

// ---------- Rendering ----------
function renderResults() {
  const profile = SAMPLE_PROFILE;
  document.getElementById("profile-name").textContent = profile.name;
  document.getElementById("profile-title").textContent = profile.title;
  document.getElementById("profile-avatar").textContent = "AS";
  renderTags(document.getElementById("skill-tags"), profile.skills);
  renderList(document.getElementById("education-list"), profile.education);
  renderList(document.getElementById("experience-list"), profile.experience);
  renderList(document.getElementById("project-list"), profile.projects);

  renderJobs();
  const missingSkills = [...new Set(SAMPLE_JOBS.flatMap(job => job.missing))];
  renderTags(document.getElementById("have-tags"), profile.skills.map(skill => "✓ " + skill), "have");
  renderTags(document.getElementById("need-tags"), missingSkills.map(skill => "✕ " + skill), "need");
  renderRoadmap();

  document.getElementById("stat-skills").textContent = profile.skills.length;
  document.getElementById("stat-jobs").textContent = SAMPLE_JOBS.length;
  document.getElementById("stat-gaps").textContent = missingSkills.length;

  resultsArea.hidden = false;
  emptyHint.hidden = true;
  analysisDone = true;

  // Animate progress bars after the cards are visible
  requestAnimationFrame(() => requestAnimationFrame(() => {
    document.querySelectorAll(".progress-fill").forEach(bar => { bar.style.width = bar.dataset.score + "%"; });
  }));
}

function renderJobs() {
  const grid = document.getElementById("job-grid");
  grid.innerHTML = "";
  SAMPLE_JOBS.forEach(job => {
    const card = makeElement("article", "card job-card");
    const top = makeElement("div", "job-top");
    top.appendChild(makeElement("h3", "", job.title));
    top.appendChild(makeElement("span", "job-score", job.score + "%"));
    card.appendChild(top);

    const bar = makeElement("div", "progress");
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-valuenow", job.score);
    bar.setAttribute("aria-valuemin", 0);
    bar.setAttribute("aria-valuemax", 100);
    bar.setAttribute("aria-label", job.title + " illustrative match score");
    const fill = makeElement("div", "progress-fill");
    fill.dataset.score = job.score;
    bar.appendChild(fill);
    card.appendChild(bar);

    card.appendChild(makeElement("h4", "", "Matched skills"));
    const matchedTags = makeElement("div", "tags");
    job.matched.forEach(skill => matchedTags.appendChild(makeElement("span", "tag small have", skill)));
    card.appendChild(matchedTags);

    card.appendChild(makeElement("h4", "", "Missing skills"));
    const missingTags = makeElement("div", "tags");
    job.missing.forEach(skill => missingTags.appendChild(makeElement("span", "tag small need", skill)));
    card.appendChild(missingTags);

    card.appendChild(makeElement("p", "why", job.why));
    card.appendChild(makeElement("p", "muted", "Illustrative demo score, not a real prediction."));
    grid.appendChild(card);
  });
}

function renderRoadmap() {
  const grid = document.getElementById("roadmap-grid");
  grid.innerHTML = "";
  SAMPLE_ROADMAP.forEach(stage => {
    const card = makeElement("div", "card stage " + stage.cls);
    card.appendChild(makeElement("h3", "", stage.stage));
    card.appendChild(makeElement("p", "muted", stage.intro));
    const list = makeElement("ul", "plain-list");
    stage.items.forEach(item => list.appendChild(makeElement("li", "", item)));
    card.appendChild(list);
    grid.appendChild(card);
  });
}

// ---------- Reset ----------
resetButton.addEventListener("click", () => {
  clearFile();
  hideMessage();
  analysisDone = false;
  resultsArea.hidden = true;
  emptyHint.hidden = false;
  ["stat-skills", "stat-jobs", "stat-gaps"].forEach(id => { document.getElementById(id).textContent = "–"; });
  spinner.hidden = true;
  analyseLabel.textContent = "Analyse Resume";
  window.scrollTo({ top: 0, behavior: "smooth" });
  showMessage("Demo reset. Choose another resume to try again.", "info");
});

// ---------- Navigation ----------
function setActiveLink(id) {
  navLinks.forEach(link => link.classList.toggle("active", link.dataset.target === id));
}
navLinks.forEach(link => link.addEventListener("click", event => {
  event.preventDefault();
  const target = link.dataset.target;
  if (target !== "dashboard" && !analysisDone) {
    // Result sections are hidden until the sample analysis has been run
    showMessage("Upload a resume and choose Analyse Resume first to view this section.", "info");
    document.getElementById("dashboard").scrollIntoView({ behavior: "smooth" });
    setActiveLink("dashboard");
    return;
  }
  document.getElementById(target).scrollIntoView({ behavior: "smooth" });
  setActiveLink(target);
}));

// Highlight the nav link for the section currently in view
const observedSections = ["dashboard", "analysis", "matches", "roadmap"].map(id => document.getElementById(id));
const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => { if (entry.isIntersecting) setActiveLink(entry.target.id); });
}, { rootMargin: "-30% 0px -60% 0px" });
observedSections.forEach(section => sectionObserver.observe(section));
