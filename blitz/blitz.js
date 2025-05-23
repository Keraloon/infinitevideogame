/* global SC */
const playButton = document.getElementById("playButton");
const skipButton = document.getElementById("skipButton");
const timerDisplay = document.getElementById("timerDisplay");
const answerInput = document.getElementById("answerInput");
const scoreDisplay = document.getElementById("scoreDisplay");
const gameContainer = document.getElementById("game-container");
const submitButton = document.getElementById("submitButton");
const feedbackMessage = document.getElementById("feedbackMessage");
const languageToggle = document.getElementById("languageToggle");

let currentIndex;
let score = 0;
let totalPlayed = 0; 
let timer = 60;
let interval;
let isPlaying = false;
let currentLanguage = localStorage.getItem("language") || "fr"; // Par défaut en français

const backButton = document.getElementById("backButton");
backButton.addEventListener("click", () => {
    window.location.href = "/index.html"; // Redirection vers index.html
});

// Fonction de changement de langue
function changeLanguage() {
    currentLanguage = (currentLanguage === 'fr') ? 'en' : 'fr'; //Si Fr->En, si En->Fr
    localStorage.setItem("language", currentLanguage);
    // Appliquer les modifications de langue
    applyLanguage();

    // Efface le message de feedback lors du changement de langue
    feedbackMessage.textContent = "";

}

// Mise à jour du texte des éléments en anglais
function updateTextEnglish() {
    playButton.textContent = "Play";
    skipButton.textContent = "Skip";
    timerDisplay.textContent = `Time remaining: ${timer}s`;
    scoreDisplay.textContent = `Score: ${score} / ${totalPlayed}`;
    feedbackMessage.textContent = "Wrong answer. Try again!";
    submitButton.textContent = "Submit";
    languageToggle.textContent = "Passer en Français";
    backButton.textContent = "Return";
    answerInput.placeholder = "Write your answer";
}

// Mise à jour du texte des éléments en français
function updateTextFrench() {
    playButton.textContent = "Jouer";
    skipButton.textContent = "Passer";
    timerDisplay.textContent = `Temps restant : ${timer}s`;
    scoreDisplay.textContent = `Score : ${score} / ${totalPlayed}`;
    feedbackMessage.textContent = "Mauvaise réponse. Essayez encore !";
    submitButton.textContent = "Soumettre";
    languageToggle.textContent = "Switch to English"; 
    backButton.textContent = "Retour";
    answerInput.placeholder = "Entrez votre réponse";
}

// Applique le texte dans la langue actuelle
function applyLanguage() {
    if (currentLanguage === 'en') {
        updateTextEnglish();
    } else {
        updateTextFrench();
    }
}

// Ajout de l'événement de clic pour changer la langue
languageToggle.addEventListener("click", changeLanguage);

// Applique la langue au chargement de la page
applyLanguage();






// Initialiser le lecteur SoundCloud
let widget;

function initializePlayer() {
    const playerIframe = document.getElementById("soundcloud-player");
    widget = SC.Widget(playerIframe);
}

const suggestionsList = document.createElement("ul");
suggestionsList.id = "suggestionsList";
gameContainer.appendChild(suggestionsList); // Ajoute la liste des suggestions au conteneur de jeu

function populateAnswerOptions() {
    suggestionsList.innerHTML = ""; // Vider les suggestions précédentes

    const userInput = answerInput.value.toLowerCase();
    if (userInput.length > 0) {
        // Divise l'entrée utilisateur en mots
        const inputWords = userInput.split(' '); 

        window.musicNameList.forEach(music => {
            // Vérifie la langue et filtre les suggestions en conséquence
            const title = currentLanguage === 'fr' ? music.fr : music.en;
            const titleLower = title.toLowerCase(); // Normalise le titre

            // Vérifie si tous les mots de l'entrée sont présents dans le titre
            if (inputWords.every(word => titleLower.includes(word))) {
                const suggestionItem = document.createElement("li");
                suggestionItem.textContent = title; // Affiche le titre dans la langue sélectionnée
                suggestionItem.addEventListener("click", () => {
                    answerInput.value = title; // Préremplit le champ avec le titre sélectionné
                    suggestionsList.innerHTML = ""; // Vider les suggestions
                });
                suggestionsList.appendChild(suggestionItem);
            }
        });
    }
}


// Démarrer le jeu
function startGame() {
    if (isPlaying) return;
    isPlaying = true;
    score = 0;
    totalPlayed = 0; // Réinitialise le compteur total
    timer = 60;
    updateScoreDisplay();
    startTimer();
    playRandomMusic();
}

