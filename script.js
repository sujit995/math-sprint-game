// Pages
const gamePage = document.getElementById('game-page');
const scorePage = document.getElementById('score-page');
const splashPage = document.getElementById('splash-page');
const countdownPage = document.getElementById('countdown-page');
// Splash Page
const startForm = document.getElementById('start-form');
const radioContainers = document.querySelectorAll('.radio-container');
const radioInputs = document.querySelectorAll('input');
const bestScores = document.querySelectorAll('.best-score-value');
// Countdown Page
const countdown = document.querySelector('.countdown');
// Game Page
const itemContainer = document.querySelector('.item-container');
// Score Page
const finalTimeEl = document.querySelector('.final-time');
const baseTimeEl = document.querySelector('.base-time');
const penaltyTimeEl = document.querySelector('.penalty-time');
const playAgainBtn = document.querySelector('.play-again');

// Equations

let questionAmount = 0;
let equationsArray = [];
let playerGuessArray = [];
let bestScoresArray = [];

// Game Page
let firstNumber = 0;
let secondNumber = 0;
let equationObject = {};
const wrongFormat = [];

// Time
let timer;
let timePlayed = 0;
let baseTime = 0;
let penaltyTime = 0;
let finalTime = 0;
let finalTimeDisplay = '0.0';

// Scroll
let valueY = 0;

// Refresh Splash page
function bestScoresToDom(){
  bestScores.forEach((bestScore, index) => {
    const bestScoreEl = bestScore;
    bestScoreEl.textContent = `${bestScoresArray[index].bestScore}s`
  })
}

// Check local storage and store
function getSavedBestScoes(){
  if(localStorage.getItem('bestScoes')){
    bestScoresArray = JSON.parse(localStorage.bestScores);
  } else{
    bestScoresArray = [
      {questions: 10, bestScore: finalTimeDisplay},
      {questions: 25, bestScore: finalTimeDisplay},
      {questions: 50, bestScore: finalTimeDisplay},
      {questions: 100, bestScore: finalTimeDisplay},
    ];
    localStorage.setItem('bestScores', JSON.stringify(bestScoresArray))
  }
  bestScoresToDom()
}

// Update best score array
function updateBestScore(){
  bestScoresArray.forEach((score, index) => {
    // Select correct best score
    if(questionAmount == score.questions){
      // Return best score
      const savedBestScoes = Number(bestScoresArray[index].bestScore);
      // Update if new best score is less oe replacing zero
      if(savedBestScoes === 0 || savedBestScoes > finalTime){
        bestScoresArray[index].bestScore = finalTimeDisplay;
      }
    }
  });
  bestScoresToDom();
  // Save to local storage
  localStorage.setItem('bestScores', JSON.stringify(bestScoresArray));
}

// Play Again
function playAgain(){
  gamePage.addEventListener('click', startTimer);
  scorePage.hidden = true;
  splashPage.hidden = false;
  equationsArray = [];
  playerGuessArray = [];
  valueY = 0;
  playAgainBtn.hidden = true;
}

// Show Score Page
function showScorePage(){
  // Show Play again button
  setTimeout(() => {
    playAgainBtn.hidden = false;
  }, 1000)
  gamePage.hidden = true;
  scorePage.hidden = false;
}

// Format and Display time
function scoresToDom(){
  finalTimeDisplay = finalTime.toFixed(1);
  baseTime = timePlayed.toFixed(1);
  penaltyTime = penaltyTime.toFixed(1)
  baseTimeEl.textContent = `Base Time: ${baseTime}s`;
  penaltyTimeEl.textContent = `Penalty: +${penaltyTime}s`;
  finalTimeEl.textContent = `Final Time: ${finalTimeDisplay}s`;
  
  updateBestScore();
  // Scroll to top
  itemContainer.scrollTo({ top: 0, behavior: 'instant'})
  showScorePage();
}

function checkTime(){
  if(playerGuessArray.length == questionAmount){
    clearInterval(timer);
    equationsArray.forEach((equation, index) => {
      if(equation.evaluated === playerGuessArray[index]){
        // Correct Guess, No penalty
      }else{
        // Incorrect guess
        penaltyTime += 0.5;
      }
      finalTime = timePlayed + penaltyTime;
      console.log('time:', timePlayed, 'penalty:', penaltyTime, 'final:', finalTime);
      scoresToDom();
    })
  }
}

// add a tenth of a second to timePlayed
function addTime(){
  timePlayed += 0.1;
  checkTime();
}

// Start time when page clicked
function startTimer(){
  timePlayed = 0;
  penaltyTime = 0;
  finalTime = 0;

  timer = setInterval(addTime, 100);
  gamePage.removeEventListener('click', startTimer)
}

