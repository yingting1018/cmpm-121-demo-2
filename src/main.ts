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

canvas.addEventListener("mousedown", (event: MouseEvent) =>
{
    isDrawing = true;
    x = event.offsetX;
    y = event.offsetY;
});
canvas.addEventListener('mousemove', (event: MouseEvent) =>
{
    if (isDrawing && context)
    {
        drawLine(context, x, y, event.offsetX, event.offsetY)
        x = event.offsetX;
        y = event.offsetY;
    }
});
self.addEventListener("mouseup", (event: MouseEvent) =>
{
    if (isDrawing && context)
    {
        drawLine(context, x, y, event.offsetX, event.offsetY);
        isDrawing = false;
    }
});
clearBtn.addEventListener('click', () =>
{
    if (context) 
    {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }
})


function drawLine(context: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number)
{
    context.beginPath();
    context.strokeStyle = "black";
    context.lineWidth = 1;
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
    context.closePath();
}