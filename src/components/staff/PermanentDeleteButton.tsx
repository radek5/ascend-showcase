"use client";

type PermanentDeleteButtonProps = {
  id: string;
  kind: "PLAYER" | "PROFESSIONAL";
};

export default function PermanentDeleteButton({
  id,
  kind,
}: PermanentDeleteButtonProps) {
  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    const confirmed = window.confirm(
      "Permanently delete this archived record?\n\n" +
        "This cannot be undone. Registration, accreditation, " +
        "check-in history and associated event information may be permanently lost.",
    );

    if (!confirmed) {
      event.preventDefault();
    }
  }

  return (
    <form
      action={
        kind === "PLAYER"
          ? "/staff/archive/delete-player"
          : "/staff/archive/delete-professional"
      }
      method="post"
      onSubmit={handleSubmit}
    >
      <input
        type="hidden"
        name="id"
        value={id}
      />

      <button
        type="submit"
        className="rounded-full border border-red-500/30 px-4 py-2 text-xs font-black uppercase tracking-[0.06em] text-red-400 transition hover:bg-red-500/10"
      >
        Delete
      </button>
    </form>
  );
}
