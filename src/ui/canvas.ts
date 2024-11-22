import { MarkerLine } from "../models/markerline";
import { Drawable } from "../models/drawable";

export function setupCanvas(app: HTMLDivElement) {
    const canvas = document.createElement("canvas");
    canvas.className = "canvas-class";
    app.append(canvas);
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext("2d")!;
    return { canvas, context };
}

export function setupClearButton(app: HTMLDivElement, context: CanvasRenderingContext2D, canvas:HTMLCanvasElement, drawingLines: Array<Drawable>, redoStack: Array<MarkerLine>) {
    const clearBtn = document.createElement("button");
    clearBtn.innerText = "Clear";
    app.append(clearBtn);

    // clearBtn.addEventListener("click", () => {
    //     context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    // });
    
    return clearBtn;
}