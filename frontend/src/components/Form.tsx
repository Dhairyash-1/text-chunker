import axios from "axios"
import { useState, ChangeEvent, FormEvent, useRef } from "react"
import { v4 as uuidv4 } from "uuid"

interface Chunk {
  id: string
  page_content: string
  metadata: {
    name: string
  }
  // Add other properties if needed
}

const Form: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [result, setResult] = useState<Array<Chunk>>([])
  const [currentId, setCurrentId] = useState<string | null>("")
  const [saveChunks, setSaveChunks] = useState<Array<Chunk>>([])

  // const flatChunks = result.flat()
  // const chunks = flatChunks.map((doc) => ({ ...doc, id: uuidv4() }))
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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
      if (response.status === 200) {
        const flatChunks: [Chunk] = response.data.chunks.flat()
        const ChunksWithId = flatChunks.map((chunk) => ({
          ...chunk,
          id: uuidv4(),
        }))
        setResult(ChunksWithId)
      }
    } catch (error) {
      console.log(`Error in uploading file ${error}`)
    }
  }
  function handleEdit(id: string, newValue: string) {
    const updatedChunks = result.map((chunk) =>
      chunk.id === id ? { ...chunk, page_content: newValue } : chunk
    )
    setResult(updatedChunks)
    // setCurrentId(null) // Reset id after saving changes
  }
  function handleDelete(id: string) {
    const updated = result.filter((chunk) => chunk.id !== id)
    setResult(updated)
  }
  console.log("updated", saveChunks)
  const downloadChunks = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "chunks.json"
    a.click()
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
        {result && (
          <>
            <button
              disabled={!result.length}
              className="download-button"
              onClick={downloadChunks}
            >
              Download Updated Chunks
            </button>
            <span className="chunk-num">Toatal Chunks:-{result.length}</span>
          </>
        )}
        {result &&
          result.map((doc, i) => {
            return (
              <div key={i} className="chunks">
                {doc.id === currentId ? (
                  <textarea
                    readOnly={!(doc.id === currentId)}
                    value={doc.page_content.replace(/\n/g, " ")}
                    onChange={(e) => handleEdit(doc.id, e.target.value)}
                    ref={doc.id === currentId ? textareaRef : undefined}
                  />
                ) : (
                  <p>{doc.page_content}</p>
                )}
                <div className="row2">
                  <span>Length: {doc.page_content.length}</span>
                  <div className="btns">
                    {doc.id === currentId ? (
                      <button onClick={() => setCurrentId(null)}>Save</button>
                    ) : (
                      <button
                        onClick={() => {
                          setCurrentId(doc.id)
                          if (textareaRef.current) {
                            textareaRef.current.focus()
                          }
                        }}
                      >
                        Edit
                      </button>
                    )}
                    <button onClick={() => handleDelete(doc.id)}>Delete</button>
                  </div>
                </div>
              </div>
            )
          })}
      </div>
    </>
  )
}

export default Form
