import { SignUp } from "@clerk/nextjs";
import { Header } from "@/components/Header/Header";

export default function SignUpPage() {
  return (
    <>
      <Header />
      <section className="bg-gray-50 dark:bg-gray-800">
        <div className="mx-auto flex min-h-screen items-center justify-center px-4 py-8">
          <SignUp />
        </div>
      </section>
    </>
  );
}
