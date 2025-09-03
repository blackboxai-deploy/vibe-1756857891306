'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

interface Block {
  id: string;
  type: 'paragraph' | 'heading' | 'list' | 'todo' | 'quote' | 'code';
  content: string;
  checked?: boolean;
}

interface Page {
  id: string;
  title: string;
  blocks: Block[];
}

const initialPage: Page = {
  id: 'welcome',
  title: 'Página de Bienvenida',
  blocks: [
    {
      id: 'block-1',
      type: 'heading',
      content: 'Bienvenido a tu Workspace de Productividad'
    },
    {
      id: 'block-2',
      type: 'paragraph',
      content: 'Esta es una aplicación estilo Notion con editor de bloques, integración de IA y plantillas. Comienza creando contenido increíble con nuestro editor intuitivo.'
    }
  ]
};

const templates = [
  {
    id: 'meeting',
    name: 'Notas de Reunión',
    description: 'Estructura tus notas de reunión con agenda y elementos de acción',
    blocks: [
      { type: 'heading' as const, content: 'Notas de Reunión - [Fecha]' },
      { type: 'heading' as const, content: 'Asistentes' },
      { type: 'list' as const, content: 'Agregar nombres aquí' },
      { type: 'heading' as const, content: 'Agenda' },
      { type: 'list' as const, content: 'Punto de agenda 1' },
      { type: 'heading' as const, content: 'Elementos de Acción' },
      { type: 'todo' as const, content: 'Elemento de acción 1', checked: false }
    ]
  },
  {
    id: 'project',
    name: 'Plan de Proyecto',
    description: 'Plantilla de planificación de proyecto con cronograma',
    blocks: [
      { type: 'heading' as const, content: 'Plan de Proyecto: [Nombre]' },
      { type: 'heading' as const, content: 'Resumen del Proyecto' },
      { type: 'paragraph' as const, content: 'Descripción breve de los objetivos...' },
      { type: 'heading' as const, content: 'Cronograma y Hitos' },
      { type: 'todo' as const, content: 'Hito 1: Inicio del proyecto', checked: false },
      { type: 'heading' as const, content: 'Entregables Clave' },
      { type: 'list' as const, content: 'Entregable 1' }
    ]
  },
  {
    id: 'journal',
    name: 'Diario Personal',
    description: 'Reflexiona sobre tu día con prompts para gratitud y objetivos',
    blocks: [
      { type: 'heading' as const, content: 'Diario - [Fecha]' },
      { type: 'heading' as const, content: '🙏 Por lo que estoy agradecido' },
      { type: 'list' as const, content: 'Algo por lo que estás agradecido...' },
      { type: 'heading' as const, content: '🎉 Logros de hoy' },
      { type: 'list' as const, content: '¿Qué lograste hoy?' },
      { type: 'heading' as const, content: '🎯 Objetivos para mañana' },
      { type: 'todo' as const, content: 'Objetivo para mañana...', checked: false }
    ]
  }
];

