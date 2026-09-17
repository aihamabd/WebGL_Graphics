export class playerController {

    private verticalVelocity: number;
    private readonly gravity: number;
    private readonly jumpForce: number;
    private readonly groundY: number;

    constructor(groundY: number = 0.5, gravity: number = -9.8, jumpForce: number = 3.5) {

        this.verticalVelocity = 0;
        this.groundY = groundY;
        this.gravity = gravity;
        this.jumpForce = jumpForce;
    }

    public isGrounded(currentY: number): boolean {
        return currentY <= this.groundY;
    }

    public jump(currentY: number) {

        if (this.isGrounded(currentY)) {
            this.verticalVelocity = this.jumpForce;
        }
    }

    // returns how much Y should change this frame, and clamps if landing
    public getVerticalDelta(dt: number, currentY: number): number {

        this.verticalVelocity += this.gravity * dt;

        let nextY = currentY + this.verticalVelocity * dt;

        if (nextY <= this.groundY) {
            nextY = this.groundY;
            this.verticalVelocity = 0;
        }

        return nextY - currentY; // the delta, not the absolute position
    }
}