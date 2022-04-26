declare module "verstka-js-sdk" {
  export type Target = "desktop" | "mobile";

  export type OpenEditorParams = {
    userId: string;
    materialId: string;
    target: Target;
    html: string;
    customFields?: {};
  };

  export type OnSaveParams = {
    data: any;
    html: string;
    images: Record<string, Blob|null>;
    customFields: Record<string, any>;
    userId: string;
    materialId: string;
    target: Target;
  };

  export type OnSavingParams = {
    materialId: string;
    target: Target;
  };

  export class Session {
    on(type: "saved", onSave: (params: OnSaveParams) => void): void;

    on(type: "saving", onSave: (params: OnSavingParams) => void): void;

    on(
      type: "closed",
      onClose: (params: {
        data: any;
        userId: string;
        materialId: string;
        target: Target;
      }) => void
    ): void;

    close: () => void;
    removeListener: (string, cb: Function) => void;
  }

  class VerstkaSDK {
    constructor(params: {
      apiKey: string;
      imagesOrigin: string;
      verbose?: boolean;
    });

    openEditor: (params: OpenEditorParams) => Promise<Session>;
  }

  export default VerstkaSDK;
}
