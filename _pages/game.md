---
layout: default
title: "Guess the Number Game"
permalink: /game/
nav: true
nav_order: 99
---

<h1>Guess the Number Game</h1>
<p>Try to guess the random number between 1 and 100.</p>
<input type="number" id="guessInput" min="1" max="100" />
<button onclick="makeGuess()">Guess</button>
<p id="result"></p>

<script src="{{ '/assets/js/guess-the-number.js' | relative_url }}"></script>

