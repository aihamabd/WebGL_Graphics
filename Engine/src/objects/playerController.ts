export class playerController {

    private verticalVelocity: number;
    private movementSpeed: number;

    private readonly gravity: number;
    private readonly jumpForce: number;
    private readonly groundY: number;

    private flightEnabled: boolean;
    private readonly flightSpeed: number;

    constructor(
        groundY: number = 0.5,
        gravity: number = -9.8,
        jumpForce: number = 3.5,
        flightSpeed: number = 15,
        movementSpeed: number = 1
    ) {

        this.verticalVelocity = 0;
        this.groundY = groundY;
        this.gravity = gravity;
        this.jumpForce = jumpForce;

        this.flightEnabled = true;
        this.flightSpeed = flightSpeed;

        this.movementSpeed = movementSpeed;
    }

    public setFlightEnabled(enabled: boolean) {

        this.flightEnabled = enabled;
        this.verticalVelocity = 0; // reset so re-entering gravity mode doesn't carry stale momentum
    }

    public toggleFlight() {

        this.setFlightEnabled(!this.flightEnabled);
    }

    public isFlightEnabled(): boolean {

        return this.flightEnabled;
    }

    public isGrounded(currentY: number): boolean {

        return currentY <= this.groundY;
    }

    public jump(currentY: number) {

        if (this.flightEnabled) return; // no jump physics while flying

        if (this.isGrounded(currentY)) {
            this.verticalVelocity = this.jumpForce;
        }
    }

    // upInput: -1 to 1 (e.g. Shift/Space), only used in flight mode
    public getVerticalDelta(dt: number, currentY: number, upInput: number = 0): number {

        if (this.flightEnabled) {

            return upInput * this.flightSpeed * dt * this.movementSpeed; // direct fly control, no gravity
        }

        this.verticalVelocity += this.gravity * dt;

        let nextY = currentY + this.verticalVelocity * dt;

        if (nextY <= this.groundY) {
            nextY = this.groundY;
            this.verticalVelocity = 0;
        }

        return nextY - currentY;
    }
}