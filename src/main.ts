import "./style.css";

const APP_NAME = "Project 2"; 
const app = document.querySelector<HTMLDivElement>("#app")!;

// interface pin {
//     emoji: string;
//     label: string;
// }
const thinBrushThickness = 4;  // Previously 2
const thickBrushThickness = 10; // Previously 6
let mouseX = 0;
let mouseY = 0;
class PinPreview {
    private x: number;
    private y: number;
    private emoji: string;
    private rotation: number;

    constructor(emoji: string, rotation: number = 0) {
        this.x = 0;
        this.y = 0;
        this.emoji = emoji;
        this.rotation = rotation;
    }

    // Update preview position
    move(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    setRotation(rotation: number) {
        this.rotation = rotation;
    }

    // Draw preview of the pin at the mouse position
    draw(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate((this.rotation * Math.PI) / 180); // Convert rotation to radians
        ctx.font = "24px serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(this.emoji, 0, 0);
        ctx.restore();
    }
}

class Pin{
    private x: number;
    private y: number;
    private emoji: string;
    private rotation: number;

    constructor(x: number, y: number, emoji: string, rotation: number = 0) {
        this.x = x;
        this.y = y;
        this.emoji = emoji;
        this.rotation = rotation;
    }
    drag(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    setRotation(rotation: number) {
        this.rotation = rotation;
    }

    // Display the Pin on the canvas
    display(ctx: CanvasRenderingContext2D) {
         ctx.save();
         ctx.translate(this.x, this.y);
         ctx.rotate((this.rotation * Math.PI) / 180); // Convert rotation to radians
         ctx.textAlign = "center";
        ctx.font = "24px serif";
        ctx.textBaseline = "middle";
        ctx.fillText(this.emoji, 0, 0);
        ctx.restore();
    }
}
//used generative ai for help
class ToolPreview {
    private x: number;
    private y: number;
    private thickness: number;
    private colorHue: number;

    constructor(thickness: number, colorHue: number) {
        this.x = 0;
        this.y = 0;
        this.thickness = thickness;
        this.colorHue = colorHue;
    }

    // Update the preview's position based on mouse movement
    move(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    setColorHue(hue: number) {
        this.colorHue = hue;
    }

    // Render the preview circle on the canvas
    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.thickness / 2, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0, 0, 0, 0.5)"; // Optional: use a translucent color for preview
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.closePath();
    }
}


//Used help from generative AI
class Liner{
    private points: {x: number; y: number}[];
    private thickn: number;
    private colorHue: number;

    constructor(startX: number, startY: number, thickn:number, colorHue: number){
        this.points = [{x: startX, y: startY}];
        this.thickn = thickn;
        this.colorHue = colorHue;
    }

    drag(x: number, y:number){
        this.points.push({x, y});
       // this.thickn = thickn;
    }
    setColorHue(hue: number) {
        this.colorHue = hue;
    }

