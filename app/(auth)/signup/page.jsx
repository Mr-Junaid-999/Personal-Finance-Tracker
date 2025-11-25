import { createClient } from "@/lib/server";
import { redirect } from "next/navigation";
import Input from "@/components/ui/input";
import PasswordInput from "@/components/ui/passwordInput";
import Alert from "@/components/ui/alert";
import handleSignup from "./action";
import Link from "next/link";
export default async function SignupPage({ searchParams }) {
  const params = await searchParams;
  const error = params.error;
  const success = params.success;
  const supabaseServer = await createClient();
  const {
    data: { session },
  } = await supabaseServer.auth.getSession();
  if (session) {
    const { data: admin } = await supabaseServer
      .from("users")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .single();

    if (admin) {
      redirect("/admin/dashboard");
    } else {
      redirect("/");
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 ">
      <div className="flex flex-col items-center justify-center border py-4 px-12">
        <h1 className="text-4xl font-bold mb-4 text-blue-500">Sign Up</h1>
        <p className=" text-[16px] mb-8 text-gray-400 ">
          Make your account to start selling products on our platform.
        </p>
        {/* Show error from URL if exists */}
        {error && <Alert type="error" message={error} />}

        {/* Show success message if exists */}
        {success && <Alert type="success" message={success} />}

        <form action={handleSignup} className="w-full max-w-sm">
          <div className="mb-6">
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              name={"name"}
              type={"name"}
              placeholder={`Enter your name`}
            />
          </div>
          <Input name="tel" />
          <Input name="email" />
          <div className="mb-6">
            <input
              className="text-gray-400 shadow appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline"
              name="birthdate"
              type="date"
              placeholder="Enter your date of birth"
            />
          </div>
          <div className="mb-6">
            <select
              className="text-gray-400 shadow appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline"
              name="gender"
            >
              <option value="">Select your gender</option>
              <option value="male"> Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <PasswordInput name="password" required={true} />
          <div className="mb-6">
            <p className="text-gray-400">
              If you are already register{" "}
              <Link
                href={"/signin"}
                className="text-[#FB2E86] hover:text-[#0D0E43] transition duration-300 text-[16px] font-medium"
              >
                Click Here
              </Link>
            </p>
          </div>
          <div className="flex w-full items-center justify-between">
            <button
              className="text-white bg-blue-400 hover:bg-blue-500 w-full font-bold py-2 px-4 rounded e"
              type="submit"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
