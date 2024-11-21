

export class ToolPreview 
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