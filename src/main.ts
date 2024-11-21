import "./style.css";
import { setupCanvas, setupClearButton } from "./ui/canvas";
import { MarkerLine } from "./models/markerline";
import { stickers } from "./consts";
import { setupHeader } from "./ui/header";
import { APP_NAME, gameName } from "./consts";
import { Drawable } from "./models/drawable";
import { ToolPreview } from "./models/toolpreview";
import { StickerCommand } from "./models/stickercommand";

const app = document.querySelector<HTMLDivElement>("#app")!;
app.innerHTML = APP_NAME;

setupHeader(app, gameName);
const {canvas, context} = setupCanvas(app); 


let isDrawing = false;
let x: number = 0;
let y: number = 0;

let drawingLines: Array<Drawable> = [];
let currentLine: MarkerLine | null = null;
let redoStack: Array<MarkerLine> = [];
let lineWidth: number = 1;
let toolPreview: ToolPreview | null = null;
let currentSticker: string | null = null;
let currentStickerCommand: StickerCommand | null = null;
let isDragging = false;

const clearBtn = setupClearButton(app, context, canvas, drawingLines, redoStack);

const customStickerButton = document.createElement("button");
customStickerButton.innerText = "Custom Sticker";
app.append(customStickerButton);

const redo = document.createElement('button');
redo.innerText = 'Redo';
app.append(redo);

const undo = document.createElement('button');
undo.innerText = 'Undo';
app.append(undo);

const thin = document.createElement('button');
thin.innerText = 'Thin Marker';
app.append(thin);

const thick = document.createElement('button');
thick.innerText = 'Thick Marker';
app.append(thick);

const exportbtn = document.createElement('button');
exportbtn.innerText = 'Export';
app.append(exportbtn);


clearBtn.addEventListener('click', () =>
{
    if (context) 
    {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawingLines = [];
        redoStack = [];
    }
});

function renderStickerButtons() 
{
    stickers.forEach(({ label, icon }) =>
    {
        const stickerButton = document.createElement("button");
        stickerButton.innerText = label;
        stickerButton.addEventListener("click", () =>
        {
            currentSticker = icon;
        });
        app.append(stickerButton);
    });
}
renderStickerButtons();

customStickerButton.addEventListener("click", () =>
{
    const customSticker = prompt("Enter your custom sticker:", "");
    if (customSticker)
    {
        stickers.push({ label: customSticker, icon: customSticker });
        const newStickerButton = document.createElement("button");
        newStickerButton.innerText = customSticker;
        newStickerButton.addEventListener("click", () =>
        {
            currentSticker = customSticker;
        });
        app.append(newStickerButton);
    }
});

thin.addEventListener('click', () =>
{
    lineWidth = 2;
    if (toolPreview) toolPreview.updateThickness(lineWidth);
});

thick.addEventListener('click', () =>
{
    lineWidth = 5;
    if (toolPreview) toolPreview.updateThickness(lineWidth);
});
undo.addEventListener('click', () =>
{
    if (drawingLines.length > 0) {
        const lastLine = drawingLines.pop();
        if (lastLine instanceof MarkerLine) {
            redoStack.push(lastLine);
        }
        canvas.dispatchEvent(new Event('drawing-changed'));
    }
});

redo.addEventListener('click', () =>
{
    if (redoStack.length > 0)
    {
        const lineRedo = redoStack.pop();
        if (lineRedo)
        {
            drawingLines.push(lineRedo);
        }
        canvas.dispatchEvent(new Event('drawing-changed'));
    }
})
canvas.addEventListener("mousedown", (event: MouseEvent) =>
{
    x = event.offsetX;
    y = event.offsetY;

    if (currentSticker) {
        isDragging = true;
        currentStickerCommand = new StickerCommand(x, y, currentSticker);
    } else {
        isDrawing = true;
        currentLine = new MarkerLine(x, y, lineWidth);
    }

    if (toolPreview) {
        toolPreview.setVisible(false);
    }

    canvas.dispatchEvent(new Event('preview-changed'));
});
canvas.addEventListener('mousemove', (event: MouseEvent) => {
    x = event.offsetX;
    y = event.offsetY;

    if (isDrawing && currentLine) {
        currentLine.drag(x, y);
        canvas.dispatchEvent(new Event('drawing-changed'));
    } else if (isDragging && currentStickerCommand) {
            currentStickerCommand.drag(x, y);
            canvas.dispatchEvent(new Event('preview-changed'));
    } else if (currentSticker) {
        if (currentStickerCommand) {
                currentStickerCommand.drag(x, y);
            } else {
                currentStickerCommand = new StickerCommand(x, y, currentSticker);
            }
                canvas.dispatchEvent(new Event('preview-changed'));
        } else {
            if (!toolPreview) {
                toolPreview = new ToolPreview(x, y, lineWidth);
            } else {
                toolPreview.updatePosition(x, y);
                toolPreview.updateThickness(lineWidth);
            }
            canvas.dispatchEvent(new Event('preview-changed'));
        }
});
self.addEventListener("mouseup", (event: MouseEvent) =>
{
    x = event.offsetX; 
    y = event.offsetY;
    if (isDragging && currentStickerCommand) {
        currentStickerCommand.drag(x, y);  
        drawingLines.push(currentStickerCommand); 
        currentSticker = null; 
        currentStickerCommand = null;
        isDragging = false;
        canvas.dispatchEvent(new Event('drawing-changed'));
    }

    if (isDrawing && currentLine) {
        isDrawing = false;
        drawingLines.push(currentLine);
        currentLine = null;
    }

    if (toolPreview) {
        toolPreview.setVisible(true);
    }
});
canvas.addEventListener('drawing-changed', () =>
{
    if (context) 
    {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawingLines.forEach(line => line.display(context));
        currentLine?.display(context);
    }
});
canvas.addEventListener('preview-changed', () =>
{
    if (context) 
    {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawingLines.forEach(line => line.display(context));
            if (toolPreview)
            {
                toolPreview.draw(context);
            }
            if (currentStickerCommand)
            {
                currentStickerCommand.display(context);
            }
    }
});
exportbtn.addEventListener('click', () =>
{
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = 1024;
    exportCanvas.height = 1024;
    const exportContext = exportCanvas.getContext('2d');
    if (!exportContext) return;
    exportContext.scale(4, 4);
    drawingLines.forEach(line => line.display(exportContext));

    const anchor = document.createElement("a");
    anchor.href = exportCanvas.toDataURL("image/png");
    anchor.download = "sketchpad.png";
    anchor.click();
})