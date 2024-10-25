import "./style.css";

const APP_NAME = "Project 2";
const app = document.querySelector<HTMLDivElement>("#app")!;

//used generative ai for help
class ToolPreview {
    private x: number;
    private y: number;
    private thickness: number;

    constructor(thickness: number) {
        this.x = 0;
        this.y = 0;
        this.thickness = thickness;
    }

    // Update the preview's position based on mouse movement
    move(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    // Render the preview circle on the canvas
    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.thickness / 2, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.5)"; // Optional: use a translucent color for preview
        ctx.lineWidth = 1;
        ctx.stroke();
       // ctx.closePath();
    }
}


//Used help from generative AI
class Liner{
    private points: {x: number; y: number}[];
    private thickn: number;

    constructor(startX: number, startY: number, thickn:number){
        this.points = [{x: startX, y: startY}];
        this.thickn = thickn;
    }

    drag(x: number, y:number){
        this.points.push({x, y});
       // this.thickn = thickn;
    }

    display(ctx: CanvasRenderingContext2D){
        if(this.points.length > 0){
            ctx.beginPath();
            ctx.moveTo(this.points[0].x, this.points[0].y);
            for(const line of this.points){
                ctx.lineTo(line.x, line.y);
            }
            ctx.lineWidth = this.thickn;
            ctx.stroke();
        }
    }
}

//Used help from generative AI in the process
globalThis.onload = () => {
    const appTitle = document.getElementById('app-title');
    const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
    //canvas.style.position(50, 50);
    const thinTool = document.getElementById('thinTool') as HTMLButtonElement;
    const thickTool = document.getElementById('thickTool') as HTMLButtonElement;
   

    const clearButton = document.getElementById('clearButton') as HTMLButtonElement;
    if (appTitle) {
        appTitle.textContent = "My Awesome App";
    }
    if (canvas) {
        let currentToolThickness = 2;
        const ctx = canvas.getContext('2d');
        let isDrawing = false;
        let currentLine: Liner | null = null;//{ x: number; y: number }[] = [];
        let lines: Liner[] = [];//{ x: number; y: number }[][] = [];
        let redoStack: Liner[] = [];//{ x: number; y: number }[][] = [];
       // const undoLines: { x: number; y: number }[][] = [];
       let toolPreview: ToolPreview | null = new ToolPreview(currentToolThickness); // Initialize tool preview

        const drawingChangedEvent = new Event('drawing-changed');
        const toolMovedEvent = new Event('tool-moved');
        // const updateToolSelection = (selectedTool: HTMLButtonElement) => {
        //     thinTool.classList.remove('selectedTool');
        //     thickTool.classList.remove('selectedTool');
        //     selectedTool.classList.add('selectedTool');
        // };

        // updateToolSelection(thinTool);
        // Start drawing
        canvas.addEventListener('mousedown', (event) => {
            const rect = canvas.getBoundingClientRect();
            const startX = event.clientX - rect.left;
            const startY = event.clientY - rect.top;
            isDrawing = true;
            // const startX = event.clientX - rect.left;
            // const startY = event.clientY - rect.top;
            currentLine = new Liner(startX, startY, currentToolThickness);  // Start a new line
            //addPointToLine(event);
            redoStack.splice(0, redoStack.length);
            toolPreview = null;
            canvas.dispatchEvent(drawingChangedEvent);

        });

        // Draw line as the mouse moves
        canvas.addEventListener('mousemove', (event) => {

                const rect = canvas.getBoundingClientRect();
                const newX = event.clientX - rect.left;
                const newY = event.clientY - rect.top;
            if (isDrawing && currentLine) {
                currentLine.drag(newX, newY);
                //addPointToLine(event);
                canvas.dispatchEvent(drawingChangedEvent); // Trigger drawing change
                
            } else if (!isDrawing && toolPreview) {
                toolPreview.move(newX, newY); // Update tool preview position
                canvas.dispatchEvent(toolMovedEvent); // Trigger tool-moved event
            }
        });
        const updateToolSelection = (selectedTool: HTMLButtonElement) => {
            thinTool.classList.remove('selectedTool');
            thickTool.classList.remove('selectedTool');
            selectedTool.classList.add('selectedTool');
        };
        updateToolSelection(thinTool);
        thinTool.addEventListener('click', () => {
            currentToolThickness = 2; // Thin marker
            toolPreview = new ToolPreview(currentToolThickness); // Update preview thickness
            updateToolSelection(thinTool);
        });
    
        thickTool.addEventListener('click', () => {
            currentToolThickness = 6; // Thick marker
            toolPreview = new ToolPreview(currentToolThickness); // Update preview thickness
            updateToolSelection(thickTool);
        });
         // Stop drawing when mouse is released
         canvas.addEventListener('mouseup', () => {
            //isDrawing = false;
            if (isDrawing && currentLine) {
                lines.push(currentLine);  // Save the line
                currentLine = null;
                toolPreview = new ToolPreview(currentToolThickness); // Show tool preview after drawing
                canvas.dispatchEvent(drawingChangedEvent); // Trigger drawing change
            }
            isDrawing = false;

        });
        //Help from the https://quant-paint.glitch.me/paint1.html
        const undoButton = document.getElementById("undoButton") as HTMLButtonElement;
       // undoButton.innerHTML = "undo";
        document.body.appendChild(undoButton);
        //Help also from generative AI
        undoButton.addEventListener("click", () => {
            if(lines.length > 0){
                const lastLine = lines.pop();
            if(lastLine){
                redoStack.push(lastLine);
                //currentLine = [];
            }
            canvas.dispatchEvent(drawingChangedEvent);
            }
        });
        

        const redoButton = document.getElementById('redoButton') as HTMLButtonElement;
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
                //currentLine = [];
                redoStack = [];
                if (ctx) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
                canvas.dispatchEvent(drawingChangedEvent);  // Trigger drawing change
            });
        }
        // const addPointToLine = (event: MouseEvent) => {
        //     const rect = canvas.getBoundingClientRect();
        //     currentLine.push({
        //         x: event.clientX - rect.left,
        //         y: event.clientY - rect.top,
        //     });
        // };
        canvas.addEventListener('drawing-changed', () => {

            if (ctx) {
                // Clear the canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                // Redraw all the saved lines
                for (const line of lines) {
                    line.display(ctx);
                    //drawLine(line);
                }

                // Draw the current line if it's being drawn
                if (currentLine) {
                    currentLine.display(ctx);
                    //drawLine(currentLine);
                }
            }
        });
        const redrawCanvas = () => {
            if (ctx) {
                // Clear the canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
    
                // Redraw all the saved lines
                for (const line of lines) {
                    line.display(ctx); // Display each MarkerLine
                }
    
                // If a current line is being drawn, display it too
                if (currentLine) {
                    currentLine.display(ctx);
                }
    
                // Draw the tool preview if not drawing
                if (!isDrawing && toolPreview) {
                    toolPreview.draw(ctx);
                }
            }
        };
    
        canvas.addEventListener('drawing-changed', redrawCanvas);
        canvas.addEventListener('tool-moved', redrawCanvas);
    
        // const drawLine = (line: { x: number; y: number }[]) => {
        //     if (line.length > 0 && ctx) {
        //         ctx.beginPath();
        //         ctx.moveTo(line[0].x, line[0].y);
        //         for (let i = 1; i < line.length; i++) {
        //             ctx.lineTo(line[i].x, line[i].y);
        //         }
        //         ctx.stroke();
        //     }
        // };
    }

};

document.title = APP_NAME;
app.innerHTML = APP_NAME;
