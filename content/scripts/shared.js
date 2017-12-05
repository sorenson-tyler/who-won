var view;
var page;
var onHomePage = true;
var inputValue;
var playersCount = 4;
var games = []
var currentGame = {}
var currentGameIndex;

window.onload = function() {
  view = document.getElementById("masterView");
  page = document.getElementById("page");
  loadHeader();
};

function loadHome() {
  getUsersGames();

  navigate("views/shared/home.html", true);
}

function loadHeader() {
  var xhr = new XMLHttpRequest();

  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      var header = document.getElementById("header");
      header.innerHTML = xhr.responseText;
      loadHome();
    }
  }

  xhr.open("GET", "views/shared/header.html", true);
  xhr.setRequestHeader('Content-type', 'text/html');
  xhr.send();
}

function navigate(url, homePage) {
  var xhr = new XMLHttpRequest();

  page.setAttribute("class", "slideOut");

  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      setTimeout(function(){
        onHomePage = homePage;
        view.innerHTML = xhr.responseText;
        page.setAttribute("class", "slideIn");
        showHomeButton();
      }, 500);
    }
  }

  xhr.open("GET", url, true);
  xhr.setRequestHeader('Content-type', 'text/html');
  xhr.send();
}

function showHomeButton() {
  if (onHomePage) {
    var homeButton = document.getElementById("homeButton");
    homeButton.style.display = "none";

    displayGames();
  } else {
    var homeButton = document.getElementById("homeButton");
    homeButton.style.display = "block";
  }
}

function openGame(index) {
  currentGameIndex = index;

  currentGame = games[index];

  loadGame();
}

function getUsersGames() {
  var stringifiedGames = localStorage.getItem('whoWonGames');

  if(stringifiedGames != null || stringifiedGames != undefined) {
    games = JSON.parse(stringifiedGames);
  }
}

function updateNumberOfPlayers(positive) {
  positive? addPlayerInput() : removePlayerInput();

  var numberOfPlayers = document.getElementById("numberOfPlayers");
  numberOfPlayers.innerHTML = playersCount + ' Players';
}

function addPlayerInput() {
  playersCount++;

  var newPlayerNameElement = document.createElement("input");
  newPlayerNameElement.setAttribute("class", "input");
  newPlayerNameElement.setAttribute("id", "player-" + playersCount);
  newPlayerNameElement.setAttribute("placeholder", "Player " + playersCount + "'s Name");

  var listElement = document.getElementById("players-names");
  listElement.appendChild(newPlayerNameElement);
}

function removePlayerInput() {
  if(playersCount == 2) {
    return;
  }
  var lastPlayerNameElement = document.getElementById("player-" + playersCount);

  playersCount--;

  var listElement = document.getElementById("players-names");
  listElement.removeChild(lastPlayerNameElement);
}

function startGame() {
  currentGame = {
    numberOfPlayers: playersCount,
    gameName: document.getElementById("gameName").value,
    isGolf: document.getElementById("lowestWins").checked,
    players: getPlayers(playersCount),
    winner: 'No Scores',
    roundsPlayed: 0
  }

  games.push(currentGame);

  saveGames();

  loadGame();
}

function getPlayers(numberOfPlayers) {
  var players = [];

  for (var i = 1; i <= numberOfPlayers; i++) {
    var playerName = document.getElementById("player-" + i).value;

    var player = {
      name: playerName,
      total: 0
    }

    players.push(player);
  }

  return players;
}

function displayGames() {
  var playedGamesElement = document.getElementById('playedGames');

  for (var game in games) {
    var gameElement = document.createElement("div");

    gameElement.setAttribute("class", "game");
    (function(_game) {
       gameElement.addEventListener("click", function() {openGame(_game);});
     })(game);

    var gameNameElement = document.createElement("a");
    gameNameElement.innerHTML = games[game].gameName;
    gameNameElement.setAttribute("class", 'game-name');

    var gameWinnerElement = document.createElement("span");
    gameWinnerElement.innerHTML = games[game].winner;
    gameWinnerElement.setAttribute("class", 'game-winner');

    gameElement.appendChild(gameNameElement);
    gameElement.appendChild(gameWinnerElement);

    playedGamesElement.appendChild(gameElement);
  }
}

function loadGame() {
  var xhr = new XMLHttpRequest();
  page.setAttribute("class", "slideOut");
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      setTimeout(function(){
        onHomePage = false;
        view.innerHTML = xhr.responseText;
        showHomeButton();
        document.getElementById('gameName').innerHTML = currentGame.gameName;
        loadCurrentPlayers();
        page.setAttribute("class", "slideIn");
      }, 500);
    }
  }

  xhr.open("GET", 'views/game.html', true);
  xhr.setRequestHeader('Content-type', 'text/html');
  xhr.send();
}

function saveGames() {
  var stringifiedValue = JSON.stringify(games);
  localStorage.setItem('whoWonGames', stringifiedValue);
}

function loadCurrentPlayers() {
  var playersElement = document.getElementById('players');

  for (var player in currentGame.players) {
    var playerElement = document.createElement("div");

    playerElement.setAttribute("id", "player-" + player);

    var playerLabel = document.createElement("label");
    playerLabel.innerHTML = currentGame.players[player].name;

    var playerInput = document.createElement("input");
    playerInput.setAttribute("type", "number");
    playerInput.setAttribute("class", "input");

    playerElement.appendChild(playerLabel);
    playerElement.appendChild(playerInput);

    playersElement.appendChild(playerElement);
  }
}

function loadRoundScores() {

}

function enterRoundScores() {
  for (var i = 0; i < currentGame.numberOfPlayers; i++) {
    var playerElement = document.getElementById("player-" + i);

    var inputElement = playerElement.children[1];

    var score = parseInt(inputElement.value);

    var currentRound = currentGame.roundsPlayed + 1;
    currentGame.players[i]['round' + currentRound] = score;

    currentGame.players[i].total += score;
  }

  currentGame.roundsPlayed++;

  games[currentGameIndex] = currentGame;

  saveGames();
}
