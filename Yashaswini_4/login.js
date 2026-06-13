function register() {
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const message = document.getElementById("message");

    if (!email || !password) {
        message.style.color = "red";
        message.textContent = "Please fill all fields.";
        return;
    }

    const user = {
        email: email,
        password: password
    };

    localStorage.setItem("user", JSON.stringify(user));

    message.style.color = "green";
    message.textContent = "Registration successful!";
}

// Login User
function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (
        storedUser &&
        email === storedUser.email &&
        password === storedUser.password
    ) {
        localStorage.setItem("loggedIn", "true");
        window.location.href = "secure.html";
    } else {
        alert("Invalid email or password!");
    }
}

// Check Authentication on Secure Page
if (window.location.pathname.includes("secure.html")) {
    const isLoggedIn = localStorage.getItem("loggedIn");

    if (isLoggedIn !== "true") {
        window.location.href = "index.html";
    }
}

// Logout
function logout() {
    localStorage.removeItem("loggedIn");
    window.location.href = "index.html";
}