(() => {
  'use strict';

  const fortunes = {
    positive: [
      'The stars lean unmistakably toward yes.', 'Fortune has already opened the door.',
      'Proceed—the hour is in your favor.', 'A joyful outcome waits just beyond doubt.',
      'Yes, and sooner than you imagine.', 'The answer glows bright: absolutely.',
      'Trust the first brave step.', 'All signs point toward success.',
      'Your hope is better founded than you know.'
    ],
    negative: [
      'The road closes before that destination.', 'Do not wager your peace upon it.',
      'The signs whisper a firm no.', 'Turn back; a wiser path is near.',
      'Not while the moon keeps this company.', 'The odds are colder than they appear.',
      'Release this wish and make room for better.', 'The oracle would not count upon it.',
      'No—the cost hides behind the promise.'
    ],
    maybe: [
      'Ask again when one small thing has changed.', 'The answer depends upon your next move.',
      'Patience will reveal what haste conceals.', 'Perhaps—but only with honest courage.',
      'The balance has not yet tipped.', 'Wait for a clearer sign.',
      'Your choice matters more than chance here.', 'Not yet, though the path remains open.',
      'A secret still stands between you and certainty.'
    ],
    mysterious: [
      'What you seek is also seeking you.', 'The key is hidden inside the question.',
      'Beware the answer that arrives too easily.', 'A forgotten promise will return.',
      'The third sign will be the true one.', 'Listen when the room falls quiet.',
      'The future laughs softly behind the curtain.', 'Look not ahead, but beside you.',
      'Before the next new moon, you will understand.'
    ]
  };

  const allFortunes = Object.entries(fortunes).flatMap(([category, lines]) => lines.map(text => ({ category, text })));
  const machine = document.querySelector('#machine');
  const handle = document.querySelector('#handle');
  const answer = document.querySelector('#answer');
  const kicker = document.querySelector('#answerKicker');
  const hint = document.querySelector('#hint');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let dragging = false;
  let startY = 0;
  let pull = 0;
  let busy = false;
  let recent = [];
  let audioContext;

  const labels = { positive: 'The stars align', negative: 'A warning from beyond', maybe: 'The mist has not cleared', mysterious: 'A whisper through the veil' };
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

  function setPull(value) {
    pull = clamp(value, 0, 112);
    machine.style.setProperty('--pull', `${pull}px`);
    machine.classList.toggle('pulling', pull > 8);
    handle.setAttribute('aria-valuenow', String(Math.round(pull)));
  }

  function tone(kind) {
    try {
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audioContext.state === 'suspended') audioContext.resume();
      const now = audioContext.currentTime;
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const filter = audioContext.createBiquadFilter();
      osc.type = kind === 'release' ? 'triangle' : 'square';
      osc.frequency.setValueAtTime(kind === 'release' ? 145 : 72 + pull * .5, now);
      if (kind === 'release') osc.frequency.exponentialRampToValueAtTime(48, now + .18);
      filter.type = 'lowpass'; filter.frequency.value = 520;
      gain.gain.setValueAtTime(kind === 'release' ? .1 : .025, now);
      gain.gain.exponentialRampToValueAtTime(.001, now + (kind === 'release' ? .24 : .045));
      osc.connect(filter).connect(gain).connect(audioContext.destination);
      osc.start(now); osc.stop(now + (kind === 'release' ? .25 : .05));
    } catch (_) { /* Sound is an enhancement; silence is a valid fallback. */ }
  }

  function pickFortune() {
    const available = allFortunes.filter(item => !recent.includes(item.text));
    const choice = available[Math.floor(Math.random() * available.length)];
    recent.push(choice.text);
    if (recent.length > 8) recent.shift();
    return choice;
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = speechSynthesis.getVoices();
    utterance.voice = voices.find(v => /en[-_](GB|IN)/i.test(v.lang)) || voices.find(v => /^en/i.test(v.lang)) || null;
    utterance.rate = .82; utterance.pitch = .72; utterance.volume = .9;
    speechSynthesis.speak(utterance);
  }

  function consult() {
    if (busy) return;
    busy = true;
    const distance = pull;
    machine.style.setProperty('--release-distance', `${distance}px`);
    machine.classList.remove('pulling', 'revealed');
    machine.classList.add('snap');
    setPull(0);
    tone('release');
    answer.textContent = 'The wheels of fate are turning…';
    kicker.textContent = 'Consulting the unseen';
    hint.textContent = 'Mentallo considers your question…';
    setTimeout(() => machine.classList.add('consulting'), reducedMotion.matches ? 10 : 280);
    const delay = reducedMotion.matches ? 450 : 1550;
    setTimeout(() => {
      const fortune = pickFortune();
      machine.classList.remove('consulting', 'snap');
      machine.classList.add('revealed');
      kicker.textContent = labels[fortune.category];
      answer.textContent = fortune.text;
      hint.innerHTML = 'Ask another question <span aria-hidden="true">↓</span><span class="keyboard-hint"> or press Space</span>';
      speak(fortune.text);
      busy = false;
    }, delay);
  }

  function begin(event) {
    if (busy || (event.button !== undefined && event.button !== 0)) return;
    dragging = true; startY = event.clientY; setPull(0);
    handle.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  }

  function move(event) {
    if (!dragging) return;
    const next = event.clientY - startY;
    const before = pull;
    setPull(next);
    if (Math.floor(pull / 24) > Math.floor(before / 24)) tone('pull');
    event.preventDefault();
  }

  function end(event) {
    if (!dragging) return;
    dragging = false;
    handle.releasePointerCapture?.(event.pointerId);
    if (pull >= 38) consult(); else setPull(0);
  }

  handle.addEventListener('pointerdown', begin);
  handle.addEventListener('pointermove', move);
  handle.addEventListener('pointerup', end);
  handle.addEventListener('pointercancel', end);
  handle.addEventListener('lostpointercapture', () => { if (dragging) { dragging = false; pull >= 38 ? consult() : setPull(0); } });
  handle.addEventListener('click', event => { if (!busy && event.detail !== 0 && pull === 0) consult(); });
  handle.addEventListener('keydown', event => {
    if ((event.key === ' ' || event.key === 'Enter') && !busy) { event.preventDefault(); setPull(72); setTimeout(consult, reducedMotion.matches ? 10 : 160); }
  });

  window.addEventListener('pagehide', () => { window.speechSynthesis?.cancel(); });
})();
