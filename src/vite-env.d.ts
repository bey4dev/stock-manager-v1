/// <reference types="vite/client" />

// Google APIs type declarations
declare global {
  interface Window {
    gapi: any;
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (config: any) => any;
          revoke: (token: string) => void;
        };
      };
    };
  }
}

export {};
