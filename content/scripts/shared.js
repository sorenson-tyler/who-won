var view;
var onHomePage = true;
var inputValue;
var playersCount = 4;
var games = []
var currentGame = {}

window.onload = function() {
  view = document.getElementById("masterView");
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

  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      onHomePage = homePage;
      view.innerHTML = xhr.responseText;
      showHomeButton();
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

    var playedGamesElement = document.getElementById('playedGames');

    for (var game in games) {
      var gameElement = document.createElement("div");

      var gameNameElement = document.createElement("a");
      gameNameElement.innerHTML = games[game].gameName;
      //gameNameElement.setAttribute("onclick", openGame(games[game]));
      gameNameElement.setAttribute("class", 'game-name');

      var gameWinnerElement = document.createElement("span");
      gameWinnerElement.innerHTML = games[game].winner;
      gameWinnerElement.setAttribute("class", 'game-winner');

      gameElement.appendChild(gameNameElement);
      gameElement.appendChild(gameWinnerElement);

      playedGamesElement.appendChild(gameElement);
    }
  } else {
    var homeButton = document.getElementById("homeButton");
    homeButton.style.display = "block";
  }
}

function openGame(game) {
  currentGame = game;

  navigate('views/game.html');
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
    playerNames: getPlayersNames(playersCount),
    winner: 'No Scores'
  }

  games.push(currentGame);

  var stringifiedValue = JSON.stringify(games);
  localStorage.setItem('whoWonGames', stringifiedValue);

  navigate('views/game.html', false);
}

function getPlayersNames(numberOfPlayers) {
  var playersNames = '';

  for (var i = 1; i <= numberOfPlayers; i++) {
    var playerName = document.getElementById("player-" + i).value;
    if(i == 1) {
      playersNames = playerName;
    } else {
      playersNames += ',' + playerName;
    }
  }

  return playersNames;
}

function loadGame() {
  document.getElementById('gameName').innerHTML = currentGame.gameName;
}
