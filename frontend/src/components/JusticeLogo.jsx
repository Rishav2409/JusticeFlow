const JusticeLogo = ({ className = "w-full h-full" }) => {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Background */}
      <rect
        x="2"
        y="2"
        width="96"
        height="96"
        rx="18"
        fill="#FFFFFF"
      />

      {/* Top circle */}
      <circle
        cx="50"
        cy="19"
        r="6"
        fill="#C65A16"
      />

      {/* Central pillar */}
      <rect
        x="47"
        y="24"
        width="6"
        height="48"
        rx="3"
        fill="#2B170D"
      />

      {/* Balance beam */}
      <rect
        x="19"
        y="25"
        width="62"
        height="6"
        rx="3"
        fill="#2B170D"
      />

      {/* Left suspension */}
      <line
        x1="28"
        y1="31"
        x2="28"
        y2="51"
        stroke="#2B170D"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <line
        x1="28"
        y1="31"
        x2="17"
        y2="51"
        stroke="#2B170D"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <line
        x1="28"
        y1="31"
        x2="39"
        y2="51"
        stroke="#2B170D"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Right suspension */}
      <line
        x1="72"
        y1="31"
        x2="72"
        y2="51"
        stroke="#2B170D"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <line
        x1="72"
        y1="31"
        x2="61"
        y2="51"
        stroke="#2B170D"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      <line
        x1="72"
        y1="31"
        x2="83"
        y2="51"
        stroke="#2B170D"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Left scale */}
      <path
        d="M13 51 Q28 63 43 51"
        fill="none"
        stroke="#C65A16"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Right scale */}
      <path
        d="M57 51 Q72 63 87 51"
        fill="none"
        stroke="#C65A16"
        strokeWidth="4"
        strokeLinecap="round"
      />

      {/* Base */}
      <rect
        x="39"
        y="72"
        width="22"
        height="5"
        rx="2.5"
        fill="#2B170D"
      />

      <rect
        x="32"
        y="77"
        width="36"
        height="6"
        rx="3"
        fill="#C65A16"
      />
    </svg>
  );
};

export default JusticeLogo;