    display(ctx: CanvasRenderingContext2D){
        if(this.points.length > 0){
            ctx.beginPath();
            ctx.moveTo(this.points[0].x, this.points[0].y);
            for(const line of this.points){
                ctx.lineTo(line.x, line.y);
            }
            ctx.lineWidth = this.thickn;
            ctx.strokeStyle = `hsl(${this.colorHue}, 100%, 50%)`;
            ctx.stroke();
        }
    }
}

//Used help from generative AI in the process
globalThis.onload = () => {
   const toolSlider = document.getElementById("toolSlider") as HTMLInputElement;
let currentHue = 0; // Default color hue for brushes
let currentRotation = 0; // Default rotation angle for stamps
    const appTitle = document.getElementById('app-title'); 
    const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
    //canvas.style.position(50, 50);
    const thinTool = document.getElementById('thinTool') as HTMLButtonElement;
    const thickTool = document.getElementById('thickTool') as HTMLButtonElement;
    //const checkpin = document.getElementById('checkpin') as HTMLButtonElement;
    //const firepin = document.getElementById('firepin') as HTMLButtonElement;
    //const pumpkinpin = document.getElementById('pumpkinpin') as HTMLButtonElement;
    const customPinButton = document.getElementById('customPinButton') as HTMLButtonElement;
    const pinButtonsContainer = document.getElementById('pinButtons') as HTMLDivElement;
    const exportButton = document.getElementById("exportButton") as HTMLButtonElement;
    //const PinButtonsContainer = document.getElementById('PinButtons') as HTMLDivElement;
    const clearButton = document.getElementById('clearButton') as HTMLButtonElement;
    if (appTitle) {
        appTitle.textContent = "My Awesome App";
    }
    if (canvas) {
        let currentToolThickness = 4;
        const ctx = canvas.getContext('2d');
        let isDrawing = false;
        let currentLine: Liner | null = null;//{ x: number; y: number }[] = [];
        let lines: (Liner | Pin)[] = [];//{ x: number; y: number }[][] = [];
        let redoStack: (Liner | Pin)[] = [];//{ x: number; y: number }[][] = [];
       // const undoLines: { x: number; y: number }[][] = [];
       let toolPreview: ToolPreview | null = new ToolPreview(currentToolThickness, currentHue); // Initialize tool preview
       let pinPreview: PinPreview | null = null;
       let selectedPin: string | null = null;
        const drawingChangedEvent = new Event('drawing-changed');
        const toolMovedEvent = new Event('tool-moved');
        // const updateToolSelection = (selectedTool: HTMLButtonElement) => {
        //     thinTool.classList.remove('selectedTool');
        //     thickTool.classList.remove('selectedTool');
        //     selectedTool.classList.add('selectedTool');
        // };

        // updateToolSelection(thinTool);
        const pins = [
            { emoji: "✅", label: "Check"},
            { emoji: "🔥", label: "Fire" },
            { emoji: "🎃", label: "Pumpkin" },
            { emoji: "🥇", label: "Medal"},
            { emoji: "👍", label: "Thumbs Up"},
            { emoji: "⭐️", label: "Star" }
        ];

        // Start drawing
        canvas.addEventListener('mousedown', (event) => {
            const rect = canvas.getBoundingClientRect();
            const startX = event.clientX - rect.left;
            const startY = event.clientY - rect.top;
            //isDrawing = true;
            // const startX = event.clientX - rect.left;
            // const startY = event.clientY - rect.top;
            currentLine = new Liner(startX, startY, currentToolThickness, currentHue);  // Start a new line
            //addPointToLine(event);
            redoStack.splice(0, redoStack.length);
            toolPreview = null;
            canvas.dispatchEvent(drawingChangedEvent);
            if (selectedPin && pinPreview) {
                // Place a pin
                const pin = new Pin(startX, startY, selectedPin, currentRotation);
                lines.push(pin);
                redoStack = [];
                pinPreview = new PinPreview(selectedPin, currentRotation);
                canvas.dispatchEvent(drawingChangedEvent);
            } else {
                // Draw a line
                isDrawing = true;
                currentLine = new Liner(startX, startY, currentToolThickness, currentHue);
                redoStack = [];
                toolPreview = null;
                canvas.dispatchEvent(drawingChangedEvent);
            }

        });

        // Draw line as the mouse moves
        canvas.addEventListener('mousemove', (event) => {

                const rect = canvas.getBoundingClientRect();
                const newX = event.clientX - rect.left;
                const newY = event.clientY - rect.top;
                mouseX = newX;
                mouseY = newY;
            if (isDrawing && currentLine) {
                currentLine.drag(newX, newY);
                //addPointToLine(event);
                canvas.dispatchEvent(drawingChangedEvent); // Trigger drawing change
                
            } else if (!isDrawing){
                if (pinPreview && selectedPin) {
                    pinPreview.move(newX, newY);  // Update preview position
                    canvas.dispatchEvent(toolMovedEvent); // Trigger preview render
                }
                if(toolPreview) {
                    if(toolPreview) toolPreview.move(newX, newY); // Update tool preview position
                    if(pinPreview) pinPreview.move(newX, newY);
                    canvas.dispatchEvent(toolMovedEvent); // Trigger tool-moved event
                }
            } 
        });
        const updateToolSelection = (selectedTool: HTMLButtonElement) => {
            const buttons = Array.from(pinButtonsContainer.children) as HTMLElement[];
            [thinTool, thickTool, ...buttons].forEach(button => {
                button.classList.remove('selectedTool');
            });
            // thinTool.classList.remove('selectedTool');
            // thickTool.classList.remove('selectedTool');
            selectedTool.classList.add('selectedTool');
        };
        updateToolSelection(thinTool);
        thinTool.addEventListener('click', () => {
            currentToolThickness = thinBrushThickness; // Thin marker
            toolPreview = new ToolPreview(currentToolThickness, currentHue); // Update preview thickness
            pinPreview = null;
            selectedPin = null;
            updateToolSelection(thinTool);
        });
        
        thickTool.addEventListener('click', () => {
            currentToolThickness = thickBrushThickness; // Thick marker
            toolPreview = new ToolPreview(currentToolThickness, currentHue); // Update preview thickness
            pinPreview = null;
            selectedPin = null;    
            updateToolSelection(thickTool);
        });
        const createPinButton = (pin: {emoji: string; label: string}) => {
            const button = document.createElement("button");
            button.textContent = pin.emoji + " " + pin.label;
            button.addEventListener("click", () => selectPin(pin.emoji, button));
            pinButtonsContainer.appendChild(button);
        };
        customPinButton.addEventListener("click", () => {
            const emoji = prompt("Enter an emoji for your custom Pin:", "😊");
            if (emoji) {
                const newPin = { emoji: emoji, label: "Custom" };
                pins.push(newPin); // Add to Pins array
                createPinButton(newPin); // Generate button for new Pin 
                
                selectedPin = emoji;
                pinPreview = new PinPreview(emoji, currentRotation);
                updateToolSelection(customPinButton); 
                if (pinPreview) pinPreview.move(mouseX, mouseY);
                canvas.dispatchEvent(toolMovedEvent); 
            }
        });
        
    
        // Loop through the Pins array to generate initial buttons
        pins.forEach(pin => createPinButton(pin));

        const selectPin = (emoji: string, button: HTMLButtonElement) => {
            selectedPin = emoji;
            //isDrawing = false;
            pinPreview = new PinPreview(emoji, currentRotation);
            toolPreview = null;
            updateToolSelection(button);
            if (pinPreview) pinPreview.move(mouseX, mouseY);
            canvas.dispatchEvent(toolMovedEvent); // Trigger tool-moved event to update preview
        };
        // customPinButton.addEventListener("click", () => {
        //     const emoji = prompt("Enter an emoji for a custom Pin:", "😊");
        //     if (emoji) {
        //         const newPin = { emoji: emoji, label: "Custom" };
        //         pins.push(newPin); // Add to Pins array
        //         createPinButton(newPin); // Generate button for new Pin
        //     }
        // });
      //  checkPin.addEventListener('click', () => selectPin("✅", checkPin));
        //firePin.addEventListener('click', () => selectPin("🔥", firePin));
        //pumpkinPin.addEventListener('click', () => selectPin("🎃", pumpkinPin));

         // Stop drawing when mouse is released
         canvas.addEventListener('mouseup', () => {
            //isDrawing = false;
            if (isDrawing && currentLine) {
                lines.push(currentLine);  // Save the line
                currentLine = null;
                toolPreview = new ToolPreview(currentToolThickness, currentHue); // Show tool preview after drawing
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
                if(!isDrawing && pinPreview){
                    pinPreview.draw(ctx);
                }
            }
        };
        // Get the slider element


// Update slider value handler
toolSlider.addEventListener("input", (event) => {
    const value = parseInt(toolSlider.value, 10);
    if (selectedPin) {
       currentRotation = value; // For stamps, set rotation
       if (pinPreview) pinPreview.setRotation(currentRotation);
    } else {
        currentHue = value; // For brushes, set color hue
        if (toolPreview) toolPreview.setColorHue(currentHue);
    }
    canvas.dispatchEvent(toolMovedEvent); // Update preview with new properties
});
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
        const exportCanvas = () => {
            // Step 1: Create a temporary 1024x1024 canvas
            const exportCanvas = document.createElement("canvas");
            exportCanvas.width = 1024;
            exportCanvas.height = 1024;
            const exportCtx = exportCanvas.getContext("2d");
        
            if (!exportCtx) return; // Ensure the context is available
        
            // Step 2: Scale the context to enlarge the drawing by 4x
            exportCtx.scale(4, 4); // Scale from 256x256 to 1024x1024
        
            // Step 3: Render each item in the display list on the scaled canvas
            for (const item of lines) {
                item.display(exportCtx); // Use display method to draw each line or Pin
            }
        
            // Step 4: Convert the canvas to a data URL and trigger a download
            exportCanvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "canvas_export.png";
                    a.click();
                    URL.revokeObjectURL(url); // Clean up
                }
            }, "image/png");
        };
        
        // Attach the export function to the export button
        exportButton.addEventListener("click", exportCanvas);
    }
    // Get the export button element





};


document.title = APP_NAME;
app.innerHTML = APP_NAME;
