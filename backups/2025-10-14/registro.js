document.getElementById("registroForm").addEventListener("submit", function(e) {
    e.preventDefault();
    const usuario = {
        nombre: document.getElementById("nombre").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value
    };
    localStorage.setItem(usuario.email, JSON.stringify(usuario));
    alert("Usuario registrado con éxito");
    window.location.href = "login.html";
});