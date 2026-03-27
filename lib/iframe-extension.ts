import { Node } from '@tiptap/core';

export const Iframe = Node.create({
  name: 'iframe',
  group: 'block',
  atom: true,
  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: '100%',
      },
      height: {
        default: 'auto',
      },
      allowFullscreen: {
        default: true,
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'iframe',
      },
    ];
  },
  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    return ['iframe', { ...HTMLAttributes, frameborder: '0', allowfullscreen: 'allowfullscreen' }];
  },
  addCommands() {
    return {
      setIframe: (attrs: Record<string, any>) => ({ commands }: { commands: any }) => {
        return commands.insertContent({
          type: this.name,
          attrs,
        });
      },
    } as any; // Type assertion to bypass strict type checking
  },
});