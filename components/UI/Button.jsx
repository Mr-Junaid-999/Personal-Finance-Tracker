// components/UI/Button.js
export default function Button({
  children,
  variant = "primary",
  size = "medium",
  ...props
}) {
  const baseClasses =
    "font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors";

  const variants = {
    primary:
      "bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500",
    secondary:
      "bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
  };

  const sizes = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-sm",
    large: "px-6 py-3 text-base",
  };

  const className = `${baseClasses} ${variants[variant]} ${sizes[size]} ${
    props.className || ""
  }`;

  return (
    <button {...props} className={className}>
      {children}
    </button>
  );
}
