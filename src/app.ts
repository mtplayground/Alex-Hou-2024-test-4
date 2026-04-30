export function getAppMarkup(): string {
  return `
    <main>
      <h1>Snake Game</h1>
      <p>TypeScript + Vite bootstrap is ready.</p>
    </main>
  `;
}

export function renderApp(container: Element): void {
  container.innerHTML = getAppMarkup();
}
