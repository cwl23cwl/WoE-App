import StaticSvgBoard from "../../components/StaticSvgBoard";

export default function Page(){
  const width = 960, height = 540;

  const svg = (
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox={`0 0 ${width} ${height}`}>
      {/* Title box */}
      <rect x="180" y="60" width="600" height="110" fill="none" stroke="#4b5563" strokeWidth="6" rx="6" />
      <text x="480" y="130" textAnchor="middle"
            fontSize="72" fontWeight="800"
            fill="#c084fc" stroke="#6b7280" strokeWidth="2" paintOrder="stroke">
        ESSAY WRITING
      </text>

      {/* Prompt box */}
      <rect x="140" y="210" width="680" height="210" fill="#fff" stroke="#3b82f6" strokeWidth="3" rx="6" />
      <text x="160" y="250" fontSize="28" fontWeight="600" fill="#111827">
        <tspan x="160" dy="0">You wake up and find you have switched places with</tspan>
        <tspan x="160" dy="36">your teacher for one day. Describe what you would</tspan>
        <tspan x="160" dy="36">teach and how the day would go.</tspan>
      </text>
    </svg>
  );

  return (
    <main style={{ padding: 24 }}>
      <StaticSvgBoard width={width} height={height} page={2} totalPages={6} svg={svg} />
    </main>
  );
}
