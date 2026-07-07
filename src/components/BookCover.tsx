type Props = {
  coverUrl: string | null | undefined;
  title: string;
  height?: number;
};

export default function BookCover({ coverUrl, title, height = 120 }: Props) {
  if (coverUrl) {
    return (
      <img
        src={coverUrl}
        alt={`Cover of ${title}`}
        style={{ height, objectFit: "cover", width: "auto" }}
        className="rounded"
      />
    );
  }

  return (
    <div
      className="bg-secondary text-white d-flex align-items-center justify-content-center rounded"
      style={{ height, width: Math.round(height * 0.65), fontSize: 12 }}
      aria-label={`No cover for ${title}`}
    >
      No cover
    </div>
  );
}
