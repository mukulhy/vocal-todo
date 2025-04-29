// Top of your component file
export {}

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

declare module 'fuse.js' {
    export default class Fuse<T> {
      constructor(list: T[], options?: any);
  
      search(pattern: string): { item: T }[];
    }
  }
  