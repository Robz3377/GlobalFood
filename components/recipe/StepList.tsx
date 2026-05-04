export function StepList({ steps }: { steps: string[] }) {
  return (
    <ol className="space-y-4">
      {steps.map((step, i) => (
        <li
          key={i}
          className="flex gap-4 rounded-soft bg-white p-5 shadow-soft"
        >
          <span
            aria-hidden
            className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-sage-soft font-serif text-base font-semibold text-ink"
          >
            {i + 1}
          </span>
          <p className="pt-1 text-ink leading-relaxed">{step}</p>
        </li>
      ))}
    </ol>
  );
}
