import { DUO, Place } from "@/services/places";

// Two r=50 circles centred 60 apart (ijul left, dapta right) cross at (100,20) and (100,100);
// the lens between them is "both". Paths and label x-positions follow DUO's order.
const REGIONS = [
  { d: "M100 20A50 50 0 1 0 100 100A50 50 0 0 1 100 20Z", x: 47 },
  { d: "M100 20A50 50 0 0 1 100 100A50 50 0 0 1 100 20Z", x: 100 },
  { d: "M100 20A50 50 0 1 1 100 100A50 50 0 0 0 100 20Z", x: 153 },
];

export default function DuoFilter({
  places,
  hidden,
  onToggle,
  className = "",
}: {
  places: Place[];
  hidden: readonly string[];
  onToggle: (group: string) => void;
  className?: string;
}) {
  return (
    <figure className={`duo sticker ${className}`}>
      <svg viewBox="-2 8 204 104" role="group" aria-label="Show or hide places by who's been there">
        {DUO.map((d, i) => {
          const shown = !hidden.includes(d.group);
          const count = places.filter((p) => p.group === d.group).length;
          return (
            <g
              key={d.group}
              className="duo-region"
              role="button"
              tabIndex={0}
              aria-pressed={shown}
              aria-label={`${d.group}: ${count} places`}
              onClick={() => onToggle(d.group)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggle(d.group);
                }
              }}
            >
              <path d={REGIONS[i].d} fill={shown ? d.color : "#fff"} />
              <text x={REGIONS[i].x} y="62" className="duo-count">
                {count}
              </text>
              <text x={REGIONS[i].x} y="78" className="duo-label">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
      <figcaption>tap to show or hide</figcaption>
    </figure>
  );
}
