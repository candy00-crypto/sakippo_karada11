const START_KEY = "sakippo_diagnosis_started_at";
// 以前は1人1回きり判定に使っていたが、今は履歴保存のみで使用
const RESULT_KEY = "sakippo_diagnosis_result_v1";

const questions = [
  {
    text: "Q1. 下着について。",
    a: "そこまで興味ない",
    b: "淡い色に少し興奮する",
    correct: "B",
  },
  {
    text: "Q2. コスプレについて。",
    a: "あんまり好きじゃない",
    b: "めっちゃ好き。相手に着させたい",
    correct: "B",
  },
  {
    text: "Q3. 我慢について。",
    a: "すぐに出したい",
    b: "ギリギリまで我慢して焦らされるのが好き",
    correct: "B",
  },
  {
    text: "Q4. 集中度について。",
    a: "途中で気が散ること多い",
    b: "没入すると世界消える",
    correct: "B",
  },
  {
    text: "Q5. 行為が終わった後について。",
    a: "終わったら切り替えたい",
    b: "余韻ごと抱きしめたい",
    correct: "B",
  },
  {
    text: "Q6. スキンシップについて。",
    a: "特別な日だけ触れたい",
    b: "日常でも毎日触れたい派",
    correct: "B",
  },
  {
    text: "Q7. 休憩中の手。",
    a: "手は離したい",
    b: "手は繋いだままがいい",
    correct: "B",
  },
  {
    text: "Q8. キスに関して。",
    a: "そこまでしない",
    b: "行為中だけじゃなく毎日したい",
    correct: "B",
  },
  {
    text: "Q9. 行為中の役割について。",
    a: "完全にリードしたい派",
    b: "完全に受け身派",
    correct: "B",
  },
  {
    text: "Q10. 1回した後の“アレ”の回復速度。",
    a: "1回したらもう無理",
    b: "触れられたらじわじわ戻る",
    correct: "B",
  },
];

const startBtn = document.getElementById("startBtn");
const confirmModal = document.getElementById("confirmModal");
const limitModal = document.getElementById("limitModal");
const loadingModal = document.getElementById("loadingModal");
const confirmStartBtn = document.getElementById("confirmStartBtn");
const cancelStartBtn = document.getElementById("cancelStartBtn");
const limitOkBtn = document.getElementById("limitOkBtn");

const questionSection = document.getElementById("questionSection");
const resultSection = document.getElementById("resultSection");
const heroSection = document.getElementById("heroSection");
const questionText = document.getElementById("questionText");
const currentQuestionNumber = document.getElementById(
  "currentQuestionNumber"
);
const gaugeFill = document.getElementById("gaugeFill");
const answerABtn = document.getElementById("answerABtn");
const answerBBtn = document.getElementById("answerBBtn");
const answerHint = document.getElementById("answerHint");
const prevQuestionBtn = document.getElementById("prevQuestionBtn");

const compatibilityPercent = document.getElementById("compatibilityPercent");
const percentForMessage = document.getElementById("percentForMessage");
const resultMessage = document.getElementById("resultMessage");
const moreBtn = document.getElementById("moreBtn");
const resultImage = document.getElementById("resultImage");

let currentIndex = 0;
let answered = false;
let userAnswers = new Array(questions.length).fill(null);

function openConfirmModal() {
  confirmModal.classList.remove("hidden");
}

function closeConfirmModal() {
  confirmModal.classList.add("hidden");
}

function openLimitModal() {
  limitModal.classList.remove("hidden");
}

function closeLimitModal() {
  limitModal.classList.add("hidden");
}

function openLoadingModal() {
  loadingModal.classList.remove("hidden");
}

function closeLoadingModal() {
  loadingModal.classList.add("hidden");
}

function resetState() {
  currentIndex = 0;
  answered = false;
  userAnswers = new Array(questions.length).fill(null);
  resultSection.classList.add("hidden");
  questionSection.classList.remove("hidden");
  if (heroSection) {
    heroSection.classList.add("quiz-mode-hidden");
  }
  updateQuestion();
}

function updateGauge() {
  const answeredCount = userAnswers.filter((a) => a !== null).length;
  const progress = (answeredCount / questions.length) * 100;
  gaugeFill.style.width = `${progress}%`;
}

function updateQuestion() {
  const q = questions[currentIndex];
  currentQuestionNumber.textContent = currentIndex + 1;
  questionText.textContent = q.text;
  answerABtn.textContent = q.a;
  answerBBtn.textContent = q.b;

  if (currentIndex === 0) {
    answerHint.textContent = "直感で、これかもと思う方を選んでね♡";
  } else if (currentIndex < questions.length - 1) {
    answerHint.textContent = "テンポよく答えていくほど、本音に近づいていきます。";
  } else {
    answerHint.textContent = "これが最後の質問。ドキドキしながら選んでみてください。";
  }

  // 1問目のときは戻るボタンを非表示
  if (prevQuestionBtn) {
    if (currentIndex === 0) {
      prevQuestionBtn.classList.add("hidden");
    } else {
      prevQuestionBtn.classList.remove("hidden");
    }
  }

  updateGauge();
}

function calcCompatibility() {
  let wrongCount = 0;
  userAnswers.forEach((ans, index) => {
    if (ans && ans !== questions[index].correct) {
      wrongCount += 1;
    }
  });
  if (wrongCount === 0) return 97;
  if (wrongCount <= 2) return 95;
  return 87;
}

