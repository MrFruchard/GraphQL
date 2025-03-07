import { useState, useEffect } from "react";
import "./SkillsRadar.css";

const SkillsRadar = ({ progressData, resultsData }) => {
  const [skills, setSkills] = useState([]);
  const [hoveredSkill, setHoveredSkill] = useState(null);

  useEffect(() => {
    if (!progressData || progressData.length === 0) return;

    // Extraire les domaines de compétences à partir des chemins de progression
    const skillsMap = new Map();

    // Fonction pour extraire le domaine de compétence du chemin
    const extractSkill = (path) => {
      if (!path) return null;

      // Exemples de domaines: go, js, html, css, sql, etc.
      const domains = [
        "go",
        "js",
        "html",
        "css",
        "sql",
        "graphql",
        "docker",
        "react",
      ];

      for (const domain of domains) {
        if (path.toLowerCase().includes(domain)) {
          return domain.toUpperCase();
        }
      }

      // Si c'est une piscine, traiter spécialement
      if (path.includes("piscine")) {
        if (path.includes("go")) return "GO";
        if (path.includes("js")) return "JS";
        return "PISCINE";
      }

      // Extraire le premier segment du chemin comme domaine par défaut
      const segments = path.split("/").filter((s) => s);
      if (segments.length > 1) {
        return segments[1].toUpperCase();
      }

      return "OTHER";
    };

    // Traiter les données de progression
    progressData.forEach((item) => {
      const skill = extractSkill(item.path);
      if (!skill) return;

      if (!skillsMap.has(skill)) {
        skillsMap.set(skill, {
          name: skill,
          completed: 0,
          total: 0,
          score: 0,
        });
      }

      const skillData = skillsMap.get(skill);
      skillData.total += 1;
      if (item.grade > 0) {
        skillData.completed += 1;
      }
    });

    // Calculer les scores
    skillsMap.forEach((skill) => {
      skill.score = skill.total > 0 ? skill.completed / skill.total : 0;
    });

    // Convertir la Map en tableau et trier par nom
    const skillsArray = Array.from(skillsMap.values())
      .filter((skill) => skill.total > 0) // Filtrer les compétences avec des données
      .sort((a, b) => b.score - a.score); // Trier par score décroissant

    setSkills(skillsArray);
  }, [progressData, resultsData]);

  if (!skills || skills.length === 0) {
    return <div className="no-data">No skills data available</div>;
  }

  // Calculer les dimensions du radar
  const size = 500;
  const center = size / 2;
  const radius = size * 0.4;

  // Nombre d'axes (compétences)
  const numSkills = skills.length;

  // Nombre de cercles concentriques (niveaux)
  const numLevels = 5;

  // Calculer les coordonnées pour chaque axe
  const getCoordinates = (index, level) => {
    const angle = (Math.PI * 2 * index) / numSkills - Math.PI / 2;
    const r = (radius * level) / numLevels;

    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Générer les points pour la forme du radar
  const generateRadarPath = () => {
    let path = "";

    skills.forEach((skill, i) => {
      const point = getCoordinates(i, skill.score * numLevels);

      if (i === 0) {
        path += `M ${point.x} ${point.y}`;
      } else {
        path += ` L ${point.x} ${point.y}`;
      }
    });

    path += " Z"; // Fermer le chemin
    return path;
  };

  // Handler pour survol des axes
  const handleMouseEnter = (skillName) => {
    setHoveredSkill(skillName);
  };

  const handleMouseLeave = () => {
    setHoveredSkill(null);
  };

  return (
    <div className="skills-radar-container">
      <div className="skills-legend">
        {skills.map((skill, index) => (
          <div
            key={skill.name}
            className={`skill-legend-item ${
              hoveredSkill === skill.name ? "active" : ""
            }`}
            onMouseEnter={() => handleMouseEnter(skill.name)}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className="skill-color"
              style={{
                backgroundColor: `hsl(${
                  (index * 360) / skills.length
                }, 70%, 60%)`,
              }}
            ></div>
            <div className="skill-name">{skill.name}</div>
            <div className="skill-score">{Math.round(skill.score * 100)}%</div>
            <div className="skill-ratio">
              ({skill.completed}/{skill.total})
            </div>
          </div>
        ))}
      </div>

      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${size} ${size}`}
        className="skills-radar"
      >
        {/* Cercles concentriques */}
        {Array.from({ length: numLevels }).map((_, level) => (
          <circle
            key={`level-${level + 1}`}
            cx={center}
            cy={center}
            r={(radius * (level + 1)) / numLevels}
            fill="none"
            stroke="#333"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}

        {/* Axes des compétences */}
        {skills.map((skill, index) => {
          const outerPoint = getCoordinates(index, numLevels);
          const isActive = hoveredSkill === skill.name;

          return (
            <line
              key={`axis-${index}`}
              x1={center}
              y1={center}
              x2={outerPoint.x}
              y2={outerPoint.y}
              stroke={isActive ? "#fff" : "#666"}
              strokeWidth={isActive ? "2" : "1"}
              opacity={hoveredSkill && !isActive ? 0.3 : 1}
            />
          );
        })}

        {/* Noms des compétences */}
        {skills.map((skill, index) => {
          const labelPoint = getCoordinates(index, numLevels + 0.3);
          const isActive = hoveredSkill === skill.name;

          return (
            <text
              key={`label-${index}`}
              x={labelPoint.x}
              y={labelPoint.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={isActive ? "#fff" : "#aaa"}
              fontSize={isActive ? "14" : "12"}
              fontWeight={isActive ? "bold" : "normal"}
              opacity={hoveredSkill && !isActive ? 0.3 : 1}
              onMouseEnter={() => handleMouseEnter(skill.name)}
              onMouseLeave={handleMouseLeave}
            >
              {skill.name}
            </text>
          );
        })}

        {/* Polygone du radar */}
        <path
          d={generateRadarPath()}
          fill="rgba(246, 76, 241, 0.2)"
          stroke="#f64cf1"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Points sur le radar */}
        {skills.map((skill, index) => {
          const point = getCoordinates(index, skill.score * numLevels);
          const isActive = hoveredSkill === skill.name;

          return (
            <circle
              key={`point-${index}`}
              cx={point.x}
              cy={point.y}
              r={isActive ? "6" : "4"}
              fill={isActive ? "#fff" : "#f64cf1"}
              stroke={isActive ? "#f64cf1" : "none"}
              strokeWidth="2"
              opacity={hoveredSkill && !isActive ? 0.3 : 1}
              onMouseEnter={() => handleMouseEnter(skill.name)}
              onMouseLeave={handleMouseLeave}
            />
          );
        })}

        {/* Légendes des niveaux */}
        {Array.from({ length: numLevels }).map((_, level) => (
          <text
            key={`level-text-${level + 1}`}
            x={center + 10}
            y={center - (radius * (level + 1)) / numLevels}
            fontSize="10"
            fill="#777"
          >
            {Math.round(((level + 1) / numLevels) * 100)}%
          </text>
        ))}
      </svg>
    </div>
  );
};

export default SkillsRadar;
