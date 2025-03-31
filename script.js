// Firebase Configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Adds a new question
function addQuestion() {
  let questionDiv = document.createElement("div");
  questionDiv.classList.add("question-box");
  questionDiv.innerHTML = `
    <input type="text" placeholder="Enter question" class="questionText"><br>
    <input type="text" placeholder="Option 1" class="option"><br>
    <input type="text" placeholder="Option 2" class="option"><br>
    <input type="text" placeholder="Option 3" class="option"><br>
    <input type="text" placeholder="Option 4" class="option"><br>
    <input type="number" placeholder="Correct Option (1-4)" class="correctAnswer"><br><br>
  `;
  document.getElementById("questions").appendChild(questionDiv);
}

// Saves quiz to Firestore
function saveQuiz() {
  let creatorName = document.getElementById("creatorName").value.trim();
  let detailsToCollect = document.getElementById("detailsToCollect").value.trim();
  let quizTitle = document.getElementById("quizTitle").value.trim();
  let quizDescription = document.getElementById("quizDescription").value.trim();
  let questions = [];

  let fields = detailsToCollect.split(",").map(f => f.trim()).filter(f => f !== "");

  if (!creatorName || !quizTitle || !quizDescription || fields.length === 0) {
    alert("Please fill all required fields!");
    return;
  }

  document.querySelectorAll(".question-box").forEach(div => {
    let questionText = div.querySelector(".questionText").value.trim();
    let options = Array.from(div.querySelectorAll(".option")).map(opt => opt.value.trim());
    let correctAnswer = parseInt(div.querySelector(".correctAnswer").value) - 1;

    if (questionText && options.every(opt => opt) && correctAnswer >= 0 && correctAnswer < 4) {
      questions.push({ questionText, options, correctAnswer });
    }
  });

  if (questions.length === 0) {
    alert("Please add at least one question!");
    return;
  }

  let quizData = { creator: creatorName, fields, title: quizTitle, description: quizDescription, questions };

  db.collection("quizzes").add(quizData).then(docRef => {
    let quizLink = `${window.location.origin}/quiz.html?id=${docRef.id}`;
    document.getElementById("quizLink").value = quizLink;
    alert("Quiz created successfully!");
  });
}

// Loads quiz from Firestore
function loadQuiz() {
  let urlParams = new URLSearchParams(window.location.search);
  let quizId = urlParams.get("id");

  if (!quizId) {
    document.body.innerHTML = "<h2>Quiz Not Found!</h2>";
    return;
  }

  db.collection("quizzes").doc(quizId).get().then(doc => {
    if (!doc.exists) {
      document.body.innerHTML = "<h2>Quiz Not Found!</h2>";
      return;
    }

    let quiz = doc.data();
    document.getElementById("quizTitle").innerText = quiz.title;
    document.getElementById("quizDescription").innerText = quiz.description;

    let form = document.getElementById("quizForm");
    form.innerHTML = "";
    quiz.questions.forEach((q, index) => {
      let div = document.createElement("div");
      div.classList.add("question-box");
      div.innerHTML = `<p>${q.questionText}</p>` +
        q.options.map((opt, i) => `<label><input type="radio" name="q${index}" value="${i}"> ${opt}</label>`).join("");
      form.appendChild(div);
    });

    let participantDiv = document.getElementById("participantDetails");
    quiz.fields.forEach(field => {
      participantDiv.innerHTML += `<input type="text" class="participant-detail" placeholder="Enter ${field}" data-field="${field}"><br>`;
    });
  });
}
