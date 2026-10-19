import { NoteIcon } from './Ornaments'

interface Props {
  playing: boolean
  title: string
  onToggle: () => void
}

/** Floating round button that plays or pauses the background song. */
export function MusicToggle({ playing, title, onToggle }: Props) {
  return (
    <button
      type="button"
      className={`music-toggle ${playing ? 'is-playing' : ''}`}
      onClick={onToggle}
      aria-pressed={playing}
      aria-label={playing ? `Pause music: ${title}` : `Play music: ${title}`}
    >
      <NoteIcon className="music-toggle__icon" />
    </button>
  )
}
