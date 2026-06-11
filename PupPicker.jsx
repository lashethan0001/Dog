import React, { useState, useRef, useEffect, useCallback } from "react";

// Each breed maps a friendly display name to the Dog CEO API slug.
const BREEDS = [
  ["Affenpinscher", "affenpinscher"],
  ["African Wild Dog", "african"],
  ["Airedale Terrier", "airedale"],
  ["Akita", "akita"],
  ["Appenzeller", "appenzeller"],
  ["Australian Cattle Dog", "cattledog/australian"],
  ["Australian Shepherd", "australian/shepherd"],
  ["Basenji", "basenji"],
  ["Beagle", "beagle"],
  ["Bernese Mountain Dog", "mountain/bernese"],
  ["Bichon Frise", "frise/bichon"],
  ["Bloodhound", "hound/blood"],
  ["Border Collie", "collie/border"],
  ["Border Terrier", "terrier/border"],
  ["Borzoi", "borzoi"],
  ["Boston Terrier", "bulldog/boston"],
  ["Bouvier", "bouvier"],
  ["Boxer", "boxer"],
  ["Brittany Spaniel", "spaniel/brittany"],
  ["Cairn Terrier", "terrier/cairn"],
  ["Cardigan Corgi", "corgi/cardigan"],
  ["Cavalier King Charles", "spaniel/blenheim"],
  ["Chesapeake Bay Retriever", "retriever/chesapeake"],
  ["Chihuahua", "chihuahua"],
  ["Chow Chow", "chow"],
  ["Clumber Spaniel", "clumber"],
  ["Cockapoo", "cockapoo"],
  ["Cocker Spaniel", "spaniel/cocker"],
  ["Coton de Tulear", "cotondetulear"],
  ["Curly-Coated Retriever", "retriever/curly"],
  ["Dachshund", "dachshund"],
  ["Dalmatian", "dalmatian"],
  ["Doberman", "doberman"],
  ["English Bulldog", "bulldog/english"],
  ["English Setter", "setter/english"],
  ["English Springer Spaniel", "springer/english"],
  ["Entlebucher", "entlebucher"],
  ["Eskimo Dog", "eskimo"],
  ["Finnish Lapphund", "finnish/lapphund"],
  ["Flat-Coated Retriever", "retriever/flatcoated"],
  ["French Bulldog", "bulldog/french"],
  ["German Shepherd", "germanshepherd"],
  ["German Shorthaired Pointer", "pointer/german"],
  ["Giant Schnauzer", "schnauzer/giant"],
  ["Golden Retriever", "retriever/golden"],
  ["Gordon Setter", "setter/gordon"],
  ["Great Dane", "dane/great"],
  ["Great Pyrenees", "pyrenees"],
  ["Italian Greyhound", "greyhound/italian"],
  ["Groenendael", "groenendael"],
  ["Havanese", "havanese"],
  ["Ibizan Hound", "hound/ibizan"],
  ["Irish Setter", "setter/irish"],
  ["Irish Wolfhound", "wolfhound/irish"],
  ["Keeshond", "keeshond"],
  ["Kelpie", "kelpie"],
  ["Komondor", "komondor"],
  ["Kuvasz", "kuvasz"],
  ["Labradoodle", "labradoodle"],
  ["Labrador Retriever", "retriever/labrador"],
  ["Leonberger", "leonberg"],
  ["Lhasa Apso", "lhasa"],
  ["Malamute", "malamute"],
  ["Malinois", "malinois"],
  ["Maltese", "maltese"],
  ["Miniature Pinscher", "pinscher/miniature"],
  ["Miniature Schnauzer", "schnauzer/miniature"],
  ["Newfoundland", "newfoundland"],
  ["Norwegian Elkhound", "elkhound/norwegian"],
  ["Norwich Terrier", "terrier/norwich"],
  ["Otterhound", "otterhound"],
  ["Papillon", "papillon"],
  ["Pekingese", "pekinese"],
  ["Pembroke Corgi", "pembroke"],
  ["Pomeranian", "pomeranian"],
  ["Standard Poodle", "poodle/standard"],
  ["Toy Poodle", "poodle/toy"],
  ["Pug", "pug"],
  ["Redbone Coonhound", "redbone"],
  ["Rhodesian Ridgeback", "ridgeback/rhodesian"],
  ["Rottweiler", "rottweiler"],
  ["Saluki", "saluki"],
  ["Samoyed", "samoyed"],
  ["Schipperke", "schipperke"],
  ["Scottish Terrier", "terrier/scottish"],
  ["Shetland Sheepdog", "sheepdog/shetland"],
  ["Shiba Inu", "shiba"],
  ["Shih Tzu", "shihtzu"],
  ["Siberian Husky", "husky"],
  ["St. Bernard", "stbernard"],
  ["Sussex Spaniel", "spaniel/sussex"],
  ["Tibetan Mastiff", "mastiff/tibetan"],
  ["Vizsla", "vizsla"],
  ["Weimaraner", "weimaraner"],
  ["Welsh Terrier", "terrier/welsh"],
  ["West Highland Terrier", "terrier/westhighland"],
  ["Whippet", "whippet"],
  ["Wheaten Terrier", "terrier/wheaten"],
  ["Yorkshire Terrier", "terrier/yorkshire"],
  ["Staffordshire Bull Terrier", "bullterrier/staffordshire"],
  ["Pekingese Pup", "pekinese"],
];

