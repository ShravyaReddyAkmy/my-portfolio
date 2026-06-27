/* ---- Skills RAG Pipeline ---- */
(function () {
  const stepQuery    = document.getElementById('pl-query');
  const stepEmbed    = document.getElementById('pl-embed');
  const stepRetrieve = document.getElementById('pl-retrieve');
  const stepGenerate = document.getElementById('pl-generate');
  const queryVal     = document.getElementById('pl-query-val');
  const vectorEl     = document.getElementById('pl-vector');
  const docsEl       = document.getElementById('pl-docs');
  const tagsEl       = document.getElementById('pl-tags');

  if (!stepQuery) return;

  const PIPELINES = [
    {
      query: '"AI engineering?"',
      docs:  ['resume · skills · AI/agents', 'resume · exp · LangGraph'],
      tags:  ['Python', 'LangGraph', 'LangChain', 'Agents', 'MCP', 'RAG'],
    },
    {
      query: '"cloud + data stack?"',
      docs:  ['resume · skills · cloud', 'resume · skills · databases'],
      tags:  ['AWS', 'Pinecone', 'PostgreSQL', 'MongoDB', 'Embeddings'],
    },
    {
      query: '"ML model experience?"',
      docs:  ['resume · projects · XR capstone', 'resume · projects · video AI'],
      tags:  ['TensorFlow', 'Transfer Learning', 'YOLO', 'VLM', 'FastAPI'],
    },
  ];

  // Build vector bars once
  const BAR_COUNT = 24;
  const barEls = [];
  for (let i = 0; i < BAR_COUNT; i++) {
    const b = document.createElement('div');
    b.className = 'pl-bar';
    vectorEl.appendChild(b);
    barEls.push(b);
  }

  let pi = 0;
  let pendingTimers = [];
  let intervalId = null;
  let running = false;

  function schedule(fn, delay) {
    const id = setTimeout(() => {
      pendingTimers = pendingTimers.filter(x => x !== id);
      fn();
    }, delay);
    pendingTimers.push(id);
    return id;
  }

  function cancelAll() {
    pendingTimers.forEach(id => clearTimeout(id));
    pendingTimers = [];
  }

  function setStep(el, state) {
    el.classList.remove('active', 'done');
    if (state) el.classList.add(state);
  }

  function resetAll() {
    cancelAll();
    [stepQuery, stepEmbed, stepRetrieve, stepGenerate].forEach(s => setStep(s, null));
    docsEl.innerHTML = '';
    tagsEl.innerHTML = '';
    barEls.forEach(b => { b.style.height = '3px'; b.className = 'pl-bar'; });
  }

  function typeQuery(text, done) {
    queryVal.textContent = '"';
    const inner = text.slice(1, -1);
    let i = 0;
    const t = setInterval(() => {
      queryVal.textContent = '"' + inner.slice(0, ++i) + '"';
      if (i >= inner.length) { clearInterval(t); done(); }
    }, 42);
  }

  function animateBars(done) {
    const heights = barEls.map(() => Math.random());
    barEls.forEach((b, i) => {
      schedule(() => {
        const h = Math.round(8 + heights[i] * 40);
        b.style.height = h + 'px';
        b.className = 'pl-bar ' + (heights[i] > 0.5 ? 'pos' : 'neg');
      }, i * 18);
    });
    schedule(done, BAR_COUNT * 18 + 100);
  }

  function showDocs(docs, done) {
    docs.forEach((text, i) => {
      const d = document.createElement('div');
      d.className = 'pl-doc';
      d.textContent = text;
      docsEl.appendChild(d);
      schedule(() => d.classList.add('shown'), i * 260 + 80);
    });
    schedule(done, docs.length * 260 + 200);
  }

  function showTags(tags) {
    const capped = tags.slice(0, 8);
    capped.forEach((text, i) => {
      const t = document.createElement('span');
      t.className = 'pl-tag';
      t.textContent = text;
      tagsEl.appendChild(t);
      schedule(() => t.classList.add('shown'), i * 110 + 60);
    });
  }

  function run() {
    if (running) return;
    running = true;
    const p = PIPELINES[pi % PIPELINES.length];
    pi++;
    resetAll();

    // Step 01: query
    setStep(stepQuery, 'active');
    typeQuery(p.query, () => {
      setStep(stepQuery, 'done');

      // Step 02: embed
      setStep(stepEmbed, 'active');
      animateBars(() => {
        setStep(stepEmbed, 'done');

        // Step 03: retrieve
        setStep(stepRetrieve, 'active');
        showDocs(p.docs, () => {
          setStep(stepRetrieve, 'done');

          // Step 04: generate
          setStep(stepGenerate, 'active');
          showTags(p.tags);
          schedule(() => { setStep(stepGenerate, 'done'); running = false; }, p.tags.length * 110 + 300);
        });
      });
    });
  }

  function startInterval() {
    if (intervalId) return;
    intervalId = setInterval(run, 6000);
  }

  function stopInterval() {
    if (intervalId) { clearInterval(intervalId); intervalId = null; }
    cancelAll();
    running = false;
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopInterval();
    } else {
      resetAll();
      run();
      startInterval();
    }
  });

  run();
  // total cycle ≈ query type (~600ms) + bars (~550ms) + docs (~720ms) + tags (~900ms) + pause
  startInterval();
})();
