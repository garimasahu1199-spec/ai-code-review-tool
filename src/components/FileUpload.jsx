import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileCode } from 'lucide-react'

const FileUpload = ({ onUpload, className = '' }) => {
  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target.result
        onUpload(content, file.name)
      }
      reader.readAsText(file)
    }
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt', '.js', '.py', '.java', '.cpp', '.ts', '.go', '.rs'],
      'application/javascript': ['.js'],
      'text/javascript': ['.js'],
      'text/x-python': ['.py'],
      'text/x-java-source': ['.java'],
      'text/x-c++src': ['.cpp', '.cc', '.cxx'],
      'application/typescript': ['.ts'],
      'text/x-go': ['.go'],
      'text/x-rust': ['.rs'],
    },
    maxFiles: 1,
    multiple: false,
  })

  return (
    <div
      {...getRootProps()}
      className={`relative group cursor-pointer ${className}`}
    >
      <input {...getInputProps()} />
      <div
        className={`flex items-center justify-center gap-3 px-4 py-3 rounded-lg border-2 border-dashed transition-all duration-200 ${
          isDragReject
            ? 'border-red-500/50 bg-red-500/10'
            : isDragActive
            ? 'border-primary-500/50 bg-primary-500/10'
            : 'border-slate-700 hover:border-slate-600 bg-slate-800/30 hover:bg-slate-800/50'
        }`}
      >
        <div className={`p-2 rounded-lg transition-all ${
          isDragActive ? 'bg-primary-500/20' : 'bg-slate-800 group-hover:bg-slate-700'
        }`}>
          {isDragActive ? (
            <FileCode className="w-5 h-5 text-primary-400" />
          ) : (
            <Upload className="w-5 h-5 text-slate-400 group-hover:text-slate-300" />
          )}
        </div>
        <div className="text-left">
          <p className="text-sm font-medium text-slate-200">
            {isDragActive ? 'Drop file here' : 'Upload file'}
          </p>
          <p className="text-xs text-slate-500">
            Drag & drop or click to browse
          </p>
        </div>
      </div>
    </div>
  )
}

export default FileUpload
