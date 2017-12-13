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
      showHomeButton();
    }
  }

  xhr.open("GET", "views/shared/header.html", true);
  xhr.setRequestHeader('Content-type', 'text/html');
  xhr.send();
}

function navigate(url, homePage) {
  var xhr = new XMLHttpRequest();

  page.setAttribute("class", "col-6 slideOut");

  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      setTimeout(function() {
        onHomePage = homePage;
        view.innerHTML = xhr.responseText;
        page.setAttribute("class", "col-6 slideIn");
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
    homeButton.setAttribute("class","hide");

    displayGames();
  } else {
    var homeButton = document.getElementById("homeButton");
    homeButton.setAttribute("class","show");
  }
}

function openGame(index) {
  currentGameIndex = index;

  currentGame = games[index];

  loadGame();
}

function getUsersGames() {
  var stringifiedGames = localStorage.getItem('whoWonGames');

  if (stringifiedGames != null || stringifiedGames != undefined) {
    games = JSON.parse(stringifiedGames);
  }
}

function updateNumberOfPlayers(positive) {
  positive ? addPlayerInput() : removePlayerInput();

  var numberOfPlayers = document.getElementById("numberOfPlayers");
  numberOfPlayers.innerHTML = playersCount + ' Players';
}

function addPlayerInput() {
  playersCount++;

  var newPlayerNameElement = document.createElement("input");
  newPlayerNameElement.setAttribute("class", "input new-player");
  newPlayerNameElement.setAttribute("id", "player-" + playersCount);
  newPlayerNameElement.setAttribute("type", "text");
  newPlayerNameElement.setAttribute("placeholder", "Player " + playersCount + "'s Name");

  var listElement = document.getElementById("players-names");
  listElement.appendChild(newPlayerNameElement);
}

function removePlayerInput() {
  if (playersCount == 2) {
    return;
  }
  var lastPlayerNameElement = document.getElementById("player-" + playersCount);

  playersCount--;

  var listElement = document.getElementById("players-names");
  lastPlayerNameElement.setAttribute("class", "input delete-player");

  setTimeout(function(){ listElement.removeChild(lastPlayerNameElement); }, 500);

}

function startGame() {
  var gameName = document.getElementById("gameName").value;

  if (gameName == null || gameName == "") {
    alert('Please enter a game name before continuing.');
    return;
  }
  for (var i = 1; i <= playersCount; i++) {
    var playerElement = document.getElementById("player-" + i);

    var name = playerElement.value;

    if (name == null || name == "") {
      alert('Please enter a name for each player before continuing.');
      return;
    }
  }
  currentGame = {
    numberOfPlayers: playersCount,
    gameName: gameName,
    isGolf: document.getElementById("lowestWins").checked,
    players: getPlayers(playersCount),
    winner: 'No Scores',
    roundsPlayed: 0
  }

  games.push(currentGame);

  saveGames();

  openGame(games.length - 1);
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
  var yourGamesElement = document.getElementById('your-games');

  if (games == null || games.length < 1) {
    yourGamesElement.innerHTML = '';
  } else {
    var playedGamesElement = document.getElementById('playedGames');

    createGamelistHeaders(playedGamesElement);

    for (var game in games) {
      var gameElement = document.createElement("div");

      gameElement.setAttribute("class", "game");
      (function(_game) {
        gameElement.addEventListener("click", function() {
          openGame(_game);
        });
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
}

function createGamelistHeaders(playedGamesElement) {
  var gameElement = document.createElement("div");
  gameElement.setAttribute("class", "game");

  var gameNameElement = document.createElement("span");
  gameNameElement.innerHTML = "Game Name";
  gameNameElement.setAttribute("class", 'game-name-header');

  var gameWinnerContainer = document.createElement("span");

  var gameWinnerElement = document.createElement("span");

  gameWinnerElement.innerHTML = "Current Winner";
  gameWinnerElement.setAttribute("class", 'game-winner-header');

  var trophyElement = document.createElement("i");
  trophyElement.setAttribute("class", "fa fa-trophy icon");

  gameWinnerContainer.appendChild(trophyElement)
  gameWinnerContainer.appendChild(gameWinnerElement);

  gameElement.appendChild(gameNameElement);
  gameElement.appendChild(gameWinnerContainer);

  playedGamesElement.appendChild(gameElement);
}

function loadGame() {
  var xhr = new XMLHttpRequest();
  page.setAttribute("class", "col-6 slideOut");
  xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
      setTimeout(function() {
        onHomePage = false;
        view.innerHTML = xhr.responseText;
        showHomeButton();
        document.getElementById('gameName').innerHTML = currentGame.isGolf ?
          currentGame.gameName + " (Remember lowest score wins!)" : currentGame.gameName + "";
        loadCurrentPlayers();
        loadRounds();
        page.setAttribute("class", "col-6 slideIn");
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

function loadRounds() {
  var roundScores = [];
  var playerNames = [];
  for (var i = 1; i <= currentGame.roundsPlayed; i++) {
    roundScores[i] = [];
    for (var j = 0; j < currentGame.numberOfPlayers; j++) {
      roundScores[i][j] = currentGame.players[j]['round' + i];

      if (i == 1) {
        playerNames.push(currentGame.players[j].name);
      }
    }
  }

  if (currentGame.roundsPlayed > 0) {
    var roundContainerElement = document.getElementById('roundScores');
    while (roundContainerElement.firstChild) {
      roundContainerElement.removeChild(roundContainerElement.firstChild);
    }

    var roundScoresElement = document.createElement("div");
    roundScoresElement.setAttribute("class", "roundScores");

    var playerHeaderElement = document.createElement("div");
    playerHeaderElement.setAttribute("class", "playerScoreHeaderRow");

    //Players Names
    for (var playerName in playerNames) {
      var currentPlayerElement = document.createElement("div");
      currentPlayerElement.innerHTML = playerNames[playerName];
      currentPlayerElement.setAttribute("class", "playerScoreHeader");
      if(playerNames[playerName] == currentGame.winner) {
        var trophyElement = document.createElement("i");
        trophyElement.setAttribute("class", "fa fa-trophy game-leader");
        playerHeaderElement.appendChild(trophyElement);
        currentPlayerElement.setAttribute("style", "color: rgb(138, 135, 59);")
      }

      playerHeaderElement.appendChild(currentPlayerElement);
    }

    //Total Scores
    var roundRowElement = document.createElement("div");
    roundRowElement.setAttribute("class", "total");

    var roundNumberElement = document.createElement("div");
    roundNumberElement.innerHTML = "Totals";
    roundNumberElement.setAttribute("class", "roundNumberHeader");

    roundRowElement.appendChild(roundNumberElement);

    //Player total scores
    var rowScoresElement = document.createElement("div");
    rowScoresElement.setAttribute("class", "roundPlayerScores")

    for (var j = 0; j < currentGame.numberOfPlayers; j++) {
      var roundScoreElement = document.createElement("div");
      roundScoreElement.innerHTML = currentGame.players[j].total;
      roundScoreElement.setAttribute("class", "playerRoundScore");

      rowScoresElement.appendChild(roundScoreElement);
    }

    roundRowElement.appendChild(rowScoresElement);

    roundScoresElement.appendChild(roundRowElement);

    //Round header number with player score
    for (var i = 1; i <= currentGame.roundsPlayed; i++) {
      var roundRowElement = document.createElement("div");
      roundRowElement.setAttribute("class", "round" + i);

      var roundNumberElement = document.createElement("div");
      roundNumberElement.innerHTML = "Round " + i;
      roundNumberElement.setAttribute("class", "roundNumberHeader");

      roundRowElement.appendChild(roundNumberElement);

      var rowScoresElement = document.createElement("div");
      rowScoresElement.setAttribute("class", "roundPlayerScores")

      for (var j = 0; j < currentGame.numberOfPlayers; j++) {
        var roundScoreElement = document.createElement("div");
        roundScoreElement.innerHTML = roundScores[i][j];
        roundScoreElement.setAttribute("class", "playerRoundScore");

        rowScoresElement.appendChild(roundScoreElement);
      }

      roundRowElement.appendChild(rowScoresElement);

      roundScoresElement.appendChild(roundRowElement);
    }

    roundContainerElement.appendChild(playerHeaderElement);
    roundContainerElement.appendChild(roundScoresElement);
  }
}

function enterRoundScores() {
  var highestTotal;

  for (var i = 0; i < currentGame.numberOfPlayers; i++) {
    var playerElement = document.getElementById("player-" + i);

    var inputElement = playerElement.children[1];

    var score = parseInt(inputElement.value);

    if (isNaN(score)) {
      alert('Please enter a number score for each player before continuing.');
      return;
    }

    var currentRound = currentGame.roundsPlayed + 1;
    currentGame.players[i]['round' + currentRound] = score;

    currentGame.players[i].total += score;

    if (highestTotal == null || isWinning(currentGame.isGolf, currentGame.players[i].total, highestTotal)) {
      currentGame.winner = currentGame.players[i].name;

      highestTotal = currentGame.players[i].total;
    }

    inputElement.value = '';
  }

  currentGame.roundsPlayed++;

  games[currentGameIndex] = currentGame;

  saveGames();

  loadRounds();
}

function isWinning(isGolf, playerTotal, highestTotal) {
  if (isGolf) {
    return playerTotal < highestTotal;
  } else {
    return playerTotal > highestTotal;
  }
}
