
// =====================================
// GS GISAKURA SCHOOL MANAGEMENT SYSTEM
// =====================================

// CHANGE YOUR ADMINISTRATOR PASSKEY HERE
const ADMIN_PASSKEY = "GISAKURA2026";

// DATABASE
let students = JSON.parse(
    localStorage.getItem("gsGisakuraStudents") || "[]"
);

let currentRole = null;
let selectedId = null;

const form = document.getElementById("studentForm");

// =====================================
// ACCESS AND DASHBOARD CONTROL
// =====================================

document.getElementById("adminChoice").addEventListener("click", () => {
    document.getElementById("passkeyBox").hidden = false;
    document.getElementById("passkey").focus();
    document.getElementById("loginMessage").textContent = "";
});

document.getElementById("guestChoice").addEventListener("click", () => {
    openDashboard("guest");
});

document.getElementById("loginAdmin").addEventListener("click", loginAdmin);

document.getElementById("passkey").addEventListener("keydown", event => {
    if (event.key === "Enter") loginAdmin();
});

function loginAdmin() {
    const enteredKey = document.getElementById("passkey").value;

    if (enteredKey === ADMIN_PASSKEY) {
        document.getElementById("passkey").value = "";
        document.getElementById("loginMessage").textContent = "";
        openDashboard("admin");
    } else {
        document.getElementById("loginMessage").textContent =
            "Incorrect passkey. Please try again.";

        document.getElementById("loginMessage").style.color = "red";
    }
}

function openDashboard(role) {
    currentRole = role;
    selectedId = null;

    document.getElementById("loginSection").hidden = true;
    document.getElementById("dashboardSection").hidden = false;
    document.getElementById("logoutBtn").hidden = false;

    const isAdmin = role === "admin";

    document.getElementById("dashboardTitle").textContent =
        isAdmin ? "Administrator Dashboard" : "Student Guest Dashboard";

    document.getElementById("dashboardDescription").textContent =
        isAdmin
            ? "Manage school registration and student records."
            : "Complete your student registration below.";

    document.getElementById("roleBadge").textContent =
        isAdmin ? "ADMINISTRATOR" : "STUDENT GUEST";

    document.getElementById("adminStats").hidden = !isAdmin;
    document.getElementById("adminDatabase").hidden = !isAdmin;
    document.getElementById("guestNotice").hidden = isAdmin;

    document.getElementById("formTitle").textContent =
        isAdmin ? "Register a Student" : "Student Registration";

    document.getElementById("saveBtn").textContent =
        isAdmin ? "Register Student" : "Submit Registration";

    clearForm();
    displayStudents();
}

function logout() {
    currentRole = null;
    selectedId = null;

    clearForm();

    document.getElementById("dashboardSection").hidden = true;
    document.getElementById("loginSection").hidden = false;
    document.getElementById("logoutBtn").hidden = true;
    document.getElementById("passkeyBox").hidden = true;

    document.getElementById("search").value = "";
    document.getElementById("filterClass").value = "";
    document.getElementById("loginMessage").textContent = "";
}

document.getElementById("logoutBtn").addEventListener("click", logout);

// =====================================
// DATABASE FUNCTIONS
// =====================================

function saveDatabase() {
    localStorage.setItem(
        "gsGisakuraStudents",
        JSON.stringify(students)
    );
}

function showMessage(text, color = "green") {
    const msg = document.getElementById("message");
    msg.textContent = text;
    msg.style.color = color;
}

function getFormData() {
    return {
        id: document.getElementById("studentId").value.trim(),
        firstName: document.getElementById("firstName").value.trim(),
        lastName: document.getElementById("lastName").value.trim(),
        gender: document.getElementById("gender").value,
        dob: document.getElementById("dob").value,
        studentClass: document.getElementById("studentClass").value,
        combination: document.getElementById("combination").value.trim(),
        guardian: document.getElementById("guardian").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        address: document.getElementById("address").value.trim()
    };
}

// =====================================
// REGISTER STUDENT
// =====================================

form.addEventListener("submit", function(event) {
    event.preventDefault();

    if (!currentRole) return;

    const student = getFormData();

    const duplicate = students.some(s =>
        s.id.toLowerCase() === student.id.toLowerCase()
    );

    if (duplicate) {
        showMessage("This Student ID is already registered.", "red");
        return;
    }

    if (new Date(student.dob + "T00:00:00") > new Date()) {
        showMessage("Date of birth cannot be in the future.", "red");
        return;
    }

    students.push(student);
    saveDatabase();
    displayStudents();

    clearForm();

    if (currentRole === "guest") {
        showMessage(
            "Registration submitted successfully! Thank you.",
            "green"
        );
    } else {
        showMessage(
            "Student registered successfully!",
            "green"
        );
    }
});

// =====================================
// DISPLAY DATABASE (ADMIN ONLY)
// =====================================

