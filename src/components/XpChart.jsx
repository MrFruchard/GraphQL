import { useState, useEffect } from "react";
import "./XpChart.css";

const XpChart = ({ xpData }) => {
  const [totalXP, setTotalXP] = useState(0);

  useEffect(() => {
    if (xpData && xpData.length > 0) {
      const total = xpData.reduce((sum, item) => sum + item.amount, 0);
      setTotalXP(total);
    }
  }, [xpData]);

  // Pas de données à afficher
  if (!xpData || xpData.length === 0) {
    return <div className="no-data">No XP data available</div>;
  }

  // Trier les données par date
  const sortedData = [...xpData].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
  );

  // Préparer les données pour le graphique
  let cumulativeXP = 0;
  const chartData = sortedData.map((item) => {
    cumulativeXP += item.amount;
    return {
      date: new Date(item.createdAt),
      xp: item.amount,
      cumulativeXP,
      path: item.path,
    };
  });

  // Calculer les dimensions du graphique
  const svgWidth = 800;
  const svgHeight = 400;
  const margin = { top: 30, right: 30, bottom: 50, left: 60 };
  const width = svgWidth - margin.left - margin.right;
  const height = svgHeight - margin.top - margin.bottom;

  // Déterminer les échelles
  const xMin = chartData[0].date;
  const xMax = chartData[chartData.length - 1].date;
  const yMax = chartData[chartData.length - 1].cumulativeXP;

  // Fonction pour calculer les positions
  const getX = (date) => {
    return margin.left + (width * (date - xMin)) / (xMax - xMin);
  };

  const getY = (value) => {
    return margin.top + (height - (height * value) / yMax);
  };

  // Générer le chemin pour la ligne du graphique
  let pathD = "";
  chartData.forEach((point, i) => {
    const x = getX(point.date);
    const y = getY(point.cumulativeXP);

    if (i === 0) {
      pathD += `M ${x} ${y}`;
    } else {
      pathD += ` L ${x} ${y}`;
    }
  });

  // Générer le chemin pour l'aire sous la courbe
  const areaD = `${pathD} L ${getX(
    chartData[chartData.length - 1].date
  )} ${getY(0)} L ${getX(chartData[0].date)} ${getY(0)} Z`;

  // Générer les ticks pour l'axe X (5 dates réparties)
  const xTicks = [];
  for (let i = 0; i < 5; i++) {
    const tickDate = new Date(xMin.getTime() + (i * (xMax - xMin)) / 4);
    xTicks.push({
      date: tickDate,
      x: getX(tickDate),
      label: tickDate.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      }),
    });
  }

  // Générer les ticks pour l'axe Y (5 valeurs réparties)
  const yTicks = [];
  for (let i = 0; i <= 5; i++) {
    const value = (i * yMax) / 5;
    yTicks.push({
      value,
      y: getY(value),
      label: Math.round(value).toLocaleString(),
    });
  }

  return (
    <div className="xp-chart-container">
      <div className="chart-info">
        <div className="info-item">
          <span className="info-label">Total XP:</span>
          <span className="info-value">{totalXP.toLocaleString()}</span>
        </div>
      </div>

      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="xp-chart"
      >
        {/* Définition du gradient */}
        <defs>
          <linearGradient id="xpGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f64cf1" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#f64cf1" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Lignes de grille horizontales */}
        {yTicks.map((tick, i) => (
          <line
            key={`grid-h-${i}`}
            x1={margin.left}
            y1={tick.y}
            x2={margin.left + width}
            y2={tick.y}
            stroke="#333"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
        ))}

        {/* Aire sous la courbe */}
        <path d={areaD} fill="url(#xpGradient)" strokeWidth="0" />

        {/* Ligne de l'évolution XP */}
        <path
          d={pathD}
          fill="none"
          stroke="#f64cf1"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points de données */}
        {chartData
          .filter((_, i) => i % Math.ceil(chartData.length / 20) === 0)
          .map((point, i) => (
            <circle
              key={`point-${i}`}
              cx={getX(point.date)}
              cy={getY(point.cumulativeXP)}
              r="4"
              fill="#f64cf1"
            />
          ))}

        {/* Axe X */}
        <line
          x1={margin.left}
          y1={margin.top + height}
          x2={margin.left + width}
          y2={margin.top + height}
          stroke="#aaa"
          strokeWidth="2"
        />

        {/* Ticks de l'axe X */}
        {xTicks.map((tick, i) => (
          <g key={`x-tick-${i}`}>
            <line
              x1={tick.x}
              y1={margin.top + height}
              x2={tick.x}
              y2={margin.top + height + 6}
              stroke="#aaa"
              strokeWidth="2"
            />
            <text
              x={tick.x}
              y={margin.top + height + 20}
              textAnchor="middle"
              fill="#aaa"
              fontSize="12"
            >
              {tick.label}
            </text>
          </g>
        ))}

        {/* Légende axe X */}
        <text
          x={margin.left + width / 2}
          y={svgHeight - 10}
          textAnchor="middle"
          fill="#fff"
          fontSize="14"
        >
          Time
        </text>

        {/* Axe Y */}
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={margin.top + height}
          stroke="#aaa"
          strokeWidth="2"
        />

        {/* Ticks de l'axe Y */}
        {yTicks.map((tick, i) => (
          <g key={`y-tick-${i}`}>
            <line
              x1={margin.left - 6}
              y1={tick.y}
              x2={margin.left}
              y2={tick.y}
              stroke="#aaa"
              strokeWidth="2"
            />
            <text
              x={margin.left - 10}
              y={tick.y}
              textAnchor="end"
              dominantBaseline="middle"
              fill="#aaa"
              fontSize="12"
            >
              {tick.label}
            </text>
          </g>
        ))}

        {/* Légende axe Y */}
        <text
          transform={`rotate(-90, ${margin.left - 40}, ${
            margin.top + height / 2
          })`}
          x={margin.left - 40}
          y={margin.top + height / 2}
          textAnchor="middle"
          fill="#fff"
          fontSize="14"
        >
          Cumulative XP
        </text>
      </svg>
    </div>
  );
};

export default XpChart;
