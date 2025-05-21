import React, { useState } from 'react'
import { HiMiniPlus, HiOutlineTrash } from 'react-icons/hi2'
import { LuPaperclip } from 'react-icons/lu'

/**
 * Component for adding and managing attachment links
 * @param {Array} attachments - Current array of attachments
 * @param {Function} setAttachments - Function to update attachments
 */
const AddAttachmentInput = ({ attachments = [], setAttachments }) => {
    const [option, setOption] = useState('')
    const [error, setError] = useState('')

    // Validate URL format
    const isValidUrl = (url) => {
        try {
            // Try to create a URL object (will throw error if invalid)
            new URL(url.startsWith('http') ? url : `https://${url}`)
            return true
        } catch {
            return false
        }
    }

    // Handle adding a new attachment
    const handleAddOption = () => {
        if (!option.trim()) {
            setError('Please enter a URL')
            return
        }

        if (!isValidUrl(option.trim())) {
            setError('Please enter a valid URL (e.g., example.com or https://example.com)')
            return
        }

        // Format URL - add https:// if not present
        let formattedUrl = option.trim()
        if (!formattedUrl.startsWith('http')) {
            formattedUrl = `https://${formattedUrl}`
        }

        setAttachments([...attachments, formattedUrl])
        setOption('')
        setError('')
    }

    // Handle deleting an attachment
    const handleDeleteOption = (index) => {
        const updatedArr = attachments.filter((_, idx) => idx !== index)
        setAttachments(updatedArr)
    }

    // Handle pressing Enter key
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleAddOption()
        }
    }

    return (
        <div className="attachment-input">
            {/* Display current attachments */}
            {attachments.map((item, index) => (
                <div 
                    className="flex justify-between bg-gray-50 border border-gray-100 px-3 py-2 rounded-md mb-3 mt-4" 
                    key={`attachment-${index}`}
                >
                    <div className="flex-1 flex items-center gap-3 overflow-hidden">
                        <LuPaperclip className='text-gray-400 flex-shrink-0'/>
                        <p className="text-xs text-black truncate" title={item}>
                            {item}
                        </p>
                    </div>
                    <button 
                        className="cursor-pointer ml-2"
                        onClick={() => handleDeleteOption(index)}
                        aria-label="Delete attachment"
                    >
                        <HiOutlineTrash className='text-lg text-red-500'/> 
                    </button>
                </div>
            ))}

            {/* Add new attachment input */}
            <div className="flex items-center gap-5 mt-4">
                <div className="flex-1 flex items-center gap-3 border border-gray-100 rounded-md px-3">
                    <LuPaperclip className='text-gray-400'/>
                    <input 
                        type="text" 
                        className="w-full text-black outline-none bg-white py-2" 
                        placeholder='Add file link (e.g., example.com or https://example.com)' 
                        value={option} 
                        onChange={({target}) => {
                            setOption(target.value)
                            setError('')
                        }}
                        onKeyDown={handleKeyDown}
                    />
                </div>
                <button 
                    className="card-btn text-nowrap" 
                    onClick={handleAddOption}
                    disabled={!option.trim()}
                >
                    <HiMiniPlus className='text-lg'/> Add
                </button>
            </div>

            {/* Error message */}
            {error && (
                <p className="text-red-500 text-xs mt-2">{error}</p>
            )}

            {/* Help text */}
            <p className="text-gray-500 text-xs mt-2">
                Supported: Any web URL (will automatically add https:// if not provided)
            </p>
        </div>
    )
}

export default AddAttachmentInput