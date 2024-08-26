/**
 * An interface for json schema to invoke scalable keys of languages
 */
export interface IObjectExtensionJsonLanguages {
    [langKey: string]: string | null;
}

/**
 * An interface for json schema list current using languages
 */
export interface IModelExtensionJsonLanguages extends IObjectExtensionJsonLanguages {
    en: string | null;
    th: string | null;
}