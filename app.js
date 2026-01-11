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
  let targetWord = null;

  for (let letter in dictionaryIndex) {
    const match = dictionaryIndex[letter].find(w => w.toLowerCase() === input);
    if (match) {
      foundLetter = letter.toLowerCase();
      targetWord = match;
      break;
    }
  }

  if (!foundLetter) {
    resultDiv.innerHTML = "❌ Word not found";
    return;
  }

  // Load the word JSON file
  const wordPath = `./data/${foundLetter}/${targetWord}.json`;

  fetch(wordPath)
    .then(response => {
      if (!response.ok) {
        // Fallback: Try Capitalized filename if lowercase fails (e.g. happy -> Happy.json)
        const capitalized = targetWord.charAt(0).toUpperCase() + targetWord.slice(1);
        if (capitalized !== targetWord) {
          return fetch(`./data/${foundLetter}/${capitalized}.json`).then(res => {
            if (!res.ok) throw new Error("File not found");
            return res.json();
          });
        }
        throw new Error("File not found");
      }
      return response.json();
    })
    .then(data => {
      // Check if data is directly the word object (unwrapped)
      if (data.word || data.meanings) {
        displayWord(data);
        return;
      }

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
      resultDiv.innerHTML = `❌ ${error.message}`;
    });
}

// Display word meaning
function displayWord(wordData) {
  const resultDiv = document.getElementById("result");

  let html = `
    <h2>${wordData.word || "Unknown"}</h2>
    <p><strong>Phonetic:</strong> ${wordData.phonetic || ""}</p>
    <p><strong>Part of Speech:</strong> ${wordData.part_of_speech ? wordData.part_of_speech.join(", ") : ""}</p>
  `;

  if (wordData.meanings) {
    for (let pos in wordData.meanings) {
      html += `<h3>${pos.toUpperCase()}</h3>`;
      wordData.meanings[pos].forEach(item => {
        html += `
          <p>• ${item.definition}<br>
          <em>${item.example || ""}</em></p>
        `;
      });
    }
  }

  if (wordData.synonyms) {
    html += `<p><strong>Synonyms:</strong> ${wordData.synonyms.join(", ")}</p>`;
  }

  if (wordData.antonyms) {
    html += `<p><strong>Antonyms:</strong> ${wordData.antonyms.join(", ")}</p>`;
  }

  resultDiv.innerHTML = html;
}
