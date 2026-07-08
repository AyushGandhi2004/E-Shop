"use client";

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const toolbarOptions = [
    [{ font: [] }],
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ size: ['small', false, 'large', 'huge'] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ script: 'sub' }, { script: 'super' }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ indent: '-1' }, { indent: '+1' }],
    [{ align: [] }],
    ['blockquote', 'code-block'],
    ['link', 'image', 'video'],
    ['clean'],
]

const RichTextEditor = ({ value, onChange }: { value: string; onChange: (content: string) => void }) => {
    const [editorValue, setEditorValue] = useState(value || "");

    useEffect(() => {
        setEditorValue(value || "");
    }, [value]);

    return (
        <div className='rich-text-editor relative text-xs'>
            <ReactQuill
                theme="snow"
                value={editorValue}
                onChange={(content) => {
                    setEditorValue(content);
                    onChange(content);
                }}
                modules={{
                    toolbar: toolbarOptions,
                }}
                placeholder="Write a detailed description of your product here..."
                className='rich-text-editor__quill'
            />

            <style>
                {`
                    .rich-text-editor .ql-toolbar.ql-snow {
                        border: 1px solid rgba(255, 255, 255, 0.12);
                        border-bottom: 0;
                        background: linear-gradient(180deg, rgba(17, 24, 39, 0.95), rgba(9, 12, 18, 0.95));
                        border-top-left-radius: 0.75rem;
                        border-top-right-radius: 0.75rem;
                        padding: 0.75rem;
                    }

                    .rich-text-editor .ql-container.ql-snow {
                        border: 1px solid rgba(255, 255, 255, 0.12);
                        border-top: 0;
                        border-bottom-left-radius: 0.75rem;
                        border-bottom-right-radius: 0.75rem;
                        background: rgba(3, 7, 18, 0.98);
                        color: #f8fafc;
                        min-height: 250px;
                    }

                    .rich-text-editor .ql-editor {
                        min-height: 250px;
                        padding: 1rem;
                        line-height: 1.7;
                        font-size: 0.875rem;
                        color: #f8fafc;
                    }

                    .rich-text-editor .ql-editor.ql-blank::before {
                        color: rgba(148, 163, 184, 0.75);
                        font-style: normal;
                    }

                    .rich-text-editor .ql-snow .ql-picker,
                    .rich-text-editor .ql-snow .ql-stroke,
                    .rich-text-editor .ql-snow .ql-fill,
                    .rich-text-editor .ql-snow .ql-picker-label,
                    .rich-text-editor .ql-snow .ql-picker-options {
                        color: #e2e8f0;
                        stroke: #e2e8f0;
                    }

                    .rich-text-editor .ql-snow .ql-picker-options {
                        background: #0f172a;
                        border-color: rgba(255, 255, 255, 0.12);
                    }

                    .rich-text-editor .ql-snow .ql-tooltip {
                        background: #0f172a;
                        color: #f8fafc;
                        border-color: rgba(255, 255, 255, 0.12);
                        box-shadow: 0 16px 40px rgba(0, 0, 0, 0.35);
                    }

                    .rich-text-editor .ql-snow .ql-tooltip input[type="text"] {
                        background: #020617;
                        color: #f8fafc;
                        border-color: rgba(255, 255, 255, 0.12);
                    }

                    .rich-text-editor .ql-snow.ql-toolbar button:hover,
                    .rich-text-editor .ql-snow .ql-toolbar button:hover,
                    .rich-text-editor .ql-snow.ql-toolbar button.ql-active,
                    .rich-text-editor .ql-snow .ql-toolbar button.ql-active {
                        color: #ffffff;
                    }

                    .rich-text-editor .ql-snow .ql-toolbar button:hover .ql-stroke,
                    .rich-text-editor .ql-snow .ql-toolbar button.ql-active .ql-stroke,
                    .rich-text-editor .ql-snow .ql-picker-label:hover .ql-stroke,
                    .rich-text-editor .ql-snow .ql-picker-label.ql-active .ql-stroke {
                        stroke: #ffffff;
                    }
                `}
            </style>
        </div>
    )
}

export default RichTextEditor