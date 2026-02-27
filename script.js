/* ================================
   DATABASE (LocalStorage)
================================ */

function getStudents(){
    return JSON.parse(localStorage.getItem("students")) || [];
}

function saveStudents(students){
    localStorage.setItem("students", JSON.stringify(students));
}

/* ================================
   APPLY FORM
================================ */

const enrollForm = document.getElementById("enrollForm");

if(enrollForm){
    enrollForm.addEventListener("submit", function(e){
        e.preventDefault();

        const fullname = document.getElementById("fullname").value;
        const birthdate = document.getElementById("birthdate").value;
        const email = document.getElementById("email").value;
        const contact = document.getElementById("contact").value;
        const course = document.getElementById("course").value;

        const students = getStudents();

        const studentID = "2026-" + (students.length + 1).toString().padStart(4, '0');

        const newStudent = {
            id: studentID,
            fullname,
            birthdate,
            email,
            contact,
            course,
            status: "Pending"
        };

        students.push(newStudent);
        saveStudents(students);

        alert("Application Submitted! Your Student ID: " + studentID);
        enrollForm.reset();
    });
}

/* ================================
   ADMIN PANEL
================================ */

const studentList = document.getElementById("studentList");

if(studentList){
    displayStudents();
}

function displayStudents(){
    const students = getStudents();
    studentList.innerHTML = "";

    students.forEach((student, index) => {
        studentList.innerHTML += `
            <div class="card">
                <h3>${student.fullname}</h3>
                <p>ID: ${student.id}</p>
                <p>Course: ${student.course}</p>
                <p>Status: ${student.status}</p>

                <button onclick="updateStatus(${index}, 'Admitted')">Admit</button>
                <button onclick="updateStatus(${index}, 'Failed')">Reject</button>
            </div>
        `;
    });
}

function updateStatus(index, status){
    const students = getStudents();
    students[index].status = status;
    saveStudents(students);
    displayStudents();
}

/* ================================
   SEARCH FUNCTION
================================ */

function searchStudent(){
    const search = document.getElementById("search").value.toLowerCase();
    const students = getStudents();
    studentList.innerHTML = "";

    students.forEach((student, index) => {
        if(student.fullname.toLowerCase().includes(search)){
            studentList.innerHTML += `
                <div class="card">
                    <h3>${student.fullname}</h3>
                    <p>ID: ${student.id}</p>
                    <p>Course: ${student.course}</p>
                    <p>Status: ${student.status}</p>
                </div>
            `;
        }
    });
}

/* ================================
   FILTER FUNCTION
================================ */

function filterStatus(){
    const filter = document.getElementById("filter").value;
    const students = getStudents();
    studentList.innerHTML = "";

    students.forEach((student) => {
        if(filter === "" || student.status === filter){
            studentList.innerHTML += `
                <div class="card">
                    <h3>${student.fullname}</h3>
                    <p>ID: ${student.id}</p>
                    <p>Course: ${student.course}</p>
                    <p>Status: ${student.status}</p>
                </div>
            `;
        }
    });
}

/* ================================
   STUDENT PORTAL LOGIN
================================ */

const loginForm = document.getElementById("loginForm");

if(loginForm){
    loginForm.addEventListener("submit", function(e){
        e.preventDefault();

        const id = document.getElementById("studentID").value;
        const password = document.getElementById("password").value;

        const students = getStudents();
        const student = students.find(s => s.id === id);

        if(student && password === student.birthdate.replaceAll("-", "")){
            if(student.status === "Admitted"){
                document.getElementById("loginBox").style.display = "none";
                document.getElementById("dashboard").style.display = "block";
                document.getElementById("displayID").innerText = student.id;
            } else {
                alert("Your application is not yet approved.");
            }
        } else {
            alert("Invalid Student ID or Password");
        }
    });
}

function logout(){
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("loginBox").style.display = "block";
}

document.getElementById("enrollForm").addEventListener("submit", function(e){
    e.preventDefault();

    const name = document.getElementById("fullname").value;
    const birthdate = document.getElementById("birthdate").value;
    const course = document.getElementById("course").value;

    // Generate Student ID
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    const studentID = year + "-" + random;

    // Convert birthdate to MMDDYYYY (default password)
    const date = new Date(birthdate);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    const defaultPassword = mm + dd + yyyy;

    const studentData = {
        id: studentID,
        name: name,
        course: course,
        password: defaultPassword,
        status: "Admitted"
    };

    localStorage.setItem(studentID, JSON.stringify(studentData));

    document.getElementById("message").innerHTML =
        "Application submitted successfully!<br>" +
        "Your Student ID: <strong>" + studentID + "</strong><br>" +
        "Default Password: <strong>" + defaultPassword + "</strong><br>" +
        "You may now login to the Student Portal.";
});

