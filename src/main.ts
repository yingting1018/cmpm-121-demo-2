import "./style.css";

const APP_NAME = "yingting's game";
const app = document.querySelector<HTMLDivElement>("#app")!;

document.title = APP_NAME;
app.innerHTML = APP_NAME;

const gameName = "Sticker Sketchpad";
document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

interface Drawable {
    display(ctx: CanvasRenderingContext2D): void;
}
const canvas: HTMLCanvasElement = document.createElement('canvas');
canvas.className = 'canvas-class';
canvas.width = 256;
canvas.height = 256;
app.append(canvas);
const context = canvas.getContext("2d");
const clearBtn = document.createElement('button');
clearBtn.innerText = 'Clear';
app.append(clearBtn);
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

class MarkerLine implements Drawable
{
    private points: Array<{ x: number, y: number }> = [];
    private thickness: number;
    constructor(initialX: number, initialY: number, thickness: number)
    {
        this.points.push({ x: initialX, y: initialY });
        this.thickness = thickness;
    }
    drag(x: number, y: number)
    {
        this.points.push({ x, y});
    }

    display(ctx: CanvasRenderingContext2D)
    {
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.lineWidth = this.thickness;
        this.points.forEach((point, index) =>
        {
            if (index === 0) 
            {
                ctx.moveTo(point.x, point.y);
            } else
            {
                ctx.lineTo(point.x, point.y);
            }
        });
        ctx.stroke();
        ctx.closePath();
    }
}
class ToolPreview 
{
    private x: number;
    private y: number;
    private thickness: number;
    private visible: boolean;
    constructor (x: number, y: number, thickness: number)
    {
        this.x = x;
        this.y = y;
        this.thickness = thickness;
        this.visible = true;
    }
    updatePosition(x: number, y: number)
    {
        this.x = x;
        this.y = y;
    }
    updateThickness(thickness: number) {
        this.thickness = thickness;
    }
    setVisible(visible: boolean)
    {
        this.visible = visible;
    }
    draw(ctx: CanvasRenderingContext2D)
    {
        if (this.visible)
        {
            ctx.beginPath();
            ctx.strokeStyle = "gray";
            ctx.lineWidth = 5;
            ctx.arc(this.x, this.y, this.thickness, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.closePath();
        }
    }
}
class StickerCommand implements Drawable {
    private x: number;
    private y: number;
    private sticker: string;

    constructor(x: number, y: number, sticker: string) {
        this.x = x;
        this.y = y;
        this.sticker = sticker;
    }

    drag(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    display(ctx: CanvasRenderingContext2D) {
        ctx.font = "24px Arial";
        ctx.fillText(this.sticker, this.x - 10, this.y + 10);
    }
}
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

const sticker1 = document.createElement('button');
sticker1.innerText = '🐱';  
app.append(sticker1);

const sticker2 = document.createElement('button');
sticker2.innerText = '🍎';  
app.append(sticker2);

const sticker3 = document.createElement('button');
sticker3.innerText = '🍀'; 
app.append(sticker3);


sticker1.addEventListener('click', () => {
    currentSticker = '🐱';
    // currentStickerCommand = new StickerCommand(x, y, currentSticker);
    // canvas.dispatchEvent(new Event('tool-moved'));
});

sticker2.addEventListener('click', () => {
    currentSticker = '🍎';
    // currentStickerCommand = new StickerCommand(x, y, currentSticker);
    // canvas.dispatchEvent(new Event('tool-moved'));
});

sticker3.addEventListener('click', () => {
    currentSticker = '🍀';
    // currentStickerCommand = new StickerCommand(x, y, currentSticker);
    // canvas.dispatchEvent(new Event('tool-moved'));
});

thin.addEventListener('click', () =>
{
    lineWidth = 1;
    if (toolPreview) toolPreview.updateThickness(lineWidth);
});

thick.addEventListener('click', () =>
{
    lineWidth = 5;
    if (toolPreview) toolPreview.updateThickness(lineWidth);
});
undo.addEventListener('click', () =>
{
    if (drawingLines.length > 0)
    {
        const lastLine = drawingLines.pop();
        if (lastLine) 
        {
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
                // Live updating and preview of the emoji at current mouse position
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
clearBtn.addEventListener('click', () =>
{
    if (context) 
    {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawingLines = [];
        redoStack = [];
    }
});