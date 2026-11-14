import { useState, useEffect, useRef } from 'react'
import { Link } from '@tanstack/react-router'
import { useBlocker } from '@tanstack/react-router'
import { useResumes, useCreateResume, useUpdateResume, useDeleteResume } from '../../hooks/useApi'
import { useToast } from '../../components/ui/Toast'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardHeader } from '../../components/ui/Card'
import { ResumeEditor } from './ResumeEditor'
import { ResumePreview } from './ResumePreview'
import { ResumeList } from './ResumeList'
import type { Resume } from '../../types'
import { Plus, Trash2, Save, Download, AlertTriangle, ArrowLeft } from 'lucide-react'

const STARTER_TEMPLATE = `# [Your Name]
**[Your Title]**

[email@address.com] | [(555) 123-4567] | [City, State] | [linkedin.com/in/yourname]

## Summary
A brief summary of your professional background, key skills, and what you're looking for in your next role.

## Experience
**Job Title** | Company Name | Start Date – End Date
- Key achievement or responsibility using strong action verbs
- Another bullet point with measurable impact
- Collaborated with cross-functional teams to deliver results

**Previous Job Title** | Company Name | Start Date – End Date
- Responsibility or achievement
- Supported [project/initiative] that [outcome]

## Education
**Degree Name** | University Name | Graduation Year
- Relevant coursework or honors (optional)

## Skills
- **Languages:** TypeScript, JavaScript, Python
- **Frontend:** React, Tailwind CSS, HTML5, CSS3
- **Tools:** Git, Docker, VS Code, CI/CD`

