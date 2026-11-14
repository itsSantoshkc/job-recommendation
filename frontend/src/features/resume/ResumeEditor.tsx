import { useCallback, useRef } from 'react'
import { Textarea } from '../../components/ui/Textarea'
import { Bold, Italic, Heading1, List, Link, Code, Quote } from 'lucide-react'

interface ResumeEditorProps {
  content: string
  onChange: (value: string) => void
  editorRef?: React.RefObject<HTMLTextAreaElement>
}

const TOOLBAR_BUTTONS = [
  { icon: Bold, label: 'Bold', insert: '**', suffix: '**' },
  { icon: Italic, label: 'Italic', insert: '*', suffix: '*' },
  { icon: Heading1, label: 'Heading', insert: '## ', suffix: '' },
  { icon: List, label: 'List', insert: '- ', suffix: '' },
  { icon: Link, label: 'Link', insert: '[text](url)', suffix: '' },
  { icon: Code, label: 'Code', insert: '`', suffix: '`' },
  { icon: Quote, label: 'Quote', insert: '> ', suffix: '' },
] as const

// Insert text at the current cursor position of a textarea
function insertAtCursor(textArea: HTMLTextAreaElement, insert: string, suffix: string) {
  const start = textArea.selectionStart
  const end = textArea.selectionEnd
  const selected = textArea.value.slice(start, end)
  const newValue =
    textArea.value.slice(0, start) + insert + selected + suffix + textArea.value.slice(end)
  textArea.value = newValue
  // Move cursor after inserted text (before suffix if nothing selected)
  const cursorPos = start + insert.length + selected.length
  textArea.setSelectionRange(cursorPos, cursorPos)
  textArea.focus()
  return newValue
}

export function ResumeEditor({ content, onChange, editorRef }: ResumeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleInsert = useCallback(
    (insert: string, suffix: string) => {
      const ta = textareaRef.current
      if (!ta) return
      const newValue = insertAtCursor(ta, insert, suffix)
      onChange(newValue)
    },
    [onChange]
  )

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        {TOOLBAR_BUTTONS.map(btn => (
          <button
            key={btn.label}
            type="button"
            onClick={() => handleInsert(btn.insert, btn.suffix)}
            title={btn.label}
            className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300"
            aria-label={btn.label}
          >
            <btn.icon className="h-4 w-4" />
          </button>
        ))}
      </div>

      {/* Editor */}
      <Textarea
        ref={editorRef ?? textareaRef}
        value={content}
        onChange={e => onChange(e.target.value)}
        className="flex-1 h-full font-mono text-sm leading-relaxed p-4 resize-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-500"
        placeholder="Start writing your resume in markdown..."
        spellCheck={false}
      />
    </div>
  )
}