const SWIPE_THRESHOLD = 110;

export default function PupPicker() {
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState([]); // {name, slug, url, liked}
  const [drag, setDrag] = useState({ x: 0, y: 0, active: false });
  const [flyOut, setFlyOut] = useState(null); // "left" | "right" | null
  const cache = useRef({}); // index -> {url, status}
  const [, force] = useState(0);
  const startRef = useRef(null);
  const cardRef = useRef(null);

  // Inject fonts once.
  useEffect(() => {
    const id = "puppicker-fonts";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Nunito:wght@500;600;700;800&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const fetchImage = useCallback((i) => {
    if (i >= BREEDS.length) return;
    if (cache.current[i] && cache.current[i].status !== "error") return;
    const slug = BREEDS[i][1];
    cache.current[i] = { status: "loading", url: null };
    force((n) => n + 1);
    fetch(`https://dog.ceo/api/breed/${slug}/images/random`)
      .then((r) => r.json())
      .then((d) => {
        if (d && d.status === "success") {
          cache.current[i] = { status: "ready", url: d.message };
        } else {
          cache.current[i] = { status: "error", url: null };
        }
        force((n) => n + 1);
      })
      .catch(() => {
        cache.current[i] = { status: "error", url: null };
        force((n) => n + 1);
      });
  }, []);

  // Prefetch current + a few ahead.
  useEffect(() => {
    for (let k = index; k < index + 4; k++) fetchImage(k);
  }, [index, fetchImage]);

  const decide = useCallback(
    (liked) => {
      if (flyOut || index >= BREEDS.length) return;
      const entry = cache.current[index];
      setResults((r) => [
        ...r,
        {
          name: BREEDS[index][0],
          slug: BREEDS[index][1],
          url: entry ? entry.url : null,
          liked,
        },
      ]);
      setFlyOut(liked ? "right" : "left");
      window.setTimeout(() => {
        setFlyOut(null);
        setDrag({ x: 0, y: 0, active: false });
        setIndex((i) => i + 1);
      }, 280);
    },
    [flyOut, index]
  );

  const undo = useCallback(() => {
    if (flyOut || results.length === 0) return;
    setResults((r) => r.slice(0, -1));
    setIndex((i) => Math.max(0, i - 1));
  }, [flyOut, results.length]);

  // Keyboard controls.
  useEffect(() => {
    const onKey = (e) => {
      if (index >= BREEDS.length) return;
      if (e.key === "ArrowLeft") decide(false);
      else if (e.key === "ArrowRight") decide(true);
      else if (e.key === "ArrowUp") undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [decide, undo, index]);

  // Pointer drag.
  const onPointerDown = (e) => {
    if (flyOut) return;
    startRef.current = { x: e.clientX, y: e.clientY };
    setDrag({ x: 0, y: 0, active: true });
    if (cardRef.current) cardRef.current.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (!startRef.current) return;
    setDrag({
      x: e.clientX - startRef.current.x,
      y: e.clientY - startRef.current.y,
      active: true,
    });
  };
  const onPointerUp = () => {
    if (!startRef.current) return;
    const { x } = drag;
    startRef.current = null;
    if (x > SWIPE_THRESHOLD) decide(true);
    else if (x < -SWIPE_THRESHOLD) decide(false);
    else setDrag({ x: 0, y: 0, active: false });
  };

  const done = index >= BREEDS.length;
  const liked = results.filter((r) => r.liked);

  // ---- Styles ----
  const C = {
    ink: "#1f2a24",
    paper: "#e9efe9",
    card: "#ffffff",
    yes: "#2fae66",
    no: "#f2685c",
    amber: "#f0b03e",
    muted: "#6d7a72",
  };

  const wrap = {
    fontFamily: "'Nunito', system-ui, sans-serif",
    minHeight: "100%",
    background: `radial-gradient(120% 90% at 50% -10%, #f5f8f3 0%, ${C.paper} 70%)`,
    color: C.ink,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px 16px 28px",
    boxSizing: "border-box",
    userSelect: "none",
  };

  // ---- End screen ----
  if (done) {
    return (
      <div style={wrap}>
        <Header C={C} index={BREEDS.length} total={BREEDS.length} />
        <div style={{ maxWidth: 560, width: "100%", textAlign: "center" }}>
          <h2
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: 30,
              margin: "10px 0 4px",
            }}
          >
            Your pack of {liked.length}
          </h2>
          <p style={{ color: C.muted, margin: "0 0 18px", fontWeight: 600 }}>
            {liked.length === 0
              ? "A tough crowd. Not a single tail wagged."
              : "The very good dogs you swiped right on."}
          </p>
          {liked.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: 12,
                marginBottom: 22,
              }}
            >
              {liked.map((d, i) => (
                <div
                  key={i}
                  style={{
                    background: C.card,
                    borderRadius: 16,
                    overflow: "hidden",
                    boxShadow: "0 6px 18px rgba(31,42,36,0.10)",
                  }}
                >
                  <div style={{ aspectRatio: "1 / 1", background: "#dfe6df" }}>
                    {d.url && (
                      <img
                        src={d.url}
                        alt={d.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    )}
                  </div>
                  <div
                    style={{
                      padding: "8px 8px 10px",
                      fontSize: 13,
                      fontWeight: 700,
                      lineHeight: 1.2,
                    }}
                  >
                    {d.name}
                  </div>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={() => {
              setResults([]);
              setIndex(0);
              cache.current = {};
            }}
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 800,
              fontSize: 16,
              color: "#fff",
              background: C.ink,
              border: "none",
              borderRadius: 999,
              padding: "13px 28px",
              cursor: "pointer",
            }}
          >
            Start over
          </button>
        </div>
      </div>
    );
  }

  // ---- Swiping screen ----
  const rot = drag.x / 18;
  const flyTransform =
    flyOut === "right"
      ? "translateX(140%) rotate(22deg)"
      : flyOut === "left"
      ? "translateX(-140%) rotate(-22deg)"
      : null;

  const topStyle = {
    transform: flyTransform
      ? flyTransform
      : `translate(${drag.x}px, ${drag.y}px) rotate(${rot}deg)`,
    transition: drag.active && !flyOut ? "none" : "transform 0.32s cubic-bezier(.2,.8,.3,1)",
  };

  const yesOpacity = Math.min(1, Math.max(0, drag.x / SWIPE_THRESHOLD));
  const noOpacity = Math.min(1, Math.max(0, -drag.x / SWIPE_THRESHOLD));

  return (
    <div style={wrap}>
      <Header C={C} index={index} total={BREEDS.length} />

      <div
        style={{
          position: "relative",
          width: "min(360px, 88vw)",
          height: "min(440px, 64vh)",
          marginTop: 8,
        }}
      >
        {/* Peek of the next card */}
        {index + 1 < BREEDS.length && (
          <CardShell
            C={C}
            style={{
              transform: "scale(0.94) translateY(14px)",
              zIndex: 1,
              transition: "transform 0.3s ease",
            }}
          >
            <CardBody
              C={C}
              i={index + 1}
              cache={cache.current}
              onRetry={() => fetchImage(index + 1)}
            />
          </CardShell>
        )}

        {/* Top, interactive card */}
        <CardShell
          C={C}
          innerRef={cardRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{ ...topStyle, zIndex: 2, cursor: drag.active ? "grabbing" : "grab" }}
        >
          <Stamp text="YES" color={C.yes} rotate={-14} side="left" opacity={yesOpacity} />
          <Stamp text="NOPE" color={C.no} rotate={14} side="right" opacity={noOpacity} />
          <CardBody
            C={C}
            i={index}
            cache={cache.current}
            onRetry={() => fetchImage(index)}
          />
        </CardShell>
      </div>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 22,
          marginTop: 22,
        }}
      >
        <RoundBtn label="No" color={C.no} onClick={() => decide(false)}>
          ✕
        </RoundBtn>
        <RoundBtn
          label="Undo"
          color={C.amber}
          small
          disabled={results.length === 0}
          onClick={undo}
        >
          ↩
        </RoundBtn>
        <RoundBtn label="Yes" color={C.yes} onClick={() => decide(true)}>
          ♥
        </RoundBtn>
      </div>

      <p style={{ color: C.muted, fontSize: 13, marginTop: 16, fontWeight: 600 }}>
        Drag the card, tap a button, or use ← / → keys
      </p>
    </div>
  );
}

function Header({ C, index, total }) {
  const pct = Math.round((index / total) * 100);
  return (
    <div style={{ width: "min(360px, 88vw)", marginBottom: 6 }}>
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        <h1
          style={{
            fontFamily: "'Fraunces', serif",
            fontWeight: 700,
            fontSize: 26,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          PupPicker
        </h1>
        <span style={{ fontWeight: 800, color: C.muted, fontSize: 14 }}>
          {Math.min(index + 1, total)} / {total}
        </span>
      </div>
      <div
        style={{
          height: 6,
          background: "#d4ded4",
          borderRadius: 999,
          marginTop: 8,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: C.yes,
            borderRadius: 999,
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

function CardShell({ C, children, style, innerRef, ...handlers }) {
  return (
    <div
      ref={innerRef}
      {...handlers}
      style={{
        position: "absolute",
        inset: 0,
        background: C.card,
        borderRadius: 26,
        boxShadow: "0 18px 40px rgba(31,42,36,0.18)",
        overflow: "hidden",
        touchAction: "none",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function CardBody({ C, i, cache, onRetry }) {
  const name = BREEDS[i][0];
  const entry = cache[i] || { status: "loading" };
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#dfe6df",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {entry.status === "ready" && (
          <img
            src={entry.url}
            alt={name}
            draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}
        {entry.status === "loading" && <Spinner color={C.muted} />}
        {entry.status === "error" && (
          <button
            onClick={onRetry}
            style={{
              fontFamily: "'Nunito', sans-serif",
              fontWeight: 700,
              background: "#fff",
              border: `2px solid ${C.no}`,
              color: C.no,
              borderRadius: 999,
              padding: "8px 16px",
              cursor: "pointer",
            }}
          >
            Couldn't load — retry
          </button>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "40px 18px 16px",
          background:
            "linear-gradient(to top, rgba(20,28,23,0.78) 0%, rgba(20,28,23,0) 100%)",
        }}
      >
        <div
          style={{
            fontFamily: "'Fraunces', serif",
            color: "#fff",
            fontSize: 24,
            fontWeight: 600,
            lineHeight: 1.1,
            textShadow: "0 1px 8px rgba(0,0,0,0.3)",
          }}
        >
          {name}
        </div>
      </div>
    </div>
  );
}

function Stamp({ text, color, rotate, side, opacity }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 26,
        [side]: 22,
        zIndex: 5,
        opacity,
        transform: `rotate(${rotate}deg)`,
        border: `5px solid ${color}`,
        color,
        fontFamily: "'Nunito', sans-serif",
        fontWeight: 800,
        fontSize: 30,
        letterSpacing: "0.06em",
        padding: "4px 14px",
        borderRadius: 12,
        background: "rgba(255,255,255,0.85)",
        pointerEvents: "none",
      }}
    >
      {text}
    </div>
  );
}

function RoundBtn({ children, label, color, onClick, small, disabled }) {
  const size = small ? 50 : 66;
  return (
    <button
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        border: `2px solid ${disabled ? "#c7d0c7" : color}`,
        background: "#fff",
        color: disabled ? "#c7d0c7" : color,
        fontSize: small ? 22 : 28,
        cursor: disabled ? "default" : "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: disabled ? "none" : "0 6px 16px rgba(31,42,36,0.14)",
        transition: "transform 0.12s ease",
      }}
      onMouseDown={(e) => {
        if (!disabled) e.currentTarget.style.transform = "scale(0.9)";
      }}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
    >
      {children}
    </button>
  );
}

function Spinner({ color }) {
  return (
    <div
      style={{
        width: 34,
        height: 34,
        border: `3px solid #cbd6cb`,
        borderTopColor: color,
        borderRadius: "50%",
        animation: "ppspin 0.8s linear infinite",
      }}
    >
      <style>{`@keyframes ppspin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
