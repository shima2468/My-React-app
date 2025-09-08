import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function ToolCard({
  title,
  desc,
  icon: Icon,
  to,
  onClick,
  color = "bg-blue-500",
  padding = "p-6",
  selected = false,
  right = null,
  disabled = false,
}) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (disabled) return;
    if (onClick) onClick();
    else if (to) navigate(to);
  };

  return (
    <motion.div
      onClick={handleClick}
      initial={{ scale: 1 }}
      whileHover={disabled ? undefined : { scale: 1.015 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={[
        "cursor-pointer flex items-start gap-5 rounded-2xl border border-slate-200 bg-white hover:shadow-sm",
        padding,
        disabled && "opacity-60 pointer-events-none",
        selected && "ring-2 ring-blue-500",
      ].filter(Boolean).join(" ")}
    >
      <span className={`grid size-12 place-items-center rounded-xl text-white ${color}`}>
        {Icon ? <Icon className="size-7" /> : null}
      </span>
      <div className="pt-1 flex-1">
        <h3 className="text-lg font-serif font-bold text-slate-900">{title}</h3>
        {desc && <p className="mt-2 text-[15px] leading-6 text-slate-600">{desc}</p>}
      </div>
      {right}
    </motion.div>
  );
}
