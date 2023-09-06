document.addEventListener("DOMContentLoaded", () => {
    // Sua chave da API do Last.fm
    const apiKey = "";
    
    // Seu nome de usuário no Last.fm
    const username = "";
    
    // URL da API do Last.fm para obter os artistas mais ouvidos
    const apiUrl = `https://ws.audioscrobbler.com/2.0/?method=user.gettopartists&user=${username}&api_key=${apiKey}&limit=10&format=json`;
    
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
