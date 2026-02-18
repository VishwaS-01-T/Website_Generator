import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { StepsList } from '../components/StepsList';
import { FileExplorer } from '../components/FileExplorer';
import { TabView } from '../components/TabView';
import { CodeEditor } from '../components/CodeEditor';
import { PreviewFrame } from '../components/PreviewFrame';
import axios from 'axios';
import { BACKEND_URL } from '../config';
import { parseXml } from '../steps';
import { useWebContainer } from '../hooks/useWebContainer';
import { Loader } from '../components/Loader';

const MOCK_FILE_CONTENT = `// This is a sample file content
import React from 'react';

function Component() {
  return <div>Hello World</div>;
}

export default Component;`;


export function Builder() {
  const location = useLocation();
  const { prompt } = location.state;
  const [userPrompt, setPrompt] = useState("");
  const [llmMessages, setLlmMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  const webcontainer = useWebContainer();

  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState('code');
  const [selectedFile, setSelectedFile] = useState(null);
  
  const [steps, setSteps] = useState([]);
  const [files, setFiles] = useState([]);

  // Build a nested file/folder tree from steps
  function buildFileTree(steps) {
    const StepType = { CreateFile: 0 };
    const root = [];
    steps.forEach(step => {
      if (step.type !== StepType.CreateFile || !step.path) return;
      const parts = step.path.split("/");
      let current = root;
      let currentPath = "";
      for (let i = 0; i < parts.length; i++) {
        currentPath = currentPath ? `${currentPath}/${parts[i]}` : parts[i];
        let node = current.find(x => x.name === parts[i]);
        if (!node) {
          if (i === parts.length - 1) {
            node = {
              name: parts[i],
              type: "file",
              path: currentPath,
              content: step.code
            };
          } else {
            node = {
              name: parts[i],
              type: "folder",
              path: currentPath,
              children: []
            };
          }
          current.push(node);
        }
        if (node.type === "folder") {
          current = node.children;
        }
      }
    });
    return root;
  }

  useEffect(() => {
    setFiles(buildFileTree(steps));
  }, [steps]);

  useEffect(() => {
    const createMountStructure = (files) => {
      const mountStructure = {};
  
      const processFile = (file, isRootFolder) => {  
        if (file.type === 'folder') {
          // For folders, create a directory entry
          mountStructure[file.name] = {
            directory: file.children ? 
              Object.fromEntries(
                file.children.map(child => [child.name, processFile(child, false)])
              ) 
              : {}
          };
        } else if (file.type === 'file') {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || ''
              }
            };
          } else {
            // For files, create a file entry with contents
            return {
              file: {
                contents: file.content || ''
              }
            };
          }
        }
  
        return mountStructure[file.name];
      };
  
      // Process each top-level file/folder
      files.forEach(file => processFile(file, true));
  
      return mountStructure;
    };
  
    const mountStructure = createMountStructure(files);
  
    // Mount the structure if WebContainer is available
    console.log(mountStructure);
    webcontainer?.mount(mountStructure);
  }, [files, webcontainer]);

  async function init() {
    const response = await axios.post(`${BACKEND_URL}/template`, {
      prompt: prompt.trim()
    });
    setTemplateSet(true);
    
    const {prompts, uiPrompts} = response.data;

    // Fix: Check if uiPrompts exists and has at least one element
    let initialSteps = [];
    if (uiPrompts && uiPrompts.length > 0) {
      initialSteps = parseXml(uiPrompts[0]).map((x) => ({
        ...x,
        status: "pending"
      }));
    }
    setSteps(initialSteps);

    setLoading(true);
    const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
      messages: [...prompts, prompt].map(content => ({
        role: "user",
        content
      }))
    })

    setLoading(false);

    setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
      ...x,
      status: "pending"
    }))]);

    setLlmMessages([...prompts, prompt].map(content => ({
      role: "user",
      content
    })));

    setLlmMessages(x => [...x, {role: "assistant", content: stepsResponse.data.response}])
  }

  useEffect(() => {
    init();
  }, [])

  return (
    <div className="min-h-screen bg-[#181c20] flex flex-col">
      <header className="bg-[#23272f] border-b border-white/10 px-8 py-6 shadow-lg">
        <h1 className="text-4xl font-extrabold text-white mb-1 tracking-tight drop-shadow-lg">Website Builder <span className="text-yellow-400">AI</span></h1>
        <p className="text-lg text-gray-300 font-light">Prompt: <span className="text-yellow-300">{prompt}</span></p>
      </header>
      <div className="flex-1 overflow-hidden flex justify-center items-start p-6">
        <div className="w-full max-w-7xl grid grid-cols-4 gap-8">
          {/* Steps and chat */}
          <div className="col-span-1 space-y-6">
            <div className="bg-[#23272f] rounded-2xl shadow-2xl p-6 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">Build Steps</h2>
              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                <StepsList
                  steps={steps}
                  currentStep={currentStep}
                  onStepClick={setCurrentStep}
                />
              </div>
            </div>
            <div className="bg-[#23272f] rounded-2xl shadow-2xl p-6 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-2">Chat with AI</h2>
              {(loading || !templateSet) && <Loader />}
              {!(loading || !templateSet) && (
                <div className="flex flex-col gap-2">
                  <textarea
                    value={userPrompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full h-24 p-3 bg-white/5 text-white border border-white/20 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none placeholder-gray-400 text-base transition"
                    placeholder="Ask a question or give a command..."
                  />
                  <button
                    onClick={async () => {
                      const newMessage = {
                        role: "user",
                        content: userPrompt
                      };
                      setLoading(true);
                      const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
                        messages: [...llmMessages, newMessage]
                      });
                      setLoading(false);
                      setLlmMessages(x => [...x, newMessage]);
                      setLlmMessages(x => [...x, {
                        role: "assistant",
                        content: stepsResponse.data.response
                      }]);
                      setSteps(s => [
                        ...s,
                        ...parseXml(stepsResponse.data.response).map(x => ({
                          ...x,
                          status: "pending"
                        }))
                      ]);
                    }}
                    className="w-full bg-yellow-400 text-gray-900 py-2 px-6 rounded-xl font-semibold text-base shadow-lg hover:bg-yellow-500 transition-all duration-200"
                  >
                    Send
                  </button>
                </div>
              )}
            </div>
          </div>
          {/* File Explorer */}
          <div className="col-span-1">
            <div className="bg-[#23272f] rounded-2xl shadow-2xl p-6 border border-white/10 h-full flex flex-col">
              <FileExplorer files={files} onFileSelect={setSelectedFile} />
            </div>
          </div>
          {/* Code/Preview */}
          <div className="col-span-2 bg-[#23272f] rounded-2xl shadow-2xl p-6 border border-white/10 h-[calc(100vh-8rem)] flex flex-col">
            <TabView activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="flex-1 min-h-0">
              {activeTab === 'code' ? (
                <CodeEditor file={selectedFile} />
              ) : (
                <PreviewFrame webContainer={webcontainer} files={files} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}