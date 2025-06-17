let randomNumber = Math.floor(Math.random() * 100) + 1;
function makeGuess() {
  const input = document.getElementById('guessInput');
  const result = document.getElementById('result');
  const guess = parseInt(input.value, 10);
  if (isNaN(guess) || guess < 1 || guess > 100) {
    result.textContent = 'Please enter a number between 1 and 100.';
    return;
  }
  if (guess === randomNumber) {
    result.textContent = 'Congratulations! You guessed the number!';
  } else if (guess < randomNumber) {
    result.textContent = 'Too low! Try again.';
  } else {
    result.textContent = 'Too high! Try again.';
  }
  input.value = '';
}

