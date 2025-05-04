import React from "react";

type PlayIconProps = React.SVGProps<SVGSVGElement> & {
  className?: string;
};

const PlayIcon: React.FC<PlayIconProps> = ({ className = "", ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`lucide lucide-play-icon lucide-play ${className}`}
    {...props}
  >
    <polygon points="6 3 20 12 6 21 6 3" />
  </svg>
);

export default PlayIcon;