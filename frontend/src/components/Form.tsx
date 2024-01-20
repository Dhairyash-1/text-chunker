import axios from "axios"
import { useState, ChangeEvent, FormEvent } from "react"

interface Chunk {
  page_content: string
  metadata: {
    name: string
  }
  // Add other properties if needed
}

const Form: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [result, setResult] = useState<Array<Array<Chunk>>>([])

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    e.preventDefault()
    const files = e.target.files
    if (files && files.length > 0) {
      setSelectedFiles(files)
    }
  }

  async function handleUpload(e: FormEvent) {
    e.preventDefault()
    if (!selectedFiles) return

    const formData = new FormData()
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append("file", selectedFiles[i])
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
      console.log(response)

      setResult(response.data.chunks)
    } catch (error) {
      console.log(`Error in uploading file ${error}`)
    }
  }

  return (
    <>
      <div className="form-container">
        <h1>Text Chunking</h1>
        <form method="post" onSubmit={handleUpload}>
          <label htmlFor="file-input" className="file-label">
            Choose files
          </label>
          <input
            id="file-input"
            type="file"
            name="file"
            accept="text/plain"
            onChange={handleFileChange}
            multiple // Allow multiple file selection
          />
          <button className="upload-button">Upload</button>
        </form>
        {result &&
          result.map((arr) => {
            return arr.map((doc, i) => (
              <div key={i} className="chunks">
                <p>{doc.page_content}</p>
                <span>Length: {doc.page_content.length}</span>
                <span>Filename: {doc.metadata.name}</span>
              </div>
            ))
          })}
      </div>
    </>
  )
}

export default Form
