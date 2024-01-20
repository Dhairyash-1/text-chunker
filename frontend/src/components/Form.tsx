import axios from "axios"
import { useState, ChangeEvent, FormEvent } from "react"

const Form: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [result, setResult] = useState([])

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    e.preventDefault()
    const files = e.target.files
    if (files && files.length > 0) {
      console.log(files[0])
      setSelectedFile(files[0])
    }
  }
  async function handleUpload(e: FormEvent) {
    e.preventDefault()
    if (!selectedFile) return
    const formData = new FormData()
    formData.append("file", selectedFile)
    console.log("formdata", formData)

    try {
      const response = await axios.post(
        `http://127.0.0.1:5000/api/uploadfile`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
      console.log(response)
      console.log(typeof response.data.chunks)
      setResult(response.data.chunks)
      // if (response.status === 200) {
      //   setResult(JSON.parse(response.data.chunks))
      // }
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
            Choose a file
          </label>
          <input
            id="file-input"
            type="file"
            name="file"
            accept="text/plain"
            onChange={handleFileChange}
          />
          <button className="upload-button">Upload</button>
        </form>
        {result.map((doc, i) => (
          <div key={i} className="chunks">
            <p>{doc.page_content}</p>
            <span>Length:-{doc.page_content.length}</span>
          </div>
        ))}
      </div>
    </>
  )
}

export default Form
