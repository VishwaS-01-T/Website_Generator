export const StepType = {
  CreateFile: 0,
  CreateFolder: 1,
  EditFile: 2,
  DeleteFile: 3,
  RunScript: 4
};

// Step type for reference:
// {
//   id: number,
//   title: string,
//   description: string,
//   type: StepType,
//   status: 'pending' | 'in-progress' | 'completed',
//   code?: string,
//   path?: string
// }

// Project type for reference:
// {
//   prompt: string,
//   steps: Step[]
// }

// FileItem type for reference:
// {
//   name: string,
//   type: 'file' | 'folder',
//   children?: FileItem[],
//   content?: string,
//   path: string
// }

// FileViewerProps type for reference:
// {
//   file: FileItem | null,
//   onClose: function
// }