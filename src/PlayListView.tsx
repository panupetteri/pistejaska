import { usePlays } from "./common/hooks/usePlays";
import { SkeletonLoader } from "./common/components/SkeletonLoader";
import ViewContentLayout from "./common/components/ViewContentLayout";
import PlayList from "./PlayList";
import { useGames } from "./common/hooks/useGames";
import Heading1 from "./common/components/typography/Heading1";
import { useMemo } from "react";
import { orderBy } from "lodash-es";
import ImageGalleryStripe from "./common/components/gallery/ImageGalleryStripe";
import { ImageGalleryItem } from "./common/components/gallery/ImageGallerySwipeView";
import { useComments } from "./common/hooks/useComments";
import NotificationsModal from "./NotificationsModal";

export const PlayListView = () => {
  const [plays, loadingPlays, errorPlays] = usePlays();
  const [games, loadingGames, errorGames] = useGames();
  const [comments] = useComments();

  const images = useMemo(() => {
    const items: ImageGalleryItem[] = [];
    orderBy(plays, (play) => play.getDate().epochMilliseconds, "desc").forEach(
      (play) => {
        play.getImageUrls().forEach((src) => {
          items.push({
            src,
            title: play.getDisplayName(),
            date: play.getDate(),
            link: `/view/${play.id}`,
          });
        });
      },
    );
    return items;
  }, [plays]);

  if (errorPlays || errorGames) {
    return (
      <ViewContentLayout>
        Permission denied. Ask permissions from panu.vuorinen@gmail.com.
      </ViewContentLayout>
    );
  }

  return (
    <ViewContentLayout>
      <NotificationsModal />
      <Heading1>Plays</Heading1>
      <ImageGalleryStripe className="mb-2" images={images} />
      {loadingPlays || loadingGames ? (
        <SkeletonLoader />
      ) : (
        <PlayList plays={plays} games={games} comments={comments} />
      )}
    </ViewContentLayout>
  );
};
