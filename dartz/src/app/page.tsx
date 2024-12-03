import Image from "next/image";
import BackNavigation from "./components/backNavigation/backNavigation";
import Dashboard from "./components/dashboard/dashboard";

export default function Home() {
  return (
    <main className="pb-7">
     <div>
      <BackNavigation/>
      <Dashboard />
     </div>
    </main>
  );
}
