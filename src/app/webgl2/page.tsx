'use client';

import { useEffect } from 'react';

export default function () {
  useEffect(() => {
    const vec2 = {
      create: function () {
        return new Float32Array(2);
      },
      set: function (out, x, y) {
        out[0] = x;
        out[1] = y;
        return out;
      },
      copy: function (out, a) {
        out[0] = a[0];
        out[1] = a[1];
        return out;
      },
    };
    const vec3 = {
      create: function () {
        return new Float32Array(3);
      },
      set: function (out, x, y, z) {
        out[0] = x;
        out[1] = y;
        out[2] = z;
        return out;
      },
      copy: function (out, a) {
        out[0] = a[0];
        out[1] = a[1];
        out[2] = a[2];
        return out;
      },
      add: function (out, a, b) {
        out[0] = a[0] + b[0];
        out[1] = a[1] + b[1];
        out[2] = a[2] + b[2];
        return out;
      },
      sub: function (out, a, b) {
        out[0] = a[0] - b[0];
        out[1] = a[1] - b[1];
        out[2] = a[2] - b[2];
        return out;
      },
    };
    const vec4 = {
      create: function () {
        return new Float32Array(4);
      },
      set: function (out, x, y, z, w) {
        out[0] = x;
        out[1] = y;
        out[2] = z;
        out[3] = w;
        return out;
      },
    };
    const mat4 = {
      create: function () {
        return new Float32Array(16);
      },
    };
    function dot3(a, b) {
      return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    }
    function cross(out, a, b) {
      out[0] = a[1] * b[2] - a[2] * b[1];
      out[1] = a[2] * b[0] - a[0] * b[2];
      out[2] = a[0] * b[1] - a[1] * b[0];
    }
    function normalize(v) {
      const r = Math.sqrt(dot3(v, v));
      if (r > 0.0) {
        v[0] /= r;
        v[1] /= r;
        v[2] /= r;
      }
    }
    const xaxis = vec3.create();
    const yaxis = vec3.create();
    const zaxis = vec3.create();
    function lookat(m, eye, center, up) {
      vec3.sub(zaxis, eye, center);
      normalize(zaxis);

      cross(xaxis, up, zaxis);
      normalize(xaxis);

      cross(yaxis, zaxis, xaxis);

      m[0] = xaxis[0];
      m[4] = xaxis[1];
      m[8] = xaxis[2];
      m[12] = -dot3(xaxis, eye);
      m[1] = yaxis[0];
      m[5] = yaxis[1];
      m[9] = yaxis[2];
      m[13] = -dot3(yaxis, eye);
      m[2] = zaxis[0];
      m[6] = zaxis[1];
      m[10] = zaxis[2];
      m[14] = -dot3(zaxis, eye);
      m[3] = 0;
      m[7] = 0;
      m[11] = 0;
      m[15] = 1.0;

      return m;
    }

    const screenWidth = 640;
    const screenHeight = 480;
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    canvas.width = screenWidth;
    canvas.height = screenHeight;
    canvas.style['left'] = (window.innerWidth - screenWidth) / 2 + 'px';
    canvas.style['top'] = (window.innerHeight - screenHeight) / 2 + 'px';
    canvas.style['position'] = 'absolute';
    window.addEventListener('resize', () => {
      canvas.style['left'] = (window.innerWidth - screenWidth) / 2 + 'px';
      canvas.style['top'] = (window.innerHeight - screenHeight) / 2 + 'px';
    });
    const gl = canvas.getContext('webgl2');

    const quadVBO = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadVBO);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1.0, 1.0, 0.0, 1.0, -1.0, -1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 0.0]),
      gl.STATIC_DRAW
    );
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    function drawQuad() {
      gl.bindBuffer(gl.ARRAY_BUFFER, quadVBO);
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 4 * 4, 0);
      gl.enableVertexAttribArray(1);
      gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 4 * 4, 2 * 4);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    function loadShader(type, source) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    }
    function initShaderProgram(vsSource, fsSource) {
      const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource);
      const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource);
      const shaderProgram = gl.createProgram();
      gl.attachShader(shaderProgram, vertexShader);
      gl.attachShader(shaderProgram, fragmentShader);
      gl.linkProgram(shaderProgram);
      if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
      }
      return shaderProgram;
    }
    class Shader {
      constructor(vsSource, fsSource) {
        this.shaderProgram = initShaderProgram(vsSource, fsSource);
      }
      use() {
        gl.useProgram(this.shaderProgram);
      }
      setInt(name, value) {
        const location = gl.getUniformLocation(this.shaderProgram, name);
        gl.uniform1i(location, value);
      }
      setFloat(name, value) {
        const location = gl.getUniformLocation(this.shaderProgram, name);
        gl.uniform1f(location, value);
      }
      setVec3(name, value) {
        const location = gl.getUniformLocation(this.shaderProgram, name);
        gl.uniform3fv(location, value);
      }
      setVec4(name, value) {
        const location = gl.getUniformLocation(this.shaderProgram, name);
        gl.uniform4fv(location, value);
      }
      setMat4(name, value) {
        const location = gl.getUniformLocation(this.shaderProgram, name);
        gl.uniformMatrix4fv(location, false, value);
      }
    }

    const PosScaleBias = vec4.create();
    const UVScaleBias = vec4.create();
    const InvTargetSizeAndTextureSize = vec4.create();
    function drawRect(
      X,
      Y,
      SizeX,
      SizeY,
      U,
      V,
      SizeU,
      SizeV,
      TargetSizeX,
      TargetSizeY,
      TextureSizeX,
      TextureSizeY,
      VertexShader
    ) {
      vec4.set(PosScaleBias, SizeX, SizeY, X, Y);
      vec4.set(UVScaleBias, SizeU, SizeV, U, V);

      vec4.set(
        InvTargetSizeAndTextureSize,
        1.0 / TargetSizeX,
        1.0 / TargetSizeY,
        1.0 / TextureSizeX,
        1.0 / TextureSizeY
      );

      VertexShader.setVec4('PosScaleBias', PosScaleBias);
      VertexShader.setVec4('UVScaleBias', UVScaleBias);
      VertexShader.setVec4('InvTargetSizeAndTextureSize', InvTargetSizeAndTextureSize);

      drawQuad();
    }
    const screen_vert = `
                        #version 100
                        attribute vec2 InPosition;
                        attribute vec2 InUV;

                        varying vec2 UV;

                        uniform vec4 PosScaleBias;
                        uniform vec4 UVScaleBias;
                        uniform vec4 InvTargetSizeAndTextureSize;

                        void main()
                        {
                            UV = (UVScaleBias.zw + InUV * UVScaleBias.xy) * InvTargetSizeAndTextureSize.zw;
                            gl_Position.xy = -1.0 + 2.0 * (PosScaleBias.zw + (InPosition * 0.5 + 0.5) * PosScaleBias.xy) * InvTargetSizeAndTextureSize.xy;
                            gl_Position.zw = vec2(0.0, 1.0);
                        }
                    `;
    const screen_frag = `
                        #version 100
                        precision highp float;
                        varying vec2 UV;
                        uniform sampler2D colorbuffer;
                        uniform float framecount;

                        void main()
                        {
                            vec3 color = texture2D(colorbuffer, UV).xyz;
                            gl_FragColor = vec4(color, 1.0);
                        }
                    `;
    const raytracing_frag = `
                        #version 100
                        precision highp float;
                        varying vec2 UV;

                        #define INV_PI 0.318310
                        #define TWO_PI 6.283185
                        #define EPSILON 0.000001

                        uniform float framecount;

                        float random(vec3 scale)
                        {
                            return fract(sin(dot(gl_FragCoord.xyz + framecount, scale)) * 43758.5453 + framecount);
                        }

                        struct Triangle
                        {
                            vec3 v0, v1, v2;
                            vec3 normal;
                        };
                        uniform Triangle triangles[32];

                        struct Ray
                        {
                            vec3 start;
                            vec3 direction;
                        };
                        Ray ray;

                        struct Interaction
                        {
                            vec3 position, normal;
                            int i;
                        };
                        Interaction interaction;

                        bool Triangle_intersect(Ray ray, Triangle triangle, out float t)
                        {
                            vec3 v0 = triangle.v0;
                            vec3 v1 = triangle.v1;
                            vec3 v2 = triangle.v2;
                            vec3 E1 = v1 - v0;
                            vec3 E2 = v2 - v0;

                            vec3 P = cross(ray.direction, E2);
                            float determinant = dot(P, E1);
                            if (determinant < EPSILON && determinant > -EPSILON)
                            {
                                return false;
                            }

                            float inv_determinant = 1.0 / determinant;

                            vec3 T = ray.start - v0;
                            float u = dot(P, T) * inv_determinant;
                            if (u > 1.0 || u < 0.0)
                            {
                                return false;
                            }

                            vec3 Q = cross(T, E1);
                            float v = dot(Q, ray.direction) * inv_determinant;
                            if (v > 1.0 || v < 0.0 || u + v > 1.0)
                            {
                                return false;
                            }

                            t = dot(Q, E2) * inv_determinant;
                            if (t <= 0.0)
                            {
                                return false;
                            }

                            return true;
                        }

                        bool intersect(Ray ray, out Triangle triangle, out int idx, out float t)
                        {
                            t = 10000.0;
                            idx = -1;
                            for (int i = 0; i < 32; ++i)
                            {
                                float _t;
                                if (Triangle_intersect(ray, triangles[i], _t))
                                {
                                    if (_t < t)
                                    {
                                        t = _t;
                                        idx = i;
                                    }
                                }
                            }
                            if (idx == -1)
                                return false;
                            for (int i = 0; i < 32; ++i)
                            {
                                if (idx == i)
                                {
                                    triangle = triangles[i];
                                    return true;
                                }
                            }
                            return false;
                        }

                        mat3 T;
                        void orthonormalBasis(vec3 N)
                        {
                            float sign = N.z > 0.0 ? 1.0 : -1.0;
                            float a = -1.0 / (sign + N.z);
                            float b = N.x * N.y * a;

                            T[0][0] = 1.0 + sign * N.x * N.x * a;
                            T[0][1] = sign * b;
                            T[0][2] = -sign * N.x;

                            T[1][0] = b;
                            T[1][1] = sign + N.y * N.y * a;
                            T[1][2] = -N.y;

                            T[2][0] = N.x;
                            T[2][1] = N.y;
                            T[2][2] = N.z;
                        }

                        #define balanceHeuristic(a, b) ((a) / ((a) + (b)))
                        #define lightColor vec3(200.0)
                        #define light_area 0.0893

                        float u0;
                        float u1;
                        float u2;

                        Triangle light;
                        vec3 light_pos;
                        int lightIdx;
                        void lightPoint()
                        {
                            float su = sqrt(u0);
                            if (u0 < 0.5)
                            {
                                lightIdx = 0;
                                light = triangles[0];
                            }
                            else
                            {
                                lightIdx = 1;
                                light = triangles[1];
                            }
                            light_pos = (1.0 - su) * light.v0 + (1.0 - u1) * su * light.v1 + u1 * su * light.v2;
                        }

                        vec3 Reflectance(int i)
                        {
                            if (i == 8 || i == 9)
                            {
                                return vec3(0.05, 0.65, 0.05);
                            }
                            else if (i == 10 || i == 11)
                            {
                                return vec3(0.65, 0.05, 0.05);
                            }
                            else
                            {
                                return vec3(0.65);
                            }
                        }
                        vec3 bsdf_absIdotN;
                        float bsdf_pdf;
                        bool sampleBSDF()
                        {
                            vec3 wi;
                            vec3 z;
                            z = vec3(T[2][0], T[2][1], T[2][2]);
                            wi.z = dot(z, ray.direction);

                            if (wi.z <= 0.0)
                            {
                                return false;
                            }

                            bsdf_pdf = wi.z * INV_PI;

                            bsdf_absIdotN = Reflectance(interaction.i) * INV_PI * abs(wi.z);

                            return bsdf_pdf > 0.0 ? true : false;
                        }

                        vec3 radiance;
                        void sampleLight()
                        {
                            radiance = vec3(0.0);
                            u0 = random(vec3(12.9898, 78.233, 151.7182));
                            u1 = random(vec3(63.7264, 10.873, 623.6736));
                            u2 = random(vec3(36.7539, 50.365, 306.2759));

                            lightPoint();

                            ray.start = interaction.position + interaction.normal * EPSILON;
                            ray.direction = normalize(light_pos - ray.start);

                            float cos_light_theta = dot(-ray.direction, light.normal);
                            if (cos_light_theta <= 0.0)
                            {
                                return;
                            }

                            float cos_theta = dot(ray.direction, interaction.normal);
                            if (cos_theta <= 0.0)
                            {
                                return;
                            }

                            Triangle triangle;
                            int idx;
                            float t;
                            if (!intersect(ray, triangle, idx, t))
                            {
                                return;
                            }
                            if (idx != lightIdx)
                            {
                                return;
                            }

                            if (!sampleBSDF())
                            {
                                return;
                            }

                            float light_pdf = t * t / (light_area * cos_light_theta);
                            float mis_weight = balanceHeuristic(light_pdf, bsdf_pdf);
                            radiance = mis_weight * bsdf_absIdotN * lightColor / (light_pdf * 0.5);
                        }

                        void cosWeightedHemi(void)
                        {
                            u0 = random(vec3(12.9898, 78.233, 151.7182));
                            u1 = random(vec3(63.7264, 10.873, 623.6736));

                            float r = sqrt(u0);
                            float azimuth = u1 * TWO_PI;

                            vec3 v = vec3(r * cos(azimuth), r * sin(azimuth), sqrt(1.0 - u0));

                            ray.start = interaction.position + interaction.normal * EPSILON;

                            vec3 x = vec3(T[0][0], T[1][0], T[2][0]);
                            vec3 y = vec3(T[0][1], T[1][1], T[2][1]);
                            vec3 z = vec3(T[0][2], T[1][2], T[2][2]);
                            ray.direction = vec3(dot(x, v), dot(y, v), dot(z, v));
                        }
                        #define max_depth 5
                        vec3 sample;
                        void sampleRay()
                        {
                            sample = vec3(0.0);
                            vec3 throughput = vec3(1.0);
                            for (int depth = 0; depth < max_depth; ++depth)
                            {
                                Triangle triangle;
                                int idx;
                                float t;
                                if (!intersect(ray, triangle, idx, t))
                                {
                                    sample += throughput;
                                    break;
                                }

                                if (idx < 2)
                                {
                                    if (depth == 0)
                                    {
                                        sample += lightColor;
                                    }
                                    break;
                                }

                                interaction.position = ray.start + ray.direction * t;
                                interaction.normal = triangle.normal;
                                interaction.i = idx;
                                if (dot(-ray.direction, interaction.normal) < 0.0)
                                {
                                    interaction.normal = -interaction.normal;
                                }

                                orthonormalBasis(interaction.normal);

                                sampleLight();
                                sample += radiance * throughput;

                                cosWeightedHemi();
                                if (!sampleBSDF())
                                {
                                    break;
                                }

                                throughput *= bsdf_absIdotN;
                                throughput /= bsdf_pdf;
                            }
                        }

                        uniform mat4 view;
                        uniform float fovy;
                        uniform float W;
                        uniform float H;
                        uniform vec3 eye;

                        uniform sampler2D colorbuffer;

                        void main()
                        {
                            u0 = random(vec3(12.9898, 78.233, 151.7182));
                            u1 = random(vec3(63.7264, 10.873, 623.6736));
                            float X = gl_FragCoord.x - 0.5 + u0;
                            float Y = gl_FragCoord.y - 0.5 + u1;
                            vec3 P = vec3(X - W/2.0, Y - H/2.0, -H/(2.0*tan(fovy/2.0)));
                            vec3 U = vec3(view[0][0], view[1][0], view[2][0]);
                            vec3 V = vec3(view[0][1], view[1][1], view[2][1]);
                            vec3 N = vec3(view[0][2], view[1][2], view[2][2]);
                            vec3 dir = P.x * U + P.y * V + P.z * N;

                            ray.start = eye;
                            ray.direction = normalize(dir);

                            sampleRay();

                            sample = sample / (sample + 1.0);
                            float textureWeight = framecount / (framecount + 1.0);
                            vec3 color = texture2D(colorbuffer, UV).xyz;
                            gl_FragColor = vec4(mix(sample, color, textureWeight), 1.0);
                        }
                    `;

    const colorbuffer = gl.createFramebuffer();
    const textures = [];
    for (let i = 0; i < 2; i++) {
      textures.push(gl.createTexture());
      gl.bindTexture(gl.TEXTURE_2D, textures[i]);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, screenWidth, screenHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    }
    gl.bindTexture(gl.TEXTURE_2D, null);

    const raytracingShader = new Shader(screen_vert, raytracing_frag);
    const screengShader = new Shader(screen_vert, screen_frag);

    raytracingShader.use();
    raytracingShader.setVec3('triangles[0].v0', new Float32Array([-0.24, 1.98, -0.22]));
    raytracingShader.setVec3('triangles[0].v1', new Float32Array([0.23, 1.98, 0.16]));
    raytracingShader.setVec3('triangles[0].v2', new Float32Array([-0.24, 1.98, 0.16]));
    raytracingShader.setVec3('triangles[0].normal', new Float32Array([0.0, -1.0, 0.0]));
    raytracingShader.setVec3('triangles[1].v0', new Float32Array([-0.24, 1.98, -0.22]));
    raytracingShader.setVec3('triangles[1].v1', new Float32Array([0.23, 1.98, -0.22]));
    raytracingShader.setVec3('triangles[1].v2', new Float32Array([0.23, 1.98, 0.16]));
    raytracingShader.setVec3('triangles[1].normal', new Float32Array([0.0, -1.0, 0.0]));
    raytracingShader.setVec3('triangles[2].v0', new Float32Array([1.0, 0.0, 0.99]));
    raytracingShader.setVec3('triangles[2].v1', new Float32Array([-0.99, -0.0, -1.04]));
    raytracingShader.setVec3('triangles[2].v2', new Float32Array([-1.01, 0.0, 0.99]));
    raytracingShader.setVec3('triangles[2].normal', new Float32Array([0.0, 1.0, -0.0]));
    raytracingShader.setVec3('triangles[3].v0', new Float32Array([-1.02, 1.99, -1.04]));
    raytracingShader.setVec3('triangles[3].v1', new Float32Array([1.0, 1.99, 0.99]));
    raytracingShader.setVec3('triangles[3].v2', new Float32Array([-1.02, 1.99, 0.99]));
    raytracingShader.setVec3('triangles[3].normal', new Float32Array([0.0, -1.0, 0.0]));
    raytracingShader.setVec3('triangles[4].v0', new Float32Array([-0.99, -0.0, -1.04]));
    raytracingShader.setVec3('triangles[4].v1', new Float32Array([1.0, 1.99, -1.04]));
    raytracingShader.setVec3('triangles[4].v2', new Float32Array([-1.02, 1.99, -1.04]));
    raytracingShader.setVec3('triangles[4].normal', new Float32Array([0.0, -0.0, 1.0]));
    raytracingShader.setVec3('triangles[5].v0', new Float32Array([1.0, 0.0, 0.99]));
    raytracingShader.setVec3('triangles[5].v1', new Float32Array([1.0, -0.0, -1.04]));
    raytracingShader.setVec3('triangles[5].v2', new Float32Array([-0.99, -0.0, -1.04]));
    raytracingShader.setVec3('triangles[5].normal', new Float32Array([0.0, 1.0, -0.0]));
    raytracingShader.setVec3('triangles[6].v0', new Float32Array([-1.02, 1.99, -1.04]));
    raytracingShader.setVec3('triangles[6].v1', new Float32Array([1.0, 1.99, -1.04]));
    raytracingShader.setVec3('triangles[6].v2', new Float32Array([1.0, 1.99, 0.99]));
    raytracingShader.setVec3('triangles[6].normal', new Float32Array([0.0, -1.0, 0.0]));
    raytracingShader.setVec3('triangles[7].v0', new Float32Array([-0.99, -0.0, -1.04]));
    raytracingShader.setVec3('triangles[7].v1', new Float32Array([1.0, -0.0, -1.04]));
    raytracingShader.setVec3('triangles[7].v2', new Float32Array([1.0, 1.99, -1.04]));
    raytracingShader.setVec3('triangles[7].normal', new Float32Array([0.0, 0.0, 1.0]));
    raytracingShader.setVec3('triangles[8].v0', new Float32Array([-1.01, 0.0, 0.99]));
    raytracingShader.setVec3('triangles[8].v1', new Float32Array([-1.02, 1.99, -1.04]));
    raytracingShader.setVec3('triangles[8].v2', new Float32Array([-1.02, 1.99, 0.99]));
    raytracingShader.setVec3('triangles[8].normal', new Float32Array([0.999987, 0.005025, 0.0]));
    raytracingShader.setVec3('triangles[9].v0', new Float32Array([-1.01, 0.0, 0.99]));
    raytracingShader.setVec3('triangles[9].v1', new Float32Array([-0.99, -0.0, -1.04]));
    raytracingShader.setVec3('triangles[9].v2', new Float32Array([-1.02, 1.99, -1.04]));
    raytracingShader.setVec3('triangles[9].normal', new Float32Array([0.999838, 0.015073, 0.009851]));
    raytracingShader.setVec3('triangles[10].v0', new Float32Array([1.0, 0.0, 0.99]));
    raytracingShader.setVec3('triangles[10].v1', new Float32Array([1.0, 1.99, -1.04]));
    raytracingShader.setVec3('triangles[10].v2', new Float32Array([1.0, -0.0, -1.04]));
    raytracingShader.setVec3('triangles[10].normal', new Float32Array([-1.0, 0.0, -0.0]));
    raytracingShader.setVec3('triangles[11].v0', new Float32Array([1.0, 0.0, 0.99]));
    raytracingShader.setVec3('triangles[11].v1', new Float32Array([1.0, 1.99, 0.99]));
    raytracingShader.setVec3('triangles[11].v2', new Float32Array([1.0, 1.99, -1.04]));
    raytracingShader.setVec3('triangles[11].normal', new Float32Array([-1.0, 0.0, 0.0]));
    raytracingShader.setVec3('triangles[12].v0', new Float32Array([0.04, 1.2, -0.09]));
    raytracingShader.setVec3('triangles[12].v1', new Float32Array([-0.71, 1.2, -0.49]));
    raytracingShader.setVec3('triangles[12].v2', new Float32Array([-0.53, 1.2, 0.09]));
    raytracingShader.setVec3('triangles[12].normal', new Float32Array([0.0, 1.0, 0.0]));
    raytracingShader.setVec3('triangles[13].v0', new Float32Array([-0.53, 1.2, 0.09]));
    raytracingShader.setVec3('triangles[13].v1', new Float32Array([-0.71, -0.0, -0.49]));
    raytracingShader.setVec3('triangles[13].v2', new Float32Array([-0.53, 0.0, 0.09]));
    raytracingShader.setVec3('triangles[13].normal', new Float32Array([-0.955064, 0.0, 0.296399]));
    raytracingShader.setVec3('triangles[14].v0', new Float32Array([-0.71, 1.2, -0.49]));
    raytracingShader.setVec3('triangles[14].v1', new Float32Array([-0.14, -0.0, -0.67]));
    raytracingShader.setVec3('triangles[14].v2', new Float32Array([-0.71, -0.0, -0.49]));
    raytracingShader.setVec3('triangles[14].normal', new Float32Array([-0.301131, -0.0, -0.953583]));
    raytracingShader.setVec3('triangles[15].v0', new Float32Array([-0.14, 1.2, -0.67]));
    raytracingShader.setVec3('triangles[15].v1', new Float32Array([0.04, -0.0, -0.09]));
    raytracingShader.setVec3('triangles[15].v2', new Float32Array([-0.14, -0.0, -0.67]));
    raytracingShader.setVec3('triangles[15].normal', new Float32Array([0.955064, 0.0, -0.296399]));
    raytracingShader.setVec3('triangles[16].v0', new Float32Array([0.04, 1.2, -0.09]));
    raytracingShader.setVec3('triangles[16].v1', new Float32Array([-0.53, 0.0, 0.09]));
    raytracingShader.setVec3('triangles[16].v2', new Float32Array([0.04, -0.0, -0.09]));
    raytracingShader.setVec3('triangles[16].normal', new Float32Array([0.301131, 0.0, 0.953583]));
    raytracingShader.setVec3('triangles[17].v0', new Float32Array([0.04, 1.2, -0.09]));
    raytracingShader.setVec3('triangles[17].v1', new Float32Array([-0.14, 1.2, -0.67]));
    raytracingShader.setVec3('triangles[17].v2', new Float32Array([-0.71, 1.2, -0.49]));
    raytracingShader.setVec3('triangles[17].normal', new Float32Array([0.0, 1.0, 0.0]));
    raytracingShader.setVec3('triangles[18].v0', new Float32Array([-0.53, 1.2, 0.09]));
    raytracingShader.setVec3('triangles[18].v1', new Float32Array([-0.71, 1.2, -0.49]));
    raytracingShader.setVec3('triangles[18].v2', new Float32Array([-0.71, -0.0, -0.49]));
    raytracingShader.setVec3('triangles[18].normal', new Float32Array([-0.955064, 0.0, 0.296399]));
    raytracingShader.setVec3('triangles[19].v0', new Float32Array([-0.71, 1.2, -0.49]));
    raytracingShader.setVec3('triangles[19].v1', new Float32Array([-0.14, 1.2, -0.67]));
    raytracingShader.setVec3('triangles[19].v2', new Float32Array([-0.14, -0.0, -0.67]));
    raytracingShader.setVec3('triangles[19].normal', new Float32Array([-0.301131, 0.0, -0.953583]));
    raytracingShader.setVec3('triangles[20].v0', new Float32Array([-0.14, 1.2, -0.67]));
    raytracingShader.setVec3('triangles[20].v1', new Float32Array([0.04, 1.2, -0.09]));
    raytracingShader.setVec3('triangles[20].v2', new Float32Array([0.04, -0.0, -0.09]));
    raytracingShader.setVec3('triangles[20].normal', new Float32Array([0.955064, 0.0, -0.296399]));
    raytracingShader.setVec3('triangles[21].v0', new Float32Array([0.04, 1.2, -0.09]));
    raytracingShader.setVec3('triangles[21].v1', new Float32Array([-0.53, 1.2, 0.09]));
    raytracingShader.setVec3('triangles[21].v2', new Float32Array([-0.53, 0.0, 0.09]));
    raytracingShader.setVec3('triangles[21].normal', new Float32Array([0.301131, 0.0, 0.953583]));
    raytracingShader.setVec3('triangles[22].v0', new Float32Array([0.53, 0.6, 0.75]));
    raytracingShader.setVec3('triangles[22].v1', new Float32Array([0.13, 0.6, -0.0]));
    raytracingShader.setVec3('triangles[22].v2', new Float32Array([-0.05, 0.6, 0.57]));
    raytracingShader.setVec3('triangles[22].normal', new Float32Array([0.0, 1.0, 0.0]));
    raytracingShader.setVec3('triangles[23].v0', new Float32Array([-0.05, 0.6, 0.57]));
    raytracingShader.setVec3('triangles[23].v1', new Float32Array([0.13, 0.0, 0.0]));
    raytracingShader.setVec3('triangles[23].v2', new Float32Array([-0.05, 0.0, 0.57]));
    raytracingShader.setVec3('triangles[23].normal', new Float32Array([-0.953583, -0.0, -0.301131]));
    raytracingShader.setVec3('triangles[24].v0', new Float32Array([0.53, 0.6, 0.75]));
    raytracingShader.setVec3('triangles[24].v1', new Float32Array([-0.05, 0.0, 0.57]));
    raytracingShader.setVec3('triangles[24].v2', new Float32Array([0.53, 0.0, 0.75]));
    raytracingShader.setVec3('triangles[24].normal', new Float32Array([-0.296399, 0.0, 0.955064]));
    raytracingShader.setVec3('triangles[25].v0', new Float32Array([0.7, 0.6, 0.17]));
    raytracingShader.setVec3('triangles[25].v1', new Float32Array([0.53, 0.0, 0.75]));
    raytracingShader.setVec3('triangles[25].v2', new Float32Array([0.7, 0.0, 0.17]));
    raytracingShader.setVec3('triangles[25].normal', new Float32Array([0.959629, 0.0, 0.28127]));
    raytracingShader.setVec3('triangles[26].v0', new Float32Array([0.13, 0.6, -0.0]));
    raytracingShader.setVec3('triangles[26].v1', new Float32Array([0.7, 0.0, 0.17]));
    raytracingShader.setVec3('triangles[26].v2', new Float32Array([0.13, 0.0, 0.0]));
    raytracingShader.setVec3('triangles[26].normal', new Float32Array([0.285805, 0.0, -0.958288]));
    raytracingShader.setVec3('triangles[27].v0', new Float32Array([0.53, 0.6, 0.75]));
    raytracingShader.setVec3('triangles[27].v1', new Float32Array([0.7, 0.6, 0.17]));
    raytracingShader.setVec3('triangles[27].v2', new Float32Array([0.13, 0.6, -0.0]));
    raytracingShader.setVec3('triangles[27].normal', new Float32Array([0.0, 1.0, 0.0]));
    raytracingShader.setVec3('triangles[28].v0', new Float32Array([-0.05, 0.6, 0.57]));
    raytracingShader.setVec3('triangles[28].v1', new Float32Array([0.13, 0.6, -0.0]));
    raytracingShader.setVec3('triangles[28].v2', new Float32Array([0.13, 0.0, 0.0]));
    raytracingShader.setVec3('triangles[28].normal', new Float32Array([-0.953583, 0.0, -0.301131]));
    raytracingShader.setVec3('triangles[29].v0', new Float32Array([0.53, 0.6, 0.75]));
    raytracingShader.setVec3('triangles[29].v1', new Float32Array([-0.05, 0.6, 0.57]));
    raytracingShader.setVec3('triangles[29].v2', new Float32Array([-0.05, 0.0, 0.57]));
    raytracingShader.setVec3('triangles[29].normal', new Float32Array([-0.296399, 0.0, 0.955064]));
    raytracingShader.setVec3('triangles[30].v0', new Float32Array([0.7, 0.6, 0.17]));
    raytracingShader.setVec3('triangles[30].v1', new Float32Array([0.53, 0.6, 0.75]));
    raytracingShader.setVec3('triangles[30].v2', new Float32Array([0.53, 0.0, 0.75]));
    raytracingShader.setVec3('triangles[30].normal', new Float32Array([0.959629, 0.0, 0.28127]));
    raytracingShader.setVec3('triangles[31].v0', new Float32Array([0.13, 0.6, -0.0]));
    raytracingShader.setVec3('triangles[31].v1', new Float32Array([0.7, 0.6, 0.17]));
    raytracingShader.setVec3('triangles[31].v2', new Float32Array([0.7, 0.0, 0.17]));
    raytracingShader.setVec3('triangles[31].normal', new Float32Array([0.285805, 0.0, -0.958288]));

    const view = mat4.create();
    const view_eye = vec3.create();
    const view_center = vec3.create();
    const view_up = vec3.create();
    vec3.set(view_eye, 0.0, 1.0, 3.5);
    vec3.set(view_center, 0.0, 1.0, 0.0);
    vec3.set(view_up, 0.0, 1.0, 0.0);

    let touch_pressed = false;
    let press_x;
    let press_y;
    let move_x;
    let move_y;
    function onmousedown(x, y) {
      move_x = press_x = x - screenWidth / 2;
      move_y = press_y = screenHeight / 2 - y;
      touch_pressed = true;
    }
    function onmouseup(x, y) {
      touch_pressed = false;
    }
    function onmousemove(x, y) {
      if (touch_pressed) {
        move_x = x - screenWidth / 2;
        move_y = screenHeight / 2 - y;
      }
    }

    let easeOut_time = 1;
    let axis_len_target = 0;
    const axis_target = vec3.create();
    const view_up_target = vec3.create();
    const view_eye_target = vec3.create();
    const view_eye_new = vec3.create();

    const view_x = vec3.create();
    const view_y = vec3.create();
    const view_z = vec3.create();
    const axis = vec3.create();
    const R = mat4.create();

    const PI = 3.14159265358979323846;
    function radians(degrees) {
      return (degrees * PI) / 180.0;
    }
    function matrix_rotate(r, a, x, y, z) {
      const c = Math.cos(a);
      const s = Math.sin(a);
      const onec = 1 - c;

      r[0] = x * x * onec + c;
      r[1] = y * x * onec + z * s;
      r[2] = x * z * onec - y * s;
      r[3] = 0.0;

      r[4] = x * y * onec - z * s;
      r[5] = y * y * onec + c;
      r[6] = y * z * onec + x * s;
      r[7] = 0.0;

      r[8] = x * z * onec + y * s;
      r[9] = y * z * onec - x * s;
      r[10] = z * z * onec + c;
      r[15] = 1.0;
    }
    function matrix_mult3(out, m, v) {
      out[0] = m[0] * v[0] + m[4] * v[1] + m[8] * v[2] + m[12];
      out[1] = m[1] * v[0] + m[5] * v[1] + m[9] * v[2] + m[13];
      out[2] = m[2] * v[0] + m[6] * v[1] + m[10] * v[2] + m[14];
    }
    function lookAt(tick_period) {
      if (touch_pressed) {
        vec3.set(view_x, view[0], view[4], view[8]);
        vec3.set(view_y, view[1], view[5], view[9]);
        vec3.set(view_z, view[2], view[6], view[10]);

        const dx = move_x - press_x;
        const dy = move_y - press_y;
        axis[0] = dy * view_x[0] + -dx * view_y[0];
        axis[1] = dy * view_x[1] + -dx * view_y[1];
        axis[2] = dy * view_x[2] + -dx * view_y[2];
        const axis_len = Math.sqrt(dot3(axis, axis));
        if (axis_len > 0.001) {
          axis[0] /= axis_len;
          axis[1] /= axis_len;
          axis[2] /= axis_len;
          easeOut_time = 0;
          axis_len_target = axis_len;
          vec3.copy(axis_target, axis);
          vec3.copy(view_up_target, view_y);
          vec3.copy(view_eye_target, view_eye);
        }
      }

      if (axis_len_target != 0 && easeOut_time != 1) {
        framecount = 0;
        const len_scale = 0.25;
        const time_scale = 2.0;
        const dt = (time_scale * tick_period) / 1000.0;
        easeOut_time += dt;
        if (easeOut_time > 1) easeOut_time = 1;

        function easeOutCubic(x) {
          return 1.0 - Math.pow(1.0 - x, 3.0);
        }
        const a = axis_len_target * easeOutCubic(easeOut_time) * len_scale;
        matrix_rotate(R, radians(a), axis_target[0], axis_target[1], axis_target[2]);
        vec3.sub(view_eye_new, view_eye_target, view_center);
        matrix_mult3(view_eye, R, view_eye_new);
        vec3.add(view_eye, view_eye, view_center);
        matrix_mult3(view_up, R, view_up_target);
      }

      lookat(view, view_eye, view_center, view_up);
    }

    canvas.addEventListener('mousedown', event => {
      onmousedown(event.clientX, event.clientY);
    });
    canvas.addEventListener('mouseup', event => {
      onmouseup(event.clientX, event.clientY);
    });
    canvas.addEventListener('mouseout', event => {
      onmouseup(event.clientX, event.clientY);
    });
    canvas.addEventListener('mousemove', event => {
      onmousemove(event.clientX, event.clientY);
    });
    canvas.addEventListener('touchstart', event => {
      event.preventDefault();
      onmousedown(event.touches[0].clientX, event.touches[0].clientY);
    });
    canvas.addEventListener('touchend', event => {
      event.preventDefault();
      onmouseup(0, 0);
    });
    canvas.addEventListener('touchcancel', event => {
      event.preventDefault();
      onmouseup(0, 0);
    });
    canvas.addEventListener('touchmove', event => {
      event.preventDefault();
      onmousemove(event.touches[0].clientX, event.touches[0].clientY);
    });

    const fovy = 45;
    const tick_period = 33;
    let framecount = 0;
    let textureID = 0;

    setInterval(function () {
      lookAt(tick_period);

      raytracingShader.use();
      raytracingShader.setVec3('eye', view_eye);
      raytracingShader.setMat4('view', view);
      raytracingShader.setFloat('fovy', fovy);
      raytracingShader.setFloat('W', screenWidth);
      raytracingShader.setFloat('H', screenHeight);
      raytracingShader.setFloat('framecount', framecount);
      raytracingShader.setInt('colorbuffer', 0);
      gl.bindTexture(gl.TEXTURE_2D, textures[textureID]);
      textureID = 1 - textureID;
      gl.bindFramebuffer(gl.FRAMEBUFFER, colorbuffer);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, textures[textureID], 0);
      drawRect(
        0,
        0,
        screenWidth,
        screenHeight,
        0,
        0,
        screenWidth,
        screenHeight,
        screenWidth,
        screenHeight,
        screenWidth,
        screenHeight,
        raytracingShader
      );
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      screengShader.use();
      screengShader.setFloat('framecount', framecount);
      screengShader.setInt('colorbuffer', 0);
      gl.bindTexture(gl.TEXTURE_2D, textures[textureID]);
      drawRect(
        0,
        0,
        screenWidth,
        screenHeight,
        0,
        0,
        screenWidth,
        screenHeight,
        screenWidth,
        screenHeight,
        screenWidth,
        screenHeight,
        screengShader
      );
      framecount++;
    }, tick_period);
  }, []);

  return <></>;
}
