import { useState, useEffect } from "react";
import "./ProjectsChart.css";

const ProjectsChart = ({ resultsData }) => {
  const [chartData, setChartData] = useState({
    pass: 0,
    fail: 0,
  });
  const [activeSlice, setActiveSlice] = useState(null);

  useEffect(() => {
    if (resultsData && resultsData.length > 0) {
      // Filtrer seulement les projets (pas les exercices)
      const projectResults = resultsData.filter(
        (item) =>
          item.path &&
          (item.path.includes("project") || item.path.includes("piscine"))
      );

      const pass = projectResults.filter((item) => item.grade === 1).length;
      const fail = projectResults.filter((item) => item.grade === 0).length;

      setChartData({ pass, fail });
    }
  }, [resultsData]);

  // Si pas de données, afficher un message
  if (!resultsData || resultsData.length === 0) {
    return <div className="no-data">No project data available</div>;
  }

  // Dimensions du SVG
  const size = 300;
  const radius = size / 2 - 40;
  const centerX = size / 2;
  const centerY = size / 2;

  // Données pour le graphique
  const total = chartData.pass + chartData.fail;
  if (total === 0) {
    return <div className="no-data">No project results available</div>;
  }

  const passRatio = chartData.pass / total;
  const failRatio = chartData.fail / total;

  // Calculer les angles pour le diagramme
  const startAnglePass = 0;
  const endAnglePass = 2 * Math.PI * passRatio;
  const startAngleFail = endAnglePass;
  const endAngleFail = 2 * Math.PI;

  // Fonction pour convertir un angle en coordonnées x,y
  const polarToCartesian = (centerX, centerY, radius, angle) => {
    return {
      x: centerX + radius * Math.cos(angle - Math.PI / 2),
      y: centerY + radius * Math.sin(angle - Math.PI / 2),
    };
  };

  // Créer un arc SVG
  const createArc = (startAngle, endAngle, radius) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= Math.PI ? 0 : 1;

    return [
      "M",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
      "L",
      centerX,
      centerY,
      "Z",
    ].join(" ");
  };

  // Arcs pour les tranches de réussite et d'échec
  const passArc = createArc(startAnglePass, endAnglePass, radius);
  const failArc = createArc(startAngleFail, endAngleFail, radius);

  // Position des légendes
  const passLabelPos = polarToCartesian(
    centerX,
    centerY,
    radius * 0.7,
    startAnglePass + (endAnglePass - startAnglePass) / 2
  );

  const failLabelPos = polarToCartesian(
    centerX,
    centerY,
    radius * 0.7,
    startAngleFail + (endAngleFail - startAngleFail) / 2
  );

  // Handle mouse events for hover effects
  const handleMouseEnter = (slice) => {
    setActiveSlice(slice);
  };

  const handleMouseLeave = () => {
    setActiveSlice(null);
  };

  return (
    <div className="projects-chart-container">
      <div className="pie-legend">
        <div className="legend-item">
          <div
            className="legend-color"
            style={{ backgroundColor: "#4CAF50" }}
          ></div>
          <div className="legend-label">Pass ({chartData.pass})</div>
        </div>
        <div className="legend-item">
          <div
            className="legend-color"
            style={{ backgroundColor: "#F44336" }}
          ></div>
          <div className="legend-label">Fail ({chartData.fail})</div>
        </div>
        <div className="legend-item">
          <div className="legend-text">Total: {total}</div>
        </div>
      </div>

      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${size} ${size}`}
        className="projects-chart"
      >
        {/* Tranches du diagramme */}
        <path
          d={passArc}
          fill="#4CAF50"
          stroke="#242424"
          strokeWidth="1"
          opacity={activeSlice === "fail" ? 0.6 : 1}
          onMouseEnter={() => handleMouseEnter("pass")}
          onMouseLeave={handleMouseLeave}
          className={activeSlice === "pass" ? "active-slice" : ""}
        />
        <path
          d={failArc}
          fill="#F44336"
          stroke="#242424"
          strokeWidth="1"
          opacity={activeSlice === "pass" ? 0.6 : 1}
          onMouseEnter={() => handleMouseEnter("fail")}
          onMouseLeave={handleMouseLeave}
          className={activeSlice === "fail" ? "active-slice" : ""}
        />

        {/* Textes au centre des tranches */}
        {passRatio > 0.1 && (
          <text
            x={passLabelPos.x}
            y={passLabelPos.y}
            textAnchor="middle"
            fill="#fff"
            fontSize="14"
            fontWeight="bold"
          >
            {Math.round(passRatio * 100)}%
          </text>
        )}

        {failRatio > 0.1 && (
          <text
            x={failLabelPos.x}
            y={failLabelPos.y}
            textAnchor="middle"
            fill="#fff"
            fontSize="14"
            fontWeight="bold"
          >
            {Math.round(failRatio * 100)}%
          </text>
        )}

        {/* Ligne centrale (style) */}
        <circle
          cx={centerX}
          cy={centerY}
          r="5"
          fill="#242424"
          stroke="#aaa"
          strokeWidth="1"
        />
      </svg>

      <div className="success-rate">
        <span className="rate-label">Success Rate:</span>
        <span className="rate-value">{Math.round(passRatio * 100)}%</span>
      </div>
    </div>
  );
};

export default ProjectsChart;
