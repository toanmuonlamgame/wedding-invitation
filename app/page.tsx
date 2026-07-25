import { InvitationSection } from "@/src/sections/InvitationSection";
import { OpeningSection } from "@/src/sections/OpeningSection";
import { ScheduleSection } from "@/src/sections/ScheduleSection";
import { StorySection } from "@/src/sections/StorySection";
import { GallerySection } from "@/src/sections/GallerySection";
import { VenueSection } from "@/src/sections/VenueSection";
import { CreatorSection } from "@/src/sections/CreatorSection";
import { FooterSection } from "@/src/sections/FooterSection";

export default function Home() {
  return (
    <main>
      <OpeningSection />
      <InvitationSection />
      <ScheduleSection />
      <StorySection />
      <GallerySection />
      <VenueSection />
      <CreatorSection />
      <FooterSection />
    </main>
  );
}
