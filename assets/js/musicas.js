const musicas = [
  "/assets/audio/natural.mp3",
  "/assets/audio/radioactive.mp3",
  "/assets/audio/anjos.m4a",
  
];

let atual = 0;

const player = document.getElementById("musica");

player.volume = 0.3;
player.src = musicas[atual];

player.addEventListener("ended", () => {
    atual++;

    if (atual >= musicas.length) {
        atual = 0;
    }

    player.src = musicas[atual];
    player.play();
});