function updateTimerDisplay() {
    if (currentLanguage === 'fr') {
        timerDisplay.textContent = `Temps restant : ${timer}s`;
    } else {
        timerDisplay.textContent = `Time remaining: ${timer}s`;
    }
}
// Gérer le minuteur
function startTimer() {
    timer = 60; // Remet le timer à 60 au début
    updateTimerDisplay(); // Affiche le timer initial
    interval = setInterval(() => {
        timer--;
        updateTimerDisplay(); // Met à jour l'affichage du timer

        if (timer <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    clearInterval(interval); // Arrête le minuteur
    isPlaying = false;

    if (widget) {
        widget.pause(); // Arrête la musique
    }

    // Déterminer la réponse correcte
    const correctMusic = window.musicNameList.find(music => music.id === window.musicListWithLinks[currentIndex].answer);
    const correctAnswer = correctMusic ? (currentLanguage === 'fr' ? correctMusic.fr : correctMusic.en) : '';

    // Déterminer le message à afficher selon la langue
    let alertMessage;
    if (currentLanguage === 'fr') {
        alertMessage = `Temps écoulé ! Votre score : ${score} / ${totalPlayed}. La réponse était : ${correctAnswer}`;
    } else {
        alertMessage = `Time's up! Your score: ${score} / ${totalPlayed}. The answer was: ${correctAnswer}`;
    }

    // Affiche l'alerte
    alert(alertMessage);
    
    // Réinitialisez les valeurs
    currentIndex = null;
    score = 0;
    timer = 60;
    scoreDisplay.textContent = `Score : ${score}`; // Réinitialise l'affichage du score
    timerDisplay.textContent = `Temps restant : ${timer}s`; // Réinitialise l'affichage du timer
    answerInput.value = ""; // Vider le champ de saisie
    suggestionsList.innerHTML = ""; // Vider la liste de suggestions
}



// Lecture d'une musique aléatoire
function playRandomMusic() {
    currentIndex = Math.floor(Math.random() * window.musicListWithLinks.length);
    const music = window.musicListWithLinks[currentIndex];
    if (music) {
        document.getElementById("soundcloud-player").src = `https://w.soundcloud.com/player/?url=${encodeURIComponent(music.url)}&auto_play=true`;
        initializePlayer();
        totalPlayed++;
        updateScoreDisplay();
    }
}

// Met à jour l'affichage du score
function updateScoreDisplay() {
    const adjustedTotalPlayed = totalPlayed > 0 ? totalPlayed - 1 : 0; 
    scoreDisplay.textContent = `Score : ${score} / ${adjustedTotalPlayed}`;
}


// Passer à une autre musique aléatoire
function skipMusic() {
    if (!isPlaying) return;

    // Récupérer la musique correcte à partir de `currentIndex`
    const correctMusic = window.musicNameList.find(music => music.id === window.musicListWithLinks[currentIndex].answer);
    const correctAnswer = correctMusic ? (currentLanguage === 'fr' ? correctMusic.fr : correctMusic.en) : '';

    // Affiche le message avec la bonne réponse
    feedbackMessage.textContent = `La réponse était : ${correctAnswer}`;
    
    playRandomMusic(); // Passe à une nouvelle musique
}

// Vérification de la réponse
function checkAnswer() {
    const userAnswer = answerInput.value.trim().toLowerCase();
    
    // Récupérer la musique correcte à partir de `currentIndex`
    const correctMusic = window.musicNameList.find(music => music.id === window.musicListWithLinks[currentIndex].answer);
    const correctAnswer = correctMusic ? (currentLanguage === 'fr' ? correctMusic.fr.toLowerCase() : correctMusic.en.toLowerCase()) : '';

    // Comparer la réponse utilisateur avec le titre dans la langue sélectionnée
    if (userAnswer === correctAnswer) {
        score++;
        feedbackMessage.textContent = ""; // Efface le message en cas de bonne réponse
        playRandomMusic(); // Passe à une nouvelle musique
    } else {
        feedbackMessage.textContent = "Mauvaise réponse. Essayez encore !";
    }
    answerInput.value = ""; // Vide le champ de saisie après chaque tentative
    updateScoreDisplay();
}



// Ajouter les événements
playButton.addEventListener("click", startGame);
skipButton.addEventListener("click", skipMusic);
submitButton.addEventListener("click", checkAnswer);
answerInput.addEventListener("input", populateAnswerOptions);

// Initialiser le lecteur au chargement de la page
feedbackMessage.textContent = "";
initializePlayer();