export default function HomePage() {
  const [pages, setPages] = useState<Page[]>([initialPage]);
  const [currentPageId, setCurrentPageId] = useState('welcome');
  const [blockCounter, setBlockCounter] = useState(3);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const currentPage = pages.find(p => p.id === currentPageId) || pages[0];

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('notion-pages');
    if (saved) {
      try {
        const parsedPages = JSON.parse(saved);
        setPages(parsedPages);
      } catch (e) {
        console.error('Error loading saved pages:', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('notion-pages', JSON.stringify(pages));
  }, [pages]);

  const createNewPage = () => {
    const newPage: Page = {
      id: `page-${Date.now()}`,
      title: 'Página sin título',
      blocks: [
        {
          id: `block-${blockCounter}`,
          type: 'paragraph',
          content: ''
        }
      ]
    };
    setPages([...pages, newPage]);
    setCurrentPageId(newPage.id);
    setBlockCounter(blockCounter + 1);
    toast.success('Nueva página creada');
  };

  const updatePageTitle = (title: string) => {
    setPages(pages.map(p => 
      p.id === currentPageId ? { ...p, title } : p
    ));
  };

  const addBlock = (type: Block['type'], afterBlockId?: string) => {
    const newBlock: Block = {
      id: `block-${blockCounter}`,
      type,
      content: '',
      ...(type === 'todo' && { checked: false })
    };

    setPages(pages.map(page => {
      if (page.id === currentPageId) {
        if (afterBlockId) {
          const index = page.blocks.findIndex(b => b.id === afterBlockId);
          const newBlocks = [...page.blocks];
          newBlocks.splice(index + 1, 0, newBlock);
          return { ...page, blocks: newBlocks };
        } else {
          return { ...page, blocks: [...page.blocks, newBlock] };
        }
      }
      return page;
    }));
    
    setBlockCounter(blockCounter + 1);
  };

  const updateBlock = (blockId: string, updates: Partial<Block>) => {
    setPages(pages.map(page =>
      page.id === currentPageId
        ? { ...page, blocks: page.blocks.map(block =>
            block.id === blockId ? { ...block, ...updates } : block
          )}
        : page
    ));
  };

  const deleteBlock = (blockId: string) => {
    setPages(pages.map(page =>
      page.id === currentPageId
        ? { ...page, blocks: page.blocks.filter(block => block.id !== blockId) }
        : page
    ));
  };

  const useTemplate = (template: typeof templates[0]) => {
    const newPage: Page = {
      id: `page-${Date.now()}`,
      title: template.name,
      blocks: template.blocks.map((block, index) => ({
        ...block,
        id: `block-${blockCounter + index}`
      }))
    };
    setPages([...pages, newPage]);
    setCurrentPageId(newPage.id);
    setBlockCounter(blockCounter + template.blocks.length);
    toast.success(`Plantilla "${template.name}" aplicada`);
  };

  const generateAIContent = async (action: string, prompt: string) => {
    // Simulación de IA - En producción conectaría con OpenRouter
    const responses: Record<string, string> = {
      generate: `Contenido generado basado en: "${prompt}"\n\nEste es un ejemplo de contenido que podría generar la IA. En una implementación real, esto conectaría con OpenRouter API para generar contenido usando modelos como Claude Sonnet-4.`,
      improve: `Versión mejorada del texto: "${prompt}"\n\nEsta sería una versión más profesional y pulida del contenido original.`,
      summarize: `Resumen de: "${prompt}"\n\nPuntos clave:\n• Punto principal 1\n• Punto principal 2\n• Conclusión importante`,
      ideas: `Ideas relacionadas con: "${prompt}":\n\n• Idea 1: Enfoque innovador\n• Idea 2: Perspectiva diferente\n• Idea 3: Solución creativa\n• Idea 4: Aplicación práctica\n• Idea 5: Desarrollo futuro`
    };

    const content = responses[action] || responses.generate;
    
    addBlock('paragraph');
    setTimeout(() => {
      const lastBlock = currentPage.blocks[currentPage.blocks.length - 1];
      if (lastBlock) {
        updateBlock(lastBlock.id, { content });
      }
    }, 100);
    
    toast.success('Contenido generado con IA');
  };

  const renderBlock = (block: Block) => {
    const commonProps = {
      value: block.content,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        updateBlock(block.id, { content: e.target.value }),
      className: 'w-full bg-transparent border-none outline-none resize-none',
      placeholder: getPlaceholder(block.type)
    };

    const blockControls = (
      <div className="absolute left-0 top-0 -ml-12 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
        <BlockMenu onAddBlock={(type) => addBlock(type, block.id)} />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => deleteBlock(block.id)}
          className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
        >
          ×
        </Button>
      </div>
    );

    switch (block.type) {
      case 'heading':
        return (
          <div className="group relative py-2">
            <input
              {...commonProps}
              className={`${commonProps.className} text-2xl font-semibold text-gray-900`}
            />
            {blockControls}
          </div>
        );

      case 'paragraph':
        return (
          <div className="group relative py-1">
            <Textarea
              {...commonProps}
              rows={1}
              className={`${commonProps.className} text-gray-800 leading-relaxed min-h-[1.5rem]`}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
            />
            {blockControls}
          </div>
        );

      case 'list':
        return (
          <div className="group relative py-1 flex items-start gap-3">
            <span className="text-gray-400 mt-1.5">•</span>
            <Textarea
              {...commonProps}
              rows={1}
              className={`${commonProps.className} text-gray-800 leading-relaxed flex-1 min-h-[1.5rem]`}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
            />
            {blockControls}
          </div>
        );

      case 'todo':
        return (
          <div className="group relative py-1 flex items-start gap-3">
            <Checkbox
              checked={block.checked || false}
              onCheckedChange={(checked) => 
                updateBlock(block.id, { checked: checked as boolean })
              }
              className="mt-1.5"
            />
            <Textarea
              {...commonProps}
              rows={1}
              className={`${commonProps.className} text-gray-800 leading-relaxed flex-1 min-h-[1.5rem] ${
                block.checked ? 'line-through text-gray-500' : ''
              }`}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
            />
            {blockControls}
          </div>
        );

      case 'quote':
        return (
          <div className="group relative py-2 border-l-4 border-gray-300 pl-4">
            <Textarea
              {...commonProps}
              rows={1}
              className={`${commonProps.className} text-gray-600 italic leading-relaxed min-h-[1.5rem]`}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = target.scrollHeight + 'px';
              }}
            />
            {blockControls}
          </div>
        );

      case 'code':
        return (
          <div className="group relative py-2">
            <div className="bg-gray-100 rounded-md p-4">
              <Textarea
                {...commonProps}
                rows={3}
                className={`${commonProps.className} font-mono text-sm bg-transparent min-h-[3rem]`}
                spellCheck={false}
              />
            </div>
            {blockControls}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-12' : 'w-64'} bg-white border-r border-gray-200 flex-shrink-0 transition-all duration-200`}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            {!sidebarCollapsed && (
              <>
                <h2 className="font-semibold text-gray-900">Mi Workspace</h2>
                <Badge variant="secondary">{pages.length}</Badge>
              </>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="h-8 w-8 p-0"
            >
              {sidebarCollapsed ? '→' : '←'}
            </Button>
          </div>
          
          {!sidebarCollapsed && (
            <>
              {/* New Page Button */}
              <Button
                onClick={createNewPage}
                variant="ghost"
                className="w-full mb-4 justify-start"
                size="sm"
              >
                <span className="mr-2">+</span>
                Nueva Página
              </Button>
              
              {/* Pages List */}
              <div className="space-y-1">
                {pages.map(page => (
                  <div
                    key={page.id}
                    onClick={() => setCurrentPageId(page.id)}
                    className={`flex items-center gap-2 px-2 py-1 text-sm rounded cursor-pointer hover:bg-gray-100 ${
                      currentPageId === page.id ? 'bg-gray-100' : ''
                    }`}
                  >
                    <span>📄</span>
                    <span className="truncate">{page.title}</span>
                  </div>
                ))}
              </div>
              
              {/* Templates */}
              <div className="mt-6 pt-4 border-t">
                <TemplateDialog templates={templates} onUseTemplate={useTemplate} />
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-lg">📄</span>
              <h1 className="text-lg font-semibold text-gray-900">{currentPage.title}</h1>
              <Badge variant="outline">{currentPage.blocks.length} bloques</Badge>
            </div>
            <div className="flex items-center gap-2">
              <AIAssistantDialog onGenerate={generateAIContent} />
              <Button variant="ghost" size="sm">
                Compartir
              </Button>
            </div>
          </div>
        </header>

        {/* Editor Area */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto py-8 px-6">
            {/* Page Title Editor */}
            <div className="mb-8">
              <Input
                value={currentPage.title}
                onChange={(e) => updatePageTitle(e.target.value)}
                className="text-4xl font-bold w-full bg-transparent border-none outline-none shadow-none text-gray-900 p-0"
                placeholder="Título de la página"
              />
            </div>

            {/* Blocks */}
            <div className="space-y-2">
              {currentPage.blocks.map(block => (
                <div key={block.id}>
                  {renderBlock(block)}
                </div>
              ))}
            </div>

            {/* Add Block Button */}
            <div className="mt-8">
              <Button
                onClick={() => addBlock('paragraph')}
                variant="outline"
                className="border-dashed"
              >
                <span className="mr-2">+</span>
                Agregar bloque
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

// Helper Components
function BlockMenu({ onAddBlock }: { onAddBlock: (type: Block['type']) => void }) {
  const [open, setOpen] = useState(false);
  
  const blockTypes = [
    { type: 'paragraph' as const, label: 'Párrafo', icon: '📝' },
    { type: 'heading' as const, label: 'Título', icon: 'H' },
    { type: 'list' as const, label: 'Lista', icon: '•' },
    { type: 'todo' as const, label: 'Tarea', icon: '☑️' },
    { type: 'quote' as const, label: 'Cita', icon: '❝' },
    { type: 'code' as const, label: 'Código', icon: '💻' },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 hover:bg-blue-50">
          +
        </Button>
      </DialogTrigger>
      <DialogContent className="w-80">
        <DialogHeader>
          <DialogTitle>Agregar Bloque</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          {blockTypes.map(({ type, label, icon }) => (
            <Button
              key={type}
              variant="ghost"
              onClick={() => {
                onAddBlock(type);
                setOpen(false);
              }}
              className="justify-start h-auto p-3"
            >
              <span className="mr-3 text-lg">{icon}</span>
              <div className="text-left">
                <div className="font-medium">{label}</div>
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AIAssistantDialog({ onGenerate }: { onGenerate: (action: string, prompt: string) => void }) {
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState('generate');
  const [prompt, setPrompt] = useState('');

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    onGenerate(action, prompt);
    setPrompt('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
          <span className="mr-2">✨</span>
          Asistente IA
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Asistente IA</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Acción</label>
            <select 
              value={action} 
              onChange={(e) => setAction(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="generate">Generar contenido</option>
              <option value="improve">Mejorar texto</option>
              <option value="summarize">Resumir</option>
              <option value="ideas">Generar ideas</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Prompt</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe lo que quieres generar..."
              rows={3}
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={handleGenerate} className="flex-1">
              Generar
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function TemplateDialog({ templates, onUseTemplate }: { 
  templates: Array<{
    id: string;
    name: string;
    description: string;
    blocks: Array<{
      type: 'paragraph' | 'heading' | 'list' | 'todo' | 'quote' | 'code';
      content: string;
      checked?: boolean;
    }>;
  }>,
  onUseTemplate: (template: {
    id: string;
    name: string;
    description: string;
    blocks: Array<{
      type: 'paragraph' | 'heading' | 'list' | 'todo' | 'quote' | 'code';
      content: string;
      checked?: boolean;
    }>;
  }) => void 
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start" size="sm">
          <span className="mr-2">📋</span>
          Plantillas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Plantillas</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          {templates.map(template => (
            <Card
              key={template.id}
              className="p-4 cursor-pointer hover:bg-gray-50"
              onClick={() => {
                onUseTemplate(template);
                setOpen(false);
              }}
            >
              <h3 className="font-semibold mb-2">{template.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{template.description}</p>
              <Badge variant="secondary">{template.blocks.length} bloques</Badge>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getPlaceholder(type: Block['type']): string {
  switch (type) {
    case 'paragraph': return 'Escribe algo...';
    case 'heading': return 'Título...';
    case 'list': return 'Elemento de lista...';
    case 'todo': return 'Tarea...';
    case 'quote': return 'Cita...';
    case 'code': return 'Escribe tu código...';
    default: return 'Escribe algo...';
  }
}