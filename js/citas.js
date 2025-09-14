document.getElementById("citaForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;
    const usuario = localStorage.getItem("usuarioLogueado");

    if (!usuario) {
        alert("Debes iniciar sesión");
        window.location.href = "login.html";
        return;
    }

    alert(`Cita reservada para el ${fecha} a las ${hora}`);
});