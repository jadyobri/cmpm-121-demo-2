import "./style.css";

const APP_NAME = "Project 2";
const app = document.querySelector<HTMLDivElement>("#app")!;

globalThis.onload = () => {
    const appTitle = document.getElementById('app-title');
    const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
    //canvas.style.position(50, 50);
    const clearButton = document.getElementById('clearButton') as HTMLButtonElement;

    if (appTitle) {
        appTitle.textContent = "My Awesome App";
    }
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let isDrawing = false;

        // Start drawing
        canvas.addEventListener('mousedown', (event) => {
            isDrawing = true;
            if (ctx) {
                ctx.beginPath();
                ctx.moveTo(event.offsetX, event.offsetY);
            }
        });

        // Draw line as the mouse moves
        canvas.addEventListener('mousemove', (event) => {
            if (isDrawing && ctx) {
                ctx.lineTo(event.offsetX, event.offsetY);
                ctx.stroke();
            }
        });
         // Stop drawing when mouse is released
         canvas.addEventListener('mouseup', () => {
            isDrawing = false;
            if (ctx) {
                ctx.closePath();
            }
        });

        // Stop drawing if the mouse leaves the canvas
        canvas.addEventListener('mouseleave', () => {
            isDrawing = false;
        });

        // Clear the canvas when the clear button is clicked
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                   // ctx.setPosition();
                }
            });
        }
    }
};
document.title = APP_NAME;
app.innerHTML = APP_NAME;
