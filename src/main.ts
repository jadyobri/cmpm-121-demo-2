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

        const drawingChangedEvent = new Event('drawing-changed');

        // Start drawing
        canvas.addEventListener('mousedown', (event) => {
            isDrawing = true;
            currentLine = [];  // Start a new line
            addPointToLine(event);
            // if (ctx) {
            //     ctx.beginPath();
            //     ctx.moveTo(event.offsetX, event.offsetY);
            // }
        });

        // Draw line as the mouse moves
        canvas.addEventListener('mousemove', (event) => {
            if (isDrawing && ctx) {
                // ctx.lineTo(event.offsetX, event.offsetY);
                // ctx.stroke();
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
            // if (ctx) {
            //     ctx.closePath();
            // }
        });

        // Stop drawing if the mouse leaves the canvas
        canvas.addEventListener('mouseleave', () => {
            isDrawing = false;
        });

        // Clear the canvas when the clear button is clicked
        if (clearButton) {
            clearButton.addEventListener('click', () => {
                // if (ctx) {
                //     ctx.clearRect(0, 0, canvas.width, canvas.height);
                //    // ctx.setPosition();
                // }
                lines = [];
                currentLine = [];
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }

                //lines.splice(0, lines.length) // Clear the stored lines
                //lines[0] = { x: 0; y: 0; }


                //canvas.dispatchEvent(drawingChangedEvent);
                canvas.dispatchEvent(drawingChangedEvent);  // Trigger drawing change
                //drawLine(lines[0]);
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
            // if (ctx && line.length > 1) {
            //     // Clear the canvas
            //     ctx.clearRect(0, 0, canvas.width, canvas.height);

            //     // Redraw all the saved lines
            //     for (const line of lines) {
            //         if (line.length > 1) {
            //             ctx.beginPath();
            //             ctx.moveTo(line[0].x, line[0].y);
            //             for (let i = 1; i < line.length; i++) {
            //                 ctx.lineTo(line[i].x, line[i].y);
            //             }
            //             ctx.stroke();
            //             ctx.closePath();
            //         }
            //     }
            // }
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
                //ctx.closePath();
            }
        };
    }
    // function redraw() {
    //     ctx.clearRect(0, 0, canvas.width, canvas.height);
    //     for (const line of lines) {
    //       if (line.length > 1) {
    //         ctx.beginPath();
    //         const { x, y } = line[0];
    //         ctx.moveTo(x, y);
    //         for (const { x, y } of line) {
    //           ctx.lineTo(x, y);
    //         }
    //         ctx.stroke();
    //       }
    //     }
    //   }
};

document.title = APP_NAME;
app.innerHTML = APP_NAME;
