let vocabulary = JSON.parse(localStorage.getItem("vocabulary")) || [
  { german: "spieler", english: "player" },
  { german: "star", english: "star" },
  { german: "menschen mengen", english: "crowd" },
  { german: "organisieren", english: "to organize" },
  { german: "flohmarkt", english: "jumble sale" },
  { german: "angst haben", english: "to be afraid" },
  { german: "andere", english: "others" },
  { german: "du schaffst es", english: "you can do it" },
  { german: "zeichnen", english: "to draw" },
  { german: "bild", english: "picture" },
  { german: "aufgaben", english: "job" },
  { german: "schauspieler", english: "actor" },
  { german: "arbeit", english: "job / work" },
];

let usedVocabulary = new Set();
let ran_key;
let currentVocab;
let round = 0; // Runde 0 für Deutsch->Englisch, Runde 1 für Englisch->Deutsch

// Push new Vocable to vocabulary
function addVocabulary() {
  // Eingabefelder abrufen
  const germanText = document.getElementById("germanText").value.trim();
  const englishText = document.getElementById("englishText").value.trim();

  // Überprüfen, ob beide Eingabefelder ausgefüllt sind
  if (germanText && englishText) {
    // Neue Vokabel zum Array hinzufügen
    vocabulary.push({ german: germanText, english: englishText });

    // Speichern der neuen Vokabeln im localStorage
    localStorage.setItem("vocabulary", JSON.stringify(vocabulary));

    // Eingabefelder zurücksetzen
    document.getElementById("germanText").value = "";
    document.getElementById("englishText").value = "";

    // Aktualisierte Vokabelliste anzeigen
    render();
  } else {
    alert(
      "Bitte füllen Sie beide Felder aus, um eine neue Vokabel hinzuzufügen."
    );
  }
}
// Funktion zum Starten oder Zurücksetzen des Lernens
function resetVocabulary() {
  round++;
  usedVocabulary.clear();
  nextVocabulary();
}

function nextVocabulary() {
  // Prüfen, ob alle Vokabeln abgefragt wurden
  if (usedVocabulary.size === vocabulary.length) {
    text.innerHTML =
      "Glückwunsch! Alle Vokabeln wurden richtig übersetzt. Die Runde wird neu gestartet!";
    resetVocabulary();
    return;
  }

  // Zufällige Vokabel auswählen, die noch nicht abgefragt wurde
  do {
    currentVocab = vocabulary[Math.floor(Math.random() * vocabulary.length)];
  } while (
    usedVocabulary.has(currentVocab.german) ||
    usedVocabulary.has(currentVocab.english)
  );

  // Aktualisiere das anzuzeigende Wort je nach Runde (Deutsch->Englisch oder Englisch->Deutsch)
  if (round % 2 == 0) {
    ran_key = currentVocab.german;
    word.innerHTML = `${currentVocab.english}?`;
  } else {
    ran_key = currentVocab.english;
    word.innerHTML = `${currentVocab.german}?`;
  }
}

function compare() {
  if (germanText.value === ran_key) {
    text.innerHTML = "Richtig!!";
    usedVocabulary.add(currentVocab.german); // Füge die Vokabel zur Set-Liste hinzu
  } else {
    text.innerHTML =
      germanText.value +
      " ist falsch! Die richtige Übersetzung ist: " +
      (round === 0 ? currentVocab.german : currentVocab.english);
  }

  germanText.value = "";
  nextVocabulary();
}

// Funktion zum Anzeigen der Vokabelliste (optional)
function render() {
  vocabularyList.innerHTML = "";
  for (let item of vocabulary) {
    vocabularyList.innerHTML += `<li>${item.german} - ${item.english}</li>`;
  }
}

// Starten des ersten Abfragedurchlaufs
nextVocabulary();
