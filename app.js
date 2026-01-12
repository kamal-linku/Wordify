const indexPath = "./data/index.json";
let dictionaryIndex = {};

// Load index.json when app starts
fetch(indexPath)
  .then(response => response.json())
  .then(data => {
    dictionaryIndex = data;
  })
  .catch(error => {
    console.error("Failed to load index.json", error);
  });

// Search button function (called from HTML)
function searchWord() {
  const input = document.getElementById("searchInput").value.trim().toLowerCase();
  const resultDiv = document.getElementById("result");

  if (!input) {
    resultDiv.innerHTML = "⚠️ Please enter a word";
    return;
  }

  // Find the word in index.json
  let foundLetter = null;

  for (let letter in dictionaryIndex) {
    if (dictionaryIndex[letter].includes(input)) {
      foundLetter = letter.toLowerCase();
      break;
    }
  }

  if (!foundLetter) {
    resultDiv.innerHTML = "❌ Word not found";
    return;
  }

  // Load the word JSON file
  const wordPath = `./data/${foundLetter}/${input}.json`;

  fetch(wordPath)
    .then(response => {
      if (!response.ok) {
        throw new Error("File not found");
      }
      return response.json();
    })
    .then(data => {
      // Handle case sensitivity: input is lowercase, but JSON key might be capitalized
      const key = Object.keys(data).find(k => k.toLowerCase() === input);
      if (key) {
        displayWord(data[key]);
      } else {
        throw new Error("Word data missing in file");
      }
    })
    .catch(error => {
      console.error(error);
      resultDiv.innerHTML = "❌ Meaning file not found";
    });
}

// Display word meaning
function displayWord(wordData) {
  const resultDiv = document.getElementById("result");

  let html = `
    <h2>${wordData.word}</h2>
    <p><strong>Phonetic:</strong> ${wordData.phonetic}</p>
    <p><strong>Part of Speech:</strong> ${wordData.part_of_speech.join(", ")}</p>
  `;

  for (let pos in wordData.meanings) {
    html += `<h3>${pos.toUpperCase()}</h3>`;
    wordData.meanings[pos].forEach(item => {
      html += `
        <p>• ${item.definition}<br>
        <em>${item.example}</em></p>
      `;
    });
  }

  if (wordData.synonyms) {
    html += `<p><strong>Synonyms:</strong> ${wordData.synonyms.join(", ")}</p>`;
  }

  if (wordData.antonyms) {
    html += `<p><strong>Antonyms:</strong> ${wordData.antonyms.join(", ")}</p>`;
  }

  resultDiv.innerHTML = html;
}