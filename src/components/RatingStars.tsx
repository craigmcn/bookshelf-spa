const LABELS: Record<number, string> = {
  1: "★ Poor",
  2: "★★ Fair",
  3: "★★★ Good",
  4: "★★★★ Great",
  5: "★★★★★ Excellent",
};

type Props = {
  rating: number | null;
};

export function RatingDisplay({ rating }: Props) {
  if (!rating) return <span className="text-muted">No rating</span>;
  return <span title={LABELS[rating]}>{"★".repeat(rating)}</span>;
}

type SelectProps = {
  value: number | null;
  onChange: (v: number | null) => void;
  id?: string;
};

export function RatingSelect({ value, onChange, id }: SelectProps) {
  return (
    <select
      id={id}
      className="form-select"
      value={value ?? ""}
      onChange={(e) =>
        onChange(e.target.value === "" ? null : Number(e.target.value))
      }
    >
      <option value="">No rating</option>
      {[1, 2, 3, 4, 5].map((n) => (
        <option key={n} value={n}>
          {LABELS[n]}
        </option>
      ))}
    </select>
  );
}
