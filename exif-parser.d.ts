declare module "exif-parser" {
  export function create(imgBuffer: import("buffer").Buffer): Parser;
  export class Parser {
    enableImageSize(enable: boolean): void;
    enableTagNames(enable: boolean): void;
    enableReturnTags(enable: boolean): void;
    enableBinaryFields(enable: boolean): void;
    parse(): {
      tags: { XResolution: number; YResolution: number };
      imageSize: { height: number; width: number };
      thumbnailOffset: any;
      thumbnailLength: any;
      thumbnailType:any;
      app1Offset:any;
    };
  }
}
