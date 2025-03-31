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

// Saves the quiz along with creator details and participant fields to collect
function saveQuiz() {
  let creatorName = document.getElementById("creatorName").value.trim();
  let detailsToCollect = document.getElementById("detailsToCollect").value.trim();
  let quizTitle = document.getElementById("quizTitle").value.trim();
  let quizDescription = document.getElementById("quizDescription").value.trim();
  let questions = [];

  // Convert comma-separated details into an array
  let fields = detailsToCollect.split(",").map(f => f.trim()).filter(f => f !== "");

  if (!creatorName || !quizTitle || !quizDescription || fields.length === 0) {
    alert("Please fill in your details, quiz title, description, and details to collect from participants!");
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
  let quizData = {
    creator: creatorName,
    fields: fields, // Participant details to collect
    title: quizTitle,
    description: quizDescription,
    questions: questions
  };

  localStorage.setItem(quizId, JSON.stringify(quizData));
  
  // Build the base URL using the current pathname to include repository name on GitHub Pages
  let currentUrl = window.location.href; // e.g., https://your-username.github.io/your-repo/index.html
  let baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf("/"));
  let quizLink = ${window.location.origin}${baseUrl.substring(window.location.origin.length)}/quiz.html?id=${quizId};
  
  document.getElementById("quizLink").value = quizLink;
  alert("Quiz created successfully!");
}

// Copies the quiz link to clipboard
function copyLink() {
  let linkInput = document.getElementById("quizLink");
  linkInput.select();
  document.execCommand("copy");
  alert("Quiz link copied!");
}

// Loads the quiz on the quiz-taking page
function loadQuiz() {
  let urlParams = new URLSearchParams(window.location.search);
  let quizId = urlParams.get("id");

  if (!quizId) {
    document.body.innerHTML = "<h2>Quiz Not Found!</h2>";
    return;
  }

  let quizData = localStorage.getItem(quizId);
  if (!quizData) {
    document.body.innerHTML = "<h2>Quiz Not Found!</h2>";
    return;
  }

  let quiz = JSON.parse(quizData);
  document.getElementById("quizTitle").innerText = quiz.title;
  document.getElementById("quizDescription").innerText = quiz.description;
  
  // Generate the quiz questions
  let form = document.getElementById("quizForm");
  form.innerHTML = "";
  quiz.questions.forEach((q, index) => {
    let div = document.createElement("div");
    div.classList.add("question-box");
    div.innerHTML = <p>${q.questionText}</p> +
      <div class="options-container"> +
      q.options.map((opt, i) => <label><input type="radio" name="q${index}" value="${i}"> ${opt}</label>).join("") +
      </div>;
    form.appendChild(div);
  });
  
  // Generate participant details input fields dynamically based on quiz.fields
  let participantDiv = document.getElementById("participantDetails");
  participantDiv.innerHTML = "";
  quiz.fields.forEach(field => {
    participantDiv.innerHTML += <input type="text" class="participant-detail" placeholder="Enter ${field}" data-field="${field}"><br>;
  });
  
  // Load scoreboard with dynamic headers
  loadScoreboard(quizId, quiz.fields);
}

// Submits the quiz, displays detailed results, and updates the scoreboard
function submitQuiz() {
  let participantInputs = document.querySelectorAll(".participant-detail");
  let participantData = {};
  participantInputs.forEach(input => {
    let field = input.getAttribute("data-field");
    participantData[field] = input.value.trim();
  });
  for (let key in participantData) {
    if (!participantData[key]) {
      alert(Please enter ${key});
      return;
    }
  }

  let urlParams = new URLSearchParams(window.location.search);
  let quizId = urlParams.get("id");
  let quiz = JSON.parse(localStorage.getItem(quizId));
  let score = 0;
  let resultSummaryHTML = "<h3>Quiz Results</h3>";

  quiz.questions.forEach((q, index) => {
    let selected = document.querySelector(input[name="q${index}"]:checked);
    let userAnswerIndex = selected ? parseInt(selected.value) : null;
    let correctIndex = q.correctAnswer;
    let correctOption = q.options[correctIndex];
    let userOption = userAnswerIndex !== null ? q.options[userAnswerIndex] : "No Answer";
    let isCorrect = userAnswerIndex === correctIndex;
    if (isCorrect) score++;

    resultSummaryHTML += <div class="result-question">;
    resultSummaryHTML += <p><strong>Question ${index + 1}:</strong> ${q.questionText}</p>;
    resultSummaryHTML += <p>Your Answer: ${userOption} ${isCorrect ? '<span style="color: green;">(Correct)</span>' : '<span style="color: red;">(Wrong)</span>'}</p>;
    if (!isCorrect) resultSummaryHTML += <p>Correct Answer: ${correctOption}</p>;
    resultSummaryHTML += </div><hr>;
  });

  alert(You scored: ${score}/${quiz.questions.length});

  let scoreboard = JSON.parse(localStorage.getItem(scoreboard_${quizId})) || [];
  scoreboard.push({ details: participantData, score });
  scoreboard.sort((a, b) => b.score - a.score);
  localStorage.setItem(scoreboard_${quizId}, JSON.stringify(scoreboard));

  loadScoreboard(quizId, quiz.fields);
  document.getElementById("result").innerHTML = resultSummaryHTML;
}

// Loads and displays the scoreboard with dynamic headers based on quiz.fields
function loadScoreboard(quizId, fields) {
  let scoreboard = JSON.parse(localStorage.getItem(scoreboard_${quizId})) || [];
  let scoreboardHead = document.getElementById("scoreboardHead");
  let scoreboardTableBody = document.getElementById("scoreboard");
  
  // Generate table header dynamically
  let headerRow = "<tr>";
  fields.forEach(field => {
    headerRow += <th>${field}</th>;
  });
  headerRow += <th>Score</th></tr>;
  scoreboardHead.innerHTML = headerRow;
  
  // Populate table body
  scoreboardTableBody.innerHTML = "";
  scoreboard.forEach(entry => {
    let row = <tr>;
    fields.forEach(field => {
      row += <td>${entry.details[field]}</td>;
    });
    row += <td>${entry.score}</td></tr>;
    scoreboardTableBody.innerHTML += row;
  });
}
