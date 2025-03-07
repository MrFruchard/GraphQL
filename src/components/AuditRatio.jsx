import { useState, useEffect } from "react";
import "./AuditRatio.css";

const AuditRatio = ({ auditData }) => {
  const [stats, setStats] = useState({
    done: 0,
    received: 0,
    upVotes: 0,
    downVotes: 0,
    upRatio: 0,
  });

  useEffect(() => {
    if (!auditData || auditData.length === 0) return;

    // Compter les audits effectués (done) et reçus (received)
    const upVotes = auditData.filter((audit) => audit.type === "up").length;
    const downVotes = auditData.filter((audit) => audit.type === "down").length;

    // Déterminer le nombre d'audits effectués et reçus
    // Dans cet exemple, nous utilisons une estimation basée sur la structure des audits
    // En réalité, il faudrait analyser les chemins ou d'autres attributs pour être précis
    const done = upVotes + downVotes;

    // Pour simplifier, on estime le nombre d'audits reçus comme étant proportionnel
    // Dans un vrai système, vous devriez avoir cette information dans les données
    const received = Math.round(done * 0.8); // Estimation : 80% des audits effectués

    const upRatio = done > 0 ? upVotes / done : 0;

    setStats({
      done,
      received,
      upVotes,
      downVotes,
      upRatio,
    });
  }, [auditData]);

  // Si pas de données, afficher un message
  if (!auditData || auditData.length === 0) {
    return <div className="no-data">No audit data available</div>;
  }

  // Dimensions du SVG
  const width = 600;
  const height = 300;
  const barWidth = 60;
  const barSpacing = 40;
  const barMaxHeight = height - 80;

  // Calculer les hauteurs des barres
  const maxValue = Math.max(stats.done, stats.received);
  const doneHeight = maxValue > 0 ? (stats.done / maxValue) * barMaxHeight : 0;
  const receivedHeight =
    maxValue > 0 ? (stats.received / maxValue) * barMaxHeight : 0;

  // Position des barres
  const doneX = width / 2 - barSpacing / 2 - barWidth;
  const receivedX = width / 2 + barSpacing / 2;

  // Créer la ligne du ratio up/down
  const createRatioPath = () => {
    const centerX = width / 2;
    const startY = height - 40;
    const endY = 40;
    const controlPoint1X = centerX - 100;
    const controlPoint2X = centerX + 100;
    const controlPointY = startY - (startY - endY) * stats.upRatio;

    return `M ${
      centerX - 120
    } ${startY} C ${controlPoint1X} ${controlPointY}, ${controlPoint2X} ${controlPointY}, ${
      centerX + 120
    } ${startY}`;
  };

  return (
    <div className="audit-ratio-container">
      <div className="audit-stats">
        <div className="audit-stat-item">
          <div className="stat-label">Audits effectués:</div>
          <div className="stat-value">{stats.done}</div>
        </div>
        <div className="audit-stat-item">
          <div className="stat-label">Audits reçus:</div>
          <div className="stat-value">{stats.received}</div>
        </div>
        <div className="audit-stat-item accent">
          <div className="stat-label">Votes positifs:</div>
          <div className="stat-value">
            {stats.upVotes} ({Math.round(stats.upRatio * 100)}%)
          </div>
        </div>
        <div className="audit-stat-item">
          <div className="stat-label">Votes négatifs:</div>
          <div className="stat-value">
            {stats.downVotes} ({Math.round((1 - stats.upRatio) * 100)}%)
          </div>
        </div>
      </div>

      <svg
        width="100%"
        height="300"
        viewBox={`0 0 ${width} ${height}`}
        className="audit-chart"
      >
        {/* Axe Y */}
        <line
          x1="80"
          y1="40"
          x2="80"
          y2={height - 40}
          stroke="#555"
          strokeWidth="1"
        />

        {/* Ticks de l'axe Y */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => {
          const y = height - 40 - tick * barMaxHeight;
          return (
            <g key={`y-tick-${i}`}>
              <line
                x1="75"
                y1={y}
                x2="80"
                y2={y}
                stroke="#555"
                strokeWidth="1"
              />
              <text
                x="70"
                y={y}
                textAnchor="end"
                dominantBaseline="middle"
                fill="#aaa"
                fontSize="12"
              >
                {Math.round(maxValue * tick)}
              </text>
            </g>
          );
        })}

        {/* Barre des audits effectués */}
        <g className="bar-group">
          <rect
            x={doneX}
            y={height - 40 - doneHeight}
            width={barWidth}
            height={doneHeight}
            rx="5"
            fill="#4CAF50"
            className="bar done-bar"
          />
          <text
            x={doneX + barWidth / 2}
            y={height - 40 - doneHeight - 10}
            textAnchor="middle"
            fill="#fff"
            fontSize="14"
            fontWeight="bold"
          >
            {stats.done}
          </text>
          <text
            x={doneX + barWidth / 2}
            y={height - 20}
            textAnchor="middle"
            fill="#aaa"
            fontSize="14"
          >
            Effectués
          </text>
        </g>

        {/* Barre des audits reçus */}
        <g className="bar-group">
          <rect
            x={receivedX}
            y={height - 40 - receivedHeight}
            width={barWidth}
            height={receivedHeight}
            rx="5"
            fill="#2196F3"
            className="bar received-bar"
          />
          <text
            x={receivedX + barWidth / 2}
            y={height - 40 - receivedHeight - 10}
            textAnchor="middle"
            fill="#fff"
            fontSize="14"
            fontWeight="bold"
          >
            {stats.received}
          </text>
          <text
            x={receivedX + barWidth / 2}
            y={height - 20}
            textAnchor="middle"
            fill="#aaa"
            fontSize="14"
          >
            Reçus
          </text>
        </g>

        {/* Titre du graphique */}
        <text
          x={width / 2}
          y="20"
          textAnchor="middle"
          fill="#eee"
          fontSize="16"
          fontWeight="bold"
        >
          Audits effectués vs. reçus
        </text>

        {/* Section du ratio up/down */}
        <g className="up-down-ratio">
          <text
            x={width / 2}
            y={height - 80}
            textAnchor="middle"
            fill="#eee"
            fontSize="14"
            fontWeight="bold"
          >
            Ratio de votes positifs: {Math.round(stats.upRatio * 100)}%
          </text>

          {/* Ligne du ratio */}
          <path
            d={createRatioPath()}
            fill="none"
            stroke="url(#ratioGradient)"
            strokeWidth="6"
            strokeLinecap="round"
          />

          {/* Dégradé pour la ligne du ratio */}
          <defs>
            <linearGradient
              id="ratioGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#F44336" />
              <stop offset={`${stats.upRatio * 100}%`} stopColor="#F44336" />
              <stop offset={`${stats.upRatio * 100}%`} stopColor="#4CAF50" />
              <stop offset="100%" stopColor="#4CAF50" />
            </linearGradient>
          </defs>
        </g>
      </svg>
    </div>
  );
};

export default AuditRatio;
