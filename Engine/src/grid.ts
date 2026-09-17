export class Grid {

    public vao: WebGLVertexArrayObject;
    private gl: WebGL2RenderingContext;
    private vertexCount: number;

    constructor(
        gl: WebGL2RenderingContext,
        program: WebGLProgram,
        size: number = 50,        // total width/depth of the grid
        divisions: number = 50,   // number of grid cells per side
        y: number = 0,            // height of the grid plane
        color: [number, number, number] = [0.15, 0.15, 0.15]
    ) {

        this.gl = gl;

        const [r, g, b] = color;
        const half = size / 2;
        const step = size / divisions;

        const vertexData: number[] = [];

        // lines running along X (varying Z)
        for (let i = 0; i <= divisions; i++) {

            const z = -half + i * step;

            vertexData.push(-half, y, z, r, g, b);
            vertexData.push(half, y, z, r, g, b);
        }

        // lines running along Z (varying X)
        for (let i = 0; i <= divisions; i++) {

            const x = -half + i * step;

            vertexData.push(x, y, -half, r, g, b);
            vertexData.push(x, y, half, r, g, b);
        }

        const vertices = new Float32Array(vertexData);
        this.vertexCount = vertices.length / 6;

        const vao = gl.createVertexArray();
        if (!vao) throw new Error('Failed to create VAO');
        this.vao = vao;
        gl.bindVertexArray(vao);

        const vbo = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        const positionLoc = gl.getAttribLocation(program, 'vertexPosition');
        const colorLoc = gl.getAttribLocation(program, 'vertexColor');

        gl.enableVertexAttribArray(positionLoc);
        gl.enableVertexAttribArray(colorLoc);

        gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 0);
        gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 6 * Float32Array.BYTES_PER_ELEMENT, 3 * Float32Array.BYTES_PER_ELEMENT);

        gl.bindVertexArray(null);
    }

    public draw() {

        this.gl.bindVertexArray(this.vao);
        this.gl.drawArrays(this.gl.LINES, 0, this.vertexCount);
    }
}