import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface ResumePreviewProps {
  content: string
}

export function ResumePreview({ content }: ResumePreviewProps) {
  return (
    <div
      id="resume-preview"
      className="w-full max-w-[210mm] min-h-[297mm] bg-white p-[20mm] mx-auto shadow-xl rounded-lg dark:bg-gray-900 border border-gray-200 dark:border-gray-700 print:shadow-none print:border-none"
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children, ...props }) => (
            <h1
              {...props}
              className="text-2xl font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2"
            >
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2
              {...props}
              className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-2 border-b border-gray-100 dark:border-gray-800 pb-1"
            >
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 {...props} className="text-lg font-medium text-gray-900 dark:text-white mt-4 mb-2">
              {children}
            </h3>
          ),
          p: ({ children, ...props }) => (
            <p {...props} className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">
              {children}
            </p>
          ),
          ul: ({ children, ...props }) => (
            <ul {...props} className="list-disc pl-6 mb-3 text-gray-700 dark:text-gray-300">
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol {...props} className="list-decimal pl-6 mb-3 text-gray-700 dark:text-gray-300">
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li {...props} className="mb-1 text-gray-700 dark:text-gray-300">
              {children}
            </li>
          ),
          strong: ({ children, ...props }) => (
            <strong {...props} className="font-semibold text-gray-900 dark:text-white">{children}</strong>
          ),
          em: ({ children, ...props }) => (
            <em {...props} className="italic text-gray-700 dark:text-gray-300">{children}</em>
          ),
          code: ({ children, ...props }) => (
            <code
              {...props}
              className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-gray-800 dark:text-gray-200"
            >
              {children}
            </code>
          ),
          a: ({ children, href, ...props }) => (
            <a
              {...props}
              href={href}
              className="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:no-underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote
              {...props}
              className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic text-gray-600 dark:text-gray-400 my-3"
            >
              {children}
            </blockquote>
          ),
          hr: () => <hr className="my-6 border-gray-200 dark:border-gray-700" />,
          table: ({ children, ...props }) => (
            <div {...props} className="overflow-x-auto">
              <table className="w-full text-left border-collapse mb-4 text-sm">
                {children}
              </table>
            </div>
          ),
          th: ({ children, ...props }) => (
            <th {...props} className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-gray-900 dark:text-white font-semibold bg-gray-50 dark:bg-gray-800">
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td {...props} className="border border-gray-200 dark:border-gray-700 px-3 py-2 text-gray-700 dark:text-gray-300">
              {children}
            </td>
          ),
          thead: ({ children, ...props }) => <thead {...props}>{children}</thead>,
          tbody: ({ children, ...props }) => <tbody {...props}>{children}</tbody>,
          tr: ({ children, ...props }) => <tr {...props}>{children}</tr>,
        }}
      >
        {content || '# (empty)'}
      </ReactMarkdown>
    </div>
  )
}
