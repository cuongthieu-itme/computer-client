import React, { useState, useCallback, useEffect } from 'react';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import LinkExtension from '@tiptap/extension-link'; // Renamed to avoid conflict
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import DOMPurify from 'dompurify';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link as LinkIconProp, // Renamed to avoid conflict with LinkExtension
  List,
  ListOrdered,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Heading3,
  Save,
  Ban,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

// Define keys for predefined placeholders, now more generic
export type PredefinedPlaceholderKey = 'contentBlock1' | 'contentBlock2' | 'contentBlock3' | 'contentBlock4';

const defaultPlaceholders: Record<PredefinedPlaceholderKey, string> = {
  contentBlock1: "Enter content for the first section here. This could be an introduction, overview, or any primary information.",
  contentBlock2: "Use this block for additional details, highlights, key features, or specific points. Bullet points can be effective here.",
  contentBlock3: "This section can be used for terms, conditions, policies, or any other structured information that needs to be clearly laid out.",
  contentBlock4: "Add any supplementary content, frequently asked questions, or other relevant information in this final block.",
};

interface TicketContentEditorProps {
  initialContent?: string;
  onSave?: (content: string) => void;
  onCancel?: () => void;
  title?: string; // Optional title for the editor card
  placeholderText?: string; // For custom placeholder text (takes precedence)
  placeholderKey?: PredefinedPlaceholderKey; // For selecting a predefined placeholder
}

