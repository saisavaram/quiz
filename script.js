// Adds a new question block on the creation page
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

// Saves the quiz
function saveQuiz() {
  let creatorName = document.getElementById("creatorName").value.trim();
  let detailsToCollect = document.getElementById("detailsToCollect").value.trim();
  let quizTitle = document.getElementById("quizTitle").value.trim();
  let quizDescription = document.getElementById("quizDescription").value.trim();
  let questions = [];
  let fields = detailsToCollect.split(",").map(f => f.trim()).filter(f => f !== "");

  if (!creatorName || !quizTitle || !quizDescription || fields.length === 0) {
    alert("Please fill in all fields!");
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
    alert("Please add at least one valid question!");
    return;
  }

  let quizId = quiz_${Date.now()};
  let quizData = { creator: creatorName, fields, title: quizTitle, description: quizDescription, questions };
  localStorage.setItem(quizId, JSON.stringify(quizData));
  let quizLink = ${window.location.origin}/quiz.html?id=${quizId};
  document.getElementById("quizLink").value = quizLink;
  alert("Quiz created successfully!");
}

// Copies the quiz link
function copyLink() {
  let linkInput = document.getElementById("quizLink");
  navigator.clipboard.writeText(linkInput.value).then(() => alert("Quiz link copied!"));
}

// Loads the quiz on the quiz-taking page
function loadQuiz() {
  let urlParams = new URLSearchParams(window.location.search);
  let quizId = urlParams.get("id");
  let quizData = localStorage.getItem(quizId);
  if (!quizData) {
    document.body.innerHTML = "<h2>Quiz Not Found!</h2>";
    return;
  }

  let quiz = JSON.parse(quizData);
  document.getElementById("quizTitle").innerText = quiz.title;
  document.getElementById("quizDescription").innerText = quiz.description;
  let form = document.getElementById("quizForm");
  form.innerHTML = "";
  quiz.questions.forEach((q, index) => {
    let div = document.createElement("div");
    div.innerHTML = <p>${q.questionText}</p> +
      q.options.map((opt, i) => <label><input type="radio" name="q${index}" value="${i}"> ${opt}</label><br>).join("");
    form.appendChild(div);
  });
  let participantDiv = document.getElementById("participantDetails");
  participantDiv.innerHTML = quiz.fields.map(field => <input type="text" class="participant-detail" placeholder="Enter ${field}" data-field="${field}"><br>).join("");
}

// Submits the quiz
function submitQuiz() {
  let urlParams = new URLSearchParams(window.location.search);
  let quizId = urlParams.get("id");
  let quiz = JSON.parse(localStorage.getItem(quizId));
  let score = 0;
  quiz.questions.forEach((q, index) => {
    let selected = document.querySelector(input[name="q${index}"]:checked);
    if (selected && parseInt(selected.value) === q.correctAnswer) score++;
  });
  alert(You scored: ${score}/${quiz.questions.length});
}
