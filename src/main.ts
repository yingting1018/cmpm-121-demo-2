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

let drawingPoints: Array<Array<{ x: number, y: number}>> = [];
let currentLine: Array<{ x: number, y: number}> = [];

canvas.addEventListener("mousedown", (event: MouseEvent) =>
{
    isDrawing = true;
    x = event.offsetX;
    y = event.offsetY;
    currentLine = [{ x,y }];
});
canvas.addEventListener('mousemove', (event: MouseEvent) =>
{
    if (isDrawing)
    {
        // drawLine(context, x, y, event.offsetX, event.offsetY)
        x = event.offsetX;
        y = event.offsetY;
        currentLine.push({ x,y });

        const drawingChangedEvent = new Event('drawing-changed')
        canvas.dispatchEvent(drawingChangedEvent);
    }
});
self.addEventListener("mouseup", () =>
{
    if (isDrawing)
    {
        // drawLine(context, x, y, event.offsetX, event.offsetY);
        isDrawing = false;
        drawingPoints.push(currentLine);
    }
});
canvas.addEventListener('drawing-changed', () =>
{
    if (context) 
    {
        context.clearRect(0, 0, canvas.width, canvas.height);

        drawingPoints.forEach(line =>
            {
                drawLine(context, line);
            });
        if (currentLine.length > 1)
        {
            drawLine(context, currentLine)
        }
    }
});
clearBtn.addEventListener('click', () =>
{
    if (context) 
    {
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawingPoints = [];
        currentLine = [];
    }
})


function drawLine(context: CanvasRenderingContext2D, line: Array<{ x: number, y: number }>)
{
    context.beginPath();
    context.strokeStyle = "black";
    context.lineWidth = 1;
    line.forEach((point, index) => 
    {
        if (index === 0)
        {
            context.moveTo(point.x, point.y);
        } else {
            context.lineTo(point.x, point.y);
        }
    })
    // context.moveTo(x1, y1);
    // context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
}