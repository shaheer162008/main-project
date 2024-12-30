import Link from "next/link";
import Excel from "@/components/features/excel";
import { getServerSession } from "next-auth";
import { options } from "./api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";


export default async function Dashboard() {

  const session = await getServerSession(options);

    if (!session) {
      redirect("/api/auth/signin?callbackUrl=/");
    }
  return (
    <>

<div className="flex h-14 items-center bg-black justify-between py-10 border-b px-4 lg:h-[60px] lg:px-6">
  <Link href="/" className="flex items-center gap-2 font-semibold">
    <img src="logo.png" alt="Logo" className="h-16" />
    <span className="text-white">School Education & Literacy Department Legal Dashboard</span>
  </Link>
    <div className="flex gap-x-2 text-white">
    {session?
    (
      <>
      <Link href="/api/auth/signout?callbackUrl=/">Logout</Link>
      <Link href={'/createUser'}>Create User</Link>
      </>
    ):
    (
      <Link href="/api/auth/signin">Login</Link>
    )}
    </div>
</div>

      <main className="flex flex-1 flex-col bg-black gap-4 p-4 lg:gap-6 lg:p-6">
        <Excel />
      </main>
    </>
  );
}
