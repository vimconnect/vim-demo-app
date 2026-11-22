/** Does `file` match an `accept` string (".pdf,image/*,application/json")? */
export declare function fileMatchesAccept(file: File, accept: string | undefined): boolean;
/** 1.2 MB, 340 KB, 12 B — what `FileItem` shows by default. */
export declare function formatFileSize(bytes: number): string;
