import React from 'react';
import { Save, X } from 'lucide-react';
import { TemplateData } from '../types';

interface TemplateSectionProps {
  templateName: string;
  setTemplateName: (name: string) => void;
  templateTags: string[];
  setTemplateTags: (tags: string[]) => void;
  saveTemplate: () => void;
  allTags: string[];
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  memoizedTemplateThumbnails: (TemplateData & { thumbnail: string })[];
  selectedTemplate: string | null;
  loadTemplate: (id: string) => void;
}

const TemplateSection: React.FC<TemplateSectionProps> = ({
  templateName,
  setTemplateName,
  templateTags,
  setTemplateTags,
  saveTemplate,
  allTags,
  selectedTags,
  toggleTag,
  memoizedTemplateThumbnails,
  selectedTemplate,
  loadTemplate,
}) => {
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const input = e.currentTarget;
      const tag = input.value.trim();
      if (tag && !templateTags.includes(tag)) {
        setTemplateTags([...templateTags, tag]);
        input.value = '';
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTemplateTags(templateTags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="bg-gray-50 p-6 border border-gray-100 rounded-xl m-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-700">Templates</h2>
        <div className="flex flex-col space-y-2 md:flex-row md:space-x-2 md:space-y-0">
          <input
            type="text"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Template name"
            className="p-2 border border-gray-300 rounded-lg"
          />
          <div className="flex flex-wrap gap-2 mb-2">
            {templateTags.map((tag, index) => (
              <span key={index} className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded flex items-center">
                {tag}
                <button onClick={() => removeTag(tag)} className="ml-1 text-blue-600 hover:text-blue-800">
                  &times;
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            onKeyDown={handleTagInput}
            placeholder="Add tags "
            className="p-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={saveTemplate}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center"
          >
            <Save size={20} />
          </button>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedTags.includes(tag)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } transition duration-300`}
            >
              {tag}
              {selectedTags.includes(tag) && (
                <X size={14} className="inline-block ml-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {memoizedTemplateThumbnails.length > 0 ? (
          memoizedTemplateThumbnails.map((template) => (
            <div
              key={template.id}
              className={`cursor-pointer border-2 rounded-lg p-2 ${
                selectedTemplate === template.id ? 'border-primary' : 'border-gray-200'
              }`}
              onClick={() => loadTemplate(template.id)}
            >
              <img
                src={template.thumbnail}
                alt={template.name}
                className="w-full h-24 object-contain mb-2"
              />
              <p className="text-sm text-center truncate">{template.name}</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {template.tags && template.tags.map((tag, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 text-xs font-semibold px-1.5 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full flex justify-center items-center">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(TemplateSection);