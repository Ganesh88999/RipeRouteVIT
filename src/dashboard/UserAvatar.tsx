import { operatorInitial } from "./operator"

export function UserAvatar({
  photoURL,
  name,
  size = "md",
}: {
  photoURL: string | null | undefined
  name: string
  size?: "sm" | "md"
}) {
  const dim = size === "sm" ? "h-8 w-8 text-[11px]" : "h-9 w-9 text-xs"
  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt=""
        className={`${dim} rounded-full border border-line object-cover`}
        referrerPolicy="no-referrer"
      />
    )
  }
  return (
    <span
      className={`inline-flex ${dim} items-center justify-center rounded-full bg-forest font-medium text-white`}
    >
      {operatorInitial(name)}
    </span>
  )
}
