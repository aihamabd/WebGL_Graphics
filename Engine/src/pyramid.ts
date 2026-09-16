export class Pyramid3D {

    public vao: WebGLVertexArrayObject;
    private gl: WebGL2RenderingContext;
    private vertexCount: number;

    private static readonly FACES: number[][] = [

        [0, 1, 2],
        [0, 2, 3],
        [0, 1, 4],
        [1, 2, 4],
        [2, 3, 4],
        [3, 0, 4],
    ];

    private static readonly DEFAULT_POSITIONS: [number, number, number][] = [

        [-0.5, 0.0, -0.5],  // back-left
        [0.5, 0.0, -0.5],  // back-right
        [0.5, 0.0, 0.5],  // front-right
        [-0.5, 0.0, 0.5],  // front-left
        [0.0, 0.8, 0.0],  // apex
    ];

    private static readonly DEFAULT_COLORS: [number, number, number][] = [

        [1, 0, 0],  // red
        [1, 0, 0],  // red
        [0, 1, 0],  // green
        [0, 0, 1],  // blue
        [1, 1, 0],  // yellow
        [1, 0, 1],  // magenta
    ];

    constructor(
        gl: WebGL2RenderingContext,
        program: WebGLProgram,
        positions: [number, number, number][] = Pyramid3D.DEFAULT_POSITIONS,
        colors: [number, number, number][] = Pyramid3D.DEFAULT_COLORS
    ) {

        this.gl = gl;

        if (positions.length !== 5 || colors.length !== 6) {

            throw new Error('Pyramid requires exactly 5 positions and 5 colors');
        }

        const vertexData: number[] = [];

        for (let f = 0; f < Pyramid3D.FACES.length; f++) {

            const face = Pyramid3D.FACES[f];
            const [r, g, b] = colors[f];

            for (const cornerIndex of face) {
                const [x, y, z] = positions[cornerIndex];
                vertexData.push(x, y, z, r, g, b);
            }
        }

        const vertices = new Float32Array(vertexData);
        this.vertexCount = vertices.length / 6;

        const vao = gl.createVertexArray();
        if (!vao) throw new Error('Failed to create VAO');
        this.vao = vao;
        gl.bindVertexArray(vao);

        // After binding the VAO, pass the V-Buffer and I-Buffer into the shader program.

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
            this.gl.drawArrays(this.gl.TRIANGLES, 0, this.vertexCount);
    }
}