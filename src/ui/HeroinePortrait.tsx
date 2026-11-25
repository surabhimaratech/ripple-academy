import { heroine } from "../heroine/assets";
export function HeroinePortrait({
  className = "",
  decorative = false,
}: {
  className?: string;
  decorative?: boolean;
}) {
  return (
    <span className={`heroine-portrait ${className}`}>
      <img
        src={heroine.portrait}
        alt={
          decorative
            ? ""
            : "The Ripple Academy heroine, with wavy brown hair, a purple ribbon and an embroidered purple jacket"
        }
        width="256"
        height="256"
      />
    </span>
  );
}
