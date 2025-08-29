const suits = ['♠', '♥', '♦', '♣'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

let deck = [];
let playerHand = [];
let dealerHand = [];
let score = 10;
let currentBet = 0;

const playerCardsDiv = document.getElementById('player-cards');
const dealerCardsDiv = document.getElementById('dealer-cards');
const playerTotalSpan = document.getElementById('player-total');
const dealerTotalSpan = document.getElementById('dealer-total');
const resultDiv = document.getElementById('result');

const startBtn = document.getElementById('start-button');
const hitBtn = document.getElementById('hit-button');
const standBtn = document.getElementById('stand-button');

const scoreSpan = document.getElementById('score');
const betInput = document.getElementById('bet-input');

function createDeck() {
  deck = [];
  for (let suit of suits) {
    for (let value of values) {
      deck.push({ suit, value });
    }
  }
}

function shuffleDeck() {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function dealCard(hand) {
  const card = deck.pop();
  hand.push(card);
}

function renderCards(hand, container, hideSecond = false) {
  container.innerHTML = '';
  hand.forEach((card, index) => {
    const div = document.createElement('div');
    div.classList.add('card');

    if (hideSecond && index === 1) {
      div.classList.add('face-down');
      div.innerHTML = `<div>🂠</div>`;
    } else {
      div.innerHTML = `
        <div>${card.value}</div>
        <div>${card.suit}</div>
      `;
    }

    container.appendChild(div);
  });
}

function getHandValue(hand) {
  let value = 0;
  let aces = 0;

  for (let card of hand) {
    if (['J', 'Q', 'K'].includes(card.value)) {
      value += 10;
    } else if (card.value === 'A') {
      value += 11;
      aces += 1;
    } else {
      value += parseInt(card.value);
    }
  }

  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }

  return value;
}

function updateUI(revealDealer = false) {
  renderCards(playerHand, playerCardsDiv);
  renderCards(dealerHand, dealerCardsDiv, !revealDealer);

  playerTotalSpan.textContent = getHandValue(playerHand);
  dealerTotalSpan.textContent = revealDealer ? getHandValue(dealerHand) : '?';
}

function updateScoreDisplay() {
  scoreSpan.textContent = score;
}

function checkForEnd() {
  const playerValue = getHandValue(playerHand);

  if (playerValue > 21) {
    updateUI(true);
    resultDiv.textContent = "You bust! Dealer wins.";
    endGame("lose");
  }
}

function dealerTurn() {
  hitBtn.disabled = true;
  standBtn.disabled = true;

  updateUI(true);

  let dealerValue = getHandValue(dealerHand);
  while (dealerValue < 17) {
    dealCard(dealerHand);
    dealerValue = getHandValue(dealerHand);
    updateUI(true);
  }

  const playerValue = getHandValue(playerHand);

  if (dealerValue > 21 || playerValue > dealerValue) {
    resultDiv.textContent = "You win!";
    endGame("win");
  } else if (playerValue < dealerValue) {
    resultDiv.textContent = "Dealer wins!";
    endGame("lose");
  } else {
    resultDiv.textContent = "It's a tie!";
    endGame(); // no score change
  }
}

function endGame(result = "") {
  if (result === "win") {
    score += currentBet;
    resultDiv.textContent += ` You won ${currentBet} points!`;
  } else if (result === "lose") {
    score -= currentBet;
    resultDiv.textContent += ` You lost ${currentBet} points.`;
  }

  if (score <= 0) {
    resultDiv.textContent = "Game over! You're out of points. Restarting with 10 points.";
    score = 10;
  }

  updateScoreDisplay();
  hitBtn.disabled = true;
  standBtn.disabled = true;
  startBtn.disabled = false;
  betInput.disabled = false;
}

startBtn.addEventListener('click', () => {
  currentBet = parseInt(betInput.value);

  if (isNaN(currentBet) || currentBet < 1) {
    alert("Please enter a valid bet amount.");
    return;
  }

  if (currentBet > score) {
    alert("You don't have enough points to make that bet.");
    return;
  }

  createDeck();
  shuffleDeck();

  playerHand = [];
  dealerHand = [];
  resultDiv.textContent = '';

  dealCard(playerHand);
  dealCard(dealerHand);
  dealCard(playerHand);
  dealCard(dealerHand);

  updateUI(false);
  updateScoreDisplay();

  startBtn.disabled = true;
  hitBtn.disabled = false;
  standBtn.disabled = false;
  betInput.disabled = true;
});

hitBtn.addEventListener('click', () => {
  dealCard(playerHand);
  updateUI(false);
  checkForEnd();
});

standBtn.addEventListener('click', () => {
  dealerTurn();
});
