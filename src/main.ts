import "./style.css";

const APP_NAME = "Project 2";
const app = document.querySelector<HTMLDivElement>("#app")!;

//Used help from generative AI in the process
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
        let currentLine: { x: number; y: number }[] = [];
        let lines: { x: number; y: number }[][] = [];
        let redoStack: { x: number; y: number }[][] = [];
       // const undoLines: { x: number; y: number }[][] = [];

        const drawingChangedEvent = new Event('drawing-changed');

        // Start drawing
        canvas.addEventListener('mousedown', (event) => {
            isDrawing = true;
            currentLine = [];  // Start a new line
            addPointToLine(event);
            redoStack.splice(0, redoStack.length);

        });

        // Draw line as the mouse moves
        canvas.addEventListener('mousemove', (event) => {
            if (isDrawing && ctx) {

                addPointToLine(event);
                canvas.dispatchEvent(drawingChangedEvent); // Trigger drawing change
                
            }
        });
         // Stop drawing when mouse is released
         canvas.addEventListener('mouseup', () => {
            isDrawing = false;
            if (currentLine.length > 0) {
                lines.push(currentLine);  // Save the line
                canvas.dispatchEvent(drawingChangedEvent); // Trigger drawing change
            }

        });
        //Help from the https://quant-paint.glitch.me/paint1.html
        const undoButton = document.createElement("button");
        undoButton.innerHTML = "undo";
        document.body.appendChild(undoButton);
        //Help also from generative AI
        undoButton.addEventListener("click", () => {
            if(lines.length > 0){
                const lastLine = lines.pop();
            if(lastLine){
                redoStack.push(lastLine);
                currentLine = [];
            }
            canvas.dispatchEvent(drawingChangedEvent);
            }
        });
        

        const redoButton = document.createElement('button');
        redoButton.innerHTML = "redo";
        document.body.appendChild(redoButton);
        redoButton.addEventListener("click", () => {
            if(redoStack.length > 0){
                const lastUndoneLine = redoStack.pop();
                if(lastUndoneLine){
                    lines.push(lastUndoneLine);
                }
                canvas.dispatchEvent(drawingChangedEvent);
                //lines.push(redoStack[redoStack.length-1]);
                //redoStack[redoStack.length-1].pop();
                //drawLine(lines[lines.length-1])
            }
        });

        // Stop drawing if the mouse leaves the canvas
        canvas.addEventListener('mouseleave', () => {
            isDrawing = false;
        });

        // Clear the canvas when the clear button is clicked
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                lines = [];
                currentLine = [];
                redoStack = [];
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
                canvas.dispatchEvent(drawingChangedEvent);  // Trigger drawing change
            });
        }
        const addPointToLine = (event: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            currentLine.push({
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
            });
        };
        canvas.addEventListener('drawing-changed', () => {

            if (ctx) {
                // Clear the canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Redraw all the saved lines
                for (const line of lines) {
                    drawLine(line);
                }

                // Draw the current line if it's being drawn
                if (currentLine.length > 0) {
                    drawLine(currentLine);
                }
            }
        });
        const drawLine = (line: { x: number; y: number }[]) => {
            if (line.length > 0 && ctx) {
                ctx.beginPath();
                ctx.moveTo(line[0].x, line[0].y);
                for (let i = 1; i < line.length; i++) {
                    ctx.lineTo(line[i].x, line[i].y);
                }
                ctx.stroke();
            }
        };
    }

};

document.title = APP_NAME;
app.innerHTML = APP_NAME;
