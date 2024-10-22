import "./style.css";

const APP_NAME = "Project 2";
const app = document.querySelector<HTMLDivElement>("#app")!;

window.onload = () => {
    const appTitle = document.getElementById('app-title');
    if (appTitle) {
        appTitle.textContent = "My Awesome App";
    }
};
document.title = APP_NAME;
app.innerHTML = APP_NAME;
