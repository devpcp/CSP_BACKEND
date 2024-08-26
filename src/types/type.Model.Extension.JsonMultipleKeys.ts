/**
 * An interface for json schema to invoke scalable keys of attached interface
 */
export interface IModelExtensionJsonMultipleKeys<T = any> {
    [variableKey: string]: T | null | string | number;
}