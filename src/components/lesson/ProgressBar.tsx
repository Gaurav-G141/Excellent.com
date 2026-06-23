interface Props {
  current: number
  total: number
}

export function ProgressBar({ current, total }: Props) {
  const pct = total > 0 ? ((current + 1) / total) * 100 : 0

  return (
    <div
      className="lesson-progress"
      role="progressbar"
      aria-valuenow={current + 1}
      aria-valuemin={1}
      aria-valuemax={total}
    >
      <div className="lesson-progress-fill" style={{ width: `${pct}%` }} />
    </div>
  )
}