function saveResult(percent) {
  const data = {
    percent,
    savedAt: Date.now(),
  };
  try {
    localStorage.setItem(RESULT_KEY, JSON.stringify(data));
  } catch (e) {
    // localStorage が使えない場合は何もしない
  }
}

function loadSavedResult() {
  const raw = localStorage.getItem(RESULT_KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw);
    if (!data || typeof data.percent !== "number") return null;
    return data;
  } catch (e) {
    return null;
  }
}

function getResultMessage(percent) {
  if (percent === 87) {
    return (
      "87％だったね！！！\n" +
      "ちょっと惜しいけど、ここまで高いのはなかなかすごい・・・\n\n" +
      "今回の“体の相性診断”で、\n" +
      "あなたとさきっぽの体の相性がかなりいいって分かりました。\n" +
      "あと一歩で“ベストフィット”ってところ…♡\n\n" +
      "もっとさきっぽのこと知ってほしいし、\n" +
      "特別な距離で繋がりたい。\n\n" +
      "だから、３つ全部の診断を試してもっと\n" +
      "あなたのことを教えて欲しいな。\n\n" +
      "お約束の特典を用意しました💗\n" +
      "さきっぽの“裏企画の特典”を覗いてください。\n\n" +
      "鍵垢のDMに「体の相性診断の特典希望」\n" +
      "って送ってください！！！！"
    );
  }
  if (percent === 97) {
    return (
      "97%（運命級・ほぼ理想の相手）\n\n" +
      "【運命レベルで体の相性バッチリ…！】\n" +
      "ここまで一致するの、正直びっくり…\n" +
      "肌感覚もテンポも、さきっぽが“こうされたらドキッとする”ってところを\n" +
      "自然に分かってくれる人ってなかなかいないのに…。\n\n" +
      "もし現実に出会ってたら、何気なく隣に座って\n" +
      "当たり前に仲良くなって、そのまま一気に距離が縮まってそう…♡\n\n" +
      "この先、もっと踏み込んだら、恋に落ちるまで時間かからないと思います♡"
    );
  }
  if (percent === 95) {
    return (
      "95%（ほぼ理想・恋愛圏内）\n\n" +
      "めちゃくちゃ体の相性いい。恋人候補ゾーン♡\n" +
      "触れられたときの温度感とか、距離の詰め方とか、\n" +
      "「この人とだったらドキドキしながら気持ちよくなれそう」って思える距離感。\n" +
      "まだ全部が完璧に噛み合ってるわけじゃないけど、その“余白”が逆にワクワクする…♡\n\n" +
      "これから仲が深まるほど、もっと惹かれていくタイプの相性です♡"
    );
  }
  return "";
}

function renderResult(percent) {
  compatibilityPercent.textContent = `${percent}%`;
  percentForMessage.textContent = `${percent}%`;

  if (resultImage) {
    let src = "";
    let alt = "";
    if (percent === 97) {
      src = "IMG_9089.JPG";
      alt = "体の相性97％の診断結果イメージ";
    } else if (percent === 95) {
      src = "IMG_9086.jpg";
      alt = "体の相性95％の診断結果イメージ";
    } else {
      src = "IMG_9088.jpg";
      alt = "体の相性87％の診断結果イメージ";
    }
    resultImage.src = src;
    resultImage.alt = alt;
  }

  questionSection.classList.add("hidden");
  resultSection.classList.remove("hidden");
  if (heroSection) {
    heroSection.classList.add("quiz-mode-hidden");
  }
}

function showResult() {
  const percent = calcCompatibility();
  saveResult(percent);
  renderResult(percent);
}

function handleAnswer(answer) {
  if (answered) return;
  answered = true;

  userAnswers[currentIndex] = answer;

  const isLast = currentIndex === questions.length - 1;

  if (isLast) {
    updateGauge();
    openLoadingModal();
    setTimeout(() => {
      closeLoadingModal();
      showResult();
      answered = false;
    }, 3000);
  } else {
    currentIndex += 1;
    setTimeout(() => {
      answered = false;
      updateQuestion();
    }, 220);
  }
}

startBtn.addEventListener("click", () => {
  openConfirmModal();
});

confirmStartBtn.addEventListener("click", () => {
  closeConfirmModal();
  localStorage.setItem(START_KEY, String(Date.now()));
  resetState();
  window.scrollTo({
    top: questionSection.offsetTop - 16,
    behavior: "smooth",
  });
});

cancelStartBtn.addEventListener("click", () => {
  closeConfirmModal();
});

answerABtn.addEventListener("click", () => handleAnswer("A"));
answerBBtn.addEventListener("click", () => handleAnswer("B"));

moreBtn.addEventListener("click", () => {
  window.open(
    "https://note.com/preview/n5761aa8dbc0e?prev_access_key=fdb268e6078bca2760d8018f5d63a730",
    "_blank"
  );
});

if (prevQuestionBtn) {
  prevQuestionBtn.addEventListener("click", () => {
    if (currentIndex === 0 || answered) return;
    currentIndex -= 1;
    updateQuestion();
  });
}

// ページを開いたときは毎回、最初から診断できる状態にしておく
