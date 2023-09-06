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
        // Se as credenciais estiverem corretas, armazene o nome de usuário no localStorage
        localStorage.setItem("username", username);

        // Redirecione para index.html
        window.location.href = "index.html";
    } else {
        alert("Credenciais incorretas. Tente novamente.");
    }
}

// Função para fazer o logout
function logout() {
    // Limpar o nome de usuário armazenado no localStorage
    localStorage.removeItem("username");
    
    // Redirecionar para a página de login
    window.location.href = "login.html";
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

    // Adicione um evento de clique ao botão de logout
    const logoutButton = document.getElementById("logoutButton");
    logoutButton.addEventListener("click", logout);
}



document.addEventListener("DOMContentLoaded", () => {
    // Sua chave da API do Last.fm
    const apiKey = config.apiKey;
    const excludedTags = ["seen live"];
    // Seu nome de usuário no Last.fm
    const lastfmusername = config.lastfmProfile;

    const welcomeMessage2 = document.getElementById("welcomeMessage2");
    const tableBody = document.querySelector("#artist-table tbody");
    const tagTableBody = document.querySelector("#tag-table tbody"); // Adicione esta linha

    welcomeMessage2.textContent = `Seu perfil do lastfm é ${lastfmusername}!`;

    function fetchArtistTags(artistName, apiKey, limit = 10) {
        const apiUrl = `https://ws.audioscrobbler.com/2.0/?method=artist.gettoptags&artist=${artistName}&api_key=${apiKey}&format=json`;
    
        return fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                // Verifique se há tags disponíveis
                if (data.toptags && data.toptags.tag && data.toptags.tag.length > 0) {
                    const tags = data.toptags.tag
                        .filter(tag => !excludedTags.includes(tag.name)) // Excluir tags indesejadas
                        .slice(0, limit)
                        .map(tag => tag.name)
                        .join(', ');
                    return tags;
                } else {
                    return "Nenhuma tag disponível";
                }
            })
            .catch(error => {
                console.error(`Erro ao buscar tags para ${artistName}: ${error}`);
                return "Erro ao buscar tags";
            });
    }
    

    // URL da API do Last.fm para obter os artistas mais ouvidos
    const apiUrl = `https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${lastfmusername}&api_key=${apiKey}&limit=10&format=json`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            const topArtists = data.topartists.artist;

            const artistPromises = topArtists.map(artist => {
                return fetchArtistTags(artist.name, apiKey)
                    .then(tags => {
                        artist.tags = tags;
                        return artist;
                    });
            });

            return Promise.all(artistPromises);
        })
        .then(topArtistsWithTags => {
            topArtistsWithTags.forEach((artist, index) => {
                const position = index + 1;
                const name = artist.name;
                const playcount = artist.playcount;
                const tags = artist.tags;
                const row = `<tr>
                    <td>${position}</td>
                    <td>${name}</td>
                    <td>${playcount}</td>
                    <td>${tags}</td>
                </tr>`;
                tableBody.innerHTML += row;
            });

            // Função para calcular as contagens de tags
            function countTags(topArtistsWithTags, excludedTags = []) {
                const tagCounts = {};
            
                topArtistsWithTags.forEach((artist) => {
                    artist.tags.split(', ').forEach((tag) => {
                        if (!excludedTags.includes(tag)) { // Verifica se a tag não está na lista de tags excluídas
                            if (tagCounts[tag]) {
                                tagCounts[tag]++;
                            } else {
                                tagCounts[tag] = 1;
                            }
                        }
                    });
                });
            
                return tagCounts;
            }
            

            // Preenche a segunda tabela (tags)
           
            const tagCounts = countTags(topArtistsWithTags, excludedTags);
            const sortedTags = Object.entries(tagCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);

            tagTableBody.innerHTML = '';
            sortedTags.forEach((tag, index) => {
                const position = index + 1;
                const tagName = tag[0];
                const tagCount = tag[1];
                const tagRow = `<tr>
                    <td>${position}</td>
                    <td>${tagName}</td>
                    <td>${tagCount}</td>
                </tr>`;
                tagTableBody.innerHTML += tagRow;
            });
        })
        .catch(error => console.error(error));
});
