// components/PasswordInput.jsx - WITH NAME PROP

export default async function Input({ name, CSS = "", PH = "" }) {
  return (
    <div className="mb-6">
      <input
        className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${CSS}`}
        name={name}
        type={name}
        placeholder={PH === "" ? `Enter your ${name}` : PH}
      />
    </div>
  );
}
