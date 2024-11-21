import { Drawable } from "./drawable";

export class StickerCommand implements Drawable {
    private x: number;
    private y: number;
    private sticker: string;
    private rotation: number;

    constructor(x: number, y: number, sticker: string) {
        this.x = x;
        this.y = y;
        this.sticker = sticker;
        this.rotation = Math.random() * 2 * Math.PI;
    }

    drag(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    display(ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.font = "24px Arial";
        ctx.fillText(this.sticker, -12, 12);
        ctx.restore();
    }
}