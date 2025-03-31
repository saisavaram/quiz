// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBI7rhF923ANv-NsoIieGbEAETLKg4G8IY",
    authDomain: "quizapp-9e934.firebaseapp.com",
    projectId: "quizapp-9e934",
    storageBucket: "quizapp-9e934.appspot.com",
    messagingSenderId: "149602825511",
    appId: "1:149602825511:web:2d3fecf48e3c4bf534a502"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Function to add a new question
function addQuestion() {
    let questionsDiv = document.getElementById("questions");
    let questionBox = document.createElement("div");
    questionBox.classList.add("question-box");
    
    questionBox.innerHTML = `
        <input type="text" class="questionText" placeholder="Enter Question">
        <input type="text" class="option" placeholder="Option 1">
        <input type="text" class="option" placeholder="Option 2">
        <input type="text" class="option" placeholder="Option 3">
        <input type="text" class="option" placeholder="Option 4">
        <input type="number" class="correctAnswer" placeholder="Correct Answer (1-4)">
    `;

    questionsDiv.appendChild(questionBox);
}

// Function to save quiz to Firebase
function saveQuiz() {
    let creatorName = document.getElementById("creatorName").value.trim();
    let quizTitle = document.getElementById("quizTitle").value.trim();
    let quizDescription = document.getElementById("quizDescription").value.trim();
    let questions = [];

    if (!creatorName || !quizTitle || !quizDescription) {
        alert("Please fill in all fields!");
        return;
    }

    document.querySelectorAll(".question-box").forEach(div => {
        let questionText = div.querySelector(".questionText").value.trim();
        let options = Array.from(div.querySelectorAll(".option")).map(opt => opt.value.trim());
        let correctAnswer = parseInt(div.querySelector(".correctAnswer").value) - 1;

        if (questionText && options.every(opt => opt) && correctAnswer >= 0 && correctAnswer < options.length) {
            questions.push({ questionText, options, correctAnswer });
        }
    });

    if (questions.length === 0) {
        alert("Please add at least one valid question!");
        return;
    }

    // Generate a unique quiz ID
    let quizId = `quiz_${Date.now()}`;
    let quizData = {
        creator: creatorName,
        title: quizTitle,
        description: quizDescription,
        questions: questions
    };

    // Store in Firebase Database
    database.ref("quizzes/" + quizId).set(quizData, (error) => {
        if (error) {
            alert("Error saving quiz. Please try again.");
        } else {
            let quizLink = `${window.location.origin}/quiz.html?id=${quizId}`;
            document.getElementById("quizLink").value = quizLink;
            alert("Quiz created successfully!");
        }
    });
}

// Function to load quiz from Firebase
function loadQuiz() {
    let urlParams = new URLSearchParams(window.location.search);
    let quizId = urlParams.get("id");

    if (!quizId) {
        document.body.innerHTML = "<h2>Quiz Not Found!</h2>";
        return;
    }

    database.ref("quizzes/" + quizId).once("value", (snapshot) => {
        if (!snapshot.exists()) {
            document.body.innerHTML = "<h2>Quiz Not Found!</h2>";
            return;
        }

        let quiz = snapshot.val();
        document.getElementById("quizTitle").innerText = quiz.title;
        document.getElementById("quizDescription").innerText = quiz.description;

        let form = document.getElementById("quizForm");
        form.innerHTML = "";
        quiz.questions.forEach((q, index) => {
            let div = document.createElement("div");
            div.classList.add("question-box");
            div.innerHTML = `<p>${q.questionText}</p>` +
                `<div class="options-container">` +
                q.options.map((opt, i) => `<label><input type="radio" name="q${index}" value="${i}"> ${opt}</label>`).join("") +
                `</div>`;
            form.appendChild(div);
        });
    });
}

// Function to copy quiz link
function copyLink() {
    let quizLink = document.getElementById("quizLink");
    quizLink.select();
    document.execCommand("copy");
    alert("Quiz link copied!");
}

// Function to submit quiz
function submitQuiz() {
    let urlParams = new URLSearchParams(window.location.search);
    let quizId = urlParams.get("id");

    database.ref("quizzes/" + quizId).once("value", (snapshot) => {
        if (!snapshot.exists()) {
            alert("Quiz Not Found!");
            return;
        }

        let quiz = snapshot.val();
        let score = 0;
        quiz.questions.forEach((q, index) => {
            let selectedAnswer = document.querySelector(`input[name="q${index}"]:checked`);
            if (selectedAnswer && parseInt(selectedAnswer.value) === q.correctAnswer) {
                score++;
            }
        });

        alert(`Your Score: ${score}/${quiz.questions.length}`);
    });
}
