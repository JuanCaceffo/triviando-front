export {};

declare global {
  interface GoogleCredentialResponse {
    credential: string;
    select_by: string;
  }

  interface GoogleAccountsId {
    initialize(configuration: {
      client_id: string;
      callback: (response: GoogleCredentialResponse) => void;
    }): void;
    prompt(): void;
  }

  interface Window {
    google?: {
      accounts: {
        id: GoogleAccountsId;
      };
    };
  }
}
