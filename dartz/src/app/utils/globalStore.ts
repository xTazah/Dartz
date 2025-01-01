// import { create } from "zustand";

//global state is not needed because useDndMonitor hook is used and therefore we dont need pass the props to different parts of the app, but instead handle everything inside eahc dropzone indepedenttly

// interface DragDropState {
//   activeDragId: string | null;
//   validDropzone: string | null;
//   isDragging: boolean;
//   setActiveDragId: (id: string | null) => void;
//   setValidDropzone: (id: string | null) => void;
//   setIsDragging: (dragging: boolean) => void;
// }

// export const useDragDropStore = create<DragDropState>((set) => ({
//   activeDragId: null,
//   validDropzone: null,
//   isDragging: false,
//   setActiveDragId: (id) => set({ activeDragId: id }),
//   setValidDropzone: (id) => set({ validDropzone: id }),
//   setIsDragging: (dragging) => set({ isDragging: dragging }),
// }));

//ToDo: user context as "zustand" as well and not react context
