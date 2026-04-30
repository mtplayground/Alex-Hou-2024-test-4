const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Expected #app container to exist.');
}

app.innerHTML = `
  <main>
    <h1>Snake Game</h1>
    <p>TypeScript + Vite bootstrap is ready.</p>
  </main>
`;