//   Scroll user interface
function select(guessedTrue){
  console.log('player guess array:', playerGuessArray);
  valueY+= 80;
  itemContainer.scroll(0, valueY);
  // Add player guess
  return guessedTrue ? playerGuessArray.push('true') : playerGuessArray.push('false')
}

// Displays Game Page
function showGamePage(){
  gamePage.hidden = false;
  countdownPage.hidden = true;
}

// Get Random Number up to max
function getRandomInt(max){
  return Math.floor(Math.random() * Math.floor(max));
}

// Create Correct/Incorrect Random Equations
function createEquations() {
  // Randomly choose how many correct equations there should be
  const correctEquations = getRandomInt(questionAmount)
  // Set amount of wrong equations
  const wrongEquations = questionAmount - correctEquations;
  // Loop through, multiply random numbers up to 9, push to array
  for (let i = 0; i < correctEquations; i++) {
    firstNumber = getRandomInt(9)
    secondNumber = getRandomInt(9)
    const equationValue = firstNumber * secondNumber;
    const equation = `${firstNumber} x ${secondNumber} = ${equationValue}`;
    equationObject = { value: equation, evaluated: 'true' };
    equationsArray.push(equationObject);
  }
  // Loop through, mess with the equation results, push to array
  for (let i = 0; i < wrongEquations; i++) {
    firstNumber = getRandomInt(9)
    secondNumber = getRandomInt(9)
    const equationValue = firstNumber * secondNumber;
    wrongFormat[0] = `${firstNumber} x ${secondNumber + 1} = ${equationValue}`;
    wrongFormat[1] = `${firstNumber} x ${secondNumber} = ${equationValue - 1}`;
    wrongFormat[2] = `${firstNumber + 1} x ${secondNumber} = ${equationValue}`;
    const formatChoice = getRandomInt(3)
    const equation = wrongFormat[formatChoice];
    equationObject = { value: equation, evaluated: 'false' };
    equationsArray.push(equationObject);
  }
  shuffle(equationsArray);
}

// Add equation to DOM
function equationToDOM(){
  equationsArray.forEach((equation) => {
    const item = document.createElement('div')
    item.classList.add('item');
    // equation text
    const equationText = document.createElement('h1');
    equationText.textContent = equation.value;
    // append
    item.appendChild(equationText);
    itemContainer.appendChild(item);
  })
}

// Dynamically adding correct/incorrect equations
function populateGamePage() {
  // Reset DOM, Set Blank Space Above
  itemContainer.textContent = '';
  // Spacer
  const topSpacer = document.createElement('div');
  topSpacer.classList.add('height-240');
  // Selected Item
  const selectedItem = document.createElement('div');
  selectedItem.classList.add('selected-item');
  // Append
  itemContainer.append(topSpacer, selectedItem);

  // Create Equations, Build Elements in DOM
  createEquations();
  equationToDOM();
  // Set Blank Space Below
  const bottomSpacer = document.createElement('div');
  bottomSpacer.classList.add('height-500');
  itemContainer.appendChild(bottomSpacer);
}

// Start Countdown
function startCountdown(){
  let count = 3;
  countdown.textContent = count;
  const timeCountDown = setInterval(() => {
    count--;
    if(count===0){
      countdown.textContent = "Go!";
    } else if (count === -1){
      showGamePage()
      clearInterval(timeCountDown)
    } else {
      countdown.textContent = count
    }
  }, 1000)
}

// Navigate to Countdown page
function showCountdown(){
  countdownPage.hidden = false;
  splashPage.hidden = true;
  startCountdown();
  populateGamePage()
}

// Get the values from selected radio button
function getRadioValue(){
  let radioValue;
  radioInputs.forEach((radioInput) => {
    if(radioInput.checked){
      radioValue = radioInput.value;
      console.log(radioValue);
    }
  })
  return radioValue;
}

// Form that decides amount of questions
function selectQuestionAmount(e){
  e.preventDefault();
  questionAmount = getRadioValue();
  console.log("question amount is:", questionAmount);
  if(!questionAmount){
    alert('Please select an amount of questions');
  }else{
    showCountdown();
  }
}

startForm.addEventListener('click', () => {
  radioContainers.forEach((radioElement) => {
    // remove selected item
    radioElement.classList.remove('selected-label');
    if(radioElement.children[1].checked){
      // add selected item
      radioElement.classList.add('selected-label');
    }
  })
})

startForm.addEventListener('submit', selectQuestionAmount);
gamePage.addEventListener('click', startTimer);

getSavedBestScoes();