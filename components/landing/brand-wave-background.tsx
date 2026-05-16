export function BrandWaveBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-white" aria-hidden="true">
      <svg
        className="wave-layer wave-layer-blue"
        viewBox="0 0 1600 560"
        preserveAspectRatio="none"
      >
        <path
          d="M-80 410 C 170 250 365 505 600 356 C 840 204 1085 262 1320 182 C 1465 132 1560 118 1680 138 L1680 560 L-80 560 Z"
          fill="#0033A0"
          opacity="0.16"
        />
        <path
          d="M-80 486 C 170 318 410 520 665 410 C 910 304 1098 386 1338 260 C 1485 184 1585 168 1680 172 L1680 560 L-80 560 Z"
          fill="#0033A0"
          opacity="0.28"
        />
      </svg>

      <svg
        className="wave-layer wave-layer-light"
        viewBox="0 0 1600 520"
        preserveAspectRatio="none"
      >
        <path
          d="M-90 394 C 135 270 324 300 530 382 C 765 474 980 410 1165 286 C 1340 170 1502 150 1690 190 L1690 520 L-90 520 Z"
          fill="#7DA0CA"
          opacity="0.22"
        />
        <path
          d="M-90 438 C 220 350 435 452 650 435 C 900 416 1080 286 1270 236 C 1435 192 1564 218 1690 260 L1690 520 L-90 520 Z"
          fill="#0033A0"
          opacity="0.08"
        />
      </svg>

      <svg
        className="wave-layer wave-layer-orange"
        viewBox="0 0 1600 520"
        preserveAspectRatio="none"
      >
        <path
          d="M-100 322 C 120 388 250 506 505 468 C 760 430 858 282 1118 340 C 1356 394 1456 456 1700 286 L1700 520 L-100 520 Z"
          fill="#FF6620"
          opacity="0.18"
        />
        <path
          d="M-100 398 C 140 440 306 526 560 488 C 792 454 930 332 1158 382 C 1378 430 1488 464 1700 356"
          fill="none"
          stroke="#FF6620"
          strokeLinecap="round"
          strokeWidth="10"
          opacity="0.34"
        />
      </svg>

      <svg
        className="wave-layer wave-layer-contours"
        viewBox="0 0 1600 620"
        preserveAspectRatio="none"
      >
        {Array.from({ length: 12 }).map((_, index) => (
          <path
            key={index}
            d={`M-120 ${390 + index * 16} C 130 ${260 + index * 8} 340 ${500 - index * 9} 600 ${390 + index * 10} C 858 ${282 + index * 8} 1010 ${450 - index * 8} 1260 ${304 + index * 7} C 1438 ${200 + index * 8} 1548 ${220 + index * 10} 1720 ${190 + index * 8}`}
            fill="none"
            stroke={index % 3 === 0 ? "#FF6620" : "#0033A0"}
            strokeWidth="1.2"
            opacity={index % 3 === 0 ? "0.12" : "0.08"}
          />
        ))}
      </svg>

      <div className="absolute right-[-14%] top-[18%] h-[56%] w-[48%] rounded-full border border-[#0033A0]/[0.05]" />
    </div>
  );
}