const TicketContentEditor: React.FC<TicketContentEditorProps> = ({
  initialContent = '',
  onSave,
  onCancel,
  title, // New title prop
  placeholderText,
  placeholderKey,
}) => {
  const [linkUrl, setLinkUrl] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLinkModalOpen, setIsLinkModalOpen] = useState<boolean>(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState<boolean>(false);

  const [editorHtmlContent, setEditorHtmlContent] = useState<string>(DOMPurify.sanitize(initialContent));

  // Determine the placeholder to use
  const actualPlaceholder =
    placeholderText ||
    (placeholderKey ? defaultPlaceholders[placeholderKey] : undefined) ||
    "Start writing your content here...";

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer nofollow' },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-md max-w-full h-auto align-middle',
        },
      }),
      Placeholder.configure({ placeholder: actualPlaceholder }),
    ],
    content: editorHtmlContent,
    onUpdate: ({ editor: currentEditor }) => {
      setEditorHtmlContent(currentEditor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose-base max-w-none dark:prose-invert focus:outline-none min-h-[300px]",
          "prose-p:my-2",
          "prose-ul:my-2 prose-ul:pl-5 prose-li:my-1 prose-li:marker:text-muted-foreground",
          "prose-ol:my-2 prose-ol:pl-5 prose-li:my-1",
          "prose-headings:font-semibold prose-headings:text-foreground/90",
          "prose-h1:text-xl sm:prose-h1:text-2xl prose-h1:mb-3 prose-h1:mt-4",
          "prose-h2:text-lg sm:prose-h2:text-xl prose-h2:mb-2 prose-h2:mt-3",
          "prose-h3:text-base sm:prose-h3:text-lg prose-h3:font-semibold prose-h3:mb-2 prose-h3:mt-4",
          "prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-primary/80"
        ),
      },
    },
  });

  useEffect(() => {
    if (editor && initialContent !== editorHtmlContent) {
      const sanitized = DOMPurify.sanitize(initialContent);
      if (!editor.isDestroyed) {
        editor.commands.setContent(sanitized, false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialContent, editor]);


  const handleSave = useCallback(() => {
    if (onSave) {
      const sanitizedContent = DOMPurify.sanitize(editorHtmlContent);
      onSave(sanitizedContent);
    }
  }, [onSave, editorHtmlContent]);


  const toggleBold = useCallback(() => editor?.chain().focus().toggleBold().run(), [editor]);
  const toggleItalic = useCallback(() => editor?.chain().focus().toggleItalic().run(), [editor]);
  const toggleUnderline = useCallback(() => editor?.chain().focus().toggleUnderline().run(), [editor]);
  const toggleHeading = useCallback((level: 1 | 2 | 3) => editor?.chain().focus().toggleHeading({ level }).run(), [editor]);
  const toggleBulletList = useCallback(() => editor?.chain().focus().toggleBulletList().run(), [editor]);
  const toggleOrderedList = useCallback(() => editor?.chain().focus().toggleOrderedList().run(), [editor]);

  const handleSetLink = useCallback(() => {
    if (!editor || editor.isDestroyed) return;
    if (linkUrl) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl, target: '_blank' }).run();
    } else {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    setLinkUrl('');
    setIsLinkModalOpen(false);
  }, [editor, linkUrl]);

  const openLinkModal = useCallback(() => {
    if (!editor || editor.isDestroyed) return;
    const previousUrl = editor.getAttributes('link').href || '';
    setLinkUrl(previousUrl);
    setIsLinkModalOpen(true);
  }, [editor]);

  const handleAddImage = useCallback(() => {
    if (imageUrl && editor && !editor.isDestroyed) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
    }
    setImageUrl('');
    setIsImageModalOpen(false);
  }, [editor, imageUrl]);

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);


  if (!editor) {
    return (
      <Card className="w-full">
        <CardHeader><CardTitle>{title || "Ticket Content Editor"}</CardTitle></CardHeader>
        <CardContent><p>Loading editor...</p></CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg border-border">
      <CardHeader className="border-b border-border">
        {/* Use the title prop or a default title */}
        <CardTitle className="text-lg">{title || "Ticket Content Editor"}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-4 p-2 bg-muted/40 rounded-md border border-input">
          {/* Toolbar buttons remain the same */}
          <Button
            variant="ghost" size="sm" onClick={() => toggleHeading(1)}
            className={cn("p-2 h-auto", editor.isActive('heading', { level: 1 }) ? 'bg-primary/20 text-primary' : '')}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button
            variant="ghost" size="sm" onClick={() => toggleHeading(2)}
            className={cn("p-2 h-auto", editor.isActive('heading', { level: 2 }) ? 'bg-primary/20 text-primary' : '')}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button
            variant="ghost" size="sm" onClick={() => toggleHeading(3)}
            className={cn("p-2 h-auto", editor.isActive('heading', { level: 3 }) ? 'bg-primary/20 text-primary' : '')}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Separator orientation="vertical" className="h-7 sm:h-8 mx-1" />

          <Button
            variant="ghost" size="sm" onClick={toggleBold}
            className={cn("p-2 h-auto", editor.isActive('bold') ? 'bg-primary/20 text-primary' : '')}
            title="Bold"
          >
            <Bold className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button
            variant="ghost" size="sm" onClick={toggleItalic}
            className={cn("p-2 h-auto", editor.isActive('italic') ? 'bg-primary/20 text-primary' : '')}
            title="Italic"
          >
            <Italic className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button
            variant="ghost" size="sm" onClick={toggleUnderline}
            className={cn("p-2 h-auto", editor.isActive('underline') ? 'bg-primary/20 text-primary' : '')}
            title="Underline"
          >
            <UnderlineIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Separator orientation="vertical" className="h-7 sm:h-8 mx-1" />

          <Button
            variant="ghost" size="sm" onClick={toggleBulletList}
            className={cn("p-2 h-auto", editor.isActive('bulletList') ? 'bg-primary/20 text-primary' : '')}
            title="Bullet List"
          >
            <List className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Button
            variant="ghost" size="sm" onClick={toggleOrderedList}
            className={cn("p-2 h-auto", editor.isActive('orderedList') ? 'bg-primary/20 text-primary' : '')}
            title="Ordered List"
          >
            <ListOrdered className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
          <Separator orientation="vertical" className="h-7 sm:h-8 mx-1" />

          <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost" size="sm" onClick={openLinkModal}
                className={cn("p-2 h-auto", editor.isActive('link') ? 'bg-primary/20 text-primary' : '')}
                title="Add/Edit Link"
              >
                <LinkIconProp className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editor.getAttributes('link').href ? 'Edit Link' : 'Add Link'}</DialogTitle></DialogHeader>
              <Input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://example.com" className="my-4" aria-label="Link URL" />
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleSetLink}>Set Link</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className={cn("p-2 h-auto")} title="Add Image">
                <ImageIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Image from URL</DialogTitle></DialogHeader>
              <Input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.png" className="my-4" aria-label="Image URL" />
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleAddImage}>Add Image</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border border-input rounded-md p-2 sm:p-4 min-h-[250px] shadow-sm bg-background">
          <EditorContent editor={editor} />
        </div>

        <details className="text-sm mt-4">
          <summary className="cursor-pointer font-medium text-muted-foreground hover:text-foreground">View Raw HTML Output</summary>
          <pre className="mt-2 p-3 bg-muted/50 border border-dashed rounded-md overflow-auto text-xs max-h-40">
            <code>{editorHtmlContent}</code>
          </pre>
        </details>

      </CardContent>
      {(onSave || onCancel) && (
        <CardFooter className="flex justify-end gap-3 p-4 border-t border-border">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              <Ban className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
          {onSave && (
            <Button
              onClick={handleSave}
              disabled={!editor?.isEditable || !editorHtmlContent.trim()}
            >
              <Save className="w-4 w-4 sm:h-5 sm:w-5" />
              Save Content
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};

export default TicketContentEditor;