export function ResumeBuilderPage() {
  const { addToast } = useToast()
  const { data: resumes = [], isLoading: resumesLoading } = useResumes()
  const createResume = useCreateResume()
  const updateResume = useUpdateResume()
  const deleteResume = useDeleteResume()

  const [name, setName] = useState('')
  const [content, setContent] = useState(STARTER_TEMPLATE)
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const isDirtyRef = useRef(false)

  // Unsaved-changes tracking
  const isDirty = name.trim() !== '' || content !== STARTER_TEMPLATE || isDirtyRef.current

  // Block navigation if there are unsaved changes
  useBlocker({
    shouldBlockFn: () => isDirty,
    enableBeforeUnload: () => isDirty,
  })

  // Also warn on tab close/refresh
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault()
        e.returnValue = ''
      }
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [isDirty])

  const selectedResume = resumes.find(r => r.id === selectedResumeId)

  // Sync editor with selected resume
  useEffect(() => {
    if (selectedResume && !isDirtyRef.current) {
      setName(selectedResume.name)
      setContent(selectedResume.content)
      isDirtyRef.current = false
    }
  }, [selectedResume])

  const handleNewResume = () => {
    if (isDirty && !window.confirm('Start a new resume? Unsaved changes will be lost.')) {
      return
    }
    setSelectedResumeId(null)
    setName('')
    setContent(STARTER_TEMPLATE)
    isDirtyRef.current = false
  }

  const handleSave = async () => {
    if (!name.trim()) {
      addToast({ title: 'Name required', description: 'Please give your resume a name.', variant: 'destructive' })
      return
    }
    setIsSaving(true)
    try {
      if (selectedResumeId) {
        await updateResume.mutateAsync({ id: selectedResumeId, data: { name, content } })
        addToast({ title: 'Saved', description: `Resume "${name}" updated.`, variant: 'success' })
      } else {
        const created = await createResume.mutateAsync({ name, content, isDefault: false })
        setSelectedResumeId(created.id)
        addToast({ title: 'Saved', description: `Resume "${name}" created.`, variant: 'success' })
      }
      isDirtyRef.current = false
    } catch (err) {
      addToast({ title: 'Save failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleLoadResume = (resume: Resume) => {
    if (isDirty && !window.confirm(`Load "${resume.name}"? Unsaved changes will be lost.`)) {
      return
    }
    setSelectedResumeId(resume.id)
    setName(resume.name)
    setContent(resume.content)
    isDirtyRef.current = false
  }

  const handleDeleteResume = async (id: string) => {
    const resume = resumes.find(r => r.id === id)
    if (!resume || !window.confirm(`Delete resume "${resume.name}"? This cannot be undone.`)) {
      return
    }
    setDeletingId(id)
    try {
      await deleteResume.mutateAsync(id)
      if (selectedResumeId === id) {
        setSelectedResumeId(null)
        setName('')
        setContent(STARTER_TEMPLATE)
        isDirtyRef.current = false
      }
      addToast({ title: 'Deleted', description: `Resume "${resume.name}" removed.`, variant: 'success' })
    } catch (err) {
      addToast({ title: 'Delete failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' })
    } finally {
      setDeletingId(null)
    }
  }

  const handleExportPdf = () => {
    const previewEl = document.getElementById('resume-preview')
    if (!previewEl) {
      addToast({ title: 'Export failed', description: 'Preview not found.', variant: 'destructive' })
      return
    }
    // html2pdf is imported dynamically to avoid SSR/bundle issues
    ;(async () => {
      try {
        const html2pdf = await import('html2pdf.js')
        await html2pdf.default().set({
          margin: 10,
          filename: `${(name || 'resume').replace(/\s+/g, '_')}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, logging: true, letterRendering: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        }).from(previewEl).save()
        addToast({ title: 'PDF exported', description: 'Your resume has been downloaded.', variant: 'success' })
      } catch (err) {
        addToast({ title: 'Export failed', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' })
      }
    })()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header: resume name + actions */}
        <Card className="mb-6 p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Resume Builder</h2>
              <Input
                id="resume-name"
                value={name}
                onChange={e => {
                  setName(e.target.value)
                  isDirtyRef.current = true
                }}
                placeholder="Resume name (e.g. Software Engineer Resume)"
                className="w-full sm:w-72"
                aria-label="Resume name"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end sm:justify-start">
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewResume}
                disabled={isSaving}
                className="hidden sm:inline-flex"
              >
                <Plus className="h-4 w-4 mr-1" /> New
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving || !name.trim()}
                className="hidden sm:inline-flex"
              >
                <Save className="h-4 w-4 mr-1" /> {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                variant="outline"
                onClick={handleExportPdf}
                disabled={isSaving || !content.trim()}
                className="hidden sm:inline-flex"
              >
                <Download className="h-4 w-4 mr-1" /> Export PDF
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => selectedResumeId && handleDeleteResume(selectedResumeId)}
                disabled={isSaving || deletingId === selectedResumeId || !selectedResumeId}
                className="hidden sm:inline-flex"
              >
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </div>
          </div>
        </Card>

        {/* Saved resumes list */}
        <Card className="mb-6">
          <ResumeList
            resumes={resumes}
            loading={resumesLoading}
            selectedId={selectedResumeId}
            deletingId={deletingId}
            onLoad={handleLoadResume}
            onDelete={handleDeleteResume}
          />
        </Card>

        {/* Split pane: editor + preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[70vh] min-h-[600px]">
          <Card className="flex flex-col">
            <CardHeader>
              <h3 className="font-semibold text-gray-900 dark:text-white">Markdown Editor</h3>
            </CardHeader>
            <div className="flex-1 p-4 overflow-hidden flex flex-col">
              <ResumeEditor
                content={content}
                onChange={value => {
                  setContent(value)
                  isDirtyRef.current = true
                }}
                editorRef={editorRef}
              />
            </div>
          </Card>

          <Card className="flex flex-col">
            <CardHeader className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Live Preview</h3>
              <Button variant="ghost" size="sm" onClick={handleExportPdf} disabled={!content.trim()}>
                <Download className="h-4 w-4 mr-1" /> PDF
              </Button>
            </CardHeader>
            <div className="flex-1 overflow-auto p-4">
              <ResumePreview content={content} />
            </div>
          </Card>
        </div>

        {isDirty && (
          <div className="mt-4 p-3 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 dark:text-amber-300">
                You have unsaved changes. Click <strong>Save</strong> to keep them.
              </p>
            </div>
          </div>
        )}
      </div>

      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
        <ArrowLeft className="h-4 w-4" /> Back to Jobs
      </Link>
    </div>
  )
}
