import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export function VantaFogBackground() {
  const ref = useRef(null);
  const effectRef = useRef(null);

  useEffect(() => {
    if (!effectRef.current && window.VANTA?.FOG) {
      effectRef.current = window.VANTA.FOG({
        el: ref.current,
        THREE,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        baseColor: 0x0,
        highlightColor: 0x577dbd,
        midtoneColor: 0x3e64a5,
        lowlightColor: 0x1b2c48,
        blurFactor: 1.0,
        speed: 1.0,
        zoom: 0.3,
      });
    }

    return () => {
      if (effectRef.current) effectRef.current.destroy();
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -10,
      }}
    />
  );
}

!(function (e, t) {
  ``;
  "object" == typeof exports && "object" == typeof module
    ? (module.exports = t())
    : "function" == typeof define && define.amd
      ? define([], t)
      : "object" == typeof exports
        ? (exports._vantaEffect = t())
        : (e._vantaEffect = t());
})("undefined" != typeof self ? self : this, () =>
  (() => {
    "use strict";
    var e = {
        d: (t, i) => {
          for (var o in i)
            e.o(i, o) &&
              !e.o(t, o) &&
              Object.defineProperty(t, o, { enumerable: !0, get: i[o] });
        },
        o: (e, t) => Object.prototype.hasOwnProperty.call(e, t),
        r: (e) => {
          ("undefined" != typeof Symbol &&
            Symbol.toStringTag &&
            Object.defineProperty(e, Symbol.toStringTag, { value: "Module" }),
            Object.defineProperty(e, "__esModule", { value: !0 }));
        },
      },
      t = {};
    (e.r(t),
      e.d(t, { default: () => u }),
      (Number.prototype.clamp = function (e, t) {
        return Math.min(Math.max(this, e), t);
      }));
    function i(e) {
      for (; e.children && e.children.length > 0; )
        (i(e.children[0]), e.remove(e.children[0]));
      (e.geometry && e.geometry.dispose(),
        e.material &&
          (Object.keys(e.material).forEach((t) => {
            e.material[t] &&
              null !== e.material[t] &&
              "function" == typeof e.material[t].dispose &&
              e.material[t].dispose();
          }),
          e.material.dispose()));
    }
    const o = "object" == typeof window;
    let s = (o && window.THREE) || {};
    o && !window.VANTA && (window.VANTA = {});
    const n = (o && window.VANTA) || {};
    ((n.register = (e, t) => (n[e] = (e) => new t(e))), (n.version = "0.5.24"));
    const r = function () {
      return (
        Array.prototype.unshift.call(arguments, "[VANTA]"),
        console.error.apply(this, arguments)
      );
    };
    n.VantaBase = class {
      constructor(e = {}) {
        if (!o) return !1;
        ((n.current = this),
          (this.windowMouseMoveWrapper =
            this.windowMouseMoveWrapper.bind(this)),
          (this.windowTouchWrapper = this.windowTouchWrapper.bind(this)),
          (this.windowGyroWrapper = this.windowGyroWrapper.bind(this)),
          (this.resize = this.resize.bind(this)),
          (this.animationLoop = this.animationLoop.bind(this)),
          (this.restart = this.restart.bind(this)));
        const t =
          "function" == typeof this.getDefaultOptions
            ? this.getDefaultOptions()
            : this.defaultOptions;
        if (
          ((this.options = Object.assign(
            {
              mouseControls: !0,
              touchControls: !0,
              gyroControls: !1,
              minHeight: 200,
              minWidth: 200,
              scale: 1,
              scaleMobile: 1,
            },
            t,
          )),
          (e instanceof HTMLElement || "string" == typeof e) && (e = { el: e }),
          Object.assign(this.options, e),
          this.options.THREE && (s = this.options.THREE),
          (this.el = this.options.el),
          null == this.el)
        )
          r('Instance needs "el" param!');
        else if (!(this.options.el instanceof HTMLElement)) {
          const e = this.el;
          if (((this.el = ((i = e), document.querySelector(i))), !this.el))
            return void r("Cannot find element", e);
        }
        var i, h;
        (this.prepareEl(), this.initThree(), this.setSize());
        try {
          this.init();
        } catch (e) {
          return (
            r("Init error", e),
            this.renderer &&
              this.renderer.domElement &&
              this.el.removeChild(this.renderer.domElement),
            void (
              this.options.backgroundColor &&
              (console.log("[VANTA] Falling back to backgroundColor"),
              (this.el.style.background =
                ((h = this.options.backgroundColor),
                "number" == typeof h
                  ? "#" + ("00000" + h.toString(16)).slice(-6)
                  : h)))
            )
          );
        }
        (this.initMouse(), this.resize(), this.animationLoop());
        const a = window.addEventListener;
        (a("resize", this.resize),
          window.requestAnimationFrame(this.resize),
          this.options.mouseControls &&
            (a("scroll", this.windowMouseMoveWrapper),
            a("mousemove", this.windowMouseMoveWrapper)),
          this.options.touchControls &&
            (a("touchstart", this.windowTouchWrapper),
            a("touchmove", this.windowTouchWrapper)),
          this.options.gyroControls &&
            a("deviceorientation", this.windowGyroWrapper));
      }
      setOptions(e = {}) {
        (Object.assign(this.options, e), this.triggerMouseMove());
      }
      prepareEl() {
        let e, t;
        if ("undefined" != typeof Node && Node.TEXT_NODE)
          for (e = 0; e < this.el.childNodes.length; e++) {
            const t = this.el.childNodes[e];
            if (t.nodeType === Node.TEXT_NODE) {
              const e = document.createElement("span");
              ((e.textContent = t.textContent),
                t.parentElement.insertBefore(e, t),
                t.remove());
            }
          }
        for (e = 0; e < this.el.children.length; e++)
          ((t = this.el.children[e]),
            "static" === getComputedStyle(t).position &&
              (t.style.position = "relative"),
            "auto" === getComputedStyle(t).zIndex && (t.style.zIndex = 1));
        "static" === getComputedStyle(this.el).position &&
          (this.el.style.position = "relative");
      }
      applyCanvasStyles(e, t = {}) {
        (Object.assign(e.style, {
          position: "absolute",
          zIndex: 0,
          top: 0,
          left: 0,
          background: "",
        }),
          Object.assign(e.style, t),
          e.classList.add("vanta-canvas"));
      }
      initThree() {
        s.WebGLRenderer
          ? ((this.renderer = new s.WebGLRenderer({
              alpha: !0,
              antialias: !0,
            })),
            this.el.appendChild(this.renderer.domElement),
            this.applyCanvasStyles(this.renderer.domElement),
            isNaN(this.options.backgroundAlpha) &&
              (this.options.backgroundAlpha = 1),
            (this.scene = new s.Scene()))
          : console.warn("[VANTA] No THREE defined on window");
      }
      getCanvasElement() {
        return this.renderer
          ? this.renderer.domElement
          : this.p5renderer
            ? this.p5renderer.canvas
            : void 0;
      }
      getCanvasRect() {
        const e = this.getCanvasElement();
        return !!e && e.getBoundingClientRect();
      }
      windowMouseMoveWrapper(e) {
        const t = this.getCanvasRect();
        if (!t) return !1;
        const i = e.clientX - t.left,
          o = e.clientY - t.top;
        i >= 0 &&
          o >= 0 &&
          i <= t.width &&
          o <= t.height &&
          ((this.mouseX = i),
          (this.mouseY = o),
          this.options.mouseEase || this.triggerMouseMove(i, o));
      }
      windowTouchWrapper(e) {
        const t = this.getCanvasRect();
        if (!t) return !1;
        if (1 === e.touches.length) {
          const i = e.touches[0].clientX - t.left,
            o = e.touches[0].clientY - t.top;
          i >= 0 &&
            o >= 0 &&
            i <= t.width &&
            o <= t.height &&
            ((this.mouseX = i),
            (this.mouseY = o),
            this.options.mouseEase || this.triggerMouseMove(i, o));
        }
      }
      windowGyroWrapper(e) {
        const t = this.getCanvasRect();
        if (!t) return !1;
        const i = Math.round(2 * e.alpha) - t.left,
          o = Math.round(2 * e.beta) - t.top;
        i >= 0 &&
          o >= 0 &&
          i <= t.width &&
          o <= t.height &&
          ((this.mouseX = i),
          (this.mouseY = o),
          this.options.mouseEase || this.triggerMouseMove(i, o));
      }
      triggerMouseMove(e, t) {
        (void 0 === e &&
          void 0 === t &&
          (this.options.mouseEase
            ? ((e = this.mouseEaseX), (t = this.mouseEaseY))
            : ((e = this.mouseX), (t = this.mouseY))),
          this.uniforms &&
            ((this.uniforms.iMouse.value.x = e / this.scale),
            (this.uniforms.iMouse.value.y = t / this.scale)));
        const i = e / this.width,
          o = t / this.height;
        "function" == typeof this.onMouseMove && this.onMouseMove(i, o);
      }
      setSize() {
        (this.scale || (this.scale = 1),
          "undefined" != typeof navigator &&
          (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent,
          ) ||
            window.innerWidth < 600) &&
          this.options.scaleMobile
            ? (this.scale = this.options.scaleMobile)
            : this.options.scale && (this.scale = this.options.scale),
          (this.width = Math.max(this.el.offsetWidth, this.options.minWidth)),
          (this.height = Math.max(
            this.el.offsetHeight,
            this.options.minHeight,
          )));
      }
      initMouse() {
        ((!this.mouseX && !this.mouseY) ||
          (this.mouseX === this.options.minWidth / 2 &&
            this.mouseY === this.options.minHeight / 2)) &&
          ((this.mouseX = this.width / 2),
          (this.mouseY = this.height / 2),
          this.triggerMouseMove(this.mouseX, this.mouseY));
      }
      resize() {
        (this.setSize(),
          this.camera &&
            ((this.camera.aspect = this.width / this.height),
            "function" == typeof this.camera.updateProjectionMatrix &&
              this.camera.updateProjectionMatrix()),
          this.renderer &&
            (this.renderer.setSize(this.width, this.height),
            this.renderer.setPixelRatio(window.devicePixelRatio / this.scale)),
          "function" == typeof this.onResize && this.onResize());
      }
      isOnScreen() {
        const e = this.el.offsetHeight,
          t = this.el.getBoundingClientRect(),
          i =
            window.pageYOffset ||
            (
              document.documentElement ||
              document.body.parentNode ||
              document.body
            ).scrollTop,
          o = t.top + i;
        return o - window.innerHeight <= i && i <= o + e;
      }
      animationLoop() {
        (this.t || (this.t = 0), this.t2 || (this.t2 = 0));
        const e = performance.now();
        if (this.prevNow) {
          let t = (e - this.prevNow) / (1e3 / 60);
          ((t = Math.max(0.2, Math.min(t, 5))),
            (this.t += t),
            (this.t2 += (this.options.speed || 1) * t),
            this.uniforms && (this.uniforms.iTime.value = 0.016667 * this.t2));
        }
        return (
          (this.prevNow = e),
          this.options.mouseEase &&
            ((this.mouseEaseX = this.mouseEaseX || this.mouseX || 0),
            (this.mouseEaseY = this.mouseEaseY || this.mouseY || 0),
            Math.abs(this.mouseEaseX - this.mouseX) +
              Math.abs(this.mouseEaseY - this.mouseY) >
              0.1 &&
              ((this.mouseEaseX += 0.05 * (this.mouseX - this.mouseEaseX)),
              (this.mouseEaseY += 0.05 * (this.mouseY - this.mouseEaseY)),
              this.triggerMouseMove(this.mouseEaseX, this.mouseEaseY))),
          (this.isOnScreen() || this.options.forceAnimate) &&
            ("function" == typeof this.onUpdate && this.onUpdate(),
            this.scene &&
              this.camera &&
              (this.renderer.render(this.scene, this.camera),
              this.renderer.setClearColor(
                this.options.backgroundColor,
                this.options.backgroundAlpha,
              )),
            this.fps && this.fps.update && this.fps.update(),
            "function" == typeof this.afterRender && this.afterRender()),
          (this.req = window.requestAnimationFrame(this.animationLoop))
        );
      }
      restart() {
        if (this.scene)
          for (; this.scene.children.length; )
            this.scene.remove(this.scene.children[0]);
        ("function" == typeof this.onRestart && this.onRestart(), this.init());
      }
      init() {
        "function" == typeof this.onInit && this.onInit();
      }
      destroy() {
        "function" == typeof this.onDestroy && this.onDestroy();
        const e = window.removeEventListener;
        (e("touchstart", this.windowTouchWrapper),
          e("touchmove", this.windowTouchWrapper),
          e("scroll", this.windowMouseMoveWrapper),
          e("mousemove", this.windowMouseMoveWrapper),
          e("deviceorientation", this.windowGyroWrapper),
          e("resize", this.resize),
          window.cancelAnimationFrame(this.req));
        const t = this.scene;
        (t && t.children && i(t),
          this.renderer &&
            (this.renderer.domElement &&
              this.el.removeChild(this.renderer.domElement),
            (this.renderer = null),
            (this.scene = null)),
          n.current === this && (n.current = null));
      }
    };
    const h = n.VantaBase;
    let a = "object" == typeof window && window.THREE;
    class l extends h {
      constructor(e) {
        ((a = e.THREE || a),
          (a.Color.prototype.toVector = function () {
            return new a.Vector3(this.r, this.g, this.b);
          }),
          super(e),
          (this.updateUniforms = this.updateUniforms.bind(this)));
      }
      init() {
        ((this.mode = "shader"),
          (this.uniforms = {
            iTime: { type: "f", value: 1 },
            iResolution: { type: "v2", value: new a.Vector2(1, 1) },
            iDpr: { type: "f", value: window.devicePixelRatio || 1 },
            iMouse: {
              type: "v2",
              value: new a.Vector2(this.mouseX || 0, this.mouseY || 0),
            },
          }),
          super.init(),
          this.fragmentShader && this.initBasicShader());
      }
      setOptions(e) {
        (super.setOptions(e), this.updateUniforms());
      }
      initBasicShader(e = this.fragmentShader, t = this.vertexShader) {
        (t ||
          (t =
            "uniform float uTime;\nuniform vec2 uResolution;\nvoid main() {\n  gl_Position = vec4( position, 1.0 );\n}"),
          this.updateUniforms(),
          "function" == typeof this.valuesChanger && this.valuesChanger());
        const i = new a.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: t,
            fragmentShader: e,
          }),
          o = this.options.texturePath;
        o &&
          (this.uniforms.iTex = {
            type: "t",
            value: new a.TextureLoader().load(o),
          });
        const s = new a.Mesh(new a.PlaneGeometry(2, 2), i);
        (this.scene.add(s),
          (this.camera = new a.Camera()),
          (this.camera.position.z = 1));
      }
      updateUniforms() {
        const e = {};
        let t, i;
        for (t in this.options)
          ((i = this.options[t]),
            -1 !== t.toLowerCase().indexOf("color")
              ? (e[t] = { type: "v3", value: new a.Color(i).toVector() })
              : "number" == typeof i && (e[t] = { type: "f", value: i }));
        return Object.assign(this.uniforms, e);
      }
      resize() {
        (super.resize(),
          (this.uniforms.iResolution.value.x = this.width / this.scale),
          (this.uniforms.iResolution.value.y = this.height / this.scale));
      }
    }
    class c extends l {}
    const u = n.register("FOG", c);
    return (
      (c.prototype.defaultOptions = {
        highlightColor: 16761600,
        midtoneColor: 16719616,
        lowlightColor: 2949375,
        baseColor: 16772075,
        blurFactor: 0.6,
        speed: 1,
        zoom: 1,
        scale: 2,
        scaleMobile: 4,
      }),
      (c.prototype.fragmentShader =
        "uniform vec2 iResolution;\nuniform vec2 iMouse;\nuniform float iTime;\n\nuniform float blurFactor;\nuniform vec3 baseColor;\nuniform vec3 lowlightColor;\nuniform vec3 midtoneColor;\nuniform vec3 highlightColor;\nuniform float zoom;\n\nfloat random (in vec2 _st) {\n  return fract(sin(dot(_st.xy,\n                     vec2(0.129898,0.78233)))*\n        437.585453123);\n}\n\n// Based on Morgan McGuire @morgan3d\n// https://www.shadertoy.com/view/4dS3Wd\nfloat noise (in vec2 _st) {\n  vec2 i = floor(_st);\n  vec2 f = fract(_st);\n\n  // Four corners in 2D of a tile\n  float a = random(i);\n  float b = random(i + vec2(1.0, 0.0));\n  float c = random(i + vec2(0.0, 1.0));\n  float d = random(i + vec2(1.0, 1.0));\n\n  vec2 u = f * f * (3.0 - 2.0 * f);\n\n  return mix(a, b, u.x) +\n          (c - a)* u.y * (1.0 - u.x) +\n          (d - b) * u.x * u.y;\n}\n\n#define NUM_OCTAVES 6\n\nfloat fbm ( in vec2 _st) {\n  float v = 0.0;\n  float a = blurFactor;\n  vec2 shift = vec2(100.0);\n  // Rotate to reduce axial bias\n  mat2 rot = mat2(cos(0.5), sin(0.5),\n                  -sin(0.5), cos(0.50));\n  for (int i = 0; i < NUM_OCTAVES; ++i) {\n      v += a * noise(_st);\n      _st = rot * _st * 2.0 + shift;\n      a *= (1. - blurFactor);\n  }\n  return v;\n}\n\nvoid main() {\n  vec2 st = gl_FragCoord.xy / iResolution.xy*3.;\n  st.x *= 0.7 * iResolution.x / iResolution.y ; // Still keep it more landscape than square\n  st *= zoom;\n\n  // st += st * abs(sin(iTime*0.1)*3.0);\n  vec3 color = vec3(0.0);\n\n  vec2 q = vec2(0.);\n  q.x = fbm( st + 0.00*iTime);\n  q.y = fbm( st + vec2(1.0));\n\n  vec2 dir = vec2(0.15,0.126);\n  vec2 r = vec2(0.);\n  r.x = fbm( st + 1.0*q + vec2(1.7,9.2)+ dir.x*iTime );\n  r.y = fbm( st + 1.0*q + vec2(8.3,2.8)+ dir.y*iTime);\n\n  float f = fbm(st+r);\n\n  color = mix(baseColor,\n              lowlightColor,\n              clamp((f*f)*4.0,0.0,1.0));\n\n  color = mix(color,\n              midtoneColor,\n              clamp(length(q),0.0,1.0));\n\n  color = mix(color,\n              highlightColor,\n              clamp(length(r.x),0.0,1.0));\n\n  vec3 finalColor = mix(baseColor, color, f*f*f+.6*f*f+.5*f);\n  gl_FragColor = vec4(finalColor,1.0);\n}\n"),
      t
    );
  })(),
);
