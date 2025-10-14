document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const usuario = JSON.parse(localStorage.getItem(email));

    if (usuario && usuario.password === password) {
        localStorage.setItem("usuarioLogueado", email);
        alert("Inicio de sesión correcto");
        window.location.href = "citas.html";
    } else {
        alert("Email o contraseña incorrectos");
    }
});