declare module "verstka-js-sdk" {
  type Target = "desktop" | "mobile";

  type OpenParams = {
    userId: string;
    materialId: string;
    target: Target;
    html: string;
    customFields: {};
  };

  class Session {
    on(
      type: "saved",
      onSave: (params: {
        data: any;
        html: string;
        images: Blob[];
        customFields: Record<string, any>;
        userId: string;
        materialId: string;
        target: Target;
      }) => void
    ): void;

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
  }

  class VerstkaSDK {
    constructor(params: {
      apiKey: string;
      imagesOrigin: string;
      verbose?: boolean;
    });

    openEditor: (params: OpenParams) => Promise<Session>;
  }

  export default VerstkaSDK;
}
