import React, { useEffect, useState } from "react";
import StickyBox from "react-sticky-box";
import "../../CSS/hello-page.css";
import { VantaFogBackground } from "../../../assets/animated-bg.jsx";
import { Link } from "react-router-dom";
import { TextEffectTwo } from "react-text-animate";

import DemoPicture from "../../../assets/demo-screenshot.png";

import {
  IconBulb,
  IconThunder,
  IconSettings,
  IconStar,
} from "../../../assets/ui-icons.jsx";

function App() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollProgress = Math.min(scrollY, 300) / 300;
  const easeOut = 1 - Math.pow(1 - scrollProgress, 2);
  const easeOutScale = 1 - easeOut * 0.3;
  const easeOutTranslate = -easeOut * 75;

  const getBlockProgress = (start, end, scrollY) => {
    if (scrollY < start) return 1;
    if (scrollY > end) return 0;
    const progress = (scrollY - start) / (end - start);
    return 1 - progress;
  };

  const block1Progress = getBlockProgress(500, 600, scrollY);
  const block3Progress = getBlockProgress(600, 700, scrollY);
  const block2Progress = getBlockProgress(700, 800, scrollY);
  const block4Progress = getBlockProgress(800, 900, scrollY);

  return (
    <div className={"whole-page"}>
      <VantaFogBackground />
      <div
        className={`backdrop-whole-page ${scrollY > 350 ? "active" : ""}`}
      ></div>
      <header className={`hello-header ${scrollY > 50 ? "scrolled" : ""}`}>
        <div className="hello-logo-name">VCD</div>
        <div className={"header-left-buttons"}>
          <button className={"header-button"}>Sign Up</button>

          <Link to="/" style={{ textDecoration: "none" }}>
            <button className={"header-button"}>Get Started</button>
          </Link>
        </div>
      </header>

      <div className="hello-hero-wrapper">
        <div
          className="hello-hero-text"
          style={{
            transform: `scale(${easeOutScale}) translateY(${easeOutTranslate}px)`,
          }}
        >
          <h1
            className="hello-hero-title"
            style={{ transform: `translateX(0)`, opacity: "1" }}
          >
            <TextEffectTwo
              animationDuration={1}
              animateOnce={true}
              text="Design logic circuits in your browser."
            />
          </h1>
          <p className="hello-hero-subtitle">
            <TextEffectTwo
              animationDuration={1}
              animateOnce={true}
              text="Create, simulate and sync — instantly."
            />
          </p>
        </div>
      </div>

      <div className={"sticky-wrapper"}>
        <StickyBox offsetTop={window.innerHeight * 0.2}>
          <div className={"sticky-container"}>
            <div className="side-text left">
              <div
                className={"sticky-upper-block"}
                style={{ transform: `translateX(${-block1Progress * 30}vw)` }}
              >
                <div className={"appear-block-title"}>
                  <IconThunder SVGClassName={"sticky-icon"} />
                  Instant Access
                </div>
                <p className={"appear-block-description"}>
                  No installation or setup required. Just open the website and
                  start designing your circuits instantly — from any device.
                </p>
              </div>

              <div
                className={"sticky-lower-block"}
                style={{ transform: `translateX(${-block2Progress * 30}vw)` }}
              >
                <div className={"appear-block-title"}>
                  <IconBulb SVGClassName={"sticky-icon"} />
                  Simple & Intuitive
                </div>
                <p className={"appear-block-description"}>
                  An easy-to-use interface makes circuit design accessible even
                  to beginners. Everything is clear and intuitive.
                </p>
              </div>
            </div>

            <div className="hello-image-placeholder">
              <img
                className="demo-picture"
                src={DemoPicture}
                alt="app screenshot"
              />
            </div>

            <div className="side-text right">
              <div
                className={"sticky-upper-block"}
                style={{ transform: `translateX(${block3Progress * 30}vw)` }}
              >
                <div className={"appear-block-title"}>
                  <IconSettings SVGClassName={"sticky-icon"} />
                  Real-Time Simulation
                </div>
                <p className={"appear-block-description"}>
                  Simulate your circuits instantly, test ideas quickly, and
                  catch mistakes early — no extra tools needed.
                </p>
              </div>

              <div className={"sticky-lower-block"}>
                <div
                  className={"appear-block-title"}
                  style={{
                    transform: `translateX(${block4Progress * 30}vw)`,
                  }}
                >
                  <IconStar SVGClassName={"sticky-icon"} />
                  Modern & Fast UI
                  <p className={"appear-block-description"}>
                    A sleek, responsive interface built for speed and clarity —
                    making your experience smooth and enjoyable.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </StickyBox>
      </div>

      <div className={"try-it-wrapper"}>
        <p style={{ fontSize: "50px", margin: 0, fontWeight: "600" }}>
          <TextEffectTwo
            className={"try-it-title"}
            animationDuration={1}
            animateOnce={true}
            text="Try it now!"
          />
        </p>

        <div style={{ display: "flex", gap: "20px" }}>
          <button className={"try-it-button"}>
            <p>Go to Library</p>
          </button>

          <Link
            to="/"
            style={{
              textDecoration: "none",
              color: "white",
              zIndex: "100",
            }}
          >
            <button className={"try-it-button"}>
              <p>Start Editing</p>
            </button>
          </Link>
        </div>
      </div>

      <footer className="hello-footer">
        <h2>Visual Circuit Designer</h2>

        <div className="footer-links">
          <a href="https://github.com/IUMusicalFish19/Visual-Circuit-Designer">
            GitHub
          </a>
          <a href="https://google.com">Docs</a>
          <a href="https://google.com">Contacts</a>
        </div>

        <p>© 2025 IUMusicalFish19. Made with 💙</p>
      </footer>
    </div>
  );
}

export default App;
