const app = document.querySelector('#app');
const state = { questions: [], current: 0, score: 0, mode: 'loader', fileText: '', error: '' };

const sampleCassette = JSON.stringify([
  { id: 'q1', question: 'Which of the following are prime numbers?', options: ['2', '4', '9', '11', '15'], correct_answers: ['2', '11'], choose_x_options: 2, explanation: '2 and 11 have no positive divisors other than 1 and themselves.' },
  { id: 'q2', question: 'Which material is a good conductor of electricity?', options: ['Copper', 'Rubber', 'Glass', 'Aluminium'], correct_answers: ['Copper'], choose_x_options: 1, explanation: 'Copper has free electrons that allow electric current to pass through it efficiently.' }
], null, 2);

function escapeHtml(value) { return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char])); }
function shuffle(items) { const copy = [...items]; for (let i = copy.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; } return copy; }
function validateCassette(data) {
  if (!Array.isArray(data) || data.length === 0) throw new Error('Cassette must be a non-empty JSON array.');

  const validQuestions = data.filter((question, index) => {
    const label = `Question ${index + 1}`;
    if (!question || typeof question.question !== 'string' || !question.question.trim()) return false;
    if (!Array.isArray(question.options) || question.options.length < 3 || question.options.length > 9 || question.options.some(option => typeof option !== 'string')) return false;
    if (!Array.isArray(question.correct_answers) || !Number.isInteger(question.choose_x_options) || question.correct_answers.length !== question.choose_x_options || question.choose_x_options < 1 || question.choose_x_options > question.options.length) return false;
    if (question.correct_answers.some(answer => !question.options.includes(answer))) return false;
    return true;
  }).map(question => ({ ...question, options: shuffle(question.options), selected: [], submitted: false, isCorrect: false }));

  if (!validQuestions.length) throw new Error('No valid questions were found in the cassette.');
  return shuffle(validQuestions);
}
function selectedOptions(question) { return question.selected || []; }
function finalizeUnansweredQuestions() {
  state.questions.forEach(question => {
    if (!question.submitted) {
      question.selected = selectedOptions(question);
      question.submitted = true;
      question.isCorrect = false;
    }
  });
}
function getFailedQuestions() { return state.questions.filter(question => question.submitted && !question.isCorrect); }
function buildFailedAttemptsExportMarkup() {
  const failedQuestions = getFailedQuestions();

  if (!failedQuestions.length) {
    return '<div class="print-empty">No incorrect attempts were recorded for this session.</div>';
  }

  return failedQuestions.map((question, index) => {
    const selection = selectedOptions(question);
    const selectedMarkup = selection.length
      ? selection.map(option => `<span class="print-choice incorrect">${escapeHtml(option)} [Selected]</span>`).join(', ')
      : '<span class="print-choice incorrect">No selection</span>';
    const correctMarkup = question.correct_answers.map(option => `<span class="print-choice correct">${escapeHtml(option)}</span>`).join(', ');
    const explanation = escapeHtml(question.explanation || 'No explanation provided.');

    return `
      <article class="print-entry">
        <div class="print-header">Q${index + 1}. ${escapeHtml(question.question)}</div>
        <div class="print-row"><strong>Your Selection (Incorrect):</strong> ${selectedMarkup}</div>
        <div class="print-row"><strong>Correct Answer:</strong> ${correctMarkup}</div>
        <div class="print-block"><strong>Explanation:</strong><div class="print-explanation">${explanation}</div></div>
      </article>
      <div class="print-divider">---</div>
    `;
  }).join('');
}
function render() { app.innerHTML = state.mode === 'loader' ? loaderView() : state.mode === 'exam' ? examView() : summaryView(); if (state.mode === 'summary') bindSummary(); }
function loaderView() {
  return `<div class="shell"><header class="topbar"><div class="brand"><span class="brand-mark">C</span> CASSETTE EXAM</div><div class="top-stat mono">LOCAL / OFFLINE</div></header><section class="loader-wrap"><div><p class="eyebrow mono">01 / INSERT CASSETTE</p><h1>Your exam,<br>on your terms.</h1><p class="intro">Load a question cassette and move through it one track at a time. Everything stays in this browser, ready when you are.</p><div class="cassette-visual" aria-hidden="true"><div class="cassette-label">SIDE A<br><br>ASSESSMENT / 01</div><i class="reel left"></i><i class="reel right"></i></div></div><div class="panel"><div class="tabs"><button class="tab active" type="button">LOAD CASSETTE</button></div><div class="dropzone" id="dropzone"><div><div class="drop-title">Drop a .json or .txt file here</div><div class="drop-help">or select one from your computer</div><label class="file-button">Choose file<input id="file-input" type="file" accept=".json,.txt,application/json,text/plain"></label><div class="file-name" id="file-name">${state.fileText ? 'Cassette loaded from text' : ''}</div></div></div><p class="mono" style="margin:25px 0 10px">OR PASTE RAW JSON</p><textarea id="json-input" placeholder="Paste your question array here...">${escapeHtml(state.fileText || sampleCassette)}</textarea><div class="form-foot"><div class="error" id="load-error">${escapeHtml(state.error)}</div><button class="primary" id="load-button" type="button">PLAY CASSETTE →</button></div></div></section></div>`;
}
function examView() {
  const question = state.questions[state.current]; const selected = selectedOptions(question); const atLast = state.current === state.questions.length - 1;
  const meetsRequiredSelection = selected.length === question.choose_x_options;
  const canSubmit = !question.submitted && meetsRequiredSelection;
  const showNextButton = !question.submitted || (question.submitted && !atLast);
  return `<div class="shell"><header class="exam-header"><div><div class="brand"><span class="brand-mark">C</span> CASSETTE EXAM</div><div class="mono" style="margin-top:12px">TRACK ${String(state.current + 1).padStart(2, '0')} / ${String(state.questions.length).padStart(2, '0')}</div></div><div class="exam-actions"><div class="score mono">SCORE<strong>${state.score} / ${state.questions.length}</strong></div><button class="text-button" id="reset-button" type="button">Reset exam</button><button class="text-button" id="end-button" type="button">End exam</button></div></header><main class="exam-main"><div class="question-meta mono"><span>QUESTION ${state.current + 1} OF ${state.questions.length}</span><span>${question.submitted ? 'REVIEWED' : 'IN PROGRESS'}</span></div><div class="question-copy">${escapeHtml(question.question)}</div><p class="prompt">Choose ${question.choose_x_options} option${question.choose_x_options === 1 ? '' : 's'}:</p><div class="options">${question.options.map(option => optionView(question, option, selected)).join('')}</div>${question.submitted ? `<div class="explanation"><span class="mono">EXPLANATION</span>${escapeHtml(question.explanation || 'No explanation provided.')}</div>` : ''}<div class="controls"><button class="secondary" id="previous-button" type="button" ${state.current === 0 ? 'disabled' : ''}>← Previous</button><div class="control-right"><button class="primary" id="submit-button" type="button" ${canSubmit ? '' : 'disabled'}>Submit answer</button>${showNextButton ? '<button class="primary" id="next-button" type="button">Next question →</button>' : ''}${question.submitted && atLast ? '<button class="primary" id="finish-button" type="button">View results →</button>' : ''}</div></div></main></div>`;
}
function optionView(question, option, selected) {
  const isSelected = selected.includes(option); const isCorrect = question.submitted && question.correct_answers.includes(option); const isWrong = question.submitted && isSelected && !isCorrect;
  const stateClass = isCorrect ? 'correct' : isWrong ? 'incorrect' : isSelected ? 'selected' : ''; const control = question.choose_x_options === 1 ? 'radio' : 'checkbox';
  return `<label class="option ${stateClass} ${question.submitted ? 'locked' : ''}"><input type="${control}" name="answer" value="${escapeHtml(option)}" ${isSelected ? 'checked' : ''} ${question.submitted ? 'disabled' : ''}> <span class="option-label">${escapeHtml(option)}</span>${isCorrect ? '<span class="answer-tag mono">CORRECT</span>' : ''}${isWrong ? '<span class="wrong-tag mono">YOUR PICK</span>' : ''}</label>`;
}
function summaryView() {
  const total = state.questions.length; const percentage = total ? Math.round((state.score / total) * 100) : 0;
  const failedQuestions = getFailedQuestions();
  const retakeDisabled = failedQuestions.length === 0;

  return `
    <div class="shell summary-shell">
      <header class="topbar"><div class="brand"><span class="brand-mark">C</span> CASSETTE EXAM</div><div class="top-stat mono">SESSION COMPLETE</div></header>
      <main class="summary-wrap">
        <p class="eyebrow mono">03 / PLAYBACK COMPLETE</p>
        <div class="summary-head">
          <div>
            <h2>Here is the<br>full playback.</h2>
            <p class="intro">A question-by-question record of what you selected and what the cassette expected.</p>
          </div>
          <div class="big-score">${state.score}<small> / ${total}<br>${percentage}%</small></div>
        </div>
        <div class="action-controls" aria-label="Exam recovery actions">
          <button class="secondary action-button" id="retake-button" type="button" ${retakeDisabled ? 'disabled' : ''}>${retakeDisabled ? 'No Incorrect Questions to Retake' : 'Retake Wrong Attempts'}</button>
          <button class="secondary action-button" id="pdf-button" type="button" ${failedQuestions.length === 0 ? 'disabled' : ''}>Download Incorrect Attempts PDF</button>
          <button class="primary action-button" id="home-button" type="button">Home Page</button>
        </div>
        <div class="review-list">${state.questions.map((question, index) => reviewView(question, index)).join('')}</div>
        <div class="summary-foot"><button class="primary" id="restart-button" type="button">Load another cassette →</button></div>
      </main>
    </div>
    <section class="print-export-layout" id="failed-attempts-print" aria-label="Incorrect attempts export">${buildFailedAttemptsExportMarkup()}</section>
  `;
}
function reviewView(question, index) { const selection = selectedOptions(question); return `<article class="review"><div class="review-title"><div class="review-question"><span class="mono" style="color:var(--muted)">${String(index + 1).padStart(2, '0')} / </span>${escapeHtml(question.question)}</div><span class="status ${question.isCorrect ? 'correct' : 'incorrect'}">${question.isCorrect ? 'CORRECT' : 'INCORRECT'}</span></div><p class="review-line"><strong>Correct option${question.correct_answers.length > 1 ? 's' : ''}:</strong> <span class="review-correct">${question.correct_answers.map(escapeHtml).join(', ')}</span></p><p class="review-line"><strong>Your selection${selection.length !== 1 ? 's' : ''}:</strong> <span class="${question.isCorrect ? '' : 'review-selected'}">${selection.length ? selection.map(escapeHtml).join(', ') : 'No selection'}</span></p><p class="review-explanation">${escapeHtml(question.explanation || 'No explanation provided.')}</p></article>`; }
function reset() { state.questions = []; state.current = 0; state.score = 0; state.fileText = ''; state.error = ''; state.mode = 'loader'; render(); bindLoader(); }
function returnHome() { state.questions = []; state.current = 0; state.score = 0; state.fileText = ''; state.error = ''; state.mode = 'loader'; render(); bindLoader(); }
function retakeWrongAttempts() {
  const failedQuestions = getFailedQuestions();
  if (!failedQuestions.length) return;

  const retakeQuestions = failedQuestions.map(question => {
    question.selected = [];
    question.submitted = false;
    question.isCorrect = false;
    question.options = shuffle(question.options);
    return question;
  });

  state.questions = retakeQuestions;
  state.current = 0;
  state.score = 0;
  state.mode = 'exam';
  render();
  bindExam();
}
function downloadIncorrectAttemptsPdf() {
  const failedQuestions = getFailedQuestions();
  if (!failedQuestions.length) return;
  document.querySelector('#failed-attempts-print').innerHTML = buildFailedAttemptsExportMarkup();
  window.print();
}
function handleQuestionAdvance() {
  const question = state.questions[state.current];
  if (!question.submitted) {
    question.selected = selectedOptions(question);
    question.submitted = true;
    question.isCorrect = false;
  }

  if (state.current < state.questions.length - 1) {
    state.current += 1;
    render();
    bindExam();
    return;
  }

  state.mode = 'summary';
  finalizeUnansweredQuestions();
  render();
}
function bindLoader() {
  const input = document.querySelector('#json-input'); const fileInput = document.querySelector('#file-input'); const dropzone = document.querySelector('#dropzone');
  const loadText = text => { state.fileText = text; input.value = text; document.querySelector('#file-name').textContent = 'Cassette ready to play'; };
  fileInput.addEventListener('change', event => { const file = event.target.files[0]; if (file) file.text().then(loadText); });
  ['dragenter', 'dragover'].forEach(type => dropzone.addEventListener(type, event => { event.preventDefault(); dropzone.classList.add('dragging'); }));
  ['dragleave', 'drop'].forEach(type => dropzone.addEventListener(type, event => { event.preventDefault(); dropzone.classList.remove('dragging'); }));
  dropzone.addEventListener('drop', event => { const file = event.dataTransfer.files[0]; if (file) file.text().then(loadText); });
  document.querySelector('#load-button').addEventListener('click', () => { try { state.questions = validateCassette(JSON.parse(input.value)); state.current = 0; state.score = 0; state.error = ''; state.mode = 'exam'; render(); bindExam(); } catch (error) { state.error = error.message; document.querySelector('#load-error').textContent = state.error; } });
}
function bindExam() {
  const question = state.questions[state.current];
  document.querySelectorAll('input[name="answer"]').forEach(input => input.addEventListener('change', event => { let selected = selectedOptions(question); if (question.choose_x_options === 1) selected = [event.target.value]; else if (event.target.checked) selected = [...selected, event.target.value]; else selected = selected.filter(value => value !== event.target.value); question.selected = selected; document.querySelectorAll('input[name="answer"]').forEach(control => { control.disabled = !control.checked && selected.length >= question.choose_x_options; }); document.querySelectorAll('.option').forEach(option => option.classList.toggle('selected', selected.includes(option.querySelector('input').value))); render(); bindExam(); }));
  document.querySelector('#submit-button')?.addEventListener('click', () => {
    if (question.selected.length !== question.choose_x_options) return;

    question.submitted = true;
    question.isCorrect = question.selected.length === question.correct_answers.length && question.correct_answers.every(answer => question.selected.includes(answer));
    if (question.isCorrect) state.score++;
    render();
    bindExam();
  });
  document.querySelector('#previous-button')?.addEventListener('click', () => { if (state.current > 0) { state.current--; render(); bindExam(); } });
  document.querySelector('#next-button')?.addEventListener('click', handleQuestionAdvance);
  document.querySelector('#finish-button')?.addEventListener('click', () => { finalizeUnansweredQuestions(); state.mode = 'summary'; render(); });
  document.querySelector('#reset-button')?.addEventListener('click', () => { if (confirm('Reset this exam and discard all progress?')) reset(); });
  document.querySelector('#end-button')?.addEventListener('click', () => { finalizeUnansweredQuestions(); state.mode = 'summary'; render(); });
}
function bindSummary() {
  document.querySelector('#restart-button')?.addEventListener('click', reset);
  document.querySelector('#retake-button')?.addEventListener('click', retakeWrongAttempts);
  document.querySelector('#pdf-button')?.addEventListener('click', downloadIncorrectAttemptsPdf);
  document.querySelector('#home-button')?.addEventListener('click', returnHome);
}
render();
if (state.mode === 'loader') bindLoader();