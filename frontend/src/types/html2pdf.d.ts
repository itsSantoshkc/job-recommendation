declare module 'html2pdf.js' {
  function html2pdf(): {
    set(options: Record<string, unknown>): {
      from(element: Element): { save(): Promise<void> }
    }
  }
  export default html2pdf
}
