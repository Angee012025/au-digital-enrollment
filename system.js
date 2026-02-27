/* =========================================
   ARELLANO UNIVERSITY CENTRAL SYSTEM
   LocalStorage Based – Final Version
========================================= */

const DB_KEY = "au_students_v2";

/* ==============================
   DATABASE HELPERS
============================== */
function getStudents() {
    return JSON.parse(localStorage.getItem(DB_KEY)) || [];
}

function saveStudents(students) {
    localStorage.setItem(DB_KEY, JSON.stringify(students));
}

/* ==============================
   STRAND SUBJECTS
============================== */
   const strandSubjects = {
    STEM: ["General Mathematics","Earth Science","Pre-Calculus","Basic Calculus","Practical Research 1","Physical Education"],
    ABM: ["Business Mathematics","Organization & Management","Accounting 1","Applied Economics","Business Ethics","Physical Education"],
    HUMSS: ["Creative Writing","Philippine Politics","World Religions","Community Engagement","Social Sciences","Physical Education"],
    GAS: ["Humanities 1","Social Science 1","General Math","Earth & Life Science","Organization & Management","Physical Education"],
    "TVL - ICT": ["Computer Programming","Web Development","Networking Fundamentals","IT Essentials","Practical Research 1","Physical Education"],
    "TVL - Home Economics": ["Cooking & Baking","Housekeeping Management","Entrepreneurship","Nutrition & Health","Practical Research 1","Physical Education"]
};


/* ==============================
   SECTION GENERATOR (Max 40)
============================== */
function assignSection(strand) {
    const students = getStudents();
    const letters = ["A","B","C"];
    for (let letter of letters) {
        const section = `${strand}-1${letter}`;
        const count = students.filter(s => s.section === section).length;
        if (count < 40) return section;
    }
    return `${strand}-1D`; // overflow
}

function getSchedule(section) {
    const letter = section.slice(-1);
    const schedules = { A: "7:30 AM - 2:30 PM", B: "8:00 AM - 3:00 PM", C: "9:00 AM - 4:00 PM", D: "10:00 AM - 5:00 PM" };
    return schedules[letter] + " (Mon-Fri)";
}

/* ==============================
   ENROLLMENT
============================== */
const enrollForm = document.getElementById("enrollForm");
if(enrollForm){
    enrollForm.addEventListener("submit", async function(e){
        e.preventDefault();
        
        // Change button text to show processing
        const subBtn = document.querySelector(".submit-btn");
        subBtn.innerText = "Processing...";
        subBtn.disabled = true;

        const students = getStudents();
        const fname = document.getElementById("Firstname").value;
        const sname = document.getElementById("Surname").value;
        const birthdate = document.getElementById("birthdate").value;
        const strand = document.getElementById("Strand").value;
        const campus = document.getElementById("Campus").value;
        const email = document.getElementById("email").value;

        const toBase64 = file => new Promise((resolve,reject)=>{
            if(!file) resolve(null);
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = err => reject(err);
        });

        try {
            const photoFile = document.getElementById("studentPhoto").files[0];
            const photoBase64 = await toBase64(photoFile);

            const documents = {
                form138: await toBase64(document.getElementById("docForm138").files[0]),
                goodMoral: await toBase64(document.getElementById("docGoodMoral").files[0]),
                psa: await toBase64(document.getElementById("docPSA").files[0])
            };

            const dateObj = new Date(birthdate);
            const mm = String(dateObj.getMonth()+1).padStart(2,'0');
            const dd = String(dateObj.getDate()).padStart(2,'0');
            const password = mm + dd + dateObj.getFullYear();

            const idNumber = (students.length + 1).toString().padStart(4,"0");
            const studentID = `AU-SHS-2026-${idNumber}`;
            const section = assignSection(strand);

            const newStudent = {
                id: studentID,
                fullname: `${fname} ${sname}`,
                email,
                birthdate,
                strand,
                campus,
                password,
                section,
                schedule: getSchedule(section),
                subjects: strandSubjects[strand],
                status: "Pending",
                photo: photoBase64,
                documents: documents,
                announcement: "",
                grades: [],
                average: 0
            };

            students.push(newStudent);
            saveStudents(students);

            alert(`Application Submitted!\nID: ${studentID}\nPassword: ${password}`);
            window.location.href = "portal.html"; 
        } catch (err) {
            console.error(err);
            alert("Error processing files. Please try again.");
            subBtn.innerText = "Confirm & Submit";
            subBtn.disabled = false;
        }
    });
}

