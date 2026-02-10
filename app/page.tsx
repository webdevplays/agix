
'use client';

import { useState, DragEvent, ChangeEvent, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { GenerateComponentInput, GenerateWebsiteOutput } from '@/ai/flows/website-builder-flow';
import { CodePreview } from '@/components/code-preview';
import { LoaderCircle, FileCode, ChevronDown, X, Folder, Code, File as FileIcon, Download, Braces, Paintbrush, Eye, Bot, User, Send, Twitter, Menu, Wand2, Upload, FileImage, FilePlus, FolderPlus, FolderOpen, ChevronRight, History, Sparkles, BrainCircuit, ImagePlus, UploadCloud, Archive } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeSwitcher } from '@/components/theme-switcher';
import { Label } from '@/components/ui/label';

type GeneratedFile = {
  name: string;
  language: 'html' | 'css' | 'javascript' | 'image' | 'folder';
  content: string;
  isFolder?: boolean;
};

type Message = {
  role: 'user' | 'ai';
  text: string;
};

type SavedProject = {
  id: string;
  timestamp: number;
  files: GeneratedFile[];
  messages: Message[];
};

type TutorialStep = {
  targetId: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
};


const getBaseName = (path: string) => path.split('/').pop() || '';

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: 'Hello! Describe the website you want me to build.'}
  ]);
  const [input, setInput] = useState('');
  const [projectFiles, setProjectFiles] = useState<GeneratedFile[]>([]);
  const [openTabs, setOpenTabs] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<string | 'preview' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();
  const [isBetaDialogOpen, setIsBetaDialogOpen] = useState(false); // Set to false to not show on every load
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sidebarView, setSidebarView] = useState<'chat' | 'files' | 'history'>('chat');
  const [draggedFile, setDraggedFile] = useState<GeneratedFile | null>(null);
  const [dragOverFile, setDragOverFile] = useState<GeneratedFile | null>(null);
  const [isNewFileDialogOpen, setIsNewFileDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [isCloseConfirmationOpen, setIsCloseConfirmationOpen] = useState(false);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const [previousWorks, setPreviousWorks] = useState<SavedProject[]>([]);
  const [workToLoad, setWorkToLoad] = useState<string | null>(null);
  const [isDeleteWorkConfirmationOpen, setIsDeleteWorkConfirmationOpen] = useState(false);
  const [workToDelete, setWorkToDelete] = useState<string | null>(null);
  const [isDeployDialogOpen, setIsDeployDialogOpen] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);


  // Tutorial State
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [tutorialStepIndex, setTutorialStepIndex] = useState(0);
  const [tutorialStyle, setTutorialStyle] = useState<{
    highlight: React.CSSProperties,
    popover: React.CSSProperties
  }>({ highlight: { opacity: 0 }, popover: { opacity: 0 } });
  const popoverRef = useRef<HTMLDivElement>(null);
  
  // AI Feature State
  const [isGenerateImageDialogOpen, setIsGenerateImageDialogOpen] = useState(false);
  const [generateImagePrompt, setGenerateImagePrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isRefactorDialogOpen, setIsRefactorDialogOpen] = useState(false);
  const [refactorInstructions, setRefactorInstructions] = useState('');
  const [isRefactoring, setIsRefactoring] = useState(false);
  const [isExplainingCode, setIsExplainingCode] = useState(false);
  const [fileToModify, setFileToModify] = useState<GeneratedFile | null>(null);


  const tutorialSteps: TutorialStep[] = [
    {
      targetId: 'tutorial-step-1-chat-icon',
      title: 'AI Chat',
      description: "Start here! Describe the website you want to build. The AI will generate the code for you. You can continue the conversation to make changes.",
      position: 'right',
      action: () => setSidebarView('chat'),
    },
    {
      targetId: 'tutorial-step-2-chat-input',
      title: 'Send Your Instructions',
      description: 'Type your requests here. Be as descriptive as you can! When you are ready, press Enter or click the Send button.',
      position: 'top',
    },
    {
      targetId: 'tutorial-step-3-files-icon',
      title: 'Project Files',
      description: "Once files are generated, they'll appear here. Click the folder icon to view and manage your project's file structure.",
      position: 'right',
      action: () => {
          setSidebarView('files');
          if (projectFiles.length === 0) {
              setProjectFiles([
                  { name: 'index.html', language: 'html', content: '<h1>Hello!</h1>', isFolder: false },
                  { name: 'style.css', language: 'css', content: '/* CSS */', isFolder: false },
              ]);
          }
      }
    },
    {
      targetId: 'tutorial-step-4-file-explorer',
      title: 'File Management',
      description: 'You can create new files/folders, upload assets, and download the whole project as a .zip file.',
      position: 'right',
    },
    {
      targetId: 'tutorial-step-5-editor-pane',
      title: 'Code & Preview',
      description: 'Your file contents are displayed here. You can edit code directly. Use the tabs to switch between files or open the live preview.',
      position: 'left',
    },
    {
      targetId: 'tutorial-step-6-theme-switcher',
      title: 'Customize Your View',
      description: 'Switch between light and dark mode to your preference. Your choice will be saved.',
      position: 'right',
    },
  ];

  // This will auto-resize the chat textarea
  useEffect(() => {
    const textarea = chatInputRef.current;
    if (textarea) {
        textarea.style.height = 'auto'; // Reset height to shrink if needed
        textarea.style.height = `${textarea.scrollHeight}px`;
    }
  }, [input]);

  // Load data on initial render
  useEffect(() => {
    const tutorialCompleted = localStorage.getItem('agix-cloud-ai-tutorial-completed');
    if (!tutorialCompleted) {
        setIsBetaDialogOpen(true);
    }
    try {
      const savedWorks = localStorage.getItem('agix-ai-previous-works');
      if (savedWorks) {
        setPreviousWorks(JSON.parse(savedWorks));
      }
    } catch (e) {
      console.error("Failed to load previous works from localStorage", e);
    }
  }, []);
  
  // Handle tutorial step changes
  useEffect(() => {
    if (!isTutorialActive) return;
  
    const step = tutorialSteps[tutorialStepIndex];
    if (!step) return;
  
    step.action?.();
  
    const timer = setTimeout(() => {
      const targetElement = document.getElementById(step.targetId);
      if (!targetElement) return;
  
      const targetRect = targetElement.getBoundingClientRect();
      if (targetRect.width === 0 && targetRect.height === 0) return;
  
      const popoverEl = popoverRef.current;
      if (!popoverEl) return;
      const popoverRect = popoverEl.getBoundingClientRect();
      
      const highlightPadding = 4;
  
      const newHighlightStyle: React.CSSProperties = {
        top: `${targetRect.top - highlightPadding}px`,
        left: `${targetRect.left - highlightPadding}px`,
        width: `${targetRect.width + highlightPadding * 2}px`,
        height: `${targetRect.height + highlightPadding * 2}px`,
        opacity: 1,
      };
      
      let newPopoverStyle: React.CSSProperties = { opacity: 1 };
  
      const popoverHeight = popoverRect.height;
      const popoverWidth = popoverRect.width;
  
      switch (step.position) {
        case 'top':
          newPopoverStyle.top = targetRect.top - popoverHeight - 10;
          newPopoverStyle.left = targetRect.left + targetRect.width / 2 - popoverWidth / 2;
          break;
        case 'bottom':
          newPopoverStyle.top = targetRect.bottom + 10;
          newPopoverStyle.left = targetRect.left + targetRect.width / 2 - popoverWidth / 2;
          break;
        case 'left':
          newPopoverStyle.top = targetRect.top + targetRect.height / 2 - popoverHeight / 2;
          newPopoverStyle.left = targetRect.left - popoverWidth - 10;
          break;
        case 'right':
          newPopoverStyle.top = targetRect.top + targetRect.height / 2 - popoverHeight / 2;
          newPopoverStyle.left = targetRect.right + 10;
          break;
      }
      
      if (newPopoverStyle.left && (newPopoverStyle.left as number) < 10) newPopoverStyle.left = 10;
      if (newPopoverStyle.top && (newPopoverStyle.top as number) < 10) newPopoverStyle.top = 10;
      if (newPopoverStyle.left && ((newPopoverStyle.left as number) + popoverWidth) > window.innerWidth - 10) {
        newPopoverStyle.left = window.innerWidth - popoverWidth - 10;
      }
      if (newPopoverStyle.top && ((newPopoverStyle.top as number) + popoverHeight) > window.innerHeight - 10) {
        newPopoverStyle.top = window.innerHeight - popoverHeight - 10;
      }
  
      setTutorialStyle({ highlight: newHighlightStyle, popover: newPopoverStyle });
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }, 300);
  
    return () => clearTimeout(timer);
  }, [isTutorialActive, tutorialStepIndex]);

  // Save work on browser unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (projectFiles.length > 0) {
        const newWork: SavedProject = {
          id: new Date().toISOString(),
          timestamp: Date.now(),
          files: projectFiles,
          messages: messages,
        };
        
        try {
            const savedWorksRaw = localStorage.getItem('agix-ai-previous-works');
            const savedWorks: SavedProject[] = savedWorksRaw ? JSON.parse(savedWorksRaw) : [];

            const workSignature = JSON.stringify({ files: newWork.files, messages: newWork.messages });
            
            const isDuplicate = savedWorks.some(p => JSON.stringify({ files: p.files, messages: p.messages }) === workSignature);

            if (!isDuplicate) {
                const updatedWorks = [newWork, ...savedWorks].slice(0, 10);
                localStorage.setItem('agix-ai-previous-works', JSON.stringify(updatedWorks));
            }
        } catch (e) {
            console.error("Failed to save work to localStorage on unload", e);
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [projectFiles, messages]);

  const handleNextStep = () => {
    if (tutorialStepIndex < tutorialSteps.length - 1) {
      setTutorialStepIndex(prev => prev + 1);
    } else {
      handleSkipTutorial();
    }
  };

  const handleSkipTutorial = () => {
    setIsTutorialActive(false);
    localStorage.setItem('agix-cloud-ai-tutorial-completed', 'true');
  };

  const getFileIcon = (file: GeneratedFile, isExpanded?: boolean) => {
    const iconProps = { className: "h-4 w-4" };
    if (file.isFolder) {
      return isExpanded ? <FolderOpen {...iconProps} /> : <Folder {...iconProps} />;
    }
    switch (file.language) {
      case 'html':
        return <Code {...iconProps} />;
      case 'css':
        return <Paintbrush {...iconProps} />;
      case 'javascript':
        return <Braces {...iconProps} />;
      case 'image':
        return <FileImage {...iconProps} />;
      default:
        return <FileIcon {...iconProps} />;
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);
    setError('');
    
    const inputData: GenerateComponentInput = {
      prompt: currentInput,
      files: projectFiles.filter(f => !f.isFolder), // Don't send folders to AI
    };
    
    try {
      const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inputData),
      });

      const contentType = response.headers.get('content-type');

      if (!response.ok) {
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Server error: ${response.status}`);
        } else {
          // It's not JSON, so it's likely the HTML error page.
          if (response.status === 504) { // Gateway Timeout
             throw new Error("The AI is taking too long to respond. This can happen with very complex requests. Please try breaking your request into smaller steps.");
          }
          throw new Error(`Server error: ${response.status}. The server returned an unexpected response.`);
        }
      }
      
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error("The AI server returned an unexpected response. Please try again.");
      }

      const result: GenerateWebsiteOutput = await response.json();
      if ((result as any).error) {
          throw new Error((result as any).error);
      }

      // --- NEW LOGIC TO HANDLE PARTIAL UPDATES ---
      let currentFiles = [...projectFiles];
      const filesToDelete = new Set<string>();
      const newAndUpdatedFiles: GeneratedFile[] = [];

      // Separate instructions from the AI response
      result.files.forEach((file: {name: string, content: string}) => {
          if (file.content === 'DELETE') {
              filesToDelete.add(file.name);
          } else {
              const extension = file.name.split('.').pop()?.toLowerCase() || '';
              let language: GeneratedFile['language'] = 'javascript';
              if (extension === 'html') language = 'html';
              else if (extension === 'css') language = 'css';
              else if (['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp'].includes(extension)) language = 'image';
              
              newAndUpdatedFiles.push({ ...file, language, isFolder: false });
          }
      });

      // 1. Filter out deleted files
      currentFiles = currentFiles.filter(f => !filesToDelete.has(f.name));

      // 2. Update existing files or add new ones
      const fileMap = new Map(currentFiles.map(f => [f.name, f]));
      newAndUpdatedFiles.forEach(file => {
          fileMap.set(file.name, file);
      });
      const newFileList = Array.from(fileMap.values());
      // --- END NEW LOGIC ---
      
      const newOpenFileTabs = openTabs.filter(tab => !filesToDelete.has(tab));
      if (newOpenFileTabs.length !== openTabs.length) {
        setOpenTabs(newOpenFileTabs);
        if (!newOpenFileTabs.includes(activeView || '')) {
            setActiveView(newOpenFileTabs[0] || 'preview');
        }
      }

      setProjectFiles(newFileList);
      setMessages(prev => [...prev, { role: 'ai', text: result.message || "I've updated the files for you."}]);
      setSidebarView('files');

    } catch (e: any) {
      setMessages(prev => prev.slice(0, -1));
      setInput(currentInput);
      
      setError(e.message || 'An unknown error occurred.');
      toast({
        variant: 'destructive',
        title: 'AI Request Failed',
        description: e.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closeAllFiles = () => {
    if (projectFiles.length > 0) {
      const newWork: SavedProject = {
        id: new Date().toISOString(),
        timestamp: Date.now(),
        files: projectFiles,
        messages: messages,
      };

      const workSignature = JSON.stringify({ files: newWork.files, messages: newWork.messages });
      const isDuplicate = previousWorks.some(p => JSON.stringify({ files: p.files, messages: p.messages }) === workSignature);

      if (!isDuplicate) {
        const updatedWorks = [newWork, ...previousWorks].slice(0, 10);
        setPreviousWorks(updatedWorks);
        try {
          localStorage.setItem('agix-ai-previous-works', JSON.stringify(updatedWorks));
          setTimeout(() => {
            toast({
              title: 'Project Saved',
              description: 'Your current project has been saved to "Previous Work".'
            });
          }, 0);
        } catch (e) {
          console.error("Failed to save work to localStorage", e);
          setTimeout(() => {
            toast({
              variant: 'destructive',
              title: 'Save Failed',
              description: 'Could not save the project.',
            });
          }, 0);
        }
      }
    }
    
    setProjectFiles([]);
    setOpenTabs([]);
    setActiveView(null);
    setError('');
    setMessages([{ role: 'ai', text: 'Alright, project closed. What should we create now?'}]);
    setSidebarView('chat');
    setIsCloseConfirmationOpen(false);
  };

  const handleDownloadAll = async () => {
    if (projectFiles.length === 0) return;
    
    const zip = new JSZip();
    projectFiles.forEach(file => {
      if (file.isFolder) return;
      if (file.language === 'image' && file.content.startsWith('data:')) {
        const base64Data = file.content.split(',')[1];
        zip.file(file.name, base64Data, { base64: true });
      } else {
        zip.file(file.name, file.content);
      }
    });

    try {
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'website.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: 'Downloaded!',
        description: `Your project has been downloaded as website.zip.`,
      });
    } catch (err) {
       toast({
        variant: 'destructive',
        title: 'Failed to download',
        description: 'Could not create the zip file.',
      });
    }
  };

  const handleFileContentChange = (filename: string, newContent: string) => {
    setProjectFiles(files => files.map(file => 
      file.name === filename ? { ...file, content: newContent } : file
    ));
  };

  const handleOpenFile = (fileName: string) => {
    const file = projectFiles.find(f => f.name === fileName);
    if (!file) return;

    if (file.isFolder) {
      setExpandedFolders(prev =>
        prev.includes(fileName)
            ? prev.filter(f => f !== fileName)
            : [...prev, fileName]
      );
      return;
    }

    if (!openTabs.includes(fileName)) {
      setOpenTabs(prev => [...prev, fileName]);
    }
    setActiveView(fileName);
  };
  
  const toggleFolder = (e: React.MouseEvent, folderName: string) => {
    e.stopPropagation();
    setExpandedFolders(prev =>
        prev.includes(folderName)
            ? prev.filter(f => f !== folderName)
            : [...prev, folderName]
    );
  };

  const handleCloseTab = (e: React.MouseEvent, fileNameToClose: string) => {
    e.stopPropagation();
    
    const newOpenTabs = openTabs.filter(tab => tab !== fileNameToClose);
    setOpenTabs(newOpenTabs);

    if (activeView === fileNameToClose) {
      if (newOpenTabs.length === 0) {
        setActiveView(null);
      } else {
        const currentTabIndex = openTabs.findIndex(tab => tab === fileNameToClose);
        const newActiveIndex = Math.max(0, currentTabIndex - 1);
        setActiveView(newOpenTabs[newActiveIndex]);
      }
    }
  };
  
  const confirmDeleteFile = () => {
    if (!fileToDelete) return;

    const fileToDeleteRef = projectFiles.find(f => f.name === fileToDelete);
    if (!fileToDeleteRef) {
      setFileToDelete(null);
      setIsDeleteConfirmationOpen(false);
      return;
    };

    // If it's a folder, also delete all its contents
    const newFiles = fileToDeleteRef.isFolder
      ? projectFiles.filter(f => f.name !== fileToDelete && !f.name.startsWith(`${fileToDelete}/`))
      : projectFiles.filter(f => f.name !== fileToDelete);

    setProjectFiles(newFiles);

    const tabsToClose = fileToDeleteRef.isFolder
      ? openTabs.filter(t => t === fileToDelete || t.startsWith(`${fileToDelete}/`))
      : [fileToDelete];

    const newOpenTabs = openTabs.filter(t => !tabsToClose.includes(t));
    setOpenTabs(newOpenTabs);

    if (tabsToClose.includes(activeView || '')) {
      if (newOpenTabs.length > 0) {
        setActiveView(newOpenTabs[newOpenTabs.length - 1]);
      } else if (newFiles.length > 0) {
        setActiveView('preview');
      } else {
        setActiveView(null);
      }
    }
    
    if (newFiles.length === 0) {
      closeAllFiles();
    }

    toast({
      title: 'Item Deleted',
      description: `${getBaseName(fileToDelete)} has been removed from the project.`,
    });
    
    setFileToDelete(null);
    setIsDeleteConfirmationOpen(false);
  };

  const handleDeleteFile = (e: React.MouseEvent, fileName: string) => {
    e.stopPropagation();
    setFileToDelete(fileName);
    setIsDeleteConfirmationOpen(true);
  };

  const currentFile = projectFiles.find(f => f.name === activeView);

  const handleBeautify = async () => {
    if (!currentFile || isRefactoring || isExplainingCode || isGeneratingImage || currentFile.isFolder || currentFile.language === 'image') return;
    
    const originalContent = currentFile.content;
    setIsRefactoring(true); // Re-use spinner state
    setError('');

    try {
      const response = await fetch('/api/beautify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: originalContent, language: currentFile.language }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const result = await response.json();
      if (result.error) throw new Error(result.error);

      if (result.beautifiedCode) {
        handleFileContentChange(currentFile.name, result.beautifiedCode);
        toast({
          title: 'Code Beautified!',
          description: `${currentFile.name} has been formatted.`,
        });
      }
    } catch (e: any) {
      setError(e.message || 'Could not format the code.');
      toast({
        variant: 'destructive',
        title: 'Beautify Failed',
        description: e.message || 'Could not format the code.',
      });
    } finally {
      setIsRefactoring(false);
    }
  };

  const handleExplainCode = async () => {
    if (!currentFile || isRefactoring || isExplainingCode || isGeneratingImage || currentFile.isFolder || currentFile.language === 'image') return;

    setIsExplainingCode(true);
    setError('');
    setMessages(prev => [...prev, { role: 'ai', text: `Analyzing ${currentFile.name}...` }]);
    setSidebarView('chat');
    
    try {
        const response = await fetch('/api/explain-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: currentFile.content, language: currentFile.language }),
        });
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const result = await response.json();
        if (result.error) throw new Error(result.error);

        setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { role: 'ai', text: result.explanation };
            return newMessages;
        });

    } catch (e: any) {
        setError(e.message || 'Could not explain code.');
        setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { role: 'ai', text: `Sorry, I failed to explain the code. ${e.message}` };
            return newMessages;
        });
    } finally {
        setIsExplainingCode(false);
    }
  };
  
  const handleRefactorCode = async () => {
    if (!fileToModify || !refactorInstructions.trim() || isRefactoring) return;
  
    setIsRefactoring(true);
    setError('');
    
    try {
        const response = await fetch('/api/refactor-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: fileToModify.content,
                language: fileToModify.language,
                instructions: refactorInstructions
            }),
        });

        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const result = await response.json();
        if (result.error) throw new Error(result.error);

        handleFileContentChange(fileToModify.name, result.refactoredCode);
        toast({
            title: 'Code Refactored!',
            description: `${fileToModify.name} has been updated with the changes.`,
        });
        setIsRefactorDialogOpen(false);
        setRefactorInstructions('');

    } catch (e: any) {
        setError(e.message || 'Could not refactor code.');
        toast({
            variant: 'destructive',
            title: 'Refactor Failed',
            description: e.message || 'An unknown error occurred.',
        });
    } finally {
        setIsRefactoring(false);
        setFileToModify(null);
    }
  };

  const handleGenerateImage = async () => {
    if (!generateImagePrompt.trim() || isGeneratingImage) return;

    setIsGeneratingImage(true);
    setError('');

    try {
        const response = await fetch('/api/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: generateImagePrompt }),
        });

        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const result = await response.json();
        if (result.error) throw new Error(result.error);
        
        const safePrompt = generateImagePrompt.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 30);
        const fileName = `${safePrompt}-${Date.now()}.png`;

        const newFile: GeneratedFile = {
            name: fileName,
            language: 'image',
            content: result.imageDataUri,
        };

        setProjectFiles(prev => [...prev, newFile]);
        handleOpenFile(fileName);
        setSidebarView('files');
        toast({
            title: 'Image Generated!',
            description: `${fileName} has been added to your project.`,
        });
        setIsGenerateImageDialogOpen(false);
        setGenerateImagePrompt('');

    } catch (e: any) {
        setError(e.message || 'Could not generate image.');
        toast({
            variant: 'destructive',
            title: 'Image Generation Failed',
            description: e.message || 'An unknown error occurred.',
        });
    } finally {
        setIsGeneratingImage(false);
    }
  };

  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
  
    if (!file.type.startsWith('image/')) {
      toast({
        variant: 'destructive',
        title: 'Unsupported File Type',
        description: 'Only image files can be uploaded at this time.',
      });
      return;
    }
  
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content) return;
  
      const newFile: GeneratedFile = {
        name: file.name,
        language: 'image',
        content: content,
      };
  
      setProjectFiles((prevFiles) => [...prevFiles, newFile]);
      if (!openTabs.includes(newFile.name)) {
        setOpenTabs((prevTabs) => [...prevTabs, newFile.name]);
      }
      setActiveView(newFile.name);
      setSidebarView('files');
      toast({
        title: 'File Uploaded',
        description: `${file.name} has been added to the project.`,
      });
    };
  
    reader.onerror = () => {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: 'There was an error reading the file.',
      });
    };
  
    reader.readAsDataURL(file);
  
    if(event.target) event.target.value = '';
  };
  
  const handleZipUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    toast({
        title: 'Extracting Project...',
        description: 'Please wait while the .zip file is being processed.',
    });

    try {
        const zip = new JSZip();
        const contents = await zip.loadAsync(file);
        const newFiles: GeneratedFile[] = [];
        const filePromises: Promise<void>[] = [];

        contents.forEach((relativePath, zipEntry) => {
            if (!zipEntry.dir && !relativePath.startsWith('__MACOSX/')) {
                const promise = (async () => {
                    const extension = relativePath.split('.').pop()?.toLowerCase() || '';
                    let language: GeneratedFile['language'] = 'javascript'; // Default
                    let content: string;
                    
                    const isTextFile = ['html', 'css', 'js', 'json', 'txt', 'md', 'svg', 'xml'].includes(extension);

                    if (isTextFile) {
                        content = await zipEntry.async('string');
                        if (extension === 'html') language = 'html';
                        else if (extension === 'css') language = 'css';
                        // For images like SVG that are text-based, we can still load them as data URIs to be safe
                        if (extension === 'svg') {
                            language = 'image';
                            content = `data:image/svg+xml;base64,${btoa(content)}`;
                        }
                    } else {
                        // For binary files (images, fonts, etc.), encode as base64 data URI
                        const base64 = await zipEntry.async('base64');
                        let mimeType = 'application/octet-stream';

                        if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension)) {
                            language = 'image';
                            mimeType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
                        } else if (['woff', 'woff2', 'ttf', 'otf', 'eot'].includes(extension)) {
                            // Although we don't have a 'font' language type, this will work.
                            mimeType = `font/${extension}`;
                        }
                        
                        content = `data:${mimeType};base64,${base64}`;
                    }
                    
                    newFiles.push({
                        name: relativePath,
                        language: language,
                        content: content,
                        isFolder: false,
                    });
                })();
                filePromises.push(promise);
            }
        });

        await Promise.all(filePromises);
        
        const folderPaths = new Set<string>();
        newFiles.forEach(f => {
            const pathParts = f.name.split('/');
            if (pathParts.length > 1) {
                pathParts.pop();
                let currentPath = '';
                for (const part of pathParts) {
                    currentPath = currentPath ? `${currentPath}/${part}` : part;
                    folderPaths.add(currentPath);
                }
            }
        });

        const folderObjects: GeneratedFile[] = Array.from(folderPaths).map(path => ({
            name: path,
            language: 'folder',
            content: '',
            isFolder: true,
        }));

        const allNewFiles = [...folderObjects, ...newFiles];

        setProjectFiles(allNewFiles);
        const firstFile = newFiles.find(f => f.name.toLowerCase() === 'index.html') || newFiles[0];
        if (firstFile) {
            setOpenTabs([firstFile.name]);
            setActiveView(firstFile.name);
        } else {
            setOpenTabs([]);
            setActiveView('preview');
        }

        setMessages([{ role: 'ai', text: `Project "${file.name}" uploaded successfully! What would you like to change?` }]);
        setSidebarView('files');
        
        toast({
            title: 'Project Uploaded!',
            description: `${newFiles.length} files have been extracted and loaded.`,
        });

    } catch (e: any) {
        toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: 'Could not extract the .zip file. Please ensure it is a valid zip archive.',
        });
        console.error(e); // log error for debugging
    } finally {
        setIsLoading(false);
        if (event.target) event.target.value = '';
    }
};

  const getPreviewDoc = () => {
    if (projectFiles.length === 0) return '';
    
    let htmlFile = projectFiles.find(f => f.name === 'index.html' && !f.isFolder);
    if (!htmlFile) htmlFile = projectFiles.find(f => f.name.endsWith('/index.html') && !f.isFolder);
    if (!htmlFile) htmlFile = projectFiles.find(f => f.language === 'html' && !f.isFolder);

    if (!htmlFile) {
        return '<html><body>No HTML file found to preview. Create an index.html file.</body></html>';
    }
    
    let content = htmlFile.content;
    const fileMap = new Map(projectFiles.filter(f => !f.isFolder).map(f => [f.name, f]));
    const htmlFileDir = htmlFile.name.substring(0, htmlFile.name.lastIndexOf('/') + 1);

    const resolvePath = (baseDir: string, relativePath: string): GeneratedFile | undefined => {
        if (!relativePath || relativePath.startsWith('http') || relativePath.startsWith('//') || relativePath.startsWith('data:')) {
            return undefined;
        }
        
        if (relativePath.startsWith('/')) {
            return fileMap.get(relativePath.substring(1));
        }

        const pathParts = baseDir.split('/').filter(p => p);
        const relativeParts = relativePath.split('/');

        for (const part of relativeParts) {
            if (part === '..') {
                pathParts.pop();
            } else if (part !== '.' && part) {
                pathParts.push(part);
            }
        }
        const resolvedPath = pathParts.join('/');
        return fileMap.get(resolvedPath);
    };

    // Recursive function to process CSS, including @imports
    const processCssContent = (cssContent: string, cssFilePath: string): string => {
      const cssFileDir = cssFilePath.substring(0, cssFilePath.lastIndexOf('/') + 1);

      // Process @import rules first
      let withImports = cssContent.replace(/@import\s+(?:url\()?(["'])([^"']+)\1\)?.*;/g, (match, quote, path) => {
        const file = resolvePath(cssFileDir, path);
        if (file && file.language === 'css') {
          return processCssContent(file.content, file.name); // Recursion
        }
        return ''; // Remove unresolved imports
      });

      // Then process url() paths for fonts, images, etc.
      return withImports.replace(/url\((['"]?)(.*?)\1\)/g, (match, quote, path) => {
        const file = resolvePath(cssFileDir, path);
        if (file) {
          // The content of the resolved file should be a data URI
          return `url(${file.content})`;
        }
        return match; // Keep original path if not found
      });
    };

    // 1. Inline Stylesheets <link href="...">
    content = content.replace(/<link[^>]+href=(["'])([^"']+)\1[^>]*>/g, (match, quote, path) => {
      if (path.toLowerCase().endsWith('.css')) {
        const file = resolvePath(htmlFileDir, path);
        if (file && file.language === 'css') {
          return `<style>\n${processCssContent(file.content, file.name)}\n</style>`;
        }
      }
      // Keep other links like favicons, preconnects etc.
      return match;
    });

    // 2. Process inline <style> tags for url() paths
    content = content.replace(/<style>([\s\S]*?)<\/style>/g, (match, css) => {
      return `<style>${processCssContent(css, htmlFile.name)}</style>`;
    });

    // 3. Process inline style attributes on any tag
    content = content.replace(/style=(["'])([\s\S]*?)\1/g, (match, quote, styleString) => {
        const processedStyle = processCssContent(styleString, htmlFile.name);
        return `style=${quote}${processedStyle}${quote}`;
    });
    
    // 4. Inline Scripts <script src="...">
    content = content.replace(/<script[^>]+src=(["'])([^"']+)\1[^>]*><\/script>/g, (match, quote, path) => {
      const file = resolvePath(htmlFileDir, path);
      if (file && file.language === 'javascript') {
        return `<script>${file.content}</script>`;
      }
      return match;
    });

    // 5. Replace asset paths for `src` and `poster` attributes
    const srcAttributes = ['src', 'poster'];
    srcAttributes.forEach(attribute => {
        const regex = new RegExp(`(<[^>]*?${attribute}=["'])([^"']+)(["'])`, 'gi');
        content = content.replace(regex, (match, prefix, path, suffix) => {
            const file = resolvePath(htmlFileDir, path);
            if (file) {
                return `${prefix}${file.content}${suffix}`;
            }
            return match;
        });
    });

    // 6. Replace asset paths for `srcset` attribute
    content = content.replace(/(<[^>]+srcset=["'])([^"']+)(["'])/gi, (match, prefix, srcset, suffix) => {
        const newSrcset = srcset.split(',').map(part => {
            const item = part.trim().split(/\s+/);
            const url = item[0];
            const descriptor = item.length > 1 ? ` ${item.slice(1).join(' ')}` : '';
            const file = resolvePath(htmlFileDir, url);
            return file ? `${file.content}${descriptor}` : part.trim();
        }).join(', ');
        return `${prefix}${newSrcset}${suffix}`;
    });

    return content;
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>, file: GeneratedFile) => {
    setDraggedFile(file);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, file: GeneratedFile) => {
    e.preventDefault();
    if (draggedFile && file.name !== draggedFile.name) {
      setDragOverFile(file);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, targetFile: GeneratedFile) => {
    e.preventDefault();
    if (!draggedFile || draggedFile.name === targetFile.name) {
        setDraggedFile(null);
        setDragOverFile(null);
        return;
    }

    let files = [...projectFiles];
    const draggedIndex = files.findIndex(f => f.name === draggedFile.name);
    const [movedFile] = files.splice(draggedIndex, 1);
    
    if (targetFile.isFolder && !draggedFile.isFolder && dragOverFile?.name === targetFile.name) {
        if (targetFile.name.startsWith(movedFile.name + '/')) { 
             files.splice(draggedIndex, 0, movedFile);
        } else {
            const baseName = getBaseName(movedFile.name);
            const newName = `${targetFile.name}/${baseName}`;
            
            if (files.some(f => f.name === newName)) {
                toast({ variant: "destructive", title: "Item Exists", description: `An item named "${baseName}" already exists in "${targetFile.name}".`});
                files.splice(draggedIndex, 0, movedFile);
            } else {
                const oldName = movedFile.name;
                movedFile.name = newName;
                files.push(movedFile);
                
                setOpenTabs(tabs => tabs.map(tab => tab === oldName ? newName : tab));
                if (activeView === oldName) setActiveView(newName);
                if (!expandedFolders.includes(targetFile.name)) {
                    setExpandedFolders(prev => [...prev, targetFile.name]);
                }
                toast({ title: 'File Moved', description: `Moved ${baseName} into ${targetFile.name}.` });
            }
        }
    } 
    else {
        const targetIndex = files.findIndex(f => f.name === targetFile.name);
        files.splice(targetIndex, 0, movedFile);
    }

    setProjectFiles(files);
    setDraggedFile(null);
    setDragOverFile(null);
  };

  const handleDragEnd = () => {
    setDraggedFile(null);
    setDragOverFile(null);
  };
  
  const handleCreateFile = () => {
    const finalFileName = newFileName.trim();
    if (!finalFileName) {
        toast({
            variant: 'destructive',
            title: 'Invalid Name',
            description: 'File name cannot be empty.',
        });
        return;
    }

    if (projectFiles.some(f => f.name === finalFileName)) {
        toast({
            variant: 'destructive',
            title: 'File Exists',
            description: `A file named "${finalFileName}" already exists.`,
        });
        return;
    }

    const extension = finalFileName.split('.').pop()?.toLowerCase() || '';
    let language: GeneratedFile['language'] = 'javascript';
    let content = `// New file: ${finalFileName}`;

    if (extension === 'html') {
        language = 'html';
        content = `<!DOCTYPE html>
<html>
<head>
  <title>New Page</title>
</head>
<body>
  <h1>Welcome</h1>
</body>
</html>`;
    } else if (extension === 'css') {
        language = 'css';
        content = `/* New CSS file */
body {
  font-family: sans-serif;
}`;
    } else if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(extension)) {
        toast({
            variant: 'destructive',
            title: 'Unsupported Action',
            description: `Cannot create image files directly. Please use the "Upload File" button.`,
        });
        return;
    }
    
    const newFile: GeneratedFile = { name: finalFileName, language, content, isFolder: false };
    setProjectFiles(prev => [...prev, newFile]);
    handleOpenFile(newFile.name);
    setIsNewFileDialogOpen(false);
    setNewFileName('');
    toast({ title: 'File Created', description: `Successfully created ${finalFileName}.` });
  };
  
  const handleCreateFolder = () => {
      const finalFolderName = newFolderName.trim();
      if (!finalFolderName) {
          toast({
              variant: 'destructive',
              title: 'Invalid Name',
              description: 'Folder name cannot be empty.',
          });
          return;
      }
  
      if (projectFiles.some(f => f.name === finalFolderName)) {
          toast({
              variant: 'destructive',
              title: 'Item Exists',
              description: `A file or folder named "${finalFolderName}" already exists.`,
          });
          return;
      }
  
      const newFolder: GeneratedFile = { name: finalFolderName, language: 'folder', content: '', isFolder: true };
      setProjectFiles(prev => [...prev, newFolder]);
      setIsNewFolderDialogOpen(false);
      setNewFolderName('');
      toast({ title: 'Folder Created', description: `Successfully created folder "${finalFolderName}".` });
  };

  const confirmLoadWork = (workId: string) => {
    if (projectFiles.length > 0) {
      setWorkToLoad(workId);
    } else {
      executeLoadWork(workId);
    }
  };

  const executeLoadWork = (workId: string) => {
    const workToLoadData = previousWorks.find(w => w.id === workId);
    if (!workToLoadData) return;

    let updatedWorks = previousWorks.filter(w => w.id !== workId);

    if (projectFiles.length > 0) {
      const currentWorkToSave: SavedProject = {
        id: new Date().toISOString(),
        timestamp: Date.now(),
        files: projectFiles,
        messages: messages,
      };
      
      const workSignature = JSON.stringify({ files: currentWorkToSave.files, messages: currentWorkToSave.messages });
      const isDuplicate = updatedWorks.some(p => JSON.stringify({ files: p.files, messages: p.messages }) === workSignature);

      if (!isDuplicate) {
        updatedWorks = [currentWorkToSave, ...updatedWorks];
      }
    }

    const finalWorks = updatedWorks.slice(0, 10);
    setPreviousWorks(finalWorks);
    try {
      localStorage.setItem('agix-ai-previous-works', JSON.stringify(finalWorks));
    } catch (e) {
      console.error("Failed to update localStorage when loading work", e);
    }
    
    setProjectFiles(workToLoadData.files);
    setMessages(workToLoadData.messages);
    const tabs = workToLoadData.files.filter(f => !f.isFolder).slice(0, 5).map(f => f.name);
    setOpenTabs(tabs);
    setActiveView(tabs[0] || 'preview');
    setSidebarView('files');
    setTimeout(() => {
        toast({
          title: 'Project Loaded',
          description: 'The previous project has been loaded.'
        });
    }, 0);
    
    setWorkToLoad(null);
  };
  
  const handleDeleteWork = (e: React.MouseEvent, workId: string) => {
    e.stopPropagation();
    setWorkToDelete(workId);
    setIsDeleteWorkConfirmationOpen(true);
  };
  
  const confirmDeleteWork = () => {
    if (!workToDelete) return;

    const updatedWorks = previousWorks.filter(w => w.id !== workToDelete);

    setPreviousWorks(updatedWorks);

    try {
        localStorage.setItem('agix-ai-previous-works', JSON.stringify(updatedWorks));
    } catch (e) {
        console.error("Failed to update localStorage", e);
        setPreviousWorks(previousWorks); 
    }
    
    setTimeout(() => {
        toast({
            title: 'Project Deleted',
            description: 'The saved project has been removed.',
        });
    }, 0);
    
    setWorkToDelete(null);
    setIsDeleteWorkConfirmationOpen(false);
  };

  const handleDeploy = async () => {
    if (!repoUrl.trim()) {
        toast({
            variant: "destructive",
            title: "Repository URL required",
            description: "Please enter a GitHub repository URL.",
        });
        return;
    }
    setIsDeploying(true);
    toast({
        title: "Deployment started...",
        description: `Simulating push to ${repoUrl}`,
    });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsDeploying(false);
    setIsDeployDialogOpen(false);
    setRepoUrl('');

    toast({
        title: "Deployment Successful! (Simulated)",
        description: `Your project code has been pushed to your repository.`,
    });
  };

  const filesForExplorer = projectFiles
    .filter(file => {
      const pathParts = file.name.split('/');
      if (pathParts.length <= 1) {
        return true; // Always show root files
      }
      const parentPath = pathParts.slice(0, pathParts.length - 1).join('/');
      return expandedFolders.includes(parentPath);
    })
    .sort((a, b) => {
        const aPathParts = a.name.split('/');
        const bPathParts = b.name.split('/');
    
        // Compare parent directories first
        const aParent = aPathParts.slice(0, -1).join('/');
        const bParent = bPathParts.slice(0, -1).join('/');
    
        if (aParent !== bParent) {
            return aParent.localeCompare(bParent);
        }
    
        // Sort folders before files
        const aIsFolder = a.isFolder ? 0 : 1;
        const bIsFolder = b.isFolder ? 0 : 1;
        if (aIsFolder !== bIsFolder) {
            return aIsFolder - bIsFolder;
        }
    
        return a.name.localeCompare(b.name);
    });

  const showFileView = projectFiles.length > 0;
  
  const sidebarComponent = (
      <>
        <div className="text-xs uppercase text-muted-foreground font-bold tracking-wider mb-2 px-2 pt-1 flex items-center justify-between">
          <span>{sidebarView === 'chat' ? 'Explorer' : sidebarView === 'files' ? 'Project' : 'Previous Work'}</span>
          <Button variant="ghost" size="icon" className="md:hidden h-7 w-7" onClick={() => setIsSidebarOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        {sidebarView !== 'history' && (
          <div className="flex items-center cursor-pointer mb-2 px-2">
              <ChevronDown className="h-4 w-4 mr-1" />
              <span className="font-bold">AGIX-CLOUD-AI-PROJECT</span>
          </div>
        )}
        
        <div className="flex-grow px-2 flex flex-col min-h-0">
          {sidebarView === 'chat' && (
            <div id="tutorial-step-2-chat-panel" className="flex-grow flex flex-col bg-input rounded-md overflow-hidden transition-shadow duration-300 hover:shadow-2xl hover:shadow-primary/20">
                <ScrollArea className="flex-1 p-3">
                    <div className="space-y-4">
                        {messages.map((msg, index) => (
                            <div key={index} className={cn("flex items-start gap-2 text-xs animate-in fade-in-0 slide-in-from-bottom-2 duration-300", msg.role === 'user' ? 'justify-end' : '')}>
                                {msg.role === 'ai' && <Bot className="h-5 w-5 shrink-0 text-primary" />}
                                <div className={cn("p-2 rounded-lg max-w-[85%]", msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background')}>
                                    {msg.text}
                                </div>
                                {msg.role === 'user' && <AvatarIcon />}
                            </div>
                        ))}
                        {isLoading && (
                              <div className="flex items-start gap-2 text-xs animate-in fade-in-0">
                                <Bot className="h-5 w-5 shrink-0 text-primary" />
                                <div className="p-2 rounded-lg bg-background flex items-center space-x-2 text-muted-foreground">
                                  <LoaderCircle className="h-4 w-4 animate-spin" />
                                  <span>Generating...</span>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <div className="p-2 border-t border-border">
                    <div id="tutorial-step-2-chat-input" className="flex items-end gap-2 rounded-md border bg-background p-2 focus-within:ring-2 focus-within:ring-ring">
                        <div className="flex-1 min-w-0">
                            <Textarea 
                                ref={chatInputRef}
                                placeholder="Type your message..." 
                                className="w-full bg-transparent border-none text-xs focus-visible:ring-0 ring-offset-0 focus-visible:ring-offset-0 resize-none max-h-32 overflow-y-auto"
                                rows={1}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (!isLoading && e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage();
                                    }
                                }}
                                disabled={isLoading || isExplainingCode}
                            />
                        </div>
                        <Button onClick={handleSendMessage} disabled={isLoading || isExplainingCode} size="icon" className="h-7 w-7 shrink-0">
                            <Send className="h-4 w-4"/>
                        </Button>
                    </div>
                </div>
            </div>
          )}
          {sidebarView === 'files' && (
              projectFiles.length > 0 ? (
                <div id="tutorial-step-4-file-explorer" className="flex flex-col h-full animate-in fade-in duration-500">
                  <div className="flex items-center gap-1 border-b pb-1 mb-1 border-border">
                    <Button variant="ghost" size="icon" className="h-7 w-7" title="New File" onClick={() => setIsNewFileDialogOpen(true)}>
                      <FilePlus className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" title="New Folder" onClick={() => setIsNewFolderDialogOpen(true)}>
                      <FolderPlus className="h-4 w-4" />
                    </Button>
                  </div>
                  <ScrollArea className="flex-1 -mx-2">
                    <div className='flex flex-col gap-px px-2'>
                      {filesForExplorer.map((file) => {
                          const isDraggingOver = dragOverFile?.name === file.name;
                          const isBeingDragged = draggedFile?.name === file.name;
                          const isFolderDropTarget = isDraggingOver && file.isFolder && draggedFile && !draggedFile.isFolder;
                          const isFileDropTarget = isDraggingOver && !isFolderDropTarget;
                          const depth = file.name.split('/').length - 1;
                          const baseName = getBaseName(file.name);
                          const isExpanded = expandedFolders.includes(file.name);

                          return (
                            <div
                              key={file.name}
                              onClick={() => handleOpenFile(file.name)}
                              draggable="true"
                              onDragStart={(e) => handleDragStart(e, file)}
                              onDragOver={(e) => handleDragOver(e, file)}
                              onDrop={(e) => handleDrop(e, file)}
                              onDragEnd={handleDragEnd}
                              onDragLeave={() => setDragOverFile(null)}
                              style={{ paddingLeft: `${depth * 16}px` }}
                              className={cn(
                                  "group flex items-center justify-between gap-2 cursor-pointer p-1 rounded-sm text-sm transition-all",
                                  activeView === file.name ? 'bg-accent' : 'hover:bg-accent/50',
                                  isBeingDragged && 'opacity-50',
                                  isFileDropTarget && 'border-t-2 border-primary',
                                  isFolderDropTarget && 'bg-primary/20'
                              )}
                            >
                              <div className="flex items-center gap-2 overflow-hidden">
                                  <div onClick={(e) => file.isFolder && toggleFolder(e, file.name)} className="w-4 h-4 flex items-center justify-center cursor-pointer">
                                    {file.isFolder && <ChevronRight className={cn("h-4 w-4 shrink-0 transition-transform duration-200", isExpanded && "rotate-90")} />}
                                  </div>
                                  {getFileIcon(file, isExpanded)}
                                  <span className="truncate">{baseName}</span>
                              </div>
                              <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 rounded-full hover:bg-destructive/20 hover:text-destructive-foreground/80 shrink-0 opacity-0 group-hover:opacity-100"
                                  onClick={(e) => handleDeleteFile(e, file.name)}
                                  title={`Delete ${baseName}`}
                              >
                                  <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          )
                        })}
                    </div>
                  </ScrollArea>
                  <div className="flex-shrink-0 flex flex-col gap-1 border-t border-border pt-2 mt-2">
                    <input type="file" id="file-upload" className="hidden" onChange={handleFileUpload} disabled={isLoading} />
                    <Button onClick={() => document.getElementById('file-upload')?.click()} className="w-full" variant="secondary" size="sm" disabled={isLoading}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Asset
                    </Button>
                    <input type="file" id="zip-upload" className="hidden" accept=".zip" onChange={handleZipUpload} disabled={isLoading} />
                    <Button onClick={() => document.getElementById('zip-upload')?.click()} className="w-full" variant="secondary" size="sm" disabled={isLoading}>
                        <Archive className="mr-2 h-4 w-4" />
                        Upload Project (.zip)
                    </Button>
                     <Button onClick={() => setIsGenerateImageDialogOpen(true)} className="w-full" variant="secondary" size="sm">
                        <ImagePlus className="mr-2 h-4 w-4" />
                        Generate AI Image
                    </Button>
                    <Button onClick={handleDownloadAll} className="w-full" variant="secondary" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download Project
                    </Button>
                    <Button onClick={() => setIsDeployDialogOpen(true)} className="w-full" variant="secondary" size="sm">
                      <UploadCloud className="mr-2 h-4 w-4" />
                      Deploy Project
                    </Button>
                    <Button onClick={() => setIsCloseConfirmationOpen(true)} className="w-full" variant="destructive" size="sm">
                      <X className="mr-2 h-4 w-4" />
                      Close Project
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground text-xs text-center py-10">
                  <p>No files have been generated yet.</p>
                  <p className="mt-2">Use the <FileCode className="inline h-3 w-3 mx-1" /> Explorer to start a project.</p>
                  <input type="file" id="file-upload" className="hidden" onChange={handleFileUpload} />
                  <Button onClick={() => document.getElementById('file-upload')?.click()} className="w-full mt-4" variant="outline" size="sm">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload File
                  </Button>
                  <input type="file" id="zip-upload" className="hidden" accept=".zip" onChange={handleZipUpload} disabled={isLoading} />
                  <Button onClick={() => document.getElementById('zip-upload')?.click()} className="w-full mt-2" variant="outline" size="sm" disabled={isLoading}>
                      <Archive className="mr-2 h-4 w-4" />
                      Upload Project (.zip)
                  </Button>
                </div>
              )
          )}
          {sidebarView === 'history' && (
             <div id="previous-work-panel" className="flex flex-col h-full animate-in fade-in duration-500 -mx-2">
                <ScrollArea className="flex-1">
                    <div className='flex flex-col gap-2 px-2'>
                        {previousWorks.length > 0 ? previousWorks.map(work => {
                            const workTitle = work.messages.find(m => m.role === 'user')?.text || `Project from ${new Date(work.timestamp).toLocaleString()}`;
                            const shortTitle = workTitle.length > 40 ? `${workTitle.substring(0, 40)}...` : workTitle;

                            return (
                                <div key={work.id} className="p-3 rounded-md border bg-card hover:bg-accent/50 group transition-colors">
                                    <p className="text-sm font-medium truncate" title={workTitle}>
                                        {shortTitle}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {new Date(work.timestamp).toLocaleString()} &bull; {work.files.length} files
                                    </p>
                                    <div className="flex gap-2 mt-3">
                                        <Button size="sm" className="h-7 px-2 text-xs" onClick={() => confirmLoadWork(work.id)}>Load</Button>
                                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={(e) => handleDeleteWork(e, work.id)}>Delete</Button>
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="text-muted-foreground text-xs text-center py-10">
                                <p>No previous work saved.</p>
                                <p className="mt-2">Close a project to save it here.</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
          )}
        </div>
        {error && (
            <div className="border-t border-border mt-2 pt-2 px-2">
                <div className="p-2 text-destructive-foreground bg-destructive/40 rounded-md text-xs max-h-40 overflow-y-auto">
                    <p className='font-bold mb-1'>Error:</p>
                    <pre className="whitespace-pre-wrap text-xs">{error}</pre>
                </div>
            </div>
        )}
      </>
  );

  return (
    <div className="flex flex-1 w-full bg-secondary text-foreground font-mono text-sm overflow-hidden">
       <AlertDialog open={isBetaDialogOpen} onOpenChange={(open) => {
        setIsBetaDialogOpen(open);
        if (!open) {
          const tutorialCompleted = localStorage.getItem('agix-cloud-ai-tutorial-completed');
          if (!tutorialCompleted) {
              setTimeout(() => setIsTutorialActive(true), 500);
          }
        }
       }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Welcome to Agix Cloud AI Beta!</AlertDialogTitle>
            <AlertDialogDescription>
              Thank you for trying out Agix Cloud AI. This project is currently in beta testing.
              Click "Continue" to start a quick tutorial.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {isTutorialActive && tutorialSteps[tutorialStepIndex] && (
        <>
          <div 
            className="fixed z-[99] border-2 border-primary rounded-lg transition-all duration-300 ease-in-out pointer-events-none"
            style={tutorialStyle.highlight}
          />
          <div
            ref={popoverRef}
            className="fixed z-[100] w-80 transition-all duration-300 ease-in-out"
            style={tutorialStyle.popover}
          >
            <Card className="animate-in fade-in zoom-in-95">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{tutorialSteps[tutorialStepIndex].title}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={handleSkipTutorial} className="text-xs -mt-2 -mr-3">Skip Tutorial</Button>
                </div>
                <CardDescription>{tutorialSteps[tutorialStepIndex].description}</CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-end">
                <Button onClick={handleNextStep}>
                  {tutorialStepIndex === tutorialSteps.length - 1 ? 'Finish' : 'Next'}
                </Button>
              </CardFooter>
            </Card>
          </div>
          <div className="fixed inset-0 bg-black/50 z-[98] animate-in fade-in" />
        </>
      )}

      <Dialog open={isGenerateImageDialogOpen} onOpenChange={setIsGenerateImageDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Generate Image with AI</DialogTitle>
                  <DialogDescription>
                      Describe the image you want the AI to create.
                  </DialogDescription>
              </DialogHeader>
              <Input 
                placeholder="e.g., a photorealistic cat wearing a spacesuit" 
                value={generateImagePrompt} 
                onChange={e => setGenerateImagePrompt(e.target.value)} 
                onKeyPress={e => e.key === 'Enter' && handleGenerateImage()} 
                disabled={isGeneratingImage}
              />
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsGenerateImageDialogOpen(false)} disabled={isGeneratingImage}>Cancel</Button>
                  <Button onClick={handleGenerateImage} disabled={isGeneratingImage}>
                    {isGeneratingImage && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Image
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
      
      <Dialog open={isRefactorDialogOpen} onOpenChange={setIsRefactorDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Refactor Code</DialogTitle>
                  <DialogDescription>
                     Provide instructions for how the AI should refactor &quot;
                     <span className="font-semibold text-foreground">{fileToModify?.name}</span>
                     &quot;.
                  </DialogDescription>
              </DialogHeader>
              <Textarea 
                placeholder="e.g., convert all functions to arrow functions" 
                value={refactorInstructions} 
                onChange={e => setRefactorInstructions(e.target.value)}
                disabled={isRefactoring}
                className="min-h-[120px]"
              />
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsRefactorDialogOpen(false)} disabled={isRefactoring}>Cancel</Button>
                  <Button onClick={handleRefactorCode} disabled={isRefactoring}>
                    {isRefactoring && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    Refactor
                  </Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>


      <Dialog open={isNewFileDialogOpen} onOpenChange={setIsNewFileDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create New File</DialogTitle>
                <DialogDescription>
                    Enter a name for your new file. Include the extension (e.g., .html, .css).
                </DialogDescription>
            </DialogHeader>
            <Input placeholder="e.g., about.html" value={newFileName} onChange={e => setNewFileName(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleCreateFile()} />
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewFileDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateFile}>Create File</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Create New Folder</DialogTitle>
                  <DialogDescription>
                      Enter a name for your new folder.
                  </DialogDescription>
              </DialogHeader>
              <Input placeholder="e.g., components" value={newFolderName} onChange={e => setNewFolderName(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleCreateFolder()} />
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNewFolderDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateFolder}>Create Folder</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>

      <AlertDialog open={isCloseConfirmationOpen} onOpenChange={setIsCloseConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will save your current project to "Previous Work" and start a new session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={closeAllFiles}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={isDeleteConfirmationOpen} onOpenChange={setIsDeleteConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete "{fileToDelete ? getBaseName(fileToDelete) : 'the item'}" and its contents. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFileToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteFile}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!workToLoad} onOpenChange={(open) => !open && setWorkToLoad(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Load Project?</AlertDialogTitle>
            <AlertDialogDescription>
              Loading a previous project will replace your current unsaved work. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setWorkToLoad(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => executeLoadWork(workToLoad!)}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={isDeleteWorkConfirmationOpen} onOpenChange={setIsDeleteWorkConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Saved Project?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this saved project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setWorkToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteWork}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <Dialog open={isDeployDialogOpen} onOpenChange={setIsDeployDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Deploy to GitHub</DialogTitle>
                <DialogDescription>
                    Enter your GitHub repository URL to push the code. This is a simulation and will not perform a real Git push.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
                 <Label htmlFor="repo-url">Repository URL</Label>
                 <Input
                    id="repo-url"
                    placeholder="https://github.com/user/repo.git"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    disabled={isDeploying}
                />
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => {
                    setIsDeployDialogOpen(false);
                    setRepoUrl('');
                    setIsDeploying(false);
                }} disabled={isDeploying}>Cancel</Button>
                <Button onClick={handleDeploy} disabled={isDeploying || !repoUrl.trim()}>
                    {isDeploying && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                    Deploy
                </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* Activity Bar */}
      <div className="flex flex-col items-center justify-between w-12 bg-secondary border-r border-border flex-shrink-0 z-20">
        <div>
          <div className="p-2 md:hidden">
             <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
                <Menu className="h-6 w-6" />
             </Button>
          </div>
          <div className="hidden md:flex flex-col">
            <div id="tutorial-step-1-chat-icon" onClick={() => setSidebarView('chat')} title="Explorer" className={cn("flex justify-center items-center h-12 w-12 cursor-pointer border-l-2", sidebarView === 'chat' ? 'border-primary' : 'border-transparent')}>
              <FileCode className="h-6 w-6"/>
            </div>
            <div id="tutorial-step-3-files-icon" onClick={() => setSidebarView('files')} title="Project Files" className={cn("flex justify-center items-center h-12 w-12 cursor-pointer border-l-2", sidebarView === 'files' ? 'border-primary' : 'border-transparent')}>
              <Folder className="h-6 w-6" />
            </div>
             <div onClick={() => setSidebarView('history')} title="Previous Work" className={cn("flex justify-center items-center h-12 w-12 cursor-pointer border-l-2", sidebarView === 'history' ? 'border-primary' : 'border-transparent')}>
              <History className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-4 mb-4">
          <div id="tutorial-step-6-theme-switcher">
            <ThemeSwitcher />
          </div>
          <a href="https://x.com/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground" title="Twitter/X">
            <Twitter className="h-5 w-5" />
          </a>
          <a href="https://t.me/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground" title="Telegram">
            <Send className="h-5 w-5" />
          </a>
        </div>
      </div>
      
      {/* Sidebar for Mobile */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}
      <div className={cn(
        "fixed top-0 left-0 h-full w-80 bg-card p-2 flex flex-col border-r border-border z-40 transition-transform duration-300 ease-in-out md:hidden",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {sidebarComponent}
      </div>

      {/* Sidebar for Desktop */}
      <div className="w-80 bg-card p-2 hidden md:flex flex-col border-r border-border">
        {sidebarComponent}
      </div>


      {/* Main Content / Editor */}
      <div className="flex-1 flex flex-col bg-background min-w-0">
        {/* Editor Tabs */}
        <div className="flex bg-card items-center">
          {isLoading ? (
             <div className="flex items-center py-1.5 px-4 cursor-pointer border-r border-border whitespace-nowrap bg-background border-t-2 border-t-primary animate-in fade-in duration-300">
                <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                <span>Generating...</span>
              </div>
          ) : showFileView ? (
            <div className="w-full animate-in fade-in duration-300">
              <ScrollArea orientation="horizontal" className="w-full">
                <div className='flex items-center'>
                  {openTabs.map(tabName => {
                    const file = projectFiles.find(f => f.name === tabName);
                    if (!file) return null;
                    return (
                        <div 
                            key={file.name} 
                            onClick={() => setActiveView(file.name)} 
                            className={cn(
                                "flex items-center justify-between py-1.5 px-4 cursor-pointer border-r border-border whitespace-nowrap gap-3",
                                file.name === activeView ? 'bg-background border-t-2 border-t-primary' : 'hover:bg-accent/50'
                            )}
                        >
                            <div className="flex items-center gap-2">
                                {getFileIcon(file, expandedFolders.includes(file.name))}
                                <span>{getBaseName(file.name)}</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-5 w-5 rounded-full hover:bg-destructive/20 hover:text-destructive-foreground/80 shrink-0"
                                onClick={(e) => handleCloseTab(e, file.name)}
                            >
                                <X className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    );
                  })}

                  {projectFiles.length > 0 && 
                    <div onClick={() => setActiveView('preview')} className={cn("flex items-center py-1.5 px-4 cursor-pointer border-r border-border whitespace-nowrap", activeView === 'preview' ? 'bg-background border-t-2 border-t-primary' : 'hover:bg-accent/50')}>
                      <Eye className="h-4 w-4 mr-2" />
                      <span>Preview</span>
                    </div>
                  }
                </div>
              </ScrollArea>
            </div>
          ) : (
             <div className="flex-grow flex items-center justify-center h-full text-muted-foreground">
                <div className='text-center -mt-20 animate-in fade-in-0 zoom-in-95 duration-500'>
                    <Folder size={60} className="mx-auto mb-4 opacity-50"/>
                    <h2 className="text-2xl font-body font-bold text-foreground/80">Agix Cloud AI</h2>
                    <p className="mt-2 text-foreground/60">AI Website Creator</p>
                    <p className="mt-8 text-sm text-foreground/40">Describe your website in the explorer to start.</p>
                </div>
             </div>
          )}
        </div>

        {/* Editor Pane */}
        <div id="tutorial-step-5-editor-pane" className="flex-1 overflow-auto relative transition-all duration-300 ease-in-out hover:scale-[1.005] hover:shadow-2xl hover:shadow-primary/20">
            <div key={activeView} className="w-full h-full animate-in fade-in-25 duration-300">
              {activeView === 'preview' && projectFiles.length > 0 ? (
                <iframe
                  srcDoc={getPreviewDoc()}
                  title="Website Preview"
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : currentFile?.isFolder ? (
                 <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-background text-muted-foreground">
                    <Folder size={60} className="mb-4 opacity-50"/>
                    <h2 className="text-xl font-bold">{currentFile.name}</h2>
                    <p className="mt-2 text-sm">This is a folder. Select a file to view its content.</p>
                </div>
              ) : currentFile?.language === 'image' ? (
                <div className="w-full h-full flex items-center justify-center p-4 bg-background">
                    <img src={currentFile.content} alt={currentFile.name} className="max-w-full max-h-full object-contain rounded-md shadow-lg" />
                </div>
              ) : currentFile ? (
                 <div className="relative h-full flex flex-col">
                    <div className="flex-shrink-0 bg-card border-b border-border px-2 py-1 flex items-center gap-2">
                        <Button
                            onClick={handleBeautify}
                            disabled={isRefactoring || isExplainingCode || isLoading}
                            size="sm"
                            variant="ghost"
                            title="Beautify Code"
                        >
                            {isRefactoring && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            {!isRefactoring && <Wand2 className="h-4 w-4" />}
                            <span className="ml-2 hidden sm:inline">Beautify</span>
                        </Button>
                        <Button
                            onClick={() => { setFileToModify(currentFile); setIsRefactorDialogOpen(true); }}
                            disabled={isRefactoring || isExplainingCode || isLoading}
                            size="sm"
                            variant="ghost"
                            title="Refactor Code"
                        >
                           {isRefactoring && <LoaderCircle className="h-4 w-4 animate-spin" />}
                           {!isRefactoring && <Sparkles className="h-4 w-4" />}
                           <span className="ml-2 hidden sm:inline">Refactor</span>
                        </Button>
                         <Button
                            onClick={handleExplainCode}
                            disabled={isExplainingCode || isRefactoring || isLoading}
                            size="sm"
                            variant="ghost"
                            title="Explain Code"
                        >
                           {isExplainingCode && <LoaderCircle className="h-4 w-4 animate-spin" />}
                           {!isExplainingCode && <BrainCircuit className="h-4 w-4" />}
                           <span className="ml-2 hidden sm:inline">Explain</span>
                        </Button>
                    </div>
                    <div className="flex-grow relative">
                      <CodePreview 
                          code={currentFile.content} 
                          language={currentFile.language}
                          onCodeChange={(newCode) => handleFileContentChange(currentFile.name, newCode)}
                      />
                    </div>
                 </div>
              ) : null}
            </div>
        </div>

        {/* Status Bar */}
        <div className="h-6 bg-primary text-primary-foreground flex items-center justify-between px-4 text-xs">
          <div>main*</div>
          <div className='flex items-center gap-4'>
            <span>Ln 1, Col 1</span>
            <span>Spaces: 2</span>
            <span>UTF-8</span>
            <span>{isLoading ? 'GENERATING' : (activeView === 'preview' ? 'PREVIEW' : (currentFile?.language.toUpperCase() || ''))}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function AvatarIcon() {
  return (
    <div className="h-5 w-5 shrink-0 rounded-full bg-muted flex items-center justify-center border border-border">
      <User className="h-3 w-3" />
    </div>
  )
}
