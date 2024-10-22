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

let drawingLines: Array<MarkerLine> = [];
let currentLine: MarkerLine | null = null;
let redoStack: Array<MarkerLine> = [];
let lineWidth: number = 1;
let toolPreview: ToolPreview | null = null;

class MarkerLine
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
    constructor (x: number, y: number, thickness: number)
    {
        this.x = x;
        this.y = y;
        this.thickness = thickness;
    }
    updatePosition(x: number, y: number)
    {
        this.x = x;
        this.y = y;
    }
    draw(ctx: CanvasRenderingContext2D)
    {
        ctx.beginPath();
        ctx.strokeStyle = "gray";
        ctx.lineWidth = 1;
        ctx.arc(this.x, this.y, this.thickness / 2, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();
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

thin.addEventListener('click', () =>
{
    lineWidth = 1;
});

thick.addEventListener('click', () =>
{
    lineWidth = 5;
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
    isDrawing = true;
    x = event.offsetX;
    y = event.offsetY;
    currentLine = new MarkerLine(x, y, lineWidth);
});
canvas.addEventListener('mousemove', (event: MouseEvent) =>
{
    x = event.offsetX;
    y = event.offsetY;
    if (isDrawing && currentLine)
    {
        x = event.offsetX;
        y = event.offsetY;
        currentLine.drag( x,y );
        const drawingChangedEvent = new Event('drawing-changed')
        canvas.dispatchEvent(drawingChangedEvent);
    }
    else
    {
        if (!isDrawing)
        {
            if (!toolPreview)
            {
                toolPreview = new ToolPreview(x, y, lineWidth);
            }else 
            {
                toolPreview.updatePosition(x, y);
            }
            canvas.dispatchEvent(new Event('preview-changed'));
        }
    }
});
self.addEventListener("mouseup", () =>
{
    if (isDrawing && currentLine)
    {
        isDrawing = false;
        drawingLines.push(currentLine);
        currentLine = null;
    }
});
canvas.addEventListener('drawing-changed', () =>
{
    if (context) 
    {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawingLines.forEach(line =>
            {
                line.display(context);
            });
    }
});
canvas.addEventListener('preview-changed', () =>
{
    if (context) 
    {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawingLines.forEach(line =>
            {
                line.display(context);
            });
            if (toolPreview)
            {
                toolPreview.draw(context);
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