/* ==============================
   ADMIN LOGIN
============================== */
const adminLoginForm = document.getElementById("adminLoginForm");
if(adminLoginForm){
    adminLoginForm.addEventListener("submit", function(e){
        e.preventDefault();
        if(document.getElementById("adminUser").value==="admin" &&
           document.getElementById("adminPass").value==="au2026"){
            document.getElementById("adminLoginBox").style.display="none";
            document.getElementById("adminDashboard").style.display="block";
            loadAdmin();
        } else alert("Invalid Admin Credentials");
    });
}

/* ==============================
   ADMIN DASHBOARD
============================== */
function loadAdmin() {
    const students = getStudents();
    const list = document.getElementById("studentList");
    list.innerHTML = "";

    let stats = { total: 0, pending: 0, approved: 0, rejected: 0 };

    students.forEach((s, index) => {

        stats.total++;
        if (s.status === "Pending") stats.pending++;
        if (s.status === "Approved") stats.approved++;
        if (s.status === "Rejected") stats.rejected++;

        const missingDocs = [];
        if (!s.documents?.form138) missingDocs.push("Form 138");
        if (!s.documents?.goodMoral) missingDocs.push("Good Moral");
        if (!s.documents?.psa) missingDocs.push("PSA");

        const card = document.createElement("div");
        card.className = "stat-card";
        card.style.marginBottom = "15px";

        card.innerHTML = `
            <strong>${s.fullname}</strong><br>
            ID: ${s.id}<br>
            Status: <b>${s.status}</b><br><br>

            <strong>Documents:</strong><br>
            Form 138: ${s.documents?.form138 ? "✅ Uploaded" : "❌ Missing"}<br>
            Good Moral: ${s.documents?.goodMoral ? "✅ Uploaded" : "❌ Missing"}<br>
            PSA: ${s.documents?.psa ? "✅ Uploaded" : "❌ Missing"}<br><br>

            <strong style="color:red;">Missing:</strong> 
            ${missingDocs.length ? missingDocs.join(", ") : "None"}<br><br>

            <textarea id="announce_${index}" placeholder="Type announcement..." style="width:100%; height:50px;">${s.announcement || ""}</textarea>
            <button onclick="sendAnnouncement(${index})" class="btn-approve">Send Announcement</button><br><br>

            <button onclick="updateStatus(${index}, 'Approved')" class="btn-approve">Admit</button>
            <button onclick="updateStatus(${index}, 'Rejected')" class="btn-reject">Reject</button>
            <button onclick="deleteStudent(${index})" class="btn-reject">Delete</button>
        `;

        list.appendChild(card);
    });

    document.getElementById("statTotal").innerText = stats.total;
    document.getElementById("statPending").innerText = stats.pending;
    document.getElementById("statApproved").innerText = stats.approved;
    document.getElementById("statRejected").innerText = stats.rejected;
}

function updateStatus(index, status) {
    const students = getStudents();
    students[index].status = status;
    saveStudents(students);
    loadAdmin(); // Refresh the admin panel
    alert(`Student ${students[index].fullname} is now ${status}`);
}

function deleteStudent(index) {
    if (!confirm("Are you sure you want to delete this student?")) return;

    const students = getStudents();
    const removed = students.splice(index, 1);
    saveStudents(students);
    loadAdmin(); // Refresh the admin panel
    alert(`Student ${removed[0].fullname} has been deleted`);
}

