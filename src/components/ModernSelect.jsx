import { useEffect, useMemo, useRef, useState } from 'react'

export function ModernSelect({ label, options, value, onValueChange, menuMode = 'default' }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const isWideMenu = menuMode === 'wide'
  const selectedItem = useMemo(() => options.find((item) => item.id === value) ?? options[0] ?? null, [options, value])

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false)
      }
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return (
    <div className={`compact-field ${isWideMenu ? 'compact-field--wide' : ''}`} ref={rootRef}>
      <span className="compact-field__label">{label}</span>
      <div className={`compact-native-select-wrap ${isWideMenu ? 'compact-native-select-wrap--wide' : ''} ${open ? 'is-open' : ''}`}>
        <button
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={label}
          className="compact-select-trigger"
          onClick={() => setOpen((prev) => !prev)}
          type="button"
        >
          <span className="compact-select-trigger__value">{selectedItem?.name ?? '请选择'}</span>
          <i className="compact-native-select-icon" aria-hidden="true">
            <svg viewBox="0 0 16 16">
              <path className="chevron-up" d="M4.2 7.1 8 3.3l3.8 3.8" />
              <path className="chevron-down" d="m4.2 8.9 3.8 3.8 3.8-3.8" />
            </svg>
          </i>
        </button>
        <div className={`compact-select-list ${isWideMenu ? 'compact-select-list--wide' : ''} ${open ? 'is-open' : ''}`} role="listbox">
          {options.map((item) => (
            <button
              aria-selected={item.id === value}
              className={`compact-select-option ${item.id === value ? 'is-active' : ''}`}
              key={item.id}
              onClick={() => {
                onValueChange(item.id)
                setOpen(false)
              }}
              role="option"
              type="button"
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
