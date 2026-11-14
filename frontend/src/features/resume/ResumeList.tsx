import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import type { Resume } from '../../types'

interface ResumeListProps {
  resumes: Resume[]
  loading?: boolean
  selectedId: string | null
  deletingId: string | null
  onLoad: (resume: Resume) => void
  onDelete: (id: string) => void
}

export function ResumeList({ resumes, loading, selectedId, deletingId, onLoad, onDelete }: ResumeListProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        <div className="text-sm font-medium text-gray-900 dark:text-white">Saved Resumes</div>
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-10 w-3/4" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 p-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-900 dark:text-white">Saved Resumes</div>
        {resumes.length === 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400">No saved resumes yet.</p>
        )}
      </div>

      {resumes.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-gray-500 dark:text-gray-400 text-sm">
          Create your first resume using the editor on the left.
        </div>
      ) : (
        <div className="space-y-2">
          {resumes.map(resume => {
            const isSelected = selectedId === resume.id
            const isDeleting = deletingId === resume.id
            const isConfirming = confirmDeleteId === resume.id

            return (
              <div
                key={resume.id}
                className={`
                  flex items-center justify-between gap-2 p-2 rounded border
                  ${isSelected
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 dark:border-blue-500'
                    : 'border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-colors'
                }
              `}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onLoad(resume)}
                      disabled={isSelected || isDeleting}
                      className={`w-auto text-left py-0 ${isSelected ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-600 dark:text-gray-300'}`}
                    >
                      {resume.name}
                      {resume.isDefault && <span className="text-[10px] uppercase tracking-wider opacity-60 ml-1">(default)</span>}
                    </Button>
                    {isSelected && (
                      <span className="text-[10px] bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded">
                        Loaded
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(resume.updatedAt).toLocaleDateString()} · updated
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {!isConfirming ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setConfirmDeleteId(resume.id)}
                      disabled={isDeleting}
                      aria-label={`Delete ${resume.name}`}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  ) : (
                    <div className="flex items-center gap-1 px-2">
                      <Button variant="ghost" size="sm" onClick={() => setConfirmDeleteId(null)} disabled={isDeleting}>
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(resume.id)}
                        disabled={isDeleting}
                        className="h-8 px-2"
                      >
                        {isDeleting ? '…' : 'Delete'}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