/* SEND ADMIN ANNOUNCEMENT */
function sendAnnouncement(index){
    const students = getStudents();
    const message = document.getElementById("announce_"+index).value;
    students[index].announcement = message;
    saveStudents(students);
    alert("Announcement sent to student.");
}

/* ==============================
   STUDENT PORTAL LOGIN
============================== */
function loginStudent(e){
    e.preventDefault();

    const id = document.getElementById("studentID").value;
    const pass = document.getElementById("password").value;

    const students = getStudents();
    const student = students.find(s => s.id === id && s.password === pass);

    if(!student) return alert("Invalid Credentials");
    if(student.status !== "Approved") return alert("Your application is not yet approved.");

    // Save current user in sessionStorage
    sessionStorage.setItem("currentUser", JSON.stringify(student));

    // Show dashboard
    document.getElementById("loginBox").style.display = "none";
    document.getElementById("dashboard").style.display = "block";

    // Display basic info
    document.getElementById("displayName").innerText = student.fullname;
    document.getElementById("displayID").innerText = "ID: " + student.id;
    document.getElementById("displayPhoto").src = student.photo || "default-avatar.jpg";
    document.getElementById("displayCourse").innerText = student.strand;
    document.getElementById("displaySection").innerText = student.section;
    document.getElementById("displaySchedule").innerText = student.schedule;

    // Determine Grade Level
    const yearCode = parseInt(student.id.split("-")[2]);
    const gradeLevel = (yearCode === 2026) ? "Grade 11" : "Grade 12";

    let gradeEl = document.getElementById("displayGrade");
    if(!gradeEl){
        const sectionCard = document.querySelector("#dashboard .card:nth-child(2)");
        const p = document.createElement("p");
        p.innerHTML = `<strong>Grade Level:</strong> <span id="displayGrade">${gradeLevel}</span>`;
        sectionCard.insertBefore(p, sectionCard.children[2]); // Insert after Strand
    } else {
        gradeEl.innerText = gradeLevel;
    }

    // Populate Subjects dynamically in portal LMS
    const subjectList = document.getElementById("subjectList");
    subjectList.innerHTML = "";
    (student.subjects || []).forEach(sub => {
        const li = document.createElement("li");
        li.innerText = sub;
        subjectList.appendChild(li);
    });

    // Show admin announcement if any
    if(student.announcement){
        const notice = document.createElement("div");
        notice.style.background="#ffe6e6";
        notice.style.padding="10px";
        notice.style.marginTop="15px";
        notice.style.border="1px solid red";
        notice.innerHTML = "<strong>ADMIN NOTICE:</strong><br>" + student.announcement;
        document.querySelector(".grid-container")?.prepend(notice);
    }
}
/* ==============================
   GRADE MODAL
============================== */
let currentGradeIndex = null;
function openGradeModal(index){
    const students = getStudents();
    const student = students[index];
    currentGradeIndex = index;

    const container = document.getElementById("gradeFields");
    container.innerHTML = "";

    student.subjects.forEach((sub,i)=>{
        const value = student.grades ? student.grades[i] || "" : "";
        container.innerHTML += `
            <label>${sub}</label>
            <input type="number" min="60" max="100" id="grade_${i}" value="${value}">
        `;
    });
    document.getElementById("gradeModal").style.display="flex";
}

function closeGradeModal(){
    document.getElementById("gradeModal").style.display="none";
}

function saveGrades(){
    const students = getStudents();
    const student = students[currentGradeIndex];

    const grades = [];
    student.subjects.forEach((sub,i)=>{
        const val = parseFloat(document.getElementById("grade_"+i).value);
        grades.push(val || 0);
    });

    student.grades = grades;
    student.average = (grades.reduce((a,b)=>a+b,0) / grades.length).toFixed(2);

    saveStudents(students);
    closeGradeModal();
    alert("Grades Saved!");
}

