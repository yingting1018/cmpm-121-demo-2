import { Drawable } from "./drawable";

export class MarkerLine implements Drawable
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