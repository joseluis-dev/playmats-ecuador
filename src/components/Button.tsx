import type { JSX } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
  label?: string;
  icon?: React.ReactNode;
}

export const Button = ({ className = '', label = '', icon = null, ...props }: ButtonProps): JSX.Element => {
  return (
    <button className={className}
      {...props}
    >
      <p className="text-sm font-bold">{label}</p>
      {icon}
    </button>
  )
}
