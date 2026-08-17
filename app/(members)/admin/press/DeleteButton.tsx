'use client'

export default function DeleteButton({ isPublished, action }: { isPublished: boolean; action: () => void }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (
          isPublished &&
          !window.confirm('This post is published on the live site. Delete it anyway? This cannot be undone.')
        ) {
          event.preventDefault()
        }
      }}
    >
      <button
        type="submit"
        className="text-xs px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400/70 hover:text-red-400 transition-colors"
      >
        Delete
      </button>
    </form>
  )
}
