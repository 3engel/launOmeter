type CloudShape = "a" | "b";

const CLOUD_PATHS: Record<
  CloudShape,
  Array<{ cx: number; cy: number; rx: number; ry: number }>
> = {
  a: [
    { cx: 50, cy: 65, rx: 35, ry: 25 },
    { cx: 90, cy: 50, rx: 40, ry: 32 },
    { cx: 135, cy: 60, rx: 35, ry: 28 },
    { cx: 160, cy: 70, rx: 25, ry: 20 },
  ],
  b: [
    { cx: 40, cy: 70, rx: 28, ry: 22 },
    { cx: 75, cy: 55, rx: 34, ry: 28 },
    { cx: 110, cy: 45, rx: 38, ry: 30 },
    { cx: 150, cy: 55, rx: 32, ry: 26 },
    { cx: 175, cy: 70, rx: 22, ry: 18 },
  ],
};

function Cloud({
  scale = 1,
  opacity = 0.95,
  shape = "a",
}: {
  scale?: number;
  opacity?: number;
  shape?: CloudShape;
}) {
  return (
    <svg
      viewBox="0 0 200 100"
      width={140 * scale}
      height={70 * scale}
      aria-hidden
    >
      <g
        fill="white"
        opacity={opacity}
      >
        {CLOUD_PATHS[shape].map((e, i) => (
          <ellipse
            key={i}
            {...e}
          />
        ))}
      </g>
    </svg>
  );
}

function Crayon({
  color,
  tip,
  height = 110,
}: {
  color: string;
  tip: string;
  height?: number;
}) {
  return (
    <svg
      viewBox="0 0 40 160"
      width={height * (40 / 160)}
      height={height}
      aria-hidden
      className="drop-shadow-md"
    >
      {/* Body */}
      <rect
        x="6"
        y="30"
        width="28"
        height="110"
        rx="3"
        fill={color}
      />
      {/* Label band */}
      <rect
        x="6"
        y="60"
        width="28"
        height="14"
        fill="rgba(255,255,255,0.35)"
      />
      <rect
        x="6"
        y="92"
        width="28"
        height="3"
        fill="rgba(0,0,0,0.15)"
      />
      {/* Wood tip */}
      <polygon
        points="6,30 34,30 28,8 12,8"
        fill="#f5d6a4"
      />
      <polygon
        points="12,8 28,8 22,0 18,0"
        fill={tip}
      />
      {/* Bottom shadow */}
      <rect
        x="6"
        y="138"
        width="28"
        height="2"
        fill="rgba(0,0,0,0.2)"
      />
    </svg>
  );
}

const CRAYONS: Array<{ color: string; tip: string }> = [
  { color: "#ef4444", tip: "#7f1d1d" },
  { color: "#f97316", tip: "#7c2d12" },
  { color: "#facc15", tip: "#854d0e" },
  { color: "#22c55e", tip: "#14532d" },
  { color: "#0ea5e9", tip: "#0c4a6e" },
  { color: "#6366f1", tip: "#312e81" },
  { color: "#a855f7", tip: "#581c87" },
  { color: "#ec4899", tip: "#831843" },
];

export function SchoolBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none bg-linear-to-b from-sky-300 via-sky-200 to-sky-100">
      {/* Sun */}
      <div className="absolute top-10 right-16 w-28 h-28 rounded-full bg-yellow-300/80 blur-sm" />

      {/* Clouds — varied sizes, shapes, opacities and speeds */}
      <div
        className="cloud-track cloud-xslow"
        style={{ top: "5%" }}
      >
        <Cloud
          scale={2.2}
          opacity={0.95}
          shape="b"
        />
      </div>
      <div
        className="cloud-track cloud-slow"
        style={{ top: "18%" }}
      >
        <Cloud
          scale={1.6}
          opacity={0.7}
          shape="a"
        />
      </div>
      <div
        className="cloud-track cloud-slow-2"
        style={{ top: "10%" }}
      >
        <Cloud
          scale={1.1}
          opacity={0.55}
          shape="b"
        />
      </div>
      <div
        className="cloud-track cloud-medium"
        style={{ top: "28%" }}
      >
        <Cloud
          scale={1.9}
          opacity={0.85}
          shape="a"
        />
      </div>
      <div
        className="cloud-track cloud-medium-2"
        style={{ top: "40%" }}
      >
        <Cloud
          scale={0.9}
          opacity={0.4}
          shape="a"
        />
      </div>
      <div
        className="cloud-track cloud-fast"
        style={{ top: "33%" }}
      >
        <Cloud
          scale={1.3}
          opacity={0.65}
          shape="b"
        />
      </div>
      <div
        className="cloud-track cloud-fast-2"
        style={{ top: "48%" }}
      >
        <Cloud
          scale={0.7}
          opacity={0.5}
          shape="b"
        />
      </div>

      {/* Ground strip */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-linear-to-b from-green-200/0 to-green-300/60" />

      {/* Crayons row */}
      <div className="absolute bottom-0 inset-x-0 flex items-end justify-center gap-3 sm:gap-5 px-4 pb-1 flex-wrap">
        {CRAYONS.map((c, i) => (
          <Crayon
            key={i}
            color={c.color}
            tip={c.tip}
            height={120 + (i % 3) * 8}
          />
        ))}
      </div>

      <div>
        <img
          src="/IchDuWir.svg"
          alt=""
          className="absolute left-0 w-140 -rotate-45 top-50"
        />
      </div>
    </div>
  );
}
