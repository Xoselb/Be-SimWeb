// citas.js - Script para el formulario de citas
document.addEventListener('DOMContentLoaded', function() {
    const citaForm = document.getElementById("citaForm");
    
    if (citaForm) {
        citaForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const fecha = document.getElementById("fecha")?.value;
            const hora = document.getElementById("hora")?.value;
            const usuario = localStorage.getItem("usuarioLogueado");

            if (!usuario) {
                alert("Debes iniciar sesión");
                window.location.href = "../auth/login.html";
                return;
            }

            if (fecha && hora) {
                alert(`Cita reservada para el ${fecha} a las ${hora}`);
                citaForm.reset();
            } else {
                alert("Por favor, completa todos los campos");
            }
        });
    }
});