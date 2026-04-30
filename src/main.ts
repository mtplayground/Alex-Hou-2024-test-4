import { renderApp } from './app';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
  throw new Error('Expected #app container to exist.');
}

renderApp(app);
