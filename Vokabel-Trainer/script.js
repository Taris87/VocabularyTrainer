let vocabulary = [];
let usedVocabulary = new Set();
let ran_key;
let currentVocab;
let round = 0; // Runde 0 für Deutsch->Englisch, Runde 1 für Englisch->Deutsch

// DOM-Elemente abrufen
const text = document.getElementById("text");
const word = document.getElementById("word");
const germanText = document.getElementById("germanText");

// JSON-Datei laden und Vokabeln initialisieren
fetch("./vocabulary.json")
  .then((response) => response.json())
  .then((data) => {
    // JSON-Daten und localStorage-Daten kombinieren
    const storedVocabulary =
      JSON.parse(localStorage.getItem("vocabulary")) || [];
    vocabulary = data.concat(storedVocabulary);

    // Starten des ersten Abfragedurchlaufs
    nextVocabulary();
  })
  .catch((error) => console.error("Fehler beim Laden der JSON-Datei:", error));

// Vokabel hinzufügen
function addVocabulary(german, english) {
  if (german && english) {
    vocabulary.push({ german, english });

    // Speichern der neuen Vokabeln im localStorage
    localStorage.setItem("vocabulary", JSON.stringify(vocabulary));

    germanText.value = "";
    document.getElementById("englishText").value = "";
  } else {
    alert(
      "Bitte füllen Sie beide Felder aus, um eine neue Vokabel hinzuzufügen."
    );
  }
}

// Starten oder Zurücksetzen des Lernens
function resetVocabulary() {
  round++;
  usedVocabulary.clear();
  nextVocabulary();
}

// Nächste Vokabel
function nextVocabulary() {
  if (usedVocabulary.size === vocabulary.length) {
    text.innerHTML =
      "Glückwunsch! Alle Vokabeln wurden richtig übersetzt. Die Runde wird neu gestartet!";
    resetVocabulary();
    return;
  }

  do {
    currentVocab = vocabulary[Math.floor(Math.random() * vocabulary.length)];
  } while (
    usedVocabulary.has(currentVocab.german) ||
    usedVocabulary.has(currentVocab.english)
  );

  if (round % 2 === 0) {
    ran_key = currentVocab.german.toLowerCase();
    word.innerHTML = `${currentVocab.english}?`;
  } else {
    ran_key = currentVocab.english.toLowerCase();
    word.innerHTML = `${currentVocab.german}?`;
  }
}

// Antwort überprüfen, Vergleich in Kleinbuchstaben
function compare() {
  const answer = germanText.value.trim().toLowerCase();
  const correctAnswer = ran_key; // richtiger Wert in Kleinbuchstaben

  if (answer === correctAnswer) {
    text.innerHTML = "Richtig!";
    usedVocabulary.add(currentVocab.german);
  } else {
    const solution =
      round % 2 === 0 ? currentVocab.german : currentVocab.english;
    text.innerHTML = `${germanText.value} ist falsch! Die richtige Übersetzung ist: ${solution}`;
  }

  germanText.value = "";
  nextVocabulary();
}

// Vokabelliste anzeigen auf add.HTML
function render() {
  vocabularyList.innerHTML = "";
  for (let item of vocabulary) {
    vocabularyList.innerHTML += `<li>${item.german} - ${item.english}</li>`;
  }
}