/* ==============================
   ID CARD GENERATION
============================== */
function generateIDCard(){
    const user = JSON.parse(sessionStorage.getItem("currentUser"));
    if(!user) return;

    const win = window.open("idcard.html","_blank");
    win.onload = function(){
        win.document.getElementById("idName").innerText = user.fullname.toUpperCase();
        win.document.getElementById("idNumber").innerText = user.id;
        win.document.getElementById("idStrand").innerText = user.strand;
        win.document.getElementById("idSection").innerText = user.section;
        win.document.getElementById("idSchedule").innerText = user.schedule;

        win.document.getElementById("idPhoto").src = user.photo || "default-avatar.png";

        if(user.average && parseFloat(user.average)>=90)
            win.document.getElementById("honorBadge").innerText = "WITH HONORS";

        const qrData = `Student ID: ${user.id}\nName: ${user.fullname}\nStrand: ${user.strand}\nSection: ${user.section}`;
        const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(qrData)}`;
        win.document.getElementById("qrCode").src = qrURL;

        win.print();
    };
}

/* ==============================
   PRINT ENROLLMENT SLIP
============================== */
function generatePrintForm() {
    const user = JSON.parse(sessionStorage.getItem("currentUser"));
    if(!user) return alert("No student logged in.");

    // Determine Grade Level
    let gradeLevel = "Grade 11";
    if(user.grade === "12" || (user.id && user.id.split("-")[2] == "2025")) gradeLevel = "Grade 12";

    // Schedule
    const sectionLetter = user.section ? user.section.slice(-1).toUpperCase() : "A";
    const scheduleMap = { A: "7:30 AM - 2:30 PM", B: "8:00 AM - 3:00 PM", C: "9:00 AM - 4:00 PM", D: "10:00 AM - 5:00 PM" };
    const schedule = scheduleMap[sectionLetter] + " (Mon-Fri)";

    // Fill slip HTML
    const slipHTML = `
    <html>
    <head>
        <title>Enrollment Slip</title>
        <style>
        body{font-family:Arial,sans-serif;padding:40px;color:#333;}
        .slip-container{border:2px solid #003366;padding:30px;max-width:600px;margin:auto;position:relative;}
        .header{text-align:center;border-bottom:2px solid #ffcc00;padding-bottom:10px;margin-bottom:20px;}
        .photo-box{position:absolute;top:30px;right:30px;width:120px;height:120px;border:1px solid #ccc;}
        .info-row{margin:12px 0;font-size:18px;border-bottom:1px dashed #eee;padding-bottom:5px;}
        strong{color:#003366;width:150px;display:inline-block;}
        ul{padding-left:20px;}
        </style>
    </head>
    <body>
        <div class="slip-container">
            <div class="header">
                <h1>ARELLANO UNIVERSITY</h1>
                <p>Official Enrollment Confirmation Slip</p>
            </div>
            <div class="photo-box">
                <img src="${user.photo || 'default-avatar.png'}" style="width:100%;height:100%;object-fit:cover;">
            </div>
            <div class="info-row"><strong>Student ID:</strong> ${user.id}</div>
            <div class="info-row"><strong>Full Name:</strong> ${user.fullname}</div>
            <div class="info-row"><strong>Grade Level:</strong> ${gradeLevel}</div>
            <div class="info-row"><strong>Strand:</strong> ${user.strand}</div>
            <div class="info-row"><strong>Section:</strong> ${user.section}</div>
            <div class="info-row"><strong>Time Schedule:</strong> ${schedule}</div>
            <h3>Subjects</h3>
            <ul>
                ${(user.subjects||[]).map(s => `<li>${s}</li>`).join("")}
            </ul>
        </div>
    </body>
    </html>`;

    const printWin = window.open("", "", "width=800,height=600");
    printWin.document.write(slipHTML);
    printWin.document.close();
    printWin.focus();
    printWin.print();
    printWin.close();
}   

