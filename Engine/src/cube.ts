export class Cube3D {

    public vao: WebGLVertexArrayObject;
    private gl: WebGL2RenderingContext;
    private vertexCount: number;

    private static readonly FACE_CORNERS: number[][] = [

        [0, 1, 2, 3],
        [5, 4, 7, 6],
        [4, 0, 3, 7],
        [1, 5, 6, 2],
        [4, 5, 1, 0],
        [3, 2, 6, 7],
    ];

    private static readonly DEFAULT_COLORS: [number, number, number][] = [

        [0, 0, 1], // front
        [0, 0, 1], // back
        [1, 0, 0], // left
        [1, 0, 0], // right
        [0, 1, 0], // top
        [0, 1, 0], // bottom
    ];

    // private static readonly QUAD_UV: [number, number][] = [

    //     [0, 1], [1, 1], [1, 0], [0, 0],
    // ];

    constructor(
        gl: WebGL2RenderingContext,
        program: WebGLProgram,
        origin: [number, number, number] = [0, 0, 0],
        width: number = 1,
        height: number = 1,
        depth: number = 1,
        faceColors: [number, number, number][] = Cube3D.DEFAULT_COLORS
    ) {

        if (faceColors.length !== 6) {

            throw new Error('Cube3D requires exactly 6 face colors');
        }

        this.gl = gl;

        const [ox, oy, oz] = origin;
        const hw = width / 2;
        const hh = height / 2;
        const hd = depth / 2;

        const positions: [number, number, number][] = [

            [ox - hw, oy + hh, oz - hd], // 0
            [ox + hw, oy + hh, oz - hd], // 1
            [ox + hw, oy - hh, oz - hd], // 2
            [ox - hw, oy - hh, oz - hd], // 3
            [ox - hw, oy + hh, oz + hd], // 4
            [ox + hw, oy + hh, oz + hd], // 5
            [ox + hw, oy - hh, oz + hd], // 6
            [ox - hw, oy - hh, oz + hd], // 7
        ];

        const vertexData: number[] = [];

        for (let f = 0; f < Cube3D.FACE_CORNERS.length; f++) {
            const face = Cube3D.FACE_CORNERS[f];
            const triLocalIndices = [0, 1, 2, 0, 2, 3];

            for (const localIndex of triLocalIndices) {

                const cornerIndex = face[localIndex];
                const [x, y, z] = positions[cornerIndex];
                // const [u, v] = Cube3D.QUAD_UV[localIndex];
                const [r, g, b] = faceColors[f];

                vertexData.push(x, y, z, r, g, b);
            }
        }

        const vertices = new Float32Array(vertexData);
        this.vertexCount = vertices.length / 6;

        const vao = gl.createVertexArray();
        if (!vao) throw new Error('Failed to create VAO');
        this.vao = vao;
        gl.bindVertexArray(vao);

        // After binding the VAO, pass the V-Buffer into the shader program.

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