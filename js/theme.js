(function () {
  const toggle = document.getElementById('theme-toggle');
  const icon = toggle.querySelector('.theme-icon');
  const root = document.documentElement;

  function updateIcon(theme) {
    icon.textContent = theme === 'dark' ? '☽' : '☀';
  }

  const current = root.getAttribute('data-theme') || 'light';
  updateIcon(current);

  toggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateIcon(next);
  });
})();
