import { WeddingImage } from "@/src/components/WeddingImage";
import { getStoryImageLayout } from "@/src/lib/story-chapters";
import type { StoryImage } from "@/src/types/wedding";

export function StoryImageCollection({
  images,
  context,
}: {
  images: StoryImage[];
  context: "card" | "dialog";
}) {
  const availableImages = images.filter(
    (image) => image.available && image.src.trim(),
  );
  if (!availableImages.length) return null;

  const displayedImages =
    context === "card" ? availableImages.slice(0, 4) : availableImages;
  const layout = getStoryImageLayout(availableImages.length);

  return (
    <div
      className={`story-image-collection story-image-collection-${context} story-image-layout-${layout}`}
      aria-label={`${availableImages.length} ảnh trong chương`}
    >
      {displayedImages.map((image, index) => (
        <div
          className="story-image-frame"
          data-fit-mode={image.fitMode}
          key={image.id}
        >
          <WeddingImage
            src={image.src}
            available={image.available}
            alt={image.alt}
            sizes={
              context === "dialog"
                ? "(max-width: 896px) 100vw, 46vw"
                : "(max-width: 896px) 100vw, 33vw"
            }
            className="story-image"
            framing={image}
          />
          {context === "card" &&
          index === displayedImages.length - 1 &&
          availableImages.length > displayedImages.length ? (
            <span className="story-image-more" aria-hidden="true">
              +{availableImages.length - displayedImages.length}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