function displayStudents() {
    if (currentRole !== "admin") return;

    const table = document.getElementById("studentTable");
    const search = document.getElementById("search").value.toLowerCase();
    const filter = document.getElementById("filterClass").value;

    table.innerHTML = "";

    const filtered = students.filter(s => {
        const text = Object.values(s).join(" ").toLowerCase();

        return text.includes(search) &&
            (!filter || s.studentClass === filter);
    });

    filtered.forEach(s => {
        const row = document.createElement("tr");

        const values = [
            s.id, s.firstName, s.lastName, s.gender,
            s.dob, s.studentClass, s.combination,
            s.guardian, s.phone, s.address
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value || "-";
            row.appendChild(cell);
        });

        const actionCell = document.createElement("td");

        const selectButton = document.createElement("button");
        selectButton.textContent = "Edit";
        selectButton.className = "select-btn";
        selectButton.addEventListener("click", () => selectStudent(s.id));

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete";
        deleteButton.style.marginLeft = "5px";
        deleteButton.addEventListener("click", () => deleteStudent(s.id));

        actionCell.append(selectButton, deleteButton);
        row.appendChild(actionCell);

        table.appendChild(row);
    });

    document.getElementById("recordCount").textContent =
        `Showing ${filtered.length} of ${students.length} students`;

    updateDashboard();
}

// =====================================
// ADMIN DASHBOARD STATISTICS
// =====================================

function updateDashboard() {
    document.getElementById("totalStudents").textContent =
        students.length;

    document.getElementById("maleStudents").textContent =
        students.filter(s => s.gender === "Male").length;

    document.getElementById("femaleStudents").textContent =
        students.filter(s => s.gender === "Female").length;
}

// =====================================
// SELECT AND EDIT STUDENT
// =====================================

function selectStudent(id) {
    if (currentRole !== "admin") return;

    const student = students.find(s => s.id === id);
    if (!student) return;

    selectedId = id;

    document.getElementById("studentId").value = student.id;
    document.getElementById("studentId").readOnly = true;

    document.getElementById("firstName").value = student.firstName;
    document.getElementById("lastName").value = student.lastName;
    document.getElementById("gender").value = student.gender;
    document.getElementById("dob").value = student.dob;
    document.getElementById("studentClass").value = student.studentClass;
    document.getElementById("combination").value = student.combination;
    document.getElementById("guardian").value = student.guardian;
    document.getElementById("phone").value = student.phone;
    document.getElementById("address").value = student.address;

    document.getElementById("updateBtn").hidden = false;
    document.getElementById("saveBtn").hidden = true;

    showMessage("Edit the selected student information.", "blue");

    form.scrollIntoView({ behavior: "smooth" });
}

// =====================================
// UPDATE STUDENT
// =====================================

function updateStudent() {
    if (currentRole !== "admin" || !selectedId) return;

    const updated = getFormData();

    if (new Date(updated.dob + "T00:00:00") > new Date()) {
        showMessage("Date of birth cannot be in the future.", "red");
        return;
    }

    const index = students.findIndex(s => s.id === selectedId);

    if (index === -1) return;

    students[index] = updated;

    saveDatabase();
    displayStudents();
    clearForm();

    showMessage("Student information updated successfully!");
}

document.getElementById("updateBtn").addEventListener(
    "click", updateStudent
);

// =====================================
// DELETE STUDENT
// =====================================

function deleteStudent(id) {
    if (currentRole !== "admin") return;

    if (!confirm("Are you sure you want to delete this student?")) {
        return;
    }

    students = students.filter(s => s.id !== id);

    saveDatabase();
    displayStudents();

    if (selectedId === id) clearForm();

    showMessage("Student deleted successfully!");
}

// =====================================
// CLEAR REGISTRATION FORM
// =====================================

function clearForm() {
    form.reset();

    selectedId = null;

    document.getElementById("studentId").readOnly = false;
    document.getElementById("updateBtn").hidden = true;
    document.getElementById("saveBtn").hidden = false;
}

// =====================================
// SEARCH AND FILTER
// =====================================

document.getElementById("search").addEventListener(
    "input", displayStudents
);

document.getElementById("filterClass").addEventListener(
    "change", displayStudents
);

document.getElementById("clearBtn").addEventListener(
    "click", clearForm
);

// =====================================
// EXPORT DATABASE
// =====================================

function exportCSV() {
    if (currentRole !== "admin") return;

    if (students.length === 0) {
        alert("No student records available.");
        return;
    }

    const columns = [
        "id", "firstName", "lastName", "gender",
        "dob", "studentClass", "combination",
        "guardian", "phone", "address"
    ];

    const csv = [
        columns.join(","),
        ...students.map(student =>
            columns.map(key =>
                '"' + String(student[key] ?? "").replace(/"/g, '""') + '"'
            ).join(",")
        )
    ].join("\n");

    const blob = new Blob([csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "GS_Gisakura_Students.csv";
    link.click();

    URL.revokeObjectURL(url);
}

document.getElementById("exportBtn").addEventListener(
    "click", exportCSV
);
