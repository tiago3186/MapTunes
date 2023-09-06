import config from './config.js';


// Defina um objeto com os usernames e senhas permitidos
const users = {
    "admin": "admin",
    // Adicione mais usernames e senhas aqui conforme necessário
};

// Função para verificar o login
function checkLogin(event) {
    event.preventDefault(); // Impede o envio do formulário

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    if (users[username] === password) {
        // Se as credenciais estiverem corretas, redirecione para index.html
        window.location.href = "index.html";
    } else {
        alert("Credenciais incorretas. Tente novamente.");
    }
}

// Verifica se estamos na página de login
if (window.location.pathname === "/login.html") {
    const loginForm = document.getElementById("loginForm");
    loginForm.addEventListener("submit", checkLogin);
} else if (window.location.pathname === "/index.html") {
    // Se estamos na página de boas-vindas (index.html), exiba a mensagem de boas-vindas
    const username = localStorage.getItem("username");
    if (username) {
        const welcomeMessage = document.getElementById("welcomeMessage");
        welcomeMessage.textContent = `Bem-vindo, ${username}!`;
    } else {
        // Se não houver um nome de usuário, redirecione de volta para a página de login
        window.location.href = "login.html";
    }
}


document.addEventListener("DOMContentLoaded", () => {
    // Sua chave da API do Last.fm
    const apiKey = config.apiKey;
    
    // Seu nome de usuário no Last.fm
    const lastfmusername = config.lastfmProfile;

    console.log(apiKey, lastfmusername)
    
    // URL da API do Last.fm para obter os artistas mais ouvidos
    const apiUrl = `https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${lastfmusername}&api_key=${apiKey}&limit=10&format=json`;
    
    console.log(apiUrl)

    const tableBody = document.querySelector("tbody");

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            const topArtists = data.topartists.artist;
            topArtists.forEach((artist, index) => {
                const position = index + 1;
                const name = artist.name;
                const playcount = artist.playcount;
                const tags = "Nenhuma tag disponível";
                const row = `<tr>
                    <td>${position}</td>
                    <td>${name}</td>
                    <td>${playcount}</td>
                    <td>${tags}</td>
                </tr>`;
                tableBody.innerHTML += row;
            });
        })
        .catch(error => console.error(error));
});
