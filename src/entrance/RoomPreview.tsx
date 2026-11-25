import { useEffect, useRef, useState } from "react";
import type { Interior } from "../domain/sessions";
import { entranceArt } from "./assets";
export function RoomPreview({
  room,
  title,
}: {
  room: Interior;
  title: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [src, setSrc] = useState(entranceArt.roomPreviews[room] ?? "");
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    if (src) return;
    let disposed = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          void import("../game/roomPreview")
            .then((m) => m.renderRoomPreview(room))
            .then((image) => {
              if (!disposed) setSrc(image);
            })
            .catch(() => {
              if (!disposed) setFailed(true);
            });
        }
      },
      { rootMargin: "280px" },
    );
    observer.observe(ref.current!);
    return () => {
      disposed = true;
      observer.disconnect();
    };
  }, [room]);
  return (
    <div className="wing-preview" ref={ref}>
      {src ? (
        <img
          src={src}
          width="1280"
          height="720"
          alt={`${title}: ${room === "grand-library" ? "candlelit bookshelves, reading chairs and arched windows" : room === "personal-study" ? "a writing desk, open books and a moonlit window" : "a telescope, star charts and a quiet desk"}`}
        />
      ) : (
        <span className="preview-loading">
          {failed ? "Your room is ready to enter." : "Lighting the candles…"}
        </span>
      )}
    </div>
  );
}
