import { FiActivity } from "react-icons/fi";

type BrandRowProps = {
  className?: string;
};

export function BrandRow({ className = "" }: BrandRowProps) {
  return (
    <div className={`brand-row ${className}`}>
      <span className="brand-mark">
        <FiActivity />
      </span>
      <span>Gym Admin</span>
    </div>
  );
}
