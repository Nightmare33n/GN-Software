import AgencyNavbar from "@/components/AgencyNavbar";
import AgencyHero from "@/components/AgencyHero";
import AgencyServices from "@/components/AgencyServices";
import AgencyFooter from "@/components/AgencyFooter";

export default function Page() {
  return (
    <>
      <AgencyNavbar />
      <main>
        <AgencyHero />
        <AgencyServices />
      </main>
      <AgencyFooter />
    </>
  );
}
