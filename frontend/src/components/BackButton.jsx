import { useNavigate } from "react-router-dom";

export default function BackButton({ to }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-orange-500 transition-colors group"
    >
      <span className="text-lg leading-none transition-transform group-hover:-translate-x-0.5">
        ←
      </span>
      <span>Back</span>
    </button>
  );
}
