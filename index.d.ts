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
    images: Record<string, Blob | null>;
    customFields: Record<string, any>;
    userId: string;
    materialId: string;
    target: Target;
  };

  export type OnSavingParams = {
    materialId: string;
    target: Target;
  };

  export type ImageResolverParams = {
    materialId: string;
    target: Target;
    filename: string;
    fullPath: string;
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

    on(
      type: "image_resolve",
      onResolve: (params: { images: string[] }) => void
    ): void;

    on(
      type: "image_resolved",
      onResolved: (params: ImageResolverParams) => void
    ): void;

    on(
      type: "image_rejected",
      onRejected: (params: ImageResolverParams) => void
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